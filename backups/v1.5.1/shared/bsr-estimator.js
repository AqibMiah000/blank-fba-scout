/**
 * Amazon US BSR (Best Sellers Rank) to Estimated Sales Engine
 * Uses calibrated regression curves per Amazon US main category.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BsrEstimator = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Category parameters: [a, b] for formula Sales = Math.round(a * (BSR ** (-b)))
  // Adjusted with min/max caps to avoid unrealistic estimates at extreme ends
  const CATEGORY_MODELS = {
    'home & kitchen': { a: 185000, b: 0.63, minSales: 1 },
    'kitchen & dining': { a: 160000, b: 0.62, minSales: 1 },
    'toys & games': { a: 140000, b: 0.61, minSales: 1 },
    'beauty & personal care': { a: 190000, b: 0.64, minSales: 1 },
    'health & household': { a: 210000, b: 0.65, minSales: 1 },
    'sports & outdoors': { a: 110000, b: 0.60, minSales: 1 },
    'clothing, shoes & jewelry': { a: 230000, b: 0.67, minSales: 1 },
    'electronics': { a: 95000, b: 0.58, minSales: 1 },
    'books': { a: 250000, b: 0.68, minSales: 1 },
    'pet supplies': { a: 98000, b: 0.59, minSales: 1 },
    'office products': { a: 75000, b: 0.57, minSales: 1 },
    'tools & home improvement': { a: 88000, b: 0.58, minSales: 1 },
    'automotive': { a: 80000, b: 0.57, minSales: 1 },
    'patio, lawn & garden': { a: 85000, b: 0.58, minSales: 1 },
    'baby products': { a: 70000, b: 0.56, minSales: 1 },
    'grocery & gourmet food': { a: 130000, b: 0.61, minSales: 1 },
    'arts, crafts & sewing': { a: 65000, b: 0.56, minSales: 1 },
    'cell phones & accessories': { a: 90000, b: 0.58, minSales: 1 },
    'industrial & scientific': { a: 45000, b: 0.54, minSales: 1 },
    'video games': { a: 55000, b: 0.55, minSales: 1 },
    'musical instruments': { a: 40000, b: 0.53, minSales: 1 }
  };

  const DEFAULT_MODEL = { a: 100000, b: 0.60, minSales: 1 };

  /**
   * Match a scraped category string to one of our model keys
   */
  function matchCategory(categoryString) {
    if (!categoryString) return 'general';
    const clean = categoryString.toLowerCase();
    for (const key of Object.keys(CATEGORY_MODELS)) {
      if (clean.includes(key)) {
        return key;
      }
    }
    // Secondary partial keyword matching
    if (clean.includes('kitchen') || clean.includes('home')) return 'home & kitchen';
    if (clean.includes('toy') || clean.includes('game')) return 'toys & games';
    if (clean.includes('beauty') || clean.includes('cosmetic')) return 'beauty & personal care';
    if (clean.includes('health') || clean.includes('supplement')) return 'health & household';
    if (clean.includes('apparel') || clean.includes('cloth') || clean.includes('shoe')) return 'clothing, shoes & jewelry';
    if (clean.includes('electronic') || clean.includes('computer')) return 'electronics';
    if (clean.includes('pet')) return 'pet supplies';
    if (clean.includes('tool') || clean.includes('hardware')) return 'tools & home improvement';
    if (clean.includes('book')) return 'books';
    if (clean.includes('car') || clean.includes('auto')) return 'automotive';
    if (clean.includes('food') || clean.includes('grocery')) return 'grocery & gourmet food';
    if (clean.includes('baby')) return 'baby products';
    if (clean.includes('garden') || clean.includes('patio')) return 'patio, lawn & garden';

    return 'general';
  }

  /**
   * Estimate monthly unit sales from BSR
   */
  function estimateMonthlySales(bsr, categoryString = '') {
    const rank = Number(bsr);
    if (!rank || rank <= 0 || isNaN(rank)) {
      return {
        estimatedMonthlySales: 0,
        estimatedDailySales: 0,
        confidence: 'N/A',
        matchedCategory: 'None'
      };
    }

    const matchedKey = matchCategory(categoryString);
    const model = CATEGORY_MODELS[matchedKey] || DEFAULT_MODEL;

    // Power law estimation: S = a * (BSR ^ -b)
    let rawMonthly = model.a * Math.pow(rank, -model.b);

    // Guard rails for top ranks and long tail
    if (rank === 1) {
      rawMonthly = Math.max(rawMonthly, 25000);
    } else if (rank > 300000) {
      // Long tail: rarely sells or less than 5 units a month
      rawMonthly = Math.max(0, Math.round(15 * Math.pow(300000 / rank, 1.2)));
    }

    const monthlySales = Math.max(0, Math.round(rawMonthly));
    const dailySales = Math.max(0, Math.round(monthlySales / 30));

    // Confidence indicator
    let confidence = 'High';
    if (rank > 150000) confidence = 'Low (Long tail)';
    else if (rank > 60000) confidence = 'Medium';

    return {
      estimatedMonthlySales: monthlySales,
      estimatedDailySales: dailySales,
      confidence,
      matchedCategory: matchedKey.toUpperCase()
    };
  }

  /**
   * Estimate monthly gross revenue from estimated sales and price
   */
  function estimateMonthlyRevenue(estimatedMonthlySales, price) {
    const units = Number(estimatedMonthlySales) || 0;
    const unitPrice = Number(price) || 0;
    return Number((units * unitPrice).toFixed(2));
  }

  return {
    estimateMonthlySales,
    estimateMonthlyRevenue,
    matchCategory
  };
});
