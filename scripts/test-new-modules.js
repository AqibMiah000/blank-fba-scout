const assert = require('assert');
const RestrictionsChecker = require('../shared/restrictions-checker');
const CompetitionAnalyzer = require('../shared/competition-analyzer');
const WholesaleSourcing = require('../shared/wholesale-sourcing');
const ThemeEngine = require('../shared/themes');

console.log('--- Testing Restrictions Checker ---');
const testProduct = {
  asin: 'B0F86NH2ZX',
  title: 'Anker Prime Power Bank, 20,100mAh 3-Port Portable Charger 220W Output',
  brand: 'Anker',
  category: 'Cell Phones & Accessories',
  price: 129.99,
  sellerInfo: { type: 'FBA', name: 'AnkerDirect' },
  sellerCount: 1,
  sizeTier: 'Large standard'
};

const restResult = RestrictionsChecker.analyzeRestrictions(testProduct);
console.log('Hazmat status:', restResult.hazmat.status, '(', restResult.hazmat.msg, ')');
console.log('DG status:', restResult.dg.status, '(', restResult.dg.msg, ')');
console.log('IP Radar status:', restResult.ipRadar.status, '(', restResult.ipRadar.msg, ')');
console.log('BB Analysis status:', restResult.bbAnalysis.status, '(', restResult.bbAnalysis.msg, ')');
console.log('Oversize status:', restResult.oversize.status, '(', restResult.oversize.msg, ')');

assert(restResult.hazmat.status === 'warning', 'Should detect power bank / battery as hazmat');

console.log('\n--- Testing Competition & Purchase Quantity ---');
const comp = CompetitionAnalyzer.analyzeCompetition({ sellerCount: 3, isAmazonInBuyBox: false });
console.log('Competition level:', comp.level);

const quantities = CompetitionAnalyzer.calculatePurchaseQuantity({
  estimatedMonthlySales: 956,
  sellerCount: 3,
  costOfGoods: 35.00,
  netProfitPerUnit: 25.00
});
console.log('Your estimated monthly velocity:', quantities.yourMonthlyVelocity, 'units');
console.log('14-Day Test:', quantities.testOrder);
console.log('30-Day Order:', quantities.order30Day);

console.log('\n--- Testing Sourcing Links ---');
const links = WholesaleSourcing.generateSourcingLinks({
  title: testProduct.title,
  brand: testProduct.brand,
  asin: testProduct.asin
});
console.log('Generated links count:', links.length);
links.forEach(l => console.log(`- ${l.name} (${l.badge}): ${l.url}`));

console.log('\n--- Testing Theme Engine ---');
const themes = ThemeEngine.getAvailableThemes();
console.log('Themes available:', themes.map(t => t.name).join(', '));
assert.strictEqual(themes.length, 5);

console.log('\nAll new module tests passed!');
