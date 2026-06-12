#!/usr/bin/env node

const dns = require('dns');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const sharp = require('sharp');
const XLSX = require('xlsx');

const backendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(backendRoot, '..');
const workbookPath = path.join(repoRoot, 'roycedata', 'roycedata.xlsx');
const imagesRoot = path.join(repoRoot, 'roycedata', 'drive-download-20260612T094804Z-3-001');
const uploadsRoot = path.join(backendRoot, 'uploads');
const envFile = path.join(backendRoot, '.env');

const supportedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

main().catch(async (error) => {
  console.error(error);
  await disconnectQuietly();
  process.exitCode = 1;
});

async function main() {
  loadEnvFile(envFile);
  configureDns();

  const uri = process.env.MONGODB_URI || process.env.DB_URL;
  if (!uri) {
    throw new Error('Missing MONGODB_URI. Add it to backend/.env before importing products.');
  }
  if (!fs.existsSync(workbookPath)) {
    throw new Error(`Workbook not found: ${workbookPath}`);
  }
  if (!fs.existsSync(imagesRoot)) {
    throw new Error(`Images folder not found: ${imagesRoot}`);
  }

  const rows = readProductRows();
  const imageMap = scanImages();

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
        emoji: String,
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
        name: String,
        slug: String,
        sku: String,
        series: String,
        description: String,
        tags: [String],
        category: mongoose.Schema.Types.ObjectId,
        costPrice: Number,
        sellingPrice: Number,
        retailPrice: Number,
        totalQuantity: Number,
        salesCount: Number,
        size: String,
        dimension: Object,
        weight: Number,
        material: [String],
        colors: [String],
        finish: String,
        lightSource: String,
        watt: Number,
        inputVoltage: String,
        lmPerW: Number,
        fluxLumin: Number,
        ra: Number,
        chipBrand: String,
        pf: Number,
        cutSize: String,
        beamAngle: Number,
        ipRate: String,
        remark: String,
        imageAssets: [Object],
        vendorId: mongoose.Schema.Types.ObjectId,
        isActive: Boolean,
      },
      { strict: false, timestamps: true },
    ),
    'products',
  );

  fs.mkdirSync(uploadsRoot, { recursive: true });

  const categoryCache = await buildCategoryCache(Category);
  let created = 0;
  let updated = 0;
  let imageCount = 0;
  const missingImages = [];

  for (const row of rows) {
    const sku = cleanSku(row['Model No.']);
    const costPrice = parseMoney(row['Cost Price']);
    const category = await resolveCategory(Category, categoryCache, row);
    const matchedImages = findImagesForSku(sku, imageMap);
    const imageAssets = [];

    for (const [index, sourcePath] of matchedImages.entries()) {
      imageAssets.push(await writeOptimizedImage(sourcePath, sku, index));
    }

    if (!imageAssets.length) {
      missingImages.push(sku);
    }
    imageCount += imageAssets.length;

    const payload = {
      name: sku,
      slug: toSlug(sku),
      sku,
      series: extractSeries(sku),
      description: buildDescription(row, sku),
      tags: buildTags(row),
      category: category._id,
      costPrice,
      sellingPrice: costPrice,
      retailPrice: costPrice,
      totalQuantity: 999,
      salesCount: 0,
      size: cleanText(row.Dimension),
      dimension: {
        raw: cleanText(row.Dimension),
      },
      material: [],
      colors: splitColors(row.COLOR),
      finish: cleanText(row.COLOR),
      lightSource: cleanText(row.CCT),
      watt: parseNumber(row.WATT),
      inputVoltage: cleanText(row['INPUT VOLTAGE']),
      lmPerW: parseNumber(row['LM/W']),
      fluxLumin: parseNumber(row['FLUX LUMIN']),
      ra: parseNumber(row.RA),
      chipBrand: cleanText(row['CHIP BRAND']),
      pf: parseNumber(row.PF),
      cutSize: cleanText(row['CUT SIZE']),
      beamAngle: parseNumber(row['BEAM ANGLE']),
      ipRate: cleanText(row['IP RATE']),
      remark: buildRemark(row),
      imageAssets,
      isActive: true,
    };

    removeUndefined(payload);

    const result = await Product.updateOne(
      { sku },
      {
        $set: payload,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );

    if (result.upsertedCount) created += 1;
    else updated += 1;
  }

  console.log('Royace data import complete');
  console.log(`products   ${rows.length}`);
  console.log(`created    ${created}`);
  console.log(`updated    ${updated}`);
  console.log(`images     ${imageCount}`);
  console.log(`no images  ${missingImages.length}`);
  if (missingImages.length) {
    console.log(`missing    ${missingImages.join(', ')}`);
  }

  await disconnectQuietly();
}

function readProductRows() {
  const workbook = XLSX.readFile(workbookPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils
    .sheet_to_json(sheet, { defval: '' })
    .filter((row) => cleanSku(row['Model No.']));
}

function scanImages() {
  const map = new Map();
  walk(imagesRoot);
  return map;

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.isFile() || !supportedImageExtensions.has(path.extname(entry.name).toLowerCase())) {
        continue;
      }

      const candidates = [
        ...keyVariants(path.basename(entry.name, path.extname(entry.name))),
        ...path
          .relative(imagesRoot, path.dirname(fullPath))
          .split(path.sep)
          .filter(Boolean)
          .flatMap((part) => keyVariants(part)),
      ];

      for (const key of candidates) {
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(fullPath);
      }
    }
  }
}

function findImagesForSku(sku, imageMap) {
  const keys = keyVariants(sku);
  if (sku === 'SL-ST-SUN100') keys.push('SL601100');
  if (sku === 'SL-ST-SUN200') keys.push('SL601200');

  const seen = new Set();
  const files = [];
  for (const key of keys) {
    for (const file of imageMap.get(key) || []) {
      if (seen.has(file)) continue;
      seen.add(file);
      files.push(file);
    }
  }

  return files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function keyVariants(value) {
  const withoutCopySuffix = String(value || '').replace(/\s*\(\d+\)\s*$/i, '');
  const compact = normalizeKey(withoutCopySuffix);
  if (!compact) return [];

  const variants = new Set([compact]);
  variants.add(compact.replace(/(WHITE|BLACK|GD|GB)$/i, ''));
  variants.add(compact.replace(/COPY$/i, ''));
  variants.add(compact.replace(/\(\d+\)$/i, ''));
  variants.add(compact.replace(/-\d+$/i, ''));

  return [...variants].filter(Boolean);
}

function normalizeKey(value) {
  return String(value || '')
    .replace(/\.[A-Za-z0-9]+$/, '')
    .replace(/\s+/g, '')
    .replace(/[^A-Za-z0-9]+/g, '')
    .toUpperCase();
}

async function buildCategoryCache(Category) {
  const categories = await Category.find({}, { name: 1, slug: 1 }).lean();
  return new Map(categories.map((category) => [category.slug, category]));
}

async function resolveCategory(Category, cache, row) {
  const slug = inferCategorySlug(row);
  if (cache.has(slug)) return cache.get(slug);

  const name = slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  const created = await Category.create({
    name,
    slug,
    description: `${name} products imported from Royace data.`,
    sortOrder: 999,
    isActive: true,
  });
  cache.set(slug, created);
  return created;
}

function inferCategorySlug(row) {
  const sku = cleanSku(row['Model No.']).toUpperCase();
  const ipRate = cleanText(row['IP RATE']).toUpperCase();
  const outdoor = ipRate.includes('IP54') || ipRate.includes('IP65') || sku.includes('SUN');

  if (sku.includes('WL')) return outdoor ? 'outdoor-wall-light' : 'decorative-wall-light';
  if (sku.includes('FL')) return 'outdoor-garden-floor-lamp';
  if (sku.includes('BL')) return 'outdoor-garden-mini-bollard-light';
  if (sku.includes('SPK')) return 'outdoor-garden-light';
  if (sku.includes('HL')) return outdoor ? 'indoor-garden-decorative-pendant-light' : 'decorative-pendant-light';
  if (sku.includes('GB')) return 'outdoor-garden-light';
  if (sku.includes('SF')) return outdoor ? 'outdoor-garden-light' : 'decorative-surface-light';
  if (sku.includes('RC')) return 'indoor-decorative-surface-light';
  if (sku.includes('SUN')) return 'outdoor-garden-light';
  return 'decorative-surface-light';
}

function buildDescription(row, sku) {
  const details = [
    cleanText(row.WATT) && `Watt: ${cleanText(row.WATT)}`,
    cleanText(row.COLOR) && `Color: ${cleanText(row.COLOR)}`,
    cleanText(row.CCT) && `CCT: ${cleanText(row.CCT)}`,
    cleanText(row.Dimension) && `Dimension: ${cleanText(row.Dimension)}`,
    cleanText(row['IP RATE']) && `IP Rate: ${cleanText(row['IP RATE'])}`,
  ].filter(Boolean);

  return [`Royace Lighting product ${sku}.`, ...details].join(' ');
}

function buildRemark(row) {
  return [
    cleanText(row.REMARK),
    cleanText(row.CCT) && `CCT: ${cleanText(row.CCT)}`,
    cleanText(row.WATT) && !parseNumber(row.WATT) && `WATT: ${cleanText(row.WATT)}`,
  ]
    .filter(Boolean)
    .join(' | ');
}

function buildTags(row) {
  return [
    cleanText(row.REMARK),
    cleanText(row['IP RATE']),
    cleanText(row.CCT),
    ...splitColors(row.COLOR),
  ]
    .filter(Boolean)
    .map((tag) => tag.toLowerCase());
}

function splitColors(value) {
  const text = cleanText(value);
  if (!text) return [];
  return text
    .split(/[\/,+]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanSku(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function cleanText(value) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!text || text === '/') return '';
  return text;
}

function parseMoney(value) {
  const parsed = parseNumber(value);
  return parsed === undefined ? 0 : parsed;
}

function parseNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = cleanText(value);
  if (!text) return undefined;
  const match = text.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}

function extractSeries(sku) {
  const match = sku.match(/^(.+?)(?:[-\s]?\d|\s|$)/);
  return match ? match[1].replace(/[-\s]+$/, '') : sku;
}

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function writeOptimizedImage(sourcePath, sku, order) {
  const sourceBuffer = fs.readFileSync(sourcePath);
  const output = await sharp(sourceBuffer)
    .rotate()
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toBuffer();

  const metadata = await sharp(output).metadata();
  const filename = `royace-${toSlug(sku)}-${order + 1}.webp`;
  fs.writeFileSync(path.join(uploadsRoot, filename), output);

  return {
    url: `/uploads/${filename}`,
    webpUrl: `/uploads/${filename}`,
    originalName: path.basename(sourcePath),
    mimeType: 'image/webp',
    size: output.length,
    width: metadata.width,
    height: metadata.height,
    order,
    isPrimary: order === 0,
  };
}

function removeUndefined(target) {
  for (const [key, value] of Object.entries(target)) {
    if (value === undefined) delete target[key];
  }
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

    if (process.env[match[1]] === undefined) {
      process.env[match[1]] = value;
    }
  }
}

function configureDns() {
  const dnsServers = (process.env.DB_DNS_SERVERS || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (dnsServers.length) {
    dns.setServers(dnsServers);
  }
}

async function disconnectQuietly() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect().catch(() => undefined);
  }
}
