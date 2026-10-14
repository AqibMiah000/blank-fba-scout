/**
 * Competition Analyzer & Suggested Purchase Quantity Engine
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CompetitionAnalyzer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Analyze competition level based on seller counts and Amazon presence
   */
  function analyzeCompetition({ sellerCount = 1, isAmazonInBuyBox = false, bsr = 0 }) {
    const sellers = Math.max(1, parseInt(sellerCount, 10) || 1);
    let level = 'Low';
    let color = 'green';
    let description = '';

    let rotationSpeed = 'Active (~2-4 hrs)';
    let rotationFrequency = 'Every 2 - 4 hours';
    let rotationCycle = 'Rotates 6 - 12 times daily across sellers';
    let rotationShare = `~${Math.round(100 / (sellers + 1))}%`;
    let rotationColor = '#34d399';
    let rotationBg = 'rgba(16, 185, 129, 0.2)';

    let winProbability = Math.round(100 / (sellers + 1));
    let probabilityLabel = 'High';
    let probabilityColor = '#34d399';
    let timeToWin = '~2 - 4 hours';

    if (isAmazonInBuyBox) {
      level = 'Dominant Amazon';
      color = 'red';
      description = 'Amazon is on the listing. Very difficult for 3rd-party sellers to rotate the Buy Box.';
      rotationSpeed = 'Suppressed (0%)';
      rotationFrequency = 'Amazon holds 95%+';
      rotationCycle = 'Rare / No rotation for 3rd-party sellers';
      rotationShare = '< 5%';
      rotationColor = '#f87171';
      rotationBg = 'rgba(239, 68, 68, 0.2)';

      winProbability = 3;
      probabilityLabel = 'Very Low';
      probabilityColor = '#f87171';
      timeToWin = 'Unlikely / Days';
    } else if (sellers <= 1) {
      level = 'Single Seller';
      color = 'amber';
      description = 'Only 1 seller on the listing. High risk of private label / IP infringement.';
      rotationSpeed = 'Static (No Rotation)';
      rotationFrequency = '100% to single seller';
      rotationCycle = 'Single merchant holds Buy Box';
      rotationShare = '50% if matching';
      rotationColor = '#fbbf24';
      rotationBg = 'rgba(245, 158, 11, 0.2)';

      winProbability = 50;
      probabilityLabel = 'High (50/50)';
      probabilityColor = '#34d399';
      timeToWin = '~1 - 2 hours';
    } else if (sellers >= 2 && sellers <= 5) {
      level = 'Ideal (Low Competition)';
      color = 'green';
      description = 'Great for Wholesale/Arbitrage. Healthy Buy Box rotation expected.';
      rotationSpeed = 'Fast (~2 - 4 hrs)';
      rotationFrequency = 'Every 2 - 4 hours';
      rotationCycle = 'Rotates 6 - 12 times daily across Prime sellers';
      rotationColor = '#34d399';
      rotationBg = 'rgba(16, 185, 129, 0.2)';

      winProbability = Math.round(100 / (sellers + 1));
      probabilityLabel = 'High Chance';
      probabilityColor = '#34d399';
      timeToWin = '~2 - 4 hours';
    } else if (sellers >= 6 && sellers <= 12) {
      level = 'Moderate Competition';
      color = 'amber';
      description = 'Multiple competitive sellers. Price wars possible but manageable.';
      rotationSpeed = 'Moderate (~4 - 8 hrs)';
      rotationFrequency = 'Every 4 - 8 hours';
      rotationCycle = 'Rotates 3 - 6 times daily';
      rotationColor = '#fbbf24';
      rotationBg = 'rgba(245, 158, 11, 0.2)';

      winProbability = Math.round(100 / (sellers + 1));
      probabilityLabel = 'Moderate';
      probabilityColor = '#fbbf24';
      timeToWin = '~4 - 8 hours';
    } else {
      level = 'High / Fierce';
      color = 'red';
      description = 'Crowded listing with heavy competition and margin erosion risk.';
      rotationSpeed = 'Slow (~12 - 24 hrs)';
      rotationFrequency = 'Every 12 - 24 hours';
      rotationCycle = 'Rotates ~1 - 2 times daily';
      rotationColor = '#f87171';
      rotationBg = 'rgba(239, 68, 68, 0.2)';

      winProbability = Math.max(2, Math.round(100 / (sellers + 1)));
      probabilityLabel = 'Low (Crowded)';
      probabilityColor = '#f87171';
      timeToWin = '~12 - 24 hours';
    }

    return {
      sellerCount: sellers,
      level,
      color,
      description,
      rotationSpeed,
      rotationFrequency,
      rotationCycle,
      rotationShare,
      rotationColor,
      rotationBg,
      winProbability,
      probabilityLabel,
      probabilityColor,
      timeToWin
    };
  }

  /**
   * Calculate suggested purchase quantities based on sales velocity and competition
   */
  function calculatePurchaseQuantity({
    estimatedMonthlySales = 0,
    sellerCount = 1,
    costOfGoods = 0,
    netProfitPerUnit = 0
  }) {
    const monthlySales = Math.max(0, parseInt(estimatedMonthlySales, 10) || 0);
    const competitors = Math.max(1, parseInt(sellerCount, 10) || 1);
    const cogs = Math.max(0, parseFloat(costOfGoods) || 0);
    const profit = parseFloat(netProfitPerUnit) || 0;

    // Your estimated monthly share assuming equal rotation with other sellers + you
    const totalRotationSellers = competitors + 1;
    const yourMonthlyVelocity = Math.max(1, Math.round(monthlySales / totalRotationSellers));

    // Suggested order tiers
    const testQty = Math.max(3, Math.round(yourMonthlyVelocity * 0.45)); // ~14 day test
    const monthQty = Math.max(5, yourMonthlyVelocity);                  // ~30 day supply
    const twoMonthQty = Math.max(10, yourMonthlyVelocity * 2);           // ~60 day supply

    return {
      yourMonthlyVelocity,
      testOrder: {
        label: '14-Day Test Order',
        quantity: testQty,
        investment: Number((testQty * cogs).toFixed(2)),
        projectedProfit: Number((testQty * profit).toFixed(2))
      },
      order30Day: {
        label: '30-Day Supply',
        quantity: monthQty,
        investment: Number((monthQty * cogs).toFixed(2)),
        projectedProfit: Number((monthQty * profit).toFixed(2))
      },
      order60Day: {
        label: '60-Day Supply',
        quantity: twoMonthQty,
        investment: Number((twoMonthQty * cogs).toFixed(2)),
        projectedProfit: Number((twoMonthQty * profit).toFixed(2))
      }
    };
  }

  return {
    analyzeCompetition,
    calculatePurchaseQuantity
  };
});
