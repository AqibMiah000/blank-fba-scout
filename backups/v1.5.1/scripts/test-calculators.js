const assert = require('assert');
const FbaCalculator = require('../shared/fba-calculator');
const BsrEstimator = require('../shared/bsr-estimator');

console.log('--- Testing BSR Estimator ---');
const testCasesBSR = [
  { bsr: 1, cat: 'Home & Kitchen' },
  { bsr: 1500, cat: 'Kitchen & Dining' },
  { bsr: 12000, cat: 'Toys & Games' },
  { bsr: 65000, cat: 'Sports & Outdoors' },
  { bsr: 450000, cat: 'Books' }
];

testCasesBSR.forEach(tc => {
  const res = BsrEstimator.estimateMonthlySales(tc.bsr, tc.cat);
  const rev = BsrEstimator.estimateMonthlyRevenue(res.estimatedMonthlySales, 29.99);
  console.log(`BSR #${tc.bsr} in ${tc.cat}:`);
  console.log(`  -> Monthly Sales: ${res.estimatedMonthlySales} units/mo | Daily: ${res.estimatedDailySales} | Revenue: $${rev}`);
  assert(res.estimatedMonthlySales >= 0, 'Sales should be non-negative');
});

console.log('\n--- Testing FBA Calculator ---');
// Test Case 1: Standard product ($29.99 sell price, 1.2 lb, 10x8x2 in, $8 COGS)
const profit1 = FbaCalculator.calculateProfit({
  sellingPrice: 29.99,
  costOfGoods: 8.00,
  category: 'Kitchen & Dining',
  dimensions: [10, 8, 2],
  weightLb: 1.2,
  inboundShippingRatePerLb: 0.40,
  prepFee: 0.20
});

console.log('Sample Product Profitability ($29.99 sell, $8 COGS, 1.2 lb):');
console.log(`  Referral Fee: $${profit1.referralFee}`);
console.log(`  FBA Fee: $${profit1.fbaFee} (Tier: ${profit1.sizeTier})`);
console.log(`  Inbound Shipping: $${profit1.inboundShipping}`);
console.log(`  Total Costs: $${profit1.totalCosts}`);
console.log(`  Net Profit: $${profit1.netProfit}`);
console.log(`  Margin: ${profit1.profitMargin}%`);
console.log(`  ROI: ${profit1.roi}%`);

assert(profit1.netProfit > 0, 'Should be profitable');
assert.strictEqual(profit1.sizeTier, 'Large standard');

console.log('\nAll tests passed successfully!');
