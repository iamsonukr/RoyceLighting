#!/usr/bin/env node

const dnsModule = require('dns');
const dns = dnsModule.promises;
const fs = require('fs');
const net = require('net');
const path = require('path');
const mongoose = require('mongoose');

const backendRoot = path.resolve(__dirname, '..');
const envFile = process.env.DB_DEBUG_ENV_FILE || path.join(backendRoot, '.env');
const timeoutMs = readPositiveInt(process.env.DB_DEBUG_TIMEOUT_MS, 10000);

main().catch(async (error) => {
  printError('fatal', error);
  await disconnectQuietly();
  process.exitCode = 1;
});

async function main() {
  header('Royce Lighting database debugger');
  line('cwd', process.cwd());
  line('env file', envFile);
  line('timeout', `${timeoutMs}ms`);

  loadEnvFile(envFile);

  const args = process.argv.slice(2);
  const cliUri = readOptionArg(args, '--uri=');
  const dnsServers = readDnsServers(readOptionArg(args, '--dns=') || process.env.DB_DNS_SERVERS);

  if (dnsServers.length) {
    dnsModule.setServers(dnsServers);
    line('dns servers', dnsServers.join(', '));
  }

  const uri = cliUri || process.env.MONGODB_URI || process.env.DB_URL;

  if (!uri) {
    fail('MONGODB_URI is missing.');
    note('Create backend/.env with MONGODB_URI=... or pass --uri="mongodb://..."');
    process.exitCode = 1;
    return;
  }

  let details;
  try {
    details = inspectUri(uri);
  } catch (error) {
    fail('MONGODB_URI is not a valid MongoDB connection string.');
    printError('parse', error);
    note('If the password contains @, :, /, #, ?, or &, URL-encode those characters.');
    process.exitCode = 1;
    return;
  }

  line('uri', maskMongoUri(uri));
  line('protocol', details.protocol.replace(':', ''));
  line('host', details.host);
  line('database', details.database || '(none - MongoDB will use "test")');

  if (!details.database) {
    warn('No database name is present in MONGODB_URI.');
    note('Use a URI like mongodb+srv://user:pass@host/royce-lighting?retryWrites=true&w=majority');
  }

  await runDnsChecks(details);
  await runTcpChecks(details);
  await runMongooseCheck(uri);
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    warn(`Env file not found: ${filePath}`);
    return;
  }

  try {
    require('dotenv').config({ path: filePath });
    ok('Loaded env file with dotenv.');
    return;
  } catch (error) {
    warn(`dotenv could not be loaded: ${error.message}`);
  }

  const parsed = parseEnvFile(fs.readFileSync(filePath, 'utf8'));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
  ok('Loaded env file with fallback parser.');
}

function parseEnvFile(content) {
  const result = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[match[1]] = value;
  }

  return result;
}

function inspectUri(uri) {
  const parsed = new URL(uri);
  const protocol = parsed.protocol;

  if (protocol !== 'mongodb:' && protocol !== 'mongodb+srv:') {
    throw new Error(`Unsupported protocol: ${protocol || '(missing)'}`);
  }

  return {
    protocol,
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 27017,
    database: decodeURIComponent(parsed.pathname.replace(/^\//, '')),
    isSrv: protocol === 'mongodb+srv:',
    authSource: parsed.searchParams.get('authSource'),
  };
}

async function runDnsChecks(details) {
  header('DNS checks');

  if (details.isSrv) {
    const srvName = `_mongodb._tcp.${details.host}`;
    try {
      const records = await dns.resolveSrv(srvName);
      ok(`SRV records found for ${srvName}: ${records.length}`);
      records.slice(0, 3).forEach((record, index) => {
        line(
          `srv ${index + 1}`,
          `${trimDot(record.name)}:${record.port} priority=${record.priority} weight=${record.weight}`,
        );
      });
      details.srvRecords = records;
    } catch (error) {
      fail(`Could not resolve SRV record ${srvName}.`);
      printError('dns', error);
      note(explainError(error));
    }

    try {
      const txtRecords = await dns.resolveTxt(details.host);
      ok(`TXT records found for ${details.host}: ${txtRecords.length}`);
    } catch (error) {
      warn(`No TXT record read for ${details.host}: ${formatError(error)}`);
    }

    return;
  }

  try {
    const addresses = await dns.lookup(details.host, { all: true });
    ok(`Address records found for ${details.host}: ${addresses.length}`);
    addresses.slice(0, 3).forEach((address, index) => {
      line(`addr ${index + 1}`, `${address.address} family=IPv${address.family}`);
    });
  } catch (error) {
    fail(`Could not resolve host ${details.host}.`);
    printError('dns', error);
    note(explainError(error));
  }
}

async function runTcpChecks(details) {
  header('TCP checks');

  const targets = details.isSrv
    ? (details.srvRecords || []).slice(0, 3).map((record) => ({
        host: trimDot(record.name),
        port: record.port,
      }))
    : [{ host: details.host, port: details.port }];

  if (!targets.length) {
    warn('Skipped TCP checks because no target host was resolved.');
    return;
  }

  for (const target of targets) {
    const result = await testTcp(target.host, target.port, timeoutMs);
    if (result.ok) {
      ok(`TCP connect succeeded: ${target.host}:${target.port}`);
    } else {
      fail(`TCP connect failed: ${target.host}:${target.port}`);
      line('tcp error', result.error);
    }
  }
}

async function runMongooseCheck(uri) {
  header('Mongoose check');

  if (process.env.MONGOOSE_DEBUG === '1' || process.env.DB_DEBUG_VERBOSE === '1') {
    mongoose.set('debug', (collection, method, query, doc) => {
      line('mongoose', `${collection}.${method} ${safeJson(query)} ${safeJson(doc)}`);
    });
  }

  mongoose.connection.on('connected', () => ok('Mongoose connected.'));
  mongoose.connection.on('disconnected', () => warn('Mongoose disconnected.'));
  mongoose.connection.on('error', (error) => printError('mongoose event', error));

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs,
      connectTimeoutMS: timeoutMs,
      socketTimeoutMS: timeoutMs,
      maxPoolSize: 1,
      autoIndex: false,
    });

    const db = mongoose.connection.db;
    line('db name', db.databaseName);

    await db.admin().ping();
    ok('MongoDB ping succeeded.');

    try {
      const collections = await db.listCollections({}, { nameOnly: true }).toArray();
      line('collections', collections.length ? collections.map((item) => item.name).join(', ') : '(none)');
    } catch (error) {
      warn(`Connected, but could not list collections: ${formatError(error)}`);
    }

    ok('Database connection is working.');
  } catch (error) {
    fail('Mongoose could not connect.');
    printError('connect', error);
    note(explainError(error));
    process.exitCode = 1;
  } finally {
    await disconnectQuietly();
  }
}

function testTcp(host, port, timeout) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port, timeout });
    let settled = false;

    const finish = (result) => {
      if (settled) {
        return;
      }
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.once('connect', () => finish({ ok: true }));
    socket.once('timeout', () => finish({ ok: false, error: `timeout after ${timeout}ms` }));
    socket.once('error', (error) => finish({ ok: false, error: formatError(error) }));
  });
}

async function disconnectQuietly() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect().catch(() => undefined);
  }
}

function readOptionArg(args, prefix) {
  const arg = args.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

function readDnsServers(value) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);
}

function readPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function maskMongoUri(uri) {
  try {
    const parsed = new URL(uri);
    const auth = parsed.username ? '<user>:***@' : '';
    return `${parsed.protocol}//${auth}${parsed.host}${parsed.pathname}${parsed.search}`;
  } catch {
    return uri.replace(/\/\/([^:@/]+)(?::([^@/]*))?@/, '//<user>:***@');
  }
}

function explainError(error) {
  const text = `${error.name || ''} ${error.code || ''} ${error.message || ''}`.toLowerCase();

  if (text.includes('authentication failed') || text.includes('bad auth')) {
    return 'Diagnosis: MongoDB username/password is wrong, the user was deleted, or authSource points to the wrong database.';
  }

  if (text.includes('querysrv') || text.includes('enotfound') || text.includes('enodata')) {
    return 'Diagnosis: DNS cannot resolve the Atlas SRV host. Check the cluster hostname and local/network DNS.';
  }

  if (text.includes('ip') && (text.includes('whitelist') || text.includes('access list'))) {
    return 'Diagnosis: your current IP is not allowed in MongoDB Atlas Network Access.';
  }

  if (text.includes('econnrefused')) {
    return 'Diagnosis: the MongoDB host is reachable, but nothing is listening on that port.';
  }

  if (text.includes('timed out') || text.includes('etimeout') || text.includes('server selection')) {
    return 'Diagnosis: MongoDB is not reachable from this machine. Check Atlas access list, VPN/firewall, and internet access.';
  }

  if (text.includes('mongoParseError'.toLowerCase()) || text.includes('invalid scheme')) {
    return 'Diagnosis: the connection string format is invalid.';
  }

  return 'Diagnosis: see the error above; it is not one of the common MongoDB connection failures.';
}

function safeJson(value) {
  if (value === undefined) {
    return '';
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function trimDot(value) {
  return value.replace(/\.$/, '');
}

function formatError(error) {
  const code = error.code ? `${error.code}: ` : '';
  return `${code}${error.message || error}`;
}

function header(message) {
  console.log(`\n== ${message} ==`);
}

function line(label, message) {
  console.log(`${label.padEnd(12)} ${message}`);
}

function ok(message) {
  line('ok', message);
}

function warn(message) {
  line('warn', message);
}

function fail(message) {
  line('fail', message);
}

function note(message) {
  line('note', message);
}

function printError(label, error) {
  line(label, formatError(error));
}
