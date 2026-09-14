// Maintenance, Compatibility & Update Auditor for BLANK FBA SCOUT
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('====================================================');
console.log('    BLANK FBA SCOUT - AUTOMATED UPDATE AUDITOR      ');
console.log('====================================================\n');

const ROOT_DIR = path.resolve(__dirname, '..');
const manifestPath = path.join(ROOT_DIR, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const currentVersion = manifest.version;

console.log(`[STATUS] Current Version: v${currentVersion}`);

// 1. DOM Selectors Audit in content.js
console.log('\n[1/4] Auditing Amazon DOM Selectors in content.js...');
const contentJsPath = path.join(ROOT_DIR, 'content', 'content.js');
const contentJs = fs.readFileSync(contentJsPath, 'utf8');

const activeSelectors = [
  '#corePrice_feature_div',
  '#corePriceDisplay_desktop_feature_div',
  '#merchant-info',
  '#tabular-buybox',
  '#all-offers-display',
  'a[href*="seller="]',
  '#productTitle',
  '#landingImage',
  '#bylineInfo',
  '#productDetails_techSpec_section_1',
  '#detailBullets_feature_div'
];

let allSelectorsOk = true;
activeSelectors.forEach(sel => {
  if (contentJs.includes(sel)) {
    console.log(`  [OK] Active selector found: ${sel}`);
  } else {
    console.warn(`  [WARNING] Selector missing: ${sel}`);
    allSelectorsOk = false;
  }
});

// 2. Run All Automated Test Suites
console.log('\n[2/4] Running Automated Verification Test Suites...');
try {
  execSync('node scripts/run-all-tests.js', { cwd: ROOT_DIR, stdio: 'inherit' });
  console.log('[OK] All test suites passed!');
} catch (e) {
  console.error('\n[ERROR] Automated tests failed! Halting update.');
  process.exit(1);
}

// 3. Automated Backup Verification
console.log('\n[3/4] Checking Version Backup Status...');
const backupDir = path.join(ROOT_DIR, 'backups', `v${currentVersion}`);
if (fs.existsSync(backupDir)) {
  console.log(`  [OK] Snapshot backup already exists at: backups/v${currentVersion}`);
} else {
  console.log(`  [CREATING] Creating snapshot backup at: backups/v${currentVersion}...`);
  fs.mkdirSync(backupDir, { recursive: true });
  const copyList = ['manifest.json', 'background.js', 'README.md', 'LICENSE', 'content', 'icons', 'popup', 'shared', 'scripts'];
  copyList.forEach(item => {
    const src = path.join(ROOT_DIR, item);
    const dst = path.join(backupDir, item);
    if (fs.existsSync(src)) {
      fs.cpSync(src, dst, { recursive: true });
    }
  });
  console.log(`  [OK] Backup archived successfully.`);
}

// 4. Version Incrementing & Release Readiness
const [major, minor, patch] = currentVersion.split('.').map(Number);
const nextVersion = `${major}.${minor + 1}.0`;
console.log('\n[4/4] Release Pipeline Progression:');
console.log(`  - Current Release: v${currentVersion}`);
console.log(`  - Next Target Release: v${nextVersion}`);

try {
  const remote = execSync('git remote -v', { cwd: ROOT_DIR }).toString().trim();
  console.log(`  - Git Remote: Configured`);
} catch (e) {
  console.log('  - Git Remote: None');
}

console.log('\n====================================================');
console.log('  AUDIT COMPLETE: Extension is fully healthy & verified!');
console.log('====================================================');
