// Comprehensive Verification Tests for BLANK FBA SCOUT v1.5.0
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const FbaCalculator = require('../shared/fba-calculator.js');
const MarketplaceEngine = require('../shared/marketplaces.js');
const ChartsEngine = require('../shared/charts-engine.js');
const WholesaleSourcing = require('../shared/wholesale-sourcing.js');

console.log('--- 1. Testing 2026 Inbound Placement Fee in FBA Calculator ---');
const resStandard = FbaCalculator.calculateProfit({
  sellingPrice: 29.99,
  costOfGoods: 8.00,
  weightLb: 1.2,
  inboundPlacementFee: 0.00
});
const resWithPlacement = FbaCalculator.calculateProfit({
  sellingPrice: 29.99,
  costOfGoods: 8.00,
  weightLb: 1.2,
  inboundPlacementFee: 0.32
});
assert.strictEqual(Number((resStandard.netProfit - resWithPlacement.netProfit).toFixed(2)), 0.32);
assert.strictEqual(resWithPlacement.inboundPlacementFee, 0.32);
console.log('[PASS] Inbound Placement Fee calculation verified.');

console.log('\n--- 2. Testing Marketplace Auto-Detection Engine ---');
const mUS = MarketplaceEngine.detectMarketplace('https://www.amazon.com/dp/B08N5WRWNW');
assert.strictEqual(mUS.code, 'US');
assert.strictEqual(mUS.currency, 'USD');
assert.strictEqual(mUS.symbol, '$');

const mUK = MarketplaceEngine.detectMarketplace('https://www.amazon.co.uk/dp/B08N5WRWNW');
assert.strictEqual(mUK.code, 'UK');
assert.strictEqual(mUK.currency, 'GBP');
assert.strictEqual(mUK.symbol, '£');
assert.strictEqual(mUK.vatRate, 0.20);

const mDE = MarketplaceEngine.detectMarketplace('https://www.amazon.de/dp/B08N5WRWNW');
assert.strictEqual(mDE.code, 'DE');
assert.strictEqual(mDE.currency, 'EUR');
assert.strictEqual(mDE.symbol, '€');
assert.strictEqual(mDE.vatRate, 0.19);

const mCA = MarketplaceEngine.detectMarketplace('https://www.amazon.ca/dp/B08N5WRWNW');
assert.strictEqual(mCA.code, 'CA');
assert.strictEqual(mCA.currency, 'CAD');
assert.strictEqual(mCA.symbol, 'CA$');
console.log('[PASS] Marketplace detection verified for US, UK, DE, CA.');

console.log('\n--- 3. Testing VAT Calculations (UK 20% & DE 19%) ---');
const vatUK = MarketplaceEngine.calculateVat(24.00, mUK);
assert.strictEqual(vatUK.vatAmount, 4.00);
assert.strictEqual(vatUK.netPrice, 20.00);

const ukProfit = FbaCalculator.calculateProfit({
  sellingPrice: 24.00,
  costOfGoods: 6.00,
  vatRate: mUK.vatRate,
  marketplace: 'UK'
});
assert.strictEqual(ukProfit.vatAmount, 4.00);
assert.strictEqual(ukProfit.marketplace, 'UK');
console.log('[PASS] VAT calculation and net margin deduction verified.');

console.log('\n--- 4. Testing Keepa API CSV Parser in ChartsEngine ---');
// Keepa sample data format: [time1, price1, time2, price2]
const sampleKeepaPrice = [28500000, 2499, 28500500, 2599, 28501000, 2399];
const parsedPrice = ChartsEngine.parseKeepaCsv(sampleKeepaPrice, true);
assert.deepStrictEqual(parsedPrice, [24.99, 25.99, 23.99]);
console.log('[PASS] Keepa CSV price points parser verified.');

console.log('\n--- 5. Testing Regional Wholesale Sourcing Links ---');
const linksUK = WholesaleSourcing.generateSourcingLinks({
  title: 'Anker Power Bank',
  asin: 'B08N5WRWNW',
  hostSuffix: 'amazon.co.uk'
});
const sellerLinkUK = linksUK.find(l => l.name === 'Amazon Seller Central');
assert(sellerLinkUK.url.includes('sellercentral.amazon.co.uk'));
const ebayUK = linksUK.find(l => l.name === 'eBay Bulk Lots');
assert(ebayUK.url.includes('ebay.co.uk'));
console.log('[PASS] Regional sourcing links verified.');

console.log('\n--- 6. Testing Manifest Permissions & Domain Matches ---');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest.json'), 'utf8'));
assert(manifest.host_permissions.includes('*://*.amazon.co.uk/*'));
assert(manifest.host_permissions.includes('*://*.amazon.de/*'));
assert(manifest.content_scripts[0].matches.includes('*://*.amazon.co.uk/*'));
assert(manifest.content_scripts[0].js.includes('shared/marketplaces.js'));
console.log('[PASS] Manifest domain matches and scripts verified.');

console.log('\nAll v1.5.0 verification tests passed successfully with 100% precision!');
