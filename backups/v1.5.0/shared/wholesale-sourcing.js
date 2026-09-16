/**
 * Wholesale & Sourcing Deep Links Generator
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.WholesaleSourcing = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Clean product title to extract primary search keywords (strip excess marketing fluff)
   */
  function cleanKeywords(title = '', brand = '') {
    let clean = (title || '')
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Take the first 5-7 meaningful words
    const words = clean.split(' ').slice(0, 6).join(' ');
    return words || brand || 'wholesale products';
  }

  /**
   * Generate curated sourcing platform links
   */
  function generateSourcingLinks({ title = '', brand = '', asin = '' }) {
    const keywords = cleanKeywords(title, brand);
    const query = encodeURIComponent(keywords);
    const brandQuery = encodeURIComponent(brand || '');

    return [
      {
        name: 'Alibaba',
        badge: 'B2B China',
        icon: '🇨🇳',
        url: `https://www.alibaba.com/trade/search?fsb=y&IndexArea=product_en&SearchText=${query}`,
        description: 'Direct manufacturer & OEM/ODM quotes with MOQs'
      },
      {
        name: 'Google Wholesale',
        badge: 'US Distributors',
        icon: '🌐',
        url: `https://www.google.com/search?q=${brandQuery}+${query}+wholesale+distributor+supplier+MOQ`,
        description: 'Find authorized US & global wholesale distributors'
      },
      {
        name: 'AliExpress',
        badge: 'Low MOQ',
        icon: '📦',
        url: `https://www.aliexpress.com/wholesale?SearchText=${query}`,
        description: 'Fast sample orders & low MOQ wholesale pricing'
      },
      {
        name: 'ThomasNet',
        badge: 'US Suppliers',
        icon: '🏭',
        url: `https://www.thomasnet.com/search.html?cov=NA&what=${query}`,
        description: 'North American certified industrial & consumer suppliers'
      },
      {
        name: 'eBay Bulk Lots',
        badge: 'Liquidation',
        icon: '🏷️',
        url: `https://www.ebay.com/sch/i.html?_nkw=${query}+lot`,
        description: 'Overstock, liquidation lots, and wholesale bundles'
      },
      {
        name: 'Amazon Seller Central',
        badge: 'Check Gating',
        icon: '🔒',
        url: `https://sellercentral.amazon.com/product-search/search?q=${asin}`,
        description: 'Confirm live ungating eligibility on your seller account'
      }
    ];
  }

  return {
    cleanKeywords,
    generateSourcingLinks
  };
});
