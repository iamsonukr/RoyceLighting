#!/usr/bin/env node

const dns = require('dns');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const sharp = require('sharp');

const backendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(backendRoot, '..');
const envFile = process.env.PRODUCT_IMAGE_SYNC_ENV_FILE || path.join(backendRoot, '.env');
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const args = process.argv.slice(2);
const shouldApply = args.includes('--apply');
const shouldVerify = args.includes('--verify');
const shouldReplace = !args.includes('--append');
const imagesRoot = path.resolve(readArg('--images=') || path.join(repoRoot, 'images'));
const uploadRoot = path.resolve(readArg('--uploads=') || path.join(backendRoot, 'uploads'));

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
    throw new Error('Missing MONGODB_URI. Add it to backend/.env before running this script.');
  }

  if (!fs.existsSync(imagesRoot)) {
    throw new Error(`Images folder not found: ${imagesRoot}`);
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    autoIndex: false,
  });

  const Product = mongoose.model(
    'Product',
    new mongoose.Schema(
      {
        sku: String,
        name: String,
        imageAssets: [Object],
      },
      { strict: false, timestamps: true },
    ),
  );

  const products = await Product.find({}, { sku: 1, name: 1, imageAssets: 1 }).lean();
  const productsByKey = buildProductMap(products);
  const scanned = scanImageFiles(imagesRoot);
  const matches = groupMatches(scanned.files, productsByKey);

  printScanSummary(products, scanned, matches);

  if (shouldVerify) {
    await printVerifySummary(Product, matches);
    await disconnectQuietly();
    return;
  }

  if (!shouldApply) {
    console.log('\nDry run only. Re-run with --apply to copy files and update product imageAssets.');
    await disconnectQuietly();
    return;
  }

  fs.mkdirSync(uploadRoot, { recursive: true });

  const results = [];
  for (const [productId, group] of matches.entries()) {
    const product = products.find((item) => String(item._id) === productId);
    const uploadedAssets = [];

    for (const [index, sourcePath] of group.files.entries()) {
      uploadedAssets.push(await writeOptimizedImage(sourcePath, group.sku, index));
    }

    const nextAssets = shouldReplace
      ? uploadedAssets
      : normalizeExistingAssets(product.imageAssets).concat(
          uploadedAssets.map((asset, index) => ({
            ...asset,
            order: normalizeExistingAssets(product.imageAssets).length + index,
            isPrimary: normalizeExistingAssets(product.imageAssets).length === 0 && index === 0,
          })),
        );

    const normalizedAssets = nextAssets.map((asset, index) => ({
      ...asset,
      order: index,
      isPrimary: index === 0,
    }));

    await Product.updateOne(
      { _id: product._id },
      {
        $set: {
          imageAssets: normalizedAssets,
          updatedAt: new Date(),
        },
      },
    );

    results.push({
      sku: group.sku,
      productId,
      name: group.name,
      images: uploadedAssets.length,
    });
  }

  console.log('\nUpdated products:');
  for (const result of results) {
    console.log(`- ${result.sku}: ${result.images} image(s) -> ${result.name || result.productId}`);
  }

  console.log(`\nDone. ${results.length} product(s) updated.`);
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

function buildProductMap(products) {
  const map = new Map();
  for (const product of products) {
    for (const key of skuKeys(product.sku)) {
      if (!map.has(key)) map.set(key, product);
    }
  }
  return map;
}

function skuKeys(value) {
  const cleaned = cleanSegment(value);
  if (!cleaned) return [];

  return [
    cleaned,
    cleaned.replace(/\s+/g, ''),
    cleaned.replace(/[^A-Z0-9]+/g, ''),
  ].filter((item, index, list) => item && list.indexOf(item) === index);
}

function cleanSegment(value) {
  if (!value) return '';
  return String(value)
    .replace(/\.[A-Za-z0-9]+$/, '')
    .replace(/\s+copy$/i, '')
    .trim()
    .toUpperCase();
}

function scanImageFiles(root) {
  const files = [];
  let skipped = 0;

  walk(root);
  return { files, skipped };

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;

      const extension = path.extname(entry.name).toLowerCase();
      if (!supportedExtensions.has(extension)) {
        skipped += 1;
        continue;
      }

      files.push(fullPath);
    }
  }
}

function groupMatches(files, productsByKey) {
  const groups = new Map();

  for (const filePath of files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))) {
    const product = findProductForFile(filePath, productsByKey);
    if (!product) continue;

    const productId = String(product._id);
    if (!groups.has(productId)) {
      groups.set(productId, {
        sku: product.sku,
        name: product.name,
        files: [],
      });
    }

    groups.get(productId).files.push(filePath);
  }

  return groups;
}

function findProductForFile(filePath, productsByKey) {
  const parsed = path.parse(filePath);
  const candidates = [
    ...skuKeys(parsed.name),
    ...ancestorSegments(filePath).flatMap((segment) => skuKeys(segment)),
  ];

  for (const candidate of candidates) {
    const product = productsByKey.get(candidate);
    if (product) return product;
  }

  return null;
}

function ancestorSegments(filePath) {
  const relative = path.relative(imagesRoot, path.dirname(filePath));
  if (!relative || relative.startsWith('..')) return [];
  return relative
    .split(path.sep)
    .filter(Boolean)
    .reverse();
}

function printScanSummary(products, scanned, matches) {
  const imageCount = [...matches.values()].reduce((total, group) => total + group.files.length, 0);

  console.log('Product image sync');
  console.log(`mode       ${shouldApply ? 'apply' : 'dry-run'}`);
  console.log(`strategy   ${shouldReplace ? 'replace imageAssets' : 'append to imageAssets'}`);
  console.log(`images     ${imagesRoot}`);
  console.log(`uploads    ${uploadRoot}`);
  console.log(`products   ${products.length}`);
  console.log(`files      ${scanned.files.length} supported, ${scanned.skipped} skipped`);
  console.log(`matches    ${matches.size} products, ${imageCount} image file(s)`);

  const preview = [...matches.values()].slice(0, 25);
  if (preview.length) {
    console.log('\nMatched preview:');
    for (const group of preview) {
      console.log(`- ${group.sku}: ${group.files.length} image(s)`);
    }
  }

  if (matches.size > preview.length) {
    console.log(`... ${matches.size - preview.length} more product(s)`);
  }
}

async function printVerifySummary(Product, matches) {
  const products = await Product.find(
    { _id: { $in: [...matches.keys()].map((id) => new mongoose.Types.ObjectId(id)) } },
    { sku: 1, name: 1, imageAssets: 1 },
  ).lean();
  const productsById = new Map(products.map((product) => [String(product._id), product]));
  const failures = [];

  for (const [productId, group] of matches.entries()) {
    const product = productsById.get(productId);
    const assets = normalizeExistingAssets(product?.imageAssets);
    const missingFiles = assets.filter((asset) => {
      const imagePath = asset.webpUrl || asset.url;
      return !imagePath || !fs.existsSync(path.join(uploadRoot, path.basename(imagePath)));
    });

    if (!product || assets.length !== group.files.length || missingFiles.length) {
      failures.push({
        sku: group.sku,
        expected: group.files.length,
        actual: assets.length,
        missing: missingFiles.length,
      });
    }
  }

  console.log('\nVerification:');
  console.log(`ok         ${matches.size - failures.length} product(s)`);
  console.log(`issues     ${failures.length} product(s)`);

  if (failures.length) {
    console.log('\nProducts needing attention:');
    for (const failure of failures.slice(0, 50)) {
      console.log(
        `- ${failure.sku}: expected ${failure.expected}, actual ${failure.actual}, missing files ${failure.missing}`,
      );
    }
    if (failures.length > 50) {
      console.log(`... ${failures.length - 50} more product(s)`);
    }
  }
}

async function writeOptimizedImage(sourcePath, sku, order) {
  const sourceBuffer = fs.readFileSync(sourcePath);
  const sourceMetadata = await sharp(sourceBuffer).metadata();
  const output = await sharp(sourceBuffer)
    .rotate()
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toBuffer();

  const outputMetadata = await sharp(output).metadata();
  const filename = `${safeFilename(sku)}-${Date.now()}-${order + 1}.webp`;
  const uploadPath = path.join(uploadRoot, filename);
  fs.writeFileSync(uploadPath, output);

  return {
    url: `/uploads/${filename}`,
    webpUrl: `/uploads/${filename}`,
    originalName: path.basename(sourcePath),
    mimeType: 'image/webp',
    size: output.length,
    width: outputMetadata.width || sourceMetadata.width,
    height: outputMetadata.height || sourceMetadata.height,
    order,
    isPrimary: order === 0,
  };
}

function safeFilename(value) {
  return String(value || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'product';
}

function normalizeExistingAssets(assets) {
  return Array.isArray(assets)
    ? assets
        .filter((asset) => asset && (asset.url || asset.webpUrl))
        .map((asset, index) => ({
          ...asset,
          order: Number(asset.order ?? index),
          isPrimary: Boolean(asset.isPrimary),
        }))
        .sort((a, b) => a.order - b.order)
    : [];
}

async function disconnectQuietly() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect().catch(() => undefined);
  }
}
