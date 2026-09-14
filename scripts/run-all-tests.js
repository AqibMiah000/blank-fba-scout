// Unified Test Runner for BLANK FBA SCOUT
const { execSync } = require('child_process');
const path = require('path');

const testScripts = [
  'test-calculators.js',
  'test-new-modules.js',
  'test-v120.js',
  'test-v130.js'
];

console.log('==============================================');
console.log('  BLANK FBA SCOUT - Comprehensive Test Suite  ');
console.log('==============================================\n');

let allPassed = true;

for (const script of testScripts) {
  const scriptPath = path.join(__dirname, script);
  console.log(`>>> Running: ${script}...`);
  try {
    const output = execSync(`node "${scriptPath}"`, { stdio: 'pipe' }).toString();
    console.log(output);
    console.log(`[PASS] ${script}\n----------------------------------------------`);
  } catch (err) {
    allPassed = false;
    console.error(`[FAIL] ${script}:`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    console.error(`----------------------------------------------`);
  }
}

if (allPassed) {
  console.log('\n[SUCCESS] ALL TEST SUITES PASSED WITH ZERO ERRORS!');
  process.exit(0);
} else {
  console.error('\n[ERROR] SOME TESTS FAILED! FIX BUGS BEFORE PROCEEDING.');
  process.exit(1);
}
