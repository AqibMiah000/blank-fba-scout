/**
 * BLANK FBA SCOUT - AI Confidence Score Engine
 * BuyBotPro-style algorithmic deal scoring and confidence gauge
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ConfidenceScore = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Calculate 0 - 100 Deal Score with weighted metrics
   */
  function calculateScore({
    sellingPrice = 0,
    costOfGoods = 0,
    netProfit = 0,
    profitMargin = 0,
    roi = 0,
    bsr = 0,
    estimatedMonthlySales = 0,
    sellerCount = 1,
    isAmazonInBuyBox = false,
    restrictions = {}
  }) {
    let score = 50; // baseline
    const drivers = [];

    // 1. ROI & Margin Analysis (Max ±25 pts)
    if (roi >= 40 && profitMargin >= 20) {
      score += 25;
      drivers.push({ label: 'Avg ROI', value: `Strong (${roi.toFixed(1)}%)`, status: 'pass' });
    } else if (roi >= 25 && profitMargin >= 12) {
      score += 15;
      drivers.push({ label: 'Avg ROI', value: `Healthy (${roi.toFixed(1)}%)`, status: 'pass' });
    } else if (roi >= 15) {
      score += 5;
      drivers.push({ label: 'Avg ROI', value: `Moderate (${roi.toFixed(1)}%)`, status: 'warning' });
    } else if (roi > 0) {
      score -= 10;
      drivers.push({ label: 'Avg ROI', value: `Low (${roi.toFixed(1)}%)`, status: 'warning' });
    } else {
      score -= 30;
      drivers.push({ label: 'Avg ROI', value: `Negative (${roi.toFixed(1)}%)`, status: 'fail' });
    }

    // 2. Sales Velocity & BSR (Max ±25 pts)
    if (estimatedMonthlySales >= 300) {
      score += 25;
      drivers.push({ label: 'Sales Velocity', value: `Fast (${estimatedMonthlySales}/mo)`, status: 'pass' });
    } else if (estimatedMonthlySales >= 100) {
      score += 18;
      drivers.push({ label: 'Sales Velocity', value: `Consistent (${estimatedMonthlySales}/mo)`, status: 'pass' });
    } else if (estimatedMonthlySales >= 30) {
      score += 8;
      drivers.push({ label: 'Sales Velocity', value: `Steady (~${estimatedMonthlySales}/mo)`, status: 'pass' });
    } else if (estimatedMonthlySales >= 10) {
      score -= 5;
      drivers.push({ label: 'Sales Velocity', value: `Slow (~${estimatedMonthlySales}/mo)`, status: 'warning' });
    } else {
      score -= 20;
      drivers.push({ label: 'Sales Velocity', value: 'Very Low Velocity', status: 'fail' });
    }

    // 3. Buy Box & Competition Dynamics (Max ±20 pts)
    if (isAmazonInBuyBox) {
      score -= 20;
      drivers.push({ label: 'Buy Box', value: 'Amazon Dominates', status: 'fail' });
    } else if (sellerCount <= 1) {
      score -= 8;
      drivers.push({ label: 'Buy Box', value: 'Single Seller (PL Risk)', status: 'warning' });
    } else if (sellerCount >= 2 && sellerCount <= 6) {
      score += 15;
      drivers.push({ label: 'Buy Box', value: 'Healthy Rotation', status: 'pass' });
    } else if (sellerCount <= 12) {
      score += 5;
      drivers.push({ label: 'Buy Box', value: `${sellerCount} Competitors`, status: 'warning' });
    } else {
      score -= 12;
      drivers.push({ label: 'Buy Box', value: 'Crowded Listing', status: 'fail' });
    }

    // 4. IP Risk & Restrictions (Max ±15 pts)
    if (restrictions.ipRadar?.status === 'fail') {
      score -= 25;
      drivers.push({ label: 'IP Radar', value: 'High Brand Risk', status: 'fail' });
    } else if (restrictions.hazmat?.status === 'warning') {
      score -= 5;
      drivers.push({ label: 'Hazmat', value: 'Lithium/Hazmat rules', status: 'warning' });
    } else {
      score += 10;
      drivers.push({ label: 'IP Radar', value: 'Clean Track Record', status: 'pass' });
    }

    // Clamp score between 1 and 99
    score = Math.max(5, Math.min(98, score));

    // Rating Label & Colors
    let ratingLabel = 'Average';
    let ratingColor = '#f59e0b'; // amber
    let verdict = 'Moderate opportunity. Double check fees and competition before ordering.';

    if (score >= 75) {
      ratingLabel = 'Above Average';
      ratingColor = '#10b981'; // green
      verdict = 'Excellent product metrics. Healthy ROI with strong sales velocity and low risk.';
    } else if (score >= 60) {
      ratingLabel = 'Good Opportunity';
      ratingColor = '#34d399'; // light green
      verdict = 'Solid deal. Favorable margins and manageable competition.';
    } else if (score >= 45) {
      ratingLabel = 'Average';
      ratingColor = '#fbbf24'; // yellow
      verdict = 'Acceptable, but margins or seller competition require caution.';
    } else {
      ratingLabel = 'Risky / Pass';
      ratingColor = '#ef4444'; // red
      verdict = 'Low margin, slow velocity, or high risk of Amazon Buy Box suppression.';
    }

    // Suggested test purchase quantity
    const rotationVelocity = Math.max(1, Math.round(estimatedMonthlySales / (sellerCount + 1)));
    const suggestedQty = score >= 70 ? Math.max(5, Math.round(rotationVelocity * 0.4)) : Math.max(3, Math.round(rotationVelocity * 0.2));

    return {
      score: Number(score.toFixed(1)),
      ratingLabel,
      ratingColor,
      verdict,
      drivers: drivers.slice(0, 3), // top 3 driver tags
      suggestedQty
    };
  }

  return {
    calculateScore
  };
});
