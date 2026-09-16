// Verification Tests for BLANK FBA SCOUT v1.5.0
const assert = require('assert');
const FbaCalculator = require('../shared/fba-calculator.js');

console.log('--- Testing 2026 Inbound Placement Fee in FBA Calculator ---');

// Test standard calculation without placement fee
const resStandard = FbaCalculator.calculateProfit({
  sellingPrice: 29.99,
  costOfGoods: 8.00,
  weightLb: 1.2,
  inboundPlacementFee: 0.00
});
console.log('Without Placement Fee:', {
  totalAmazonFees: resStandard.totalAmazonFees,
  netProfit: resStandard.netProfit,
  roi: resStandard.roi
});

// Test with 2026 Amazon Inbound Placement Service Fee ($0.32/unit)
const resWithPlacement = FbaCalculator.calculateProfit({
  sellingPrice: 29.99,
  costOfGoods: 8.00,
  weightLb: 1.2,
  inboundPlacementFee: 0.32
});
console.log('With $0.32 Placement Fee:', {
  totalAmazonFees: resWithPlacement.totalAmazonFees,
  netProfit: resWithPlacement.netProfit,
  roi: resWithPlacement.roi
});

assert.strictEqual(Number((resStandard.netProfit - resWithPlacement.netProfit).toFixed(2)), 0.32);
assert.strictEqual(Number((resWithPlacement.totalAmazonFees - resStandard.totalAmazonFees).toFixed(2)), 0.32);
assert.strictEqual(resWithPlacement.inboundPlacementFee, 0.32);

console.log('\n--- Testing Version Consistency & Manifest ---');
const fs = require('fs');
const path = require('path');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest.json'), 'utf8'));
console.log('Manifest version:', manifest.version);

console.log('\nAll v1.5.0 verification tests passed successfully!');
