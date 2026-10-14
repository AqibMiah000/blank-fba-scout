/**
 * Amazon Product Restriction & Safety Checker ("Can I sell this?")
 * Heuristics for Hazmat, Dangerous Goods (DG), IP Radar, Buy Box, and Oversize.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RestrictionsChecker = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Dangerous Goods / Hazmat keywords
  const HAZMAT_KEYWORDS = [
    'battery', 'batteries', 'lithium', 'li-ion', 'polymer', 'aerosol', 
    'flammable', 'combustible', 'chemical', 'pressurized', 'corrosive',
    'solvent', 'gasoline', 'alcohol', 'pesticide', 'magnet'
  ];

  // High IP Risk / Private Label indicators
  const KNOWN_GATED_BRANDS = [
    'apple', 'nike', 'disney', 'lego', 'sony', 'samsung', 'adidas', 
    'bose', 'under armour', 'funko', 'anker'
  ];

  /**
   * Run full checklist on scraped product data
   */
  function analyzeRestrictions(product) {
    if (!product) return {};

    const textToScan = [
      product.title || '',
      product.category || '',
      product.brand || '',
      JSON.stringify(product.specs || {})
    ].join(' ').toLowerCase();

    // 1. Hazmat Check
    const hasBattery = /lithium|battery|batteries|li-ion|cell/i.test(textToScan);
    const hasChemical = /flammable|aerosol|spray|pressurized|chemical/i.test(textToScan);
    let hazmatStatus = 'pass';
    let hazmatMsg = 'No obvious hazardous materials detected';

    if (hasBattery || hasChemical) {
      hazmatStatus = 'warning';
      hazmatMsg = hasBattery ? 'Contains batteries (Lithium-ion / Battery rules apply)' : 'Contains chemical/aerosol components';
    }

    // 2. Dangerous Goods (DG)
    let dgStatus = 'pass';
    let dgMsg = 'Standard non-DG item';
    if (hasBattery && /power bank|charger|large capacity|watt/i.test(textToScan)) {
      dgStatus = 'warning';
      dgMsg = 'High-capacity battery / Potential Dangerous Goods program required';
    } else if (hasChemical) {
      dgStatus = 'warning';
      dgMsg = 'Potential Dangerous Goods restrictions apply';
    }

    // 3. Eligible / Gating Check
    const brandLower = (product.brand || '').toLowerCase();
    const isBigBrand = KNOWN_GATED_BRANDS.some(b => brandLower.includes(b));
    let eligibleStatus = isBigBrand ? 'warning' : 'pass';
    let eligibleMsg = isBigBrand 
      ? `Major brand (${product.brand}) often requires ungating approval` 
      : 'Open category / Check Seller Central to confirm ungated status';

    // 4. IP Radar (Intellectual Property Risk)
    // If brand is the only seller, it's typically private label and prone to IP complaints
    let ipStatus = 'pass';
    let ipMsg = 'Multiple sellers or brand allows resale';
    const sellerName = (product.sellerInfo?.name || '').toLowerCase();
    const sellerCount = product.sellerCount || 1;

    if (sellerCount <= 1 && brandLower && sellerName.includes(brandLower)) {
      ipStatus = 'fail';
      ipMsg = 'High IP Risk: Single seller appears to be the exclusive brand owner';
    } else if (isBigBrand) {
      ipStatus = 'warning';
      ipMsg = 'Brand enforces strict distribution policies';
    }

    // 5. Buy Box Analysis
    let bbStatus = 'pass';
    let bbMsg = 'Healthy Buy Box sharing among 3rd party sellers';
    const isAmazon = product.sellerInfo?.type === 'Amazon';

    if (isAmazon) {
      bbStatus = 'warning';
      bbMsg = 'Amazon is in the Buy Box (Hard to win Buy Box share)';
    } else if (!product.price || product.price === 0) {
      bbStatus = 'fail';
      bbMsg = 'Buy Box is suppressed (No featured offer)';
    }

    // 6. Oversize Check
    const isOversize = product.sizeTier && /bulky|oversize/i.test(product.sizeTier);
    let oversizeStatus = isOversize ? 'warning' : 'pass';
    let oversizeMsg = isOversize ? 'Item is Large Bulky / Oversize (higher FBA fees)' : 'Standard Size (lower FBA fees)';

    return {
      hazmat: { status: hazmatStatus, label: 'Hazmat', msg: hazmatMsg },
      eligible: { status: eligibleStatus, label: 'Eligible', msg: eligibleMsg },
      dg: { status: dgStatus, label: 'DG', msg: dgMsg },
      ipRadar: { status: ipStatus, label: 'IP Radar', msg: ipMsg },
      bbAnalysis: { status: bbStatus, label: 'BB Analysis', msg: bbMsg },
      oversize: { status: oversizeStatus, label: 'Oversize', msg: oversizeMsg },
      sellerCentralUrl: `https://sellercentral.amazon.com/product-search/search?q=${product.asin}`
    };
  }

  return {
    analyzeRestrictions
  };
});
