#!/usr/bin/env node

const childProcess = require('child_process');
const dns = require('dns');
const fs = require('fs');
const os = require('os');
const path = require('path');
const mongoose = require('mongoose');
const sharp = require('sharp');

const backendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(backendRoot, '..');
const envFile = process.env.CATEGORY_IMAGE_SYNC_ENV_FILE || path.join(backendRoot, '.env');
const args = process.argv.slice(2);
const shouldApply = args.includes('--apply');
const shouldInspectWorkbook = args.includes('--inspect-workbook');
const shouldReplace = !args.includes('--skip-existing');
const excelPath = path.resolve(
  readArg('--excel=') ||
    path.join(repoRoot, 'images', 'SL FANCY-APRIL.2026-OL-final, a (2) (1).xlsx'),
);
const imagesRoot = path.resolve(readArg('--images=') || path.join(repoRoot, 'images'));
const uploadRoot = path.resolve(readArg('--uploads=') || path.join(backendRoot, 'uploads'));
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

main().catch(async (error) => {
  console.error(error);
  await disconnectQuietly();
  process.exitCode = 1;
});

async function main() {
  loadEnvFile(envFile);
  configureDns();

  const uri = process.env.MONGODB_URI || process.env.DB_URL;
  if (!uri) throw new Error('Missing MONGODB_URI. Add it to backend/.env first.');
  if (!fs.existsSync(excelPath)) throw new Error(`Excel file not found: ${excelPath}`);
  if (!fs.existsSync(imagesRoot)) throw new Error(`Images folder not found: ${imagesRoot}`);

  const workbookRows = readWorkbookRows(excelPath);
  if (shouldInspectWorkbook) {
    inspectWorkbookRows(workbookRows);
    return;
  }
  const imageFiles = scanImageFiles(imagesRoot);
  const imageIndex = buildImageIndex(imageFiles);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    autoIndex: false,
  });

  const Category = mongoose.model(
    'Category',
    new mongoose.Schema(
      {
        name: String,
        slug: String,
        description: String,
        image: String,
        sortOrder: Number,
        isActive: Boolean,
      },
      { strict: false, timestamps: true },
    ),
    'categories',
  );

  const Product = mongoose.model(
    'Product',
    new mongoose.Schema(
      {
        sku: String,
        productId: String,
        name: String,
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      },
      { strict: false, timestamps: true },
    ),
    'products',
  );

  const categories = await Category.find({}).sort({ sortOrder: 1, name: 1 }).lean();
  const products = await Product.find({}, { sku: 1, productId: 1, name: 1, category: 1 })
    .populate('category', 'name slug')
    .lean();

  const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));
  const productCategoryBySku = buildProductCategoryMap(products);
  const workbookProductRows = extractProductRows(workbookRows);
  const databaseProductRows = extractDatabaseProductRows(products);
  const rows = mergeProductRows(workbookProductRows, databaseProductRows);
  const choices = chooseCategoryImages(rows, imageIndex, productCategoryBySku, categoriesBySlug);

  printSummary({
    workbookRows: workbookRows.length,
    workbookProductRows: workbookProductRows.length,
    databaseProductRows: databaseProductRows.length,
    productRows: rows.length,
    imageFiles: imageFiles.length,
    categories,
    choices,
  });

  if (!shouldApply) {
    console.log('\nDry run only. Re-run with --apply to write uploads and update category.image.');
    await disconnectQuietly();
    return;
  }

  fs.mkdirSync(uploadRoot, { recursive: true });

  const updated = [];
  for (const choice of choices) {
    const category = categoriesBySlug.get(choice.categorySlug);
    if (!category) continue;
    if (category.image && !shouldReplace) continue;

    const image = await writeCategoryImage(choice.imagePath, choice.categorySlug);
    await Category.updateOne(
      { _id: category._id },
      { $set: { image, updatedAt: new Date() } },
    );
    updated.push({ ...choice, image });
  }

  console.log('\nUpdated categories:');
  for (const item of updated) {
    console.log(`- ${item.categoryName}: ${item.image} <- ${item.sku}`);
  }
  console.log(`\nDone. ${updated.length} categor${updated.length === 1 ? 'y' : 'ies'} updated.`);

  await disconnectQuietly();
}

function readArg(prefix) {
  const arg = args.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}

function configureDns() {
  const dnsServers = (process.env.DB_DNS_SERVERS || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (dnsServers.length) dns.setServers(dnsServers);
}

function readWorkbookRows(filePath) {
  const extractDir = path.join(os.tmpdir(), `royce-category-sync-${Date.now()}`);
  const zipPath = path.join(extractDir, 'workbook.zip');
  fs.mkdirSync(extractDir, { recursive: true });

  try {
    fs.copyFileSync(filePath, zipPath);
    const command = [
      '-NoProfile',
      '-Command',
      `Expand-Archive -LiteralPath '${escapePowerShell(zipPath)}' -DestinationPath '${escapePowerShell(extractDir)}' -Force`,
    ];
    const result = childProcess.spawnSync('powershell.exe', command, { encoding: 'utf8' });
    if (result.status !== 0) {
      throw new Error(`Unable to extract workbook: ${result.stderr || result.stdout}`);
    }

    const sharedStrings = readSharedStrings(path.join(extractDir, 'xl', 'sharedStrings.xml'));
    const worksheetsDir = path.join(extractDir, 'xl', 'worksheets');
    const worksheetFiles = fs
      .readdirSync(worksheetsDir)
      .filter((file) => /^sheet\d+\.xml$/i.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    return worksheetFiles.flatMap((file) =>
      parseSheetRows(path.join(worksheetsDir, file), sharedStrings),
    );
  } finally {
    fs.rmSync(extractDir, { recursive: true, force: true });
  }
}

function escapePowerShell(value) {
  return String(value).replace(/'/g, "''");
}

function readSharedStrings(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const xml = fs.readFileSync(filePath, 'utf8');
  return [...xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((match) =>
    extractRichText(match[1]),
  );
}

function parseSheetRows(filePath, sharedStrings) {
  const xml = fs.readFileSync(filePath, 'utf8');
  const rows = [];

  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const values = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cellMatch[1];
      const ref = readXmlAttribute(attrs, 'r') || '';
      const type = readXmlAttribute(attrs, 't');
      const col = columnIndex(ref);
      const rawValue = readCellValue(cellMatch[2], type, sharedStrings);
      if (rawValue !== '') values[col] = rawValue;
    }
    if (values.some((value) => value !== undefined && String(value).trim() !== '')) {
      rows.push(values);
    }
  }

  return rows;
}

function readCellValue(cellXml, type, sharedStrings) {
  if (type === 's') {
    const index = Number(extractTagValue(cellXml, 'v'));
    return sharedStrings[index] || '';
  }
  if (type === 'inlineStr') return extractRichText(cellXml);
  return decodeXml(extractTagValue(cellXml, 'v'));
}

function extractRichText(xml) {
  const parts = [...xml.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((match) =>
    decodeXml(match[1]),
  );
  return parts.join('').trim();
}

function extractTagValue(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].trim() : '';
}

function readXmlAttribute(attrs, name) {
  const match = attrs.match(new RegExp(`${name}="([^"]*)"`));
  return match ? decodeXml(match[1]) : undefined;
}

function decodeXml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
}

function columnIndex(cellRef) {
  const letters = String(cellRef).match(/^[A-Z]+/i)?.[0] || 'A';
  return letters
    .toUpperCase()
    .split('')
    .reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

function extractProductRows(rows) {
  const headerIndex = rows.findIndex((row) =>
    row.some((cell) => /model|sku|product|item|code|category|type/i.test(String(cell || ''))),
  );
  const header = headerIndex >= 0 ? rows[headerIndex].map(normalizeHeader) : [];
  const dataRows = headerIndex >= 0 ? rows.slice(headerIndex + 1) : rows;
  const skuIndexes = header
    .map((value, index) => ({ value, index }))
    .filter(({ value }) => /(model|sku|productid|productcode|itemno|itemcode|code)/i.test(value))
    .map(({ index }) => index);
  const categoryIndexes = header
    .map((value, index) => ({ value, index }))
    .filter(({ value }) => /(category|type|classification|collection)/i.test(value))
    .map(({ index }) => index);

  const rowsWithProducts = [];
  for (const row of dataRows) {
    const headerCandidates = skuIndexes.length ? skuIndexes.map((index) => row[index]) : [];
    const candidates = [...headerCandidates, ...row];
    const sku = firstSku(candidates);
    if (!sku) continue;

    const categoryText = categoryIndexes
      .map((index) => row[index])
      .find((value) => value && String(value).trim());

    rowsWithProducts.push({
      sku,
      categoryText: categoryText ? String(categoryText).trim() : '',
      values: row,
      source: 'workbook',
    });
  }

  return rowsWithProducts;
}

function extractDatabaseProductRows(products) {
  const rows = [];

  for (const product of products) {
    const category = product.category;
    const categoryText = category?.name || '';
    const identifiers = candidateSkus([
      product.sku,
      product.productId,
      product.name,
    ]);

    for (const sku of identifiers) {
      rows.push({
        sku,
        categoryText,
        values: [product.name, product.sku, product.productId, categoryText].filter(Boolean),
        source: 'database',
      });
    }
  }

  return rows;
}

function mergeProductRows(workbookRows, databaseRows) {
  const rows = [];
  const seen = new Set();

  for (const row of [...workbookRows, ...databaseRows]) {
    const key = `${row.source}:${cleanSku(row.sku)}:${slugify(row.categoryText)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(row);
  }

  return rows;
}

function inspectWorkbookRows(rows) {
  console.log(`Workbook rows: ${rows.length}`);
  rows.slice(0, 120).forEach((row, index) => {
    const compact = row
      .map((cell, cellIndex) => (cell ? `${cellIndex}:${String(cell).slice(0, 80)}` : ''))
      .filter(Boolean)
      .join(' | ');
    if (compact) console.log(`${String(index + 1).padStart(3, '0')} ${compact}`);
  });

  console.log('\nRows containing RL-like values:');
  rows.forEach((row, index) => {
    const text = row.filter(Boolean).join(' | ');
    if (/\bR[LCFWT]?[A-Z]?\d/i.test(text)) {
      console.log(`${String(index + 1).padStart(3, '0')} ${text.slice(0, 240)}`);
    }
  });
}

function normalizeHeader(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function firstSku(values) {
  return candidateSkus(values)[0] || '';
}

function candidateSkus(values) {
  const result = [];

  for (const value of values) {
    const text = String(value || '').trim();
    if (!text) continue;

    for (const match of text.matchAll(/\bR[LCFWT]?[A-Z]?\d[A-Z0-9+.\-\s]*\b/gi)) {
      const sku = cleanSku(match[0]);
      if (sku && !result.includes(sku)) result.push(sku);
    }
  }

  return result;
}

function scanImageFiles(root) {
  const files = [];
  walk(root);
  return files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (supportedExtensions.has(path.extname(entry.name).toLowerCase())) files.push(fullPath);
    }
  }
}

function buildImageIndex(files) {
  const index = new Map();
  for (const file of files) {
    const keys = imageKeys(file);
    for (const key of keys) {
      if (!index.has(key)) index.set(key, []);
      index.get(key).push(file);
    }
  }
  return index;
}

function imageKeys(filePath) {
  const parsed = path.parse(filePath);
  const ancestors = path
    .relative(imagesRoot, path.dirname(filePath))
    .split(path.sep)
    .filter(Boolean);
  return [
    ...skuKeys(parsed.name),
    ...ancestors.flatMap((part) => skuKeys(part)),
  ].filter((item, index, list) => item && list.indexOf(item) === index);
}

function buildProductCategoryMap(products) {
  const map = new Map();
  for (const product of products) {
    const category = product.category;
    const categorySlug = category?.slug;
    if (!categorySlug) continue;
    for (const key of skuKeys(product.sku || product.productId || product.name)) {
      if (!map.has(key)) {
        map.set(key, {
          slug: categorySlug,
          name: category.name,
        });
      }
    }
  }
  return map;
}

function chooseCategoryImages(rows, imageIndex, productCategoryBySku, categoriesBySlug) {
  const choicesBySlug = new Map();

  for (const row of rows) {
    const imagePath = findImageForSku(row.sku, imageIndex);
    if (!imagePath) continue;

    const category = resolveCategory(row, productCategoryBySku, categoriesBySlug);
    if (!category) continue;
    if (!categoriesBySlug.has(category.slug)) continue;

    if (!choicesBySlug.has(category.slug)) {
      choicesBySlug.set(category.slug, {
        categorySlug: category.slug,
        categoryName: category.name,
        sku: row.sku,
        categoryText: row.categoryText,
        imagePath,
      });
    }
  }

  return [...choicesBySlug.values()].sort((a, b) =>
    a.categoryName.localeCompare(b.categoryName),
  );
}

function findImageForSku(sku, imageIndex) {
  for (const key of skuKeys(sku)) {
    const files = imageIndex.get(key);
    if (files?.length) return files[0];
  }
  return '';
}

function resolveCategory(row, productCategoryBySku, categoriesBySlug) {
  for (const key of skuKeys(row.sku)) {
    const dbCategory = productCategoryBySku.get(key);
    if (dbCategory) return dbCategory;
  }

  const fromText = categoryFromText(row.categoryText, categoriesBySlug);
  if (fromText) return fromText;

  return categoryFromSku(row.sku, categoriesBySlug);
}

function categoryFromText(value, categoriesBySlug) {
  const text = String(value || '').toLowerCase();
  const directSlug = slugify(text);
  if (categoriesBySlug.has(directSlug)) {
    const category = categoriesBySlug.get(directSlug);
    return { slug: category.slug, name: category.name };
  }

  for (const category of categoriesBySlug.values()) {
    const name = category.name.toLowerCase();
    if (text && (text.includes(name) || name.includes(text))) {
      return { slug: category.slug, name: category.name };
    }
  }

  return heuristicCategory(text, categoriesBySlug);
}

function categoryFromSku(sku, categoriesBySlug) {
  const value = String(sku || '').toUpperCase();
  if (value.startsWith('RLW')) return namedCategory('wall-lights', categoriesBySlug);
  if (value.startsWith('RLT')) return namedCategory('table-lamps', categoriesBySlug);
  if (value.startsWith('RLF')) return namedCategory('floor-lamps', categoriesBySlug);
  return null;
}

function heuristicCategory(text, categoriesBySlug) {
  const rules = [
    [/wall|壁灯/, 'wall-lights'],
    [/table|台灯/, 'table-lamps'],
    [/floor|落地/, 'floor-lamps'],
    [/chandelier|吊灯|pendant|hanging|吊线/, 'hanging-lights'],
    [/outdoor/, 'outdoor-lights'],
    [/facade/, 'facade-lights'],
    [/garden/, 'garden-lights'],
    [/spot|射灯/, 'led-spotlights'],
    [/magnetic|track|轨道/, 'magnetic-track-lights'],
    [/profile/, 'profile-lights'],
    [/strip/, 'led-strip-lights'],
    [/mirror/, 'mirror-lights'],
    [/solar/, 'solar-lights'],
    [/fan/, 'ceiling-fans'],
    [/decor/, 'decor-lights'],
    [/artifact/, 'artifacts'],
    [/furniture/, 'furniture'],
  ];

  for (const [pattern, slug] of rules) {
    if (pattern.test(text)) return namedCategory(slug, categoriesBySlug);
  }

  return null;
}

function namedCategory(slug, categoriesBySlug) {
  const category = categoriesBySlug.get(slug);
  return category ? { slug: category.slug, name: category.name } : null;
}

async function writeCategoryImage(sourcePath, slug) {
  const sourceBuffer = fs.readFileSync(sourcePath);
  const output = await sharp(sourceBuffer)
    .rotate()
    .resize({ width: 1200, height: 900, fit: 'cover', position: 'centre' })
    .webp({ quality: 84, effort: 6 })
    .toBuffer();

  const filename = `category-${slug}-${Date.now()}.webp`;
  fs.writeFileSync(path.join(uploadRoot, filename), output);
  return `/uploads/${filename}`;
}

function printSummary(summary) {
  console.log('Category image sync');
  console.log(`mode       ${shouldApply ? 'apply' : 'dry-run'}`);
  console.log(`excel      ${excelPath}`);
  console.log(`images     ${imagesRoot}`);
  console.log(`uploads    ${uploadRoot}`);
  console.log(`rows       ${summary.workbookRows} workbook rows`);
  console.log(`products   ${summary.workbookProductRows} workbook, ${summary.databaseProductRows} database, ${summary.productRows} total candidates`);
  console.log(`files      ${summary.imageFiles} image files`);
  console.log(`categories ${summary.categories.length} in database`);
  console.log(`matches    ${summary.choices.length} category image choice(s)`);

  if (summary.choices.length) {
    console.log('\nChosen category images:');
    for (const choice of summary.choices) {
      console.log(`- ${choice.categoryName}: ${choice.sku} -> ${path.relative(repoRoot, choice.imagePath)}`);
    }
  }

  const matchedSlugs = new Set(summary.choices.map((choice) => choice.categorySlug));
  const unmatchedCategories = summary.categories.filter((category) => !matchedSlugs.has(category.slug));
  if (unmatchedCategories.length) {
    console.log('\nNo matching local product image found for:');
    for (const category of unmatchedCategories) console.log(`- ${category.name}`);
  }
}

function skuKeys(value) {
  const cleaned = cleanSku(value);
  if (!cleaned) return [];

  return [
    cleaned,
    cleaned.replace(/\s+/g, ''),
    cleaned.replace(/[^A-Z0-9]+/g, ''),
    cleaned.replace(/\+/g, '-'),
    cleaned.replace(/-/g, '+'),
  ].filter((item, index, list) => item && list.indexOf(item) === index);
}

function cleanSku(value) {
  return String(value || '')
    .replace(/\.[A-Za-z0-9]+$/, '')
    .replace(/\s+copy$/i, '')
    .replace(/\s+on$/i, '')
    .replace(/\s+off$/i, '')
    .trim()
    .toUpperCase();
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function disconnectQuietly() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect().catch(() => undefined);
  }
}
