/**
 * BLANK FBA SCOUT - Variation Review & Sales Distribution Analyzer
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VariationAnalyzer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function extractVariations() {
    const variations = [];

    // Check twister containers
    const swatchContainers = document.querySelectorAll('#variation_color_name li, #variation_size_name li, #variation_style_name li, .swatch-list-item');
    
    swatchContainers.forEach(item => {
      const img = item.querySelector('img');
      const title = item.getAttribute('title') || item.innerText || '';
      const asin = item.getAttribute('data-defaultasin') || item.getAttribute('data-csa-c-item-id') || '';
      const isSelected = item.classList.contains('swatchSelect') || item.classList.contains('selected');

      if (title.trim()) {
        variations.push({
          title: title.replace('Click to select', '').trim(),
          asin,
          imageUrl: img ? img.src : '',
          isSelected
        });
      }
    });

    return variations;
  }

  function analyzeDistribution(variations = []) {
    if (variations.length === 0) return { hasVariations: false, message: 'Single SKU listing (No variations)' };

    const total = variations.length;
    // Highlight first 3 as primary sellers
    const ranked = variations.map((v, idx) => ({
      ...v,
      estSharePercent: idx === 0 ? 45 : idx === 1 ? 25 : idx === 2 ? 15 : Math.max(2, Math.round(15 / (total - 2)))
    }));

    return {
      hasVariations: true,
      totalVariations: total,
      topVariation: ranked[0],
      variations: ranked.slice(0, 8)
    };
  }

  return {
    extractVariations,
    analyzeDistribution
  };
});
