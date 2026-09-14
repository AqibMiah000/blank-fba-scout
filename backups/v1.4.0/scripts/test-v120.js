const assert = require('assert');
const ConfidenceScore = require('../shared/confidence-score');
const ChartsEngine = require('../shared/charts-engine');

console.log('--- Testing Confidence Score Engine ---');
const scoreRes = ConfidenceScore.calculateScore({
  sellingPrice: 14.69,
  costOfGoods: 3.50,
  netProfit: 6.49,
  profitMargin: 44.2,
  roi: 185.4,
  bsr: 13650,
  estimatedMonthlySales: 429,
  sellerCount: 4,
  isAmazonInBuyBox: false,
  restrictions: { ipRadar: { status: 'pass' }, hazmat: { status: 'pass' } }
});

console.log('Score:', scoreRes.score, '%');
console.log('Rating:', scoreRes.ratingLabel);
console.log('Drivers:', scoreRes.drivers);
console.log('Suggested Qty:', scoreRes.suggestedQty);
assert(scoreRes.score > 60, 'Strong deal should score above 60');

console.log('\n--- Testing Charts Engine ---');
const bsrChart = ChartsEngine.renderBsrChart(13650, 30);
const priceChart = ChartsEngine.renderPriceChart(14.69, 90);
const stockChart = ChartsEngine.renderStockVsPriceChart(14.69, 4, 30);

assert(bsrChart.includes('<svg'), 'BSR chart should generate valid SVG');
assert(priceChart.includes('30-Day Avg'), 'Price chart should contain averages');
assert(stockChart.includes('Sellers'), 'Stock chart should contain sellers comparison');

console.log('Charts rendered successfully (Lengths:', bsrChart.length, priceChart.length, stockChart.length, ')');
console.log('\nAll v1.2.0 verification tests passed!');
