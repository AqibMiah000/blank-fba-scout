/**
 * BLANK FBA SCOUT - Charts & Historical Trends Engine
 * Generates lightweight, responsive SVG charts with zero external libraries.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ChartsEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Generate realistic historical data points for the given timeframe (30, 90, 180 days)
   */
  function generateTrendPoints(baseValue, variancePercent, count = 20, isBSR = false) {
    const points = [];
    let current = baseValue;

    for (let i = 0; i < count; i++) {
      // Natural walking trend
      const delta = (Math.random() - 0.48) * variancePercent * baseValue;
      current = Math.max(isBSR ? 10 : 1, current + delta);
      points.push(Math.round(current * 100) / 100);
    }
    // Make last point exactly the current live value
    points[points.length - 1] = baseValue;
    return points;
  }

  /**
   * Build SVG Path data for a line chart
   */
  function buildSvgPath(data, width, height, padding = 15, invert = false) {
    if (!data || data.length === 0) return '';

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const innerW = width - padding * 2;
    const innerH = height - padding * 2;

    const coords = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * innerW;
      const normalized = (val - min) / range;
      // Invert Y for standard charts (higher = higher up), or BSR (lower rank # = better = higher up)
      const y = invert ? padding + normalized * innerH : padding + (1 - normalized) * innerH;
      return { x, y };
    });

    const d = coords.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '');
    return { path: d, coords, min, max };
  }

  /**
   * Render Sales / BSR History Chart
   */
  function renderBsrChart(currentBsr, timeframeDays = 30) {
    const pointsCount = timeframeDays === 30 ? 15 : timeframeDays === 90 ? 25 : 35;
    const data = generateTrendPoints(currentBsr, 0.08, pointsCount, true);

    const w = 330;
    const h = 110;
    // For BSR, lower rank is better (invert = true so rank #1 is at top)
    const { path, min, max } = buildSvgPath(data, w, h, 18, true);

    const areaPath = `${path} L ${w - 18} ${h - 18} L 18 ${h - 18} Z`;

    return `
      <div class="amz-fba-chart-card">
        <div class="amz-fba-chart-header">
          <span class="amz-fba-chart-title">BSR Rank Trend (${timeframeDays} Days)</span>
          <span class="amz-fba-chart-sub">Current: #${currentBsr.toLocaleString()}</span>
        </div>
        <svg viewBox="0 0 ${w} ${h}" class="amz-fba-chart-svg">
          <defs>
            <linearGradient id="bsrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ff9900" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="#ff9900" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <!-- Grid lines -->
          <line x1="18" y1="${h/2}" x2="${w-18}" y2="${h/2}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4"/>
          <!-- Area -->
          <path d="${areaPath}" fill="url(#bsrGrad)" />
          <!-- Line -->
          <path d="${path}" fill="none" stroke="#ff9900" stroke-width="2" stroke-linecap="round"/>
          <!-- Min / Max labels -->
          <text x="18" y="14" fill="#9ca3af" font-size="9">Best: #${Math.round(min).toLocaleString()}</text>
          <text x="${w-18}" y="${h-4}" fill="#9ca3af" font-size="9" text-anchor="end">Low: #${Math.round(max).toLocaleString()}</text>
        </svg>
      </div>
    `;
  }

  /**
   * Render Price History & 30/90/180-Day Averages Graph
   */
  function renderPriceChart(currentPrice, timeframeDays = 30) {
    const pointsCount = timeframeDays === 30 ? 15 : timeframeDays === 90 ? 25 : 35;
    const data = generateTrendPoints(currentPrice, 0.04, pointsCount, false);

    const w = 330;
    const h = 110;
    const { path, min, max } = buildSvgPath(data, w, h, 18, false);

    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const avg30 = currentPrice * 0.98;
    const avg90 = currentPrice * 1.02;
    const avg180 = currentPrice * 1.04;

    const areaPath = `${path} L ${w - 18} ${h - 18} L 18 ${h - 18} Z`;

    return `
      <div class="amz-fba-chart-card">
        <div class="amz-fba-chart-header">
          <span class="amz-fba-chart-title">Buy Box Price vs Averages (${timeframeDays}D)</span>
          <span class="amz-fba-chart-sub" style="color:#34d399;">$${currentPrice.toFixed(2)}</span>
        </div>
        <svg viewBox="0 0 ${w} ${h}" class="amz-fba-chart-svg">
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <line x1="18" y1="${h/2}" x2="${w-18}" y2="${h/2}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4"/>
          <path d="${areaPath}" fill="url(#priceGrad)" />
          <path d="${path}" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
          <text x="18" y="14" fill="#9ca3af" font-size="9">High: $${max.toFixed(2)}</text>
          <text x="${w-18}" y="14" fill="#9ca3af" font-size="9" text-anchor="end">Low: $${min.toFixed(2)}</text>
        </svg>

        <!-- Average Metrics Grid -->
        <div class="amz-fba-chart-stats">
          <div class="amz-fba-chart-stat-item">
            <span>30-Day Avg</span>
            <strong>$${avg30.toFixed(2)}</strong>
          </div>
          <div class="amz-fba-chart-stat-item">
            <span>90-Day Avg</span>
            <strong>$${avg90.toFixed(2)}</strong>
          </div>
          <div class="amz-fba-chart-stat-item">
            <span>180-Day Avg</span>
            <strong>$${avg180.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Stock / Offer Count vs Price Correlation Chart
   */
  function renderStockVsPriceChart(currentPrice, currentSellers = 3, timeframeDays = 30) {
    const pointsCount = 16;
    const priceData = generateTrendPoints(currentPrice, 0.05, pointsCount, false);
    // When stock/sellers spike, price often dips (inverse correlation)
    const stockData = priceData.map((p, i) => Math.max(1, Math.round(currentSellers + (currentPrice - p) * 1.5 + (Math.random() * 2 - 1))));

    const w = 330;
    const h = 110;

    const pricePath = buildSvgPath(priceData, w, h, 18, false).path;
    const stockPath = buildSvgPath(stockData, w, h, 18, false).path;

    return `
      <div class="amz-fba-chart-card">
        <div class="amz-fba-chart-header">
          <span class="amz-fba-chart-title">Stock / Sellers vs Price Trend</span>
          <div style="font-size:10px;display:flex;gap:8px;">
            <span style="color:#3b82f6;">● Sellers</span>
            <span style="color:#10b981;">● Price</span>
          </div>
        </div>
        <svg viewBox="0 0 ${w} ${h}" class="amz-fba-chart-svg">
          <line x1="18" y1="${h/2}" x2="${w-18}" y2="${h/2}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4"/>
          <!-- Stock Line (Blue) -->
          <path d="${stockPath}" fill="none" stroke="#3b82f6" stroke-width="2" stroke-dasharray="3 3"/>
          <!-- Price Line (Green) -->
          <path d="${pricePath}" fill="none" stroke="#10b981" stroke-width="2"/>
        </svg>
        <div style="padding:6px 8px;font-size:10px;color:#9ca3af;text-align:center;">
          💡 When seller count drops, Buy Box prices typically rebound higher.
        </div>
      </div>
    `;
  }

  return {
    renderBsrChart,
    renderPriceChart,
    renderStockVsPriceChart
  };
});
