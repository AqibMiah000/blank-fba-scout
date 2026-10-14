const assert = require('assert');
const FbaCalculator = require('../shared/fba-calculator');
const TopWholesale = require('../shared/top-wholesale-products');

console.log('--- Testing Break-Even & Q4 Storage ---');
const calcRes = FbaCalculator.calculateProfit({
  sellingPrice: 24.99,
  costOfGoods: 6.50,
  category: 'Kitchen & Dining',
  dimensions: [12, 8, 3],
  weightLb: 1.5,
  inboundShippingRatePerLb: 0.40,
  prepFee: 0.20,
  targetRoi: 30,
  minProfit: 3.00,
  maxBsr: 50000,
  bsr: 1500
});

console.log('Break-Even Price:', '$' + calcRes.breakEvenPrice);
console.log('Target Min Price:', '$' + calcRes.targetMinPrice);
console.log('Cubic Feet:', calcRes.cubicFeet, 'cu ft');
console.log('Standard Storage:', '$' + calcRes.standardMonthlyStorage, '/mo');
console.log('Q4 Surge Storage:', '$' + calcRes.q4MonthlyStorage, '/mo');
console.log('Meets Criteria:', calcRes.meetsCriteria);

assert(calcRes.breakEvenPrice > calcRes.costOfGoods, 'Break-even price must exceed COGS');
assert(calcRes.q4MonthlyStorage > calcRes.standardMonthlyStorage, 'Q4 storage must be higher than standard');
assert.strictEqual(calcRes.meetsCriteria, true, 'Should meet criteria');

console.log('\n--- Testing Top 100 Wholesale Directory ---');
const allProds = TopWholesale.getAllProducts();
console.log('Total wholesale products in database:', allProds.length);
assert.strictEqual(allProds.length, 100, 'Should have exactly 100 products');

const categories = TopWholesale.getCategories();
console.log('Categories:', categories.join(', '));

const kitchenProds = TopWholesale.getProductsByCategory('Kitchen');
console.log('Kitchen products sample:', kitchenProds.slice(0, 2).map(p => `${p.name} ($${p.retailPrice})`));

console.log('\nAll v1.3.0 verification tests passed successfully!');
