/**
 * Marketplace & International Localization Engine for BLANK FBA SCOUT v1.5.0
 * Automatically configures currencies, VAT rates, fee tiers, and domain routing.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MarketplaceEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MARKETPLACES = {
    'US': {
      code: 'US',
      name: 'Amazon US',
      hostSuffix: 'amazon.com',
      currency: 'USD',
      symbol: '$',
      vatRate: 0.0,
      keepaDomainId: 1,
      inboundShippingDefault: 0.40,
      prepFeeDefault: 0.20,
      baseFbaFee: 3.86
    },
    'UK': {
      code: 'UK',
      name: 'Amazon UK',
      hostSuffix: 'amazon.co.uk',
      currency: 'GBP',
      symbol: '£',
      vatRate: 0.20,
      keepaDomainId: 2,
      inboundShippingDefault: 0.35,
      prepFeeDefault: 0.18,
      baseFbaFee: 2.95
    },
    'DE': {
      code: 'DE',
      name: 'Amazon DE',
      hostSuffix: 'amazon.de',
      currency: 'EUR',
      symbol: '€',
      vatRate: 0.19,
      keepaDomainId: 3,
      inboundShippingDefault: 0.38,
      prepFeeDefault: 0.20,
      baseFbaFee: 3.40
    },
    'FR': {
      code: 'FR',
      name: 'Amazon FR',
      hostSuffix: 'amazon.fr',
      currency: 'EUR',
      symbol: '€',
      vatRate: 0.20,
      keepaDomainId: 4,
      inboundShippingDefault: 0.40,
      prepFeeDefault: 0.22,
      baseFbaFee: 3.65
    },
    'IT': {
      code: 'IT',
      name: 'Amazon IT',
      hostSuffix: 'amazon.it',
      currency: 'EUR',
      symbol: '€',
      vatRate: 0.22,
      keepaDomainId: 8,
      inboundShippingDefault: 0.40,
      prepFeeDefault: 0.22,
      baseFbaFee: 3.55
    },
    'ES': {
      code: 'ES',
      name: 'Amazon ES',
      hostSuffix: 'amazon.es',
      currency: 'EUR',
      symbol: '€',
      vatRate: 0.21,
      keepaDomainId: 9,
      inboundShippingDefault: 0.40,
      prepFeeDefault: 0.22,
      baseFbaFee: 3.50
    },
    'CA': {
      code: 'CA',
      name: 'Amazon CA',
      hostSuffix: 'amazon.ca',
      currency: 'CAD',
      symbol: 'CA$',
      vatRate: 0.05,
      keepaDomainId: 6,
      inboundShippingDefault: 0.50,
      prepFeeDefault: 0.25,
      baseFbaFee: 4.10
    }
  };

  /**
   * Detect marketplace from URL or hostname string
   */
  function detectMarketplace(urlOrHostname = '') {
    const str = (urlOrHostname || (typeof window !== 'undefined' ? window.location.hostname : '')).toLowerCase();

    if (str.includes('amazon.co.uk')) return MARKETPLACES['UK'];
    if (str.includes('amazon.de')) return MARKETPLACES['DE'];
    if (str.includes('amazon.fr')) return MARKETPLACES['FR'];
    if (str.includes('amazon.it')) return MARKETPLACES['IT'];
    if (str.includes('amazon.es')) return MARKETPLACES['ES'];
    if (str.includes('amazon.ca')) return MARKETPLACES['CA'];
    
    // Default to US
    return MARKETPLACES['US'];
  }

  /**
   * Format price with native currency symbol
   */
  function formatCurrency(amount, marketplace = null) {
    const m = marketplace || detectMarketplace();
    const num = Number(amount) || 0;
    return `${m.symbol}${num.toFixed(2)}`;
  }

  /**
   * Calculate VAT amount and net price (for UK/EU marketplaces)
   */
  function calculateVat(sellingPrice, marketplace = null) {
    const m = marketplace || detectMarketplace();
    if (!m.vatRate || m.vatRate <= 0) {
      return { vatAmount: 0, netPrice: sellingPrice, vatRate: 0 };
    }
    const price = Number(sellingPrice) || 0;
    const vatAmount = Number((price - (price / (1 + m.vatRate))).toFixed(2));
    const netPrice = Number((price - vatAmount).toFixed(2));
    return {
      vatAmount,
      netPrice,
      vatRate: m.vatRate
    };
  }

  return {
    MARKETPLACES,
    detectMarketplace,
    formatCurrency,
    calculateVat
  };
});
