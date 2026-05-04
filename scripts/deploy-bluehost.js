#!/usr/bin/env node
/**
 * deploy-bluehost.js — Deploy chamber site to Bluehost via FTPS
 * to /public_html/wvwccoc/ for Diana's review.
 *
 * Reads credentials from .deploy.env (gitignored). Required vars:
 *   BLUEHOST_HOST=ftp.bnd.gbm.mybluehost.me
 *   BLUEHOST_USER=ftp1@heedbusinesssolutions.com
 *   BLUEHOST_PASS=...
 *   BLUEHOST_PORT=21
 *   BLUEHOST_REMOTE_DIR=/public_html/wvwccoc
 *
 * Usage:
 *   node scripts/deploy-bluehost.js           # full deploy
 *   node scripts/deploy-bluehost.js --dry     # show what WOULD upload
 *   node scripts/deploy-bluehost.js --verify  # only run post-deploy checks
 */
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);

// ── Load .deploy.env ────────────────────────────────────
const envPath = path.join(ROOT, '.deploy.env');
if (!fs.existsSync(envPath)) {
  console.error('\nERROR: .deploy.env not found at project root.\n');
  console.error('Create it with these lines:\n');
  console.error('  BLUEHOST_HOST=ftp.bnd.gbm.mybluehost.me');
  console.error('  BLUEHOST_USER=ftp1@heedbusinesssolutions.com');
  console.error('  BLUEHOST_PASS=your_password_here');
  console.error('  BLUEHOST_PORT=21');
  console.error('  BLUEHOST_REMOTE_DIR=/public_html/wvwccoc\n');
  console.error('This file is .gitignored — never commit it.\n');
  process.exit(1);
}

const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const HOST = env.BLUEHOST_HOST;
const USER = env.BLUEHOST_USER;
const PASS = env.BLUEHOST_PASS;
const PORT = parseInt(env.BLUEHOST_PORT || '21', 10);
const REMOTE_DIR = env.BLUEHOST_REMOTE_DIR || '/public_html/wvwccoc';
const PUBLIC_URL = env.BLUEHOST_PUBLIC_URL || 'https://heedbusinesssolutions.com/wvwccoc/';

if (!HOST || !USER || !PASS) {
  console.error('ERROR: BLUEHOST_HOST / BLUEHOST_USER / BLUEHOST_PASS are required in .deploy.env');
  process.exit(1);
}

const args = process.argv.slice(2);
const isDry = args.includes('--dry');
const isVerifyOnly = args.includes('--verify');

// ── Files/dirs to NEVER upload ──────────────────────────
const EXCLUDE_DIRS = new Set([
  '.git', '.github', '.claude', '.cache',
  '_archive_heed', 'node_modules', 'raw', 'scripts', 'backend', 'dist'
]);
const EXCLUDE_FILES = new Set([
  '.gitignore', '.deploy.env', '.env', '.env.example', '.env.local',
  'package.json', 'package-lock.json', 'server.js',
  'start-preview.bat', 'start-preview.sh',
  'ELEVENLABS_SYSTEM_PROMPT.md', 'PITCH.md', 'README.md', 'SETUP.md',
  'CLOUDFLARE_DEPLOY.md', '_DEMO_GUIDE.md',
  '.DS_Store', 'Thumbs.db'
]);

function shouldExclude(relPath) {
  const parts = relPath.split(/[\\/]/).filter(Boolean);
  if (EXCLUDE_DIRS.has(parts[0])) return true;
  const filename = parts[parts.length - 1];
  if (EXCLUDE_FILES.has(filename)) return true;
  if (filename.endsWith('.log')) return true;
  return false;
}

function listLocalFiles(dir = '.', acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.relative(ROOT, path.join(dir, entry.name)).replace(/\\/g, '/');
    if (shouldExclude(rel)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listLocalFiles(full, acc);
    else if (entry.isFile()) acc.push({ rel, full, size: fs.statSync(full).size });
  }
  return acc;
}

function fmtBytes(n) {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(2) + ' MB';
}

const sha = (() => { try { return execSync('git rev-parse --short HEAD').toString().trim(); } catch { return 'no-git'; } })();
const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

console.log('──────────────────────────────────────────────');
console.log('Bluehost FTPS deploy — wvwccoc preview');
console.log('──────────────────────────────────────────────');
console.log(`  host       ${HOST}:${PORT}`);
console.log(`  user       ${USER}`);
console.log(`  remote dir ${REMOTE_DIR}`);
console.log(`  release    ${ts}-${sha}`);
console.log(`  preview    ${PUBLIC_URL}`);
console.log('──────────────────────────────────────────────\n');

const VERIFY_URLS = [
  PUBLIC_URL,
  PUBLIC_URL + 'index.html',
  PUBLIC_URL + 'members/directory.html',
  PUBLIC_URL + 'guides/cityloop.html',
  PUBLIC_URL + 'loyalty.html',
  PUBLIC_URL + 'data/directory.json',
  PUBLIC_URL + 'css/chamber.css?v=6',
  PUBLIC_URL + 'js/partials.js?v=6',
  PUBLIC_URL + 'es/index.html',
  PUBLIC_URL + 'admin/index.html'
];

async function verify() {
  console.log('Verifying live site…\n');
  for (const url of VERIFY_URLS) {
    try {
      const r = await fetch(url, { redirect: 'follow' });
      const sym = r.ok ? '✓' : '✗';
      console.log(`  ${sym} ${r.status}  ${url}`);
    } catch (e) {
      console.log(`  ✗ ERR  ${url}  ${e.message}`);
    }
  }
}

async function deploy() {
  const files = listLocalFiles().sort((a, b) => a.rel.localeCompare(b.rel));
  const totalBytes = files.reduce((s, f) => s + f.size, 0);
  console.log(`Files to upload: ${files.length} · ${fmtBytes(totalBytes)} total\n`);

  if (isDry) {
    console.log('DRY RUN — would upload these (showing first 30):\n');
    files.slice(0, 30).forEach(f => console.log(`  ${fmtBytes(f.size).padStart(10)}  ${f.rel}`));
    if (files.length > 30) console.log(`  … and ${files.length - 30} more`);
    return;
  }

  const client = new ftp.Client(60_000);
  client.ftp.verbose = false;

  try {
    console.log('Connecting (FTPS explicit on port 21)…');
    await client.access({
      host: HOST,
      port: PORT,
      user: USER,
      password: PASS,
      secure: true,
      secureOptions: { rejectUnauthorized: false } // Bluehost FTPS cert often differs from FQDN
    });
    console.log('✓ Connected\n');

    // Ensure remote dir exists
    await client.ensureDir(REMOTE_DIR);
    console.log(`✓ Remote dir ready: ${REMOTE_DIR}\n`);

    console.log('Uploading…');
    const start = Date.now();
    let uploaded = 0;
    let bytesUp = 0;
    const reportEvery = Math.max(1, Math.floor(files.length / 20));

    for (const file of files) {
      const remotePath = REMOTE_DIR + '/' + file.rel;
      const remoteDir  = remotePath.substring(0, remotePath.lastIndexOf('/'));
      try {
        await client.ensureDir(remoteDir);
        await client.cd('/'); // ensureDir leaves us in the dir; reset
        await client.uploadFrom(file.full, remotePath);
        uploaded++;
        bytesUp += file.size;
        if (uploaded % reportEvery === 0 || uploaded === files.length) {
          const pct = Math.round((uploaded / files.length) * 100);
          process.stdout.write(`\r  ${uploaded}/${files.length} (${pct}%) · ${fmtBytes(bytesUp)}      `);
        }
      } catch (e) {
        console.error(`\n  ✗ ${file.rel} — ${e.message}`);
      }
    }
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(`\n\n✓ Uploaded ${uploaded}/${files.length} files (${fmtBytes(bytesUp)}) in ${elapsed}s`);
  } catch (e) {
    console.error('\n✗ Deploy failed:', e.message);
    process.exitCode = 1;
  } finally {
    client.close();
  }

  console.log('\n──────────────────────────────────────────────');
  console.log(`Preview: ${PUBLIC_URL}`);
  console.log('──────────────────────────────────────────────\n');
}

(async () => {
  if (isVerifyOnly) { await verify(); return; }
  await deploy();
  if (!isDry) {
    console.log('Waiting 5s for the file system to settle…\n');
    await new Promise(r => setTimeout(r, 5000));
    await verify();
    console.log(`\nDone. Share ${PUBLIC_URL} with Diana.\n`);
  }
})();
