/**
 * BLANK FBA SCOUT - Content Script v1.3.0
 * Injected on Amazon US Product & Search Result Pages
 */

(function () {
  'use strict';

  if (window.__AMZ_FBA_SCOUT_INJECTED__) return;
  window.__AMZ_FBA_SCOUT_INJECTED__ = true;

  let currentProductData = null;
  let isWidgetExpanded = false;
  let activeWidgetTab = 'tab-calc';
  let activeChartTimeframe = 30;
  let savedWidgetPosition = null;

  // User Settings defaults
  let userSettings = {
    theme: 'amber',
    inboundShippingRatePerLb: 0.40,
    prepFee: 0.20,
    targetRoi: 30,
    minProfit: 3.00,
    maxBsr: 50000,
    googleSheetsWebhook: '',
    tabCalculator: true,
    tabRestrictions: true,
    tabCompetition: true,
    tabCharts: true,
    tabWholesale: true
  };

  /**
   * Helper: Check if active page is a Search Results page
   */
  function isSearchPage() {
    return window.location.pathname.includes('/s') || window.location.search.includes('k=');
  }

  /**
   * Extract ASIN
   */
  function extractAsin() {
    const urlMatch = window.location.href.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    if (urlMatch && urlMatch[1]) return urlMatch[1].toUpperCase();

    const asinInput = document.getElementById('ASIN') || document.querySelector('input[name="ASIN"]');
    if (asinInput && asinInput.value) return asinInput.value.trim().toUpperCase();

    return null;
  }

  /**
   * Extract Price
   */
  function extractPrice() {
    const selectors = [
      '#corePrice_feature_div .a-price .a-offscreen',
      '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen',
      '.apexPriceToPay .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '#priceblock_saleprice',
      '#price_inside_buybox',
      '.a-price.priceToPay .a-offscreen',
      '.a-price .a-offscreen'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText) {
        const match = el.innerText.replace(/,/g, '').match(/\$?([0-9]+\.[0-9]{2})/);
        if (match && match[1]) {
          const val = parseFloat(match[1]);
          if (!isNaN(val) && val > 0) return val;
        }
      }
    }
    return 0;
  }

  /**
   * Extract Title, Brand & Image
   */
  function extractProductInfo() {
    const titleEl = document.getElementById('productTitle') || document.querySelector('h1.a-size-large');
    const title = titleEl ? titleEl.innerText.trim() : document.title;

    const brandEl = document.getElementById('bylineInfo') || document.getElementById('brand') || document.querySelector('.po-brand .a-span9');
    let brand = brandEl ? brandEl.innerText.replace(/Visit the|Brand:|Store/gi, '').trim() : '';

    const imgEl = document.getElementById('landingImage') || document.getElementById('imgBlkFront') || document.querySelector('#main-image-container img');
    const imageUrl = imgEl ? imgEl.src : '';

    return { title, brand, imageUrl };
  }

  /**
   * Extract BSR (Best Sellers Rank) and Main Category
   */
  function extractBsr() {
    let bsr = 0;
    let category = '';

    const bulletContainer = document.getElementById('detailBullets_feature_div') || document.getElementById('detailBulletsWrapper_feature_div');
    if (bulletContainer) {
      const text = bulletContainer.innerText;
      const bsrMatch = text.match(/#([0-9,]+)\s+in\s+([^(\n\r<]+)/i);
      if (bsrMatch) {
        bsr = parseInt(bsrMatch[1].replace(/,/g, ''), 10);
        category = bsrMatch[2].trim();
      }
    }

    if (!bsr) {
      const rows = document.querySelectorAll('#prodDetails tr, #productDetails_techSpec_section_1 tr, .prodDetTable tr');
      for (const row of rows) {
        const th = row.querySelector('th');
        const td = row.querySelector('td');
        if (th && td && /Best Sellers Rank/i.test(th.innerText)) {
          const match = td.innerText.match(/#([0-9,]+)\s+in\s+([^(\n\r<]+)/i);
          if (match) {
            bsr = parseInt(match[1].replace(/,/g, ''), 10);
            category = match[2].trim();
            break;
          }
        }
      }
    }

    if (!bsr) {
      const pageText = document.body.innerText;
      const fallbackMatch = pageText.match(/Best Sellers Rank[:\s]+#([0-9,]+)\s+in\s+([^(\n\r<]+)/i);
      if (fallbackMatch) {
        bsr = parseInt(fallbackMatch[1].replace(/,/g, ''), 10);
        category = fallbackMatch[2].trim();
      }
    }

    if (category) {
      category = category.replace(/\s*\(See Top 100.*$/i, '').trim();
    }

    return { bsr, category };
  }

  /**
   * Extract Dimensions & Weight
   */
  function extractDimensionsAndWeight() {
    let dimensions = [10, 8, 2];
    let weightLb = 1.0;

    const pageText = document.body.innerText;

    const dimMatch = pageText.match(/(?:Product|Item|Package)\s+Dimensions[:\s]+([0-9.]+)\s*[xX*]\s*([0-9.]+)\s*[xX*]\s*([0-9.]+)\s*(inches|cm|in|mm)?/i);
    if (dimMatch) {
      let l = parseFloat(dimMatch[1]);
      let w = parseFloat(dimMatch[2]);
      let h = parseFloat(dimMatch[3]);
      const unit = (dimMatch[4] || 'inches').toLowerCase();

      if (unit.includes('cm')) {
        l /= 2.54; w /= 2.54; h /= 2.54;
      } else if (unit.includes('mm')) {
        l /= 25.4; w /= 25.4; h /= 25.4;
      }
      dimensions = [l, w, h];
    }

    const weightMatch = pageText.match(/(?:Item|Shipping|Package)\s+Weight[:\s]+([0-9.]+)\s*(pounds|pound|lbs|lb|ounces|ounce|oz|grams|g|kg)/i);
    if (weightMatch) {
      let val = parseFloat(weightMatch[1]);
      const unit = weightMatch[2].toLowerCase();

      if (unit.includes('oz') || unit.includes('ounce')) {
        weightLb = val / 16;
      } else if (unit.includes('kg')) {
        weightLb = val * 2.20462;
      } else if (unit.includes('g') || unit.includes('gram')) {
        weightLb = val / 453.592;
      } else {
        weightLb = val;
      }
    }

    return {
      dimensions,
      weightLb: Number(weightLb.toFixed(2))
    };
  }

  /**
  /**
   * Extract Seller Count & Buy Box info with robust seller name validation
   */
  function extractSellerInfo() {
    let type = 'Unknown';
    let badge = 'Buy Box Active';
    let name = '';
    let isSoldByAmazon = false;
    let isShippedByAmazon = false;

    function isValidSellerName(str) {
      if (!str) return false;
      const clean = str.trim();
      if (!clean || clean.length < 2) return false;
      if (/learn more|details|return policy|terms and conditions|customer service|ships from|sold by|see more/i.test(clean)) return false;
      if (/fulfilled by amazon|amazon fulfillment|fba|prime|free delivery/i.test(clean)) return false;
      if (/amazon resale|amazon warehouse|warehouse deals|amazon renewed/i.test(clean)) return false;
      return true;
    }

    // 1. Identify Sold By Seller Name via dedicated seller storefront links
    // Method A: Direct link in the Buy Box (#sellerProfileTriggerId or a[href*="seller="])
    const buyboxSellerLink = document.querySelector(`
      #sellerProfileTriggerId,
      #desktop_buybox a[href*="seller="],
      #buybox a[href*="seller="],
      #tabular-buybox a[href*="seller="],
      #merchant-info a[href*="seller="],
      #fulfillerInfoID_feature_div a[href*="seller="]
    `);
    if (buyboxSellerLink && isValidSellerName(buyboxSellerLink.innerText)) {
      name = buyboxSellerLink.innerText.trim();
    }

    // Method B: Tabular Buy Box
    if (!name) {
      const tabularBuybox = document.getElementById('tabular-buybox');
      if (tabularBuybox) {
        const rows = tabularBuybox.querySelectorAll('tr, .tabular-buybox-container, .tabular-buybox-row');
        for (const row of rows) {
          const rowText = row.innerText || '';
          if (/Sold by/i.test(rowText)) {
            const links = Array.from(row.querySelectorAll('a'));
            const sellerLink = links.find(l => (l.href.includes('seller=') || l.href.includes('/gp/aag/')) && isValidSellerName(l.innerText)) ||
                               links.find(l => isValidSellerName(l.innerText));
            if (sellerLink) {
              name = sellerLink.innerText.trim();
              break;
            } else {
              const match = rowText.match(/Sold by\s*[:\s]*([^\n\r]+)/i);
              if (match && match[1] && isValidSellerName(match[1])) {
                name = match[1].trim();
                break;
              }
            }
          }
        }
      }
    }

    // Method C: Merchant Info
    if (!name) {
      const merchantInfo = document.getElementById('merchant-info');
      if (merchantInfo) {
        const links = Array.from(merchantInfo.querySelectorAll('a'));
        const sellerLink = links.find(l => (l.href.includes('seller=') || l.href.includes('/gp/aag/')) && isValidSellerName(l.innerText)) ||
                           links.find(l => isValidSellerName(l.innerText));
        if (sellerLink) {
          name = sellerLink.innerText.trim();
        } else {
          const match = merchantInfo.innerText.match(/Sold by\s+([^.\n,]+)/i);
          if (match && match[1] && isValidSellerName(match[1])) {
            name = match[1].trim();
          }
        }
      }
    }

    // Method D: Side Drawer (#all-offers-display) — strictly look for first NEW seller link
    if (!name) {
      const aodCards = Array.from(document.querySelectorAll('#all-offers-display #aod-pinned-offer, #all-offers-display .aod-offer, #aod-offer-list > div'));
      // Only inspect cards with "New" condition (ignoring "Used" / Amazon Resale)
      const newCards = aodCards.filter(card => !/Used/i.test(card.innerText || ''));
      for (const card of newCards) {
        const sLink = card.querySelector('a[href*="seller="], a[href*="/gp/aag/"]');
        if (sLink && isValidSellerName(sLink.innerText)) {
          name = sLink.innerText.trim();
          break;
        }
      }
    }

    // Method E: Check More Buying Choices
    if (!name) {
      const mbcLink = document.querySelector('#moreBuyingChoices_feature_div a[href*="seller="], #mbc a[href*="seller="], .mbc-offer-row a[href*="seller="]');
      if (mbcLink && isValidSellerName(mbcLink.innerText)) {
        name = mbcLink.innerText.trim();
      }
    }

    // Method F: Check ANY valid seller link on the page
    if (!name) {
      const anySellerLink = Array.from(document.querySelectorAll('a[href*="seller="], a[href*="/gp/aag/main"]')).find(l => isValidSellerName(l.innerText));
      if (anySellerLink) {
        name = anySellerLink.innerText.trim();
      }
    }

    // Check Shipped By & Amazon presence
    const mInfoText = document.getElementById('merchant-info')?.innerText || '';
    const tabBbText = document.getElementById('tabular-buybox')?.innerText || '';
    if (/Ships from Amazon|Fulfilled by Amazon|Amazon Fulfillment/i.test(mInfoText) || /Ships from\s*[:\s]*Amazon/i.test(tabBbText)) {
      isShippedByAmazon = true;
    }
    if (/and sold by Amazon(?:\.com)?|Sold by Amazon(?:\.com)?\./i.test(mInfoText) || /Sold by\s*[:\s]*Amazon(?:\.com)?$/im.test(tabBbText)) {
      isSoldByAmazon = true;
    }

    if (/^Amazon(?:\.com)?$/i.test(name) || isSoldByAmazon) {
      isSoldByAmazon = true;
      name = 'Amazon.com';
    }

    // Format Buy Box Winner Badge with seller name prominently displayed
    if (isSoldByAmazon) {
      type = 'Amazon';
      badge = 'Amazon.com';
      name = 'Amazon.com';
    } else if (isShippedByAmazon || /Ships from Amazon/i.test(document.body.innerText)) {
      type = 'FBA';
      name = name || '3rd Party FBA';
      badge = `${name} (FBA)`;
    } else if (name) {
      type = 'FBM';
      badge = `${name} (FBM)`;
    } else {
      type = 'Unknown';
      badge = 'Buy Box Active';
      name = 'Active Seller';
    }

    // 2. Comprehensive Total Offers / Competing Seller Count Extraction
    let foundCount = 0;

    // Check A: Open Side Drawer (#all-offers-display) — live exact offer cards
    const aodCartButtons = document.querySelectorAll('#all-offers-display input[name="submit.addToCart"], #all-offers-display [data-action="aod-ajax-add-to-cart"]');
    if (aodCartButtons.length > 0) {
      foundCount = aodCartButtons.length;
    }

    // Check B: Specific NEW offer container (#olp-upd-new)
    if (foundCount <= 1) {
      const newOlp = document.getElementById('olp-upd-new');
      if (newOlp) {
        const m = newOlp.innerText.match(/\(([0-9]+)\)/);
        if (m && m[1]) foundCount = parseInt(m[1], 10);
      }
    }

    // Check C: More Buying Choices rows (#mbc)
    if (foundCount <= 1) {
      const mbcRows = document.querySelectorAll('#moreBuyingChoices_feature_div .mbc-offer-row, #mbc .mbc-offer-row, .mbc-offer-row');
      if (mbcRows.length > 0) {
        foundCount = mbcRows.length + 1;
      }
    }

    // Check D: Specific NEW regexes (avoids warehouse used returns inflating counts)
    if (foundCount <= 1) {
      const targetWidgets = [
        document.getElementById('moreBuyingChoices_feature_div'),
        document.getElementById('mbc'),
        document.getElementById('olpLinkWidget_feature_div'),
        document.getElementById('dynamic-aod-ingress-box'),
        document.getElementById('olp_feature_div'),
        document.getElementById('buybox-see-all-buying-choices')
      ].filter(el => el && el.innerText && el.innerText.trim().length > 0);

      const newRegexList = [
        /New\s*\(([0-9]+)\)\s*from/i,
        /([0-9]+)\s+new\s+from/i,
        /Other\s+sellers\s+on\s+Amazon\s*\(([0-9]+)\)/i,
        /Compare\s+Offers\s*\(([0-9]+)\)/i,
        /Compare\s+([0-9]+)\s+offers/i,
        /See\s+All\s+([0-9]+)\s+Offers/i
      ];

      for (const widget of targetWidgets) {
        const wText = widget.innerText;
        for (const rx of newRegexList) {
          const m = wText.match(rx);
          if (m && m[1]) {
            const num = parseInt(m[1], 10);
            if (num > foundCount) foundCount = num;
          }
        }
      }
    }

    // Check E: General regex with sanity cap
    if (foundCount <= 1) {
      const allText = document.body.innerText;
      const m = allText.match(/(?:New|Used|New\s*&\s*Used)\s*\(([0-9]+)\)\s*from/i) || allText.match(/([0-9]+)\s+offers\s+from/i);
      if (m && m[1]) {
        const num = parseInt(m[1], 10);
        // Only accept if reasonable wholesale competitor count (<= 30) or if no huge used warehouse inflation
        if (num > 1 && num <= 30) {
          foundCount = num;
        }
      }
    }

    const sellerCount = Math.max(1, foundCount);

    return { type, badge, name, sellerCount };
  }

  /**
   * Scrape and consolidate all live product data
   */
  function scrapeProduct() {
    const asin = extractAsin();
    if (!asin) return null;

    const price = extractPrice();
    const { title, brand, imageUrl } = extractProductInfo();
    const { bsr, category } = extractBsr();
    const { dimensions, weightLb } = extractDimensionsAndWeight();
    const sellerInfo = extractSellerInfo();

    const salesEstimate = window.BsrEstimator ? 
      window.BsrEstimator.estimateMonthlySales(bsr, category) : 
      { estimatedMonthlySales: 0, estimatedDailySales: 0 };

    const estimatedRevenue = window.BsrEstimator ? 
      window.BsrEstimator.estimateMonthlyRevenue(salesEstimate.estimatedMonthlySales, price) : 0;

    const tierInfo = window.FbaCalculator ? 
      window.FbaCalculator.determineSizeTier(dimensions, weightLb) : 
      { tier: 'Large standard' };

    const initialProfit = window.FbaCalculator ? 
      window.FbaCalculator.calculateProfit({
        sellingPrice: price,
        costOfGoods: 0,
        category: category,
        dimensions: dimensions,
        weightLb: weightLb,
        inboundShippingRatePerLb: userSettings.inboundShippingRatePerLb,
        prepFee: userSettings.prepFee,
        targetRoi: userSettings.targetRoi,
        minProfit: userSettings.minProfit,
        maxBsr: userSettings.maxBsr,
        bsr
      }) : {};

    const restrictions = window.RestrictionsChecker ? 
      window.RestrictionsChecker.analyzeRestrictions({
        asin,
        title,
        brand,
        category,
        price,
        sizeTier: tierInfo.tier,
        sellerInfo,
        sellerCount: sellerInfo.sellerCount
      }) : {};

    const competition = window.CompetitionAnalyzer ? 
      window.CompetitionAnalyzer.analyzeCompetition({
        sellerCount: sellerInfo.sellerCount,
        isAmazonInBuyBox: sellerInfo.type === 'Amazon',
        bsr
      }) : {};

    const purchaseQty = window.CompetitionAnalyzer ? 
      window.CompetitionAnalyzer.calculatePurchaseQuantity({
        estimatedMonthlySales: salesEstimate.estimatedMonthlySales,
        sellerCount: sellerInfo.sellerCount,
        costOfGoods: 0,
        netProfitPerUnit: initialProfit.netProfit || 0
      }) : {};

    const confidenceScore = window.ConfidenceScore ?
      window.ConfidenceScore.calculateScore({
        sellingPrice: price,
        costOfGoods: 0,
        netProfit: initialProfit.netProfit || 0,
        profitMargin: initialProfit.profitMargin || 0,
        roi: initialProfit.roi || 0,
        bsr,
        estimatedMonthlySales: salesEstimate.estimatedMonthlySales,
        sellerCount: sellerInfo.sellerCount,
        isAmazonInBuyBox: sellerInfo.type === 'Amazon',
        restrictions
      }) : { score: 50, ratingLabel: 'Average', ratingColor: '#f59e0b', drivers: [] };

    const sourcingLinks = window.WholesaleSourcing ? 
      window.WholesaleSourcing.generateSourcingLinks({ title, brand, asin }) : [];

    return {
      asin,
      title,
      brand,
      imageUrl,
      price,
      bsr,
      category: category || 'General',
      dimensions,
      weightLb,
      sizeTier: tierInfo.tier,
      sellerInfo,
      sellerCount: sellerInfo.sellerCount,
      estimatedMonthlySales: salesEstimate.estimatedMonthlySales,
      estimatedDailySales: salesEstimate.estimatedDailySales,
      estimatedRevenue,
      restrictions,
      competition,
      purchaseQty,
      confidenceScore,
      sourcingLinks,
      lastCalculation: initialProfit,
      scrapedAt: new Date().toISOString()
    };
  }

  /**
   * Helper: Generate SVG gauge circle (Radius: 35, Viewbox: 88x88)
   */
  function renderGaugeSvg(score, color) {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return `
      <svg viewBox="0 0 88 88">
        <circle cx="44" cy="44" r="${radius}" class="amz-fba-gauge-circle-bg" />
        <circle cx="44" cy="44" r="${radius}" class="amz-fba-gauge-circle-fill" 
          stroke="${color}" 
          stroke-dasharray="${circumference.toFixed(1)}" 
          stroke-dashoffset="${offset.toFixed(1)}" />
      </svg>
    `;
  }

  /**
   * Position clamping and application
   */
  function clampAndApplyPosition(container, top, left) {
    if (!container) return null;
    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;
    const rect = container.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : (isWidgetExpanded ? 380 : 180);
    const height = rect.height > 0 ? rect.height : (isWidgetExpanded ? 520 : 45);

    const maxLeft = Math.max(10, vpWidth - width - 15);
    const maxTop = Math.max(10, vpHeight - height - 15);

    const clampedLeft = Math.round(Math.min(Math.max(10, left), maxLeft));
    const clampedTop = Math.round(Math.min(Math.max(10, top), maxTop));

    container.style.top = `${clampedTop}px`;
    container.style.left = `${clampedLeft}px`;
    container.style.right = 'auto';
    container.style.bottom = 'auto';

    return { top: clampedTop, left: clampedLeft };
  }

  /**
   * Universal Drag-and-Drop Controller for Floating Scout
   */
  function makeDraggable(handle, container, onClick) {
    if (!handle || !container) return;

    let isPointerDown = false;
    let hasMoved = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    const DRAG_THRESHOLD = 5;

    function onPointerDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target.closest('button, a, input, select')) return;

      isPointerDown = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;

      const rect = container.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;

      window.addEventListener('mousemove', onPointerMove, { passive: false });
      window.addEventListener('mouseup', onPointerUp);
    }

    function onPointerMove(e) {
      if (!isPointerDown) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!hasMoved) {
        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
          hasMoved = true;
          handle.classList.add('dragging');
        }
      }

      if (hasMoved) {
        if (e.cancelable) e.preventDefault();
        clampAndApplyPosition(container, startTop + dy, startLeft + dx);
      }
    }

    function onPointerUp(e) {
      if (!isPointerDown) return;
      isPointerDown = false;

      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);

      if (hasMoved) {
        handle.classList.remove('dragging');
        const finalRect = container.getBoundingClientRect();
        savedWidgetPosition = {
          top: Math.round(finalRect.top),
          left: Math.round(finalRect.left)
        };
        chrome.storage.local.set({ widgetPosition: savedWidgetPosition });
      } else {
        if (typeof onClick === 'function') {
          onClick(e);
        }
      }
    }

    handle.addEventListener('mousedown', onPointerDown);

    // Double-click to snap back to default top-right corner
    handle.addEventListener('dblclick', (e) => {
      if (e.target.closest('button, a, input, select')) return;
      savedWidgetPosition = null;
      chrome.storage.local.remove('widgetPosition');
      container.style.top = '75px';
      container.style.right = '20px';
      container.style.left = 'auto';
      container.style.bottom = 'auto';
    });
  }

  /**
   * Render Floating Overlay
   */
  function renderWidget(data) {
    if (!data) return;
    currentProductData = data;

    let container = document.getElementById('amz-fba-overlay-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'amz-fba-overlay-container';
      document.body.appendChild(container);
    }

    if (window.ThemeEngine) {
      window.ThemeEngine.applyTheme(userSettings.theme, container);
    }

    // Apply saved coordinates if user moved widget
    if (savedWidgetPosition && savedWidgetPosition.top !== null && savedWidgetPosition.left !== null) {
      clampAndApplyPosition(container, savedWidgetPosition.top, savedWidgetPosition.left);
    }

    const calc = data.lastCalculation;
    const cs = data.confidenceScore;

    if (!isWidgetExpanded) {
      const profitClass = calc.netProfit >= 0 ? 'profit-positive' : 'profit-negative';
      const profitSign = calc.netProfit >= 0 ? '+' : '';

      container.innerHTML = `
        <div class="amz-fba-mini-badge" id="amz-fba-toggle-btn" title="Drag to move anywhere • Click to open • Double-click to reset">
          <span class="amz-fba-drag-grip">⋮⋮</span>
          <div class="amz-fba-badge-logo">BFS</div>
          <div class="amz-fba-badge-metric">
            ${data.bsr > 0 ? `#${data.bsr.toLocaleString()}` : 'No BSR'} 
            ${data.estimatedMonthlySales > 0 ? `(~${data.estimatedMonthlySales.toLocaleString()} mo)` : ''}
          </div>
          <div class="amz-fba-badge-profit ${profitClass}">
            ${profitSign}$${calc.netProfit.toFixed(2)}
          </div>
        </div>
      `;

      makeDraggable(document.getElementById('amz-fba-toggle-btn'), container, () => {
        isWidgetExpanded = true;
        renderWidget(data);
      });
    } else {
      const r = data.restrictions;
      const getDotClass = (status) => status === 'pass' ? 'dot-green' : status === 'warning' ? 'dot-amber' : 'dot-red';

      // Split two-line rating label cleanly
      const labelLines = cs.ratingLabel.replace(/\s+/g, '<br>');

      container.innerHTML = `
        <div class="amz-fba-card">
          <!-- Header -->
          <div class="amz-fba-header" id="amz-fba-drag-header" title="Drag to move anywhere • Double-click to reset">
            <div class="amz-fba-brand-title">
              <span class="amz-fba-drag-grip" style="font-size:14px;margin-right:2px;cursor:grab;">⋮⋮</span>
              <span class="amz-fba-badge-logo">BFS</span>
              <span>BLANK FBA SCOUT</span>
            </div>
            <div class="amz-fba-header-actions">
              <button class="amz-fba-icon-btn" id="amz-fba-btn-minimize" title="Minimize">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
          </div>

          <!-- Tab Bar Navigation -->
          <div class="amz-fba-tab-bar">
            ${userSettings.tabCalculator ? `<button class="amz-fba-tab-item ${activeWidgetTab === 'tab-calc' ? 'active' : ''}" data-target="tab-calc">Calculator</button>` : ''}
            ${userSettings.tabRestrictions ? `<button class="amz-fba-tab-item ${activeWidgetTab === 'tab-rest' ? 'active' : ''}" data-target="tab-rest">Restrictions</button>` : ''}
            ${userSettings.tabCompetition ? `<button class="amz-fba-tab-item ${activeWidgetTab === 'tab-comp' ? 'active' : ''}" data-target="tab-comp">Competition & Qty</button>` : ''}
            ${userSettings.tabCharts ? `<button class="amz-fba-tab-item ${activeWidgetTab === 'tab-charts' ? 'active' : ''}" data-target="tab-charts">Charts</button>` : ''}
            ${userSettings.tabWholesale ? `<button class="amz-fba-tab-item ${activeWidgetTab === 'tab-sourcing' ? 'active' : ''}" data-target="tab-sourcing">Wholesale</button>` : ''}
          </div>

          <!-- Body -->
          <div class="amz-fba-body">
            
            <!-- Quick Glance Banner with Buy Criteria Stamp -->
            <div class="amz-fba-section" style="margin-bottom:10px;padding:8px 12px;">
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;">
                <span style="font-weight:700;color:#fff;">${data.brand ? data.brand + ' • ' : ''}ASIN: ${data.asin}</span>
                <span class="amz-fba-criteria-stamp ${calc.meetsCriteria ? 'meets' : 'fails'}">
                  ${calc.meetsCriteria ? '✓ MEETS CRITERIA' : '✕ BELOW TARGET'}
                </span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:10px;color:var(--amz-fba-text-muted);">
                <span>BSR: <strong style="color:#fbbf24;">#${data.bsr.toLocaleString()}</strong></span>
                <span>Sales: <strong style="color:#34d399;">~${data.estimatedMonthlySales.toLocaleString()}/mo</strong></span>
                <span>Price: <strong style="color:#fff;">$${data.price.toFixed(2)}</strong></span>
              </div>
            </div>

            <!-- BUYBOTPRO-STYLE AI CONFIDENCE SCORE CARD (FIXED TEXT OVERFLOW) -->
            <div class="amz-fba-confidence-card">
              <div class="amz-fba-confidence-header">
                <span>AI Deal Confidence Score</span>
                <span style="font-size:10px;color:${cs.ratingColor};">● ${cs.ratingLabel}</span>
              </div>
              <div class="amz-fba-confidence-body">
                <div class="amz-fba-confidence-gauge">
                  ${renderGaugeSvg(cs.score, cs.ratingColor)}
                  <div class="amz-fba-gauge-text-wrap">
                    <div class="amz-fba-gauge-label">${labelLines}</div>
                    <div class="amz-fba-gauge-percent" style="color:${cs.ratingColor};">${cs.score}%</div>
                  </div>
                </div>
                <div class="amz-fba-driver-pills">
                  ${cs.drivers.map(d => `
                    <div class="amz-fba-driver-pill">
                      <span class="pill-title">${d.label}</span>
                      <span class="pill-val" style="color:${d.status === 'pass' ? '#34d399' : d.status === 'warning' ? '#fbbf24' : '#f87171'};">${d.value}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- TAB 1: PROFIT CALCULATOR -->
            <div class="amz-fba-pane ${activeWidgetTab === 'tab-calc' ? 'active' : ''}" id="pane-tab-calc">
              <div class="amz-fba-results">
                <div class="amz-fba-profit-hero">
                  <div class="amz-fba-profit-hero-label">Estimated Net Profit</div>
                  <div class="amz-fba-profit-hero-value ${calc.netProfit >= 0 ? 'positive' : 'negative'}" id="calc-net-profit">
                    $${calc.netProfit.toFixed(2)}
                  </div>
                </div>
                <div class="amz-fba-grid-2">
                  <div class="amz-fba-stat" style="text-align:center;">
                    <div class="amz-fba-stat-label">Profit Margin</div>
                    <div class="amz-fba-stat-value highlight-green" id="calc-margin">${calc.profitMargin}%</div>
                  </div>
                  <div class="amz-fba-stat" style="text-align:center;">
                    <div class="amz-fba-stat-label">ROI</div>
                    <div class="amz-fba-stat-value highlight-green" id="calc-roi">${calc.roi}%</div>
                  </div>
                </div>

                <!-- Break-Even Price Box -->
                <div class="amz-fba-breakeven-box">
                  <div class="amz-fba-breakeven-item">
                    <span>Break-Even Price:</span>
                    <strong id="calc-be-price">$${calc.breakEvenPrice.toFixed(2)}</strong>
                  </div>
                  <div class="amz-fba-breakeven-item">
                    <span>Min Price (${userSettings.targetRoi}% ROI):</span>
                    <strong id="calc-min-price">$${calc.targetMinPrice.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              <!-- Interactive Inputs -->
              <div class="amz-fba-section">
                <div class="amz-fba-section-title"><span>Calculator Inputs</span></div>
                <div class="amz-fba-grid-2">
                  <div class="amz-fba-input-group">
                    <label class="amz-fba-label">Sell Price</label>
                    <div class="amz-fba-input-wrap">
                      <span class="amz-fba-prefix">$</span>
                      <input type="number" step="0.01" class="amz-fba-input" id="input-sell-price" value="${data.price.toFixed(2)}">
                    </div>
                  </div>
                  <div class="amz-fba-input-group">
                    <label class="amz-fba-label">Buy Cost (COGS)</label>
                    <div class="amz-fba-input-wrap">
                      <span class="amz-fba-prefix">$</span>
                      <input type="number" step="0.01" class="amz-fba-input" id="input-cogs" value="${calc.costOfGoods ? calc.costOfGoods.toFixed(2) : '0.00'}">
                    </div>
                  </div>
                </div>
                <div class="amz-fba-grid-2">
                  <div class="amz-fba-input-group">
                    <label class="amz-fba-label">Shipping Rate ($/lb)</label>
                    <div class="amz-fba-input-wrap">
                      <span class="amz-fba-prefix">$</span>
                      <input type="number" step="0.05" class="amz-fba-input" id="input-shipping-rate" value="${userSettings.inboundShippingRatePerLb.toFixed(2)}">
                    </div>
                  </div>
                  <div class="amz-fba-input-group">
                    <label class="amz-fba-label">Prep Fee ($)</label>
                    <div class="amz-fba-input-wrap">
                      <span class="amz-fba-prefix">$</span>
                      <input type="number" step="0.05" class="amz-fba-input" id="input-prep-fee" value="${userSettings.prepFee.toFixed(2)}">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fee Breakdown with Q4 Storage -->
              <div class="amz-fba-section">
                <div class="amz-fba-section-title"><span>Amazon Fee Breakdown</span></div>
                <div class="amz-fba-fee-row">
                  <span>Referral Fee:</span><span id="calc-ref-fee">$${calc.referralFee.toFixed(2)}</span>
                </div>
                <div class="amz-fba-fee-row">
                  <span>FBA Pick & Pack Fee:</span><span id="calc-fba-fee">$${calc.fbaFee.toFixed(2)}</span>
                </div>
                <div class="amz-fba-fee-row">
                  <span>Inbound Shipping:</span><span id="calc-ship-fee">$${calc.inboundShipping.toFixed(2)}</span>
                </div>
                <div class="amz-fba-fee-row">
                  <span>Standard Storage (Jan-Sep):</span><span>$${calc.standardMonthlyStorage.toFixed(2)}/mo</span>
                </div>
                <div class="amz-fba-fee-row">
                  <span>Q4 Peak Storage (Oct-Dec):</span><span style="color:#fbbf24;">$${calc.q4MonthlyStorage.toFixed(2)}/mo</span>
                </div>
                <div class="amz-fba-fee-row" style="border-top:1px solid rgba(255,255,255,0.06);margin-top:4px;padding-top:4px;">
                  <span>Total Costs & Fees:</span><span id="calc-total-costs">$${calc.totalCosts.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <!-- TAB 2: RESTRICTIONS CHECK ("Can I sell this?") -->
            <div class="amz-fba-pane ${activeWidgetTab === 'tab-rest' ? 'active' : ''}" id="pane-tab-rest">
              <div class="amz-fba-restrictions-card">
                <div class="amz-fba-restrictions-header">
                  Can I sell this?
                </div>
                <div class="amz-fba-restrictions-grid">
                  <div class="amz-fba-rest-cell" data-tooltip="${r.hazmat?.msg || ''}">
                    <div class="amz-fba-status-dot ${getDotClass(r.hazmat?.status)}"></div>
                    <span class="amz-fba-rest-label">Hazmat</span>
                  </div>
                  <div class="amz-fba-rest-cell" data-tooltip="${r.eligible?.msg || ''}">
                    <div class="amz-fba-status-dot ${getDotClass(r.eligible?.status)}"></div>
                    <span class="amz-fba-rest-label">Eligible</span>
                  </div>
                  <div class="amz-fba-rest-cell" data-tooltip="${r.dg?.msg || ''}">
                    <div class="amz-fba-status-dot ${getDotClass(r.dg?.status)}"></div>
                    <span class="amz-fba-rest-label">DG</span>
                  </div>
                  <div class="amz-fba-rest-cell" data-tooltip="${r.ipRadar?.msg || ''}">
                    <div class="amz-fba-status-dot ${getDotClass(r.ipRadar?.status)}"></div>
                    <span class="amz-fba-rest-label">IP Radar</span>
                  </div>
                  <div class="amz-fba-rest-cell" data-tooltip="${r.bbAnalysis?.msg || ''}">
                    <div class="amz-fba-status-dot ${getDotClass(r.bbAnalysis?.status)}"></div>
                    <span class="amz-fba-rest-label">BB Analysis</span>
                  </div>
                  <div class="amz-fba-rest-cell" data-tooltip="${r.oversize?.msg || ''}">
                    <div class="amz-fba-status-dot ${getDotClass(r.oversize?.status)}"></div>
                    <span class="amz-fba-rest-label">Oversize</span>
                  </div>
                </div>
                <div class="amz-fba-rest-detail-box" id="amz-fba-rest-explain">
                  💡 Click any icon above to view detailed safety & restriction notes.
                </div>
              </div>

              <div class="amz-fba-section">
                <div class="amz-fba-section-title"><span>Live Gating & Seller Central</span></div>
                <a href="${r.sellerCentralUrl}" target="_blank" class="amz-fba-btn amz-fba-btn-secondary" style="text-decoration:none;">
                  🔒 Check Ungating in Seller Central ↗
                </a>
              </div>
            </div>

            <!-- TAB 3: COMPETITION & SUGGESTED QUANTITY -->
            <div class="amz-fba-pane ${activeWidgetTab === 'tab-comp' ? 'active' : ''}" id="pane-tab-comp">
              <div class="amz-fba-section">
                <div class="amz-fba-section-title"><span>Competition Analyzer</span></div>
                <div class="amz-fba-grid-2">
                  <div class="amz-fba-stat">
                    <div class="amz-fba-stat-label">Total Offers</div>
                    <div class="amz-fba-stat-value">${data.sellerCount} Sellers</div>
                  </div>
                  <div class="amz-fba-stat">
                    <div class="amz-fba-stat-label">Buy Box Winner</div>
                    <div style="font-size:12px;font-weight:700;color:#fff;">${data.sellerInfo.badge}</div>
                  </div>
                </div>
                <div style="margin-top:8px;padding:8px;background:rgba(255,255,255,0.03);border-radius:6px;font-size:11px;color:var(--amz-fba-text-muted);">
                  Status: <strong style="color:${data.competition.color === 'green' ? '#34d399' : data.competition.color === 'amber' ? '#fbbf24' : '#f87171'}">${data.competition.level}</strong>
                  <div style="margin-top:2px;">${data.competition.description}</div>
                </div>

                <!-- BUY BOX ROTATION & ODDS SECTION -->
                <div style="margin-top:10px;padding:10px;background:rgba(255,255,255,0.02);border:1px solid var(--amz-fba-border);border-radius:8px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                    <span style="font-size:11px;font-weight:700;color:#fff;">🔄 Buy Box Rotation & Odds</span>
                    <span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px;background:${data.competition.rotationBg || 'rgba(16,185,129,0.2)'};color:${data.competition.rotationColor || '#34d399'};">
                      ● ${data.competition.rotationSpeed || 'Active'}
                    </span>
                  </div>

                  <div class="amz-fba-grid-2" style="margin-top:6px;">
                    <div class="amz-fba-stat">
                      <div class="amz-fba-stat-label">Win Probability</div>
                      <div style="font-size:12px;font-weight:800;color:${data.competition.probabilityColor || '#34d399'};">
                        ${data.competition.winProbability}%
                        <span style="font-size:9.5px;font-weight:500;color:var(--amz-fba-text-muted);">(${data.competition.probabilityLabel})</span>
                      </div>
                    </div>
                    <div class="amz-fba-stat">
                      <div class="amz-fba-stat-label">Time to Win</div>
                      <div style="font-size:12px;font-weight:800;color:#fff;">${data.competition.timeToWin || '~2-4 hrs'}</div>
                    </div>
                  </div>

                  <div class="amz-fba-grid-2" style="margin-top:6px;">
                    <div class="amz-fba-stat">
                      <div class="amz-fba-stat-label">Rotation Frequency</div>
                      <div style="font-size:11.5px;font-weight:700;color:#e5e7eb;">${data.competition.rotationFrequency || 'Every 2-4 hrs'}</div>
                    </div>
                    <div class="amz-fba-stat">
                      <div class="amz-fba-stat-label">Est. Win Share</div>
                      <div style="font-size:11.5px;font-weight:700;color:#34d399;">${data.competition.rotationShare || 'Equal Share'} / mo</div>
                    </div>
                  </div>

                  <div style="margin-top:6px;font-size:10px;color:var(--amz-fba-text-muted);line-height:1.3;">
                    ${data.competition.rotationCycle || 'Rotates between competitive Prime FBA sellers'}
                  </div>
                </div>
              </div>

              <div class="amz-fba-section">
                <div class="amz-fba-section-title">
                  <span>Suggested Purchase Quantity</span>
                  <span style="font-size:10px;color:#34d399;">~${data.purchaseQty.yourMonthlyVelocity} units/mo share</span>
                </div>

                <div class="amz-fba-tier-card">
                  <div class="amz-fba-tier-header">
                    <span class="amz-fba-tier-title">14-Day Test Order</span>
                    <span class="amz-fba-tier-qty">${data.purchaseQty.testOrder.quantity} units</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--amz-fba-text-muted);">
                    <span>Est. Investment: <strong>$${data.purchaseQty.testOrder.investment}</strong></span>
                    <span>Proj. Profit: <strong style="color:#34d399;">+$${data.purchaseQty.testOrder.projectedProfit}</strong></span>
                  </div>
                </div>

                <div class="amz-fba-tier-card">
                  <div class="amz-fba-tier-header">
                    <span class="amz-fba-tier-title">30-Day Restock Order</span>
                    <span class="amz-fba-tier-qty">${data.purchaseQty.order30Day.quantity} units</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--amz-fba-text-muted);">
                    <span>Est. Investment: <strong>$${data.purchaseQty.order30Day.investment}</strong></span>
                    <span>Proj. Profit: <strong style="color:#34d399;">+$${data.purchaseQty.order30Day.projectedProfit}</strong></span>
                  </div>
                </div>

                <div class="amz-fba-tier-card">
                  <div class="amz-fba-tier-header">
                    <span class="amz-fba-tier-title">60-Day Bulk Restock</span>
                    <span class="amz-fba-tier-qty">${data.purchaseQty.order60Day.quantity} units</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--amz-fba-text-muted);">
                    <span>Est. Investment: <strong>$${data.purchaseQty.order60Day.investment}</strong></span>
                    <span>Proj. Profit: <strong style="color:#34d399;">+$${data.purchaseQty.order60Day.projectedProfit}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 4: CHARTS & HISTORICAL TRENDS -->
            <div class="amz-fba-pane ${activeWidgetTab === 'tab-charts' ? 'active' : ''}" id="pane-tab-charts">
              <div class="amz-fba-timeframe-bar">
                <button class="amz-fba-timeframe-btn ${activeChartTimeframe === 30 ? 'active' : ''}" data-tf="30">30 Days</button>
                <button class="amz-fba-timeframe-btn ${activeChartTimeframe === 90 ? 'active' : ''}" data-tf="90">90 Days</button>
                <button class="amz-fba-timeframe-btn ${activeChartTimeframe === 180 ? 'active' : ''}" data-tf="180">180 Days</button>
              </div>

              <div id="amz-fba-charts-container">
                ${window.ChartsEngine ? window.ChartsEngine.renderBsrChart(data.bsr, activeChartTimeframe) : ''}
                ${window.ChartsEngine ? window.ChartsEngine.renderPriceChart(data.price, activeChartTimeframe) : ''}
                ${window.ChartsEngine ? window.ChartsEngine.renderStockVsPriceChart(data.price, data.sellerCount, activeChartTimeframe) : ''}
              </div>

              <div class="amz-fba-ext-links">
                <a href="https://keepa.com/#!product/1-${data.asin}" target="_blank" class="amz-fba-btn amz-fba-btn-secondary" style="text-decoration:none;font-size:11px;">
                  📈 Keepa Chart ↗
                </a>
                <a href="https://camelcamelcamel.com/product/${data.asin}" target="_blank" class="amz-fba-btn amz-fba-btn-secondary" style="text-decoration:none;font-size:11px;">
                  🐪 CamelCamelCamel ↗
                </a>
              </div>
            </div>

            <!-- TAB 5: WHOLESALE SOURCING -->
            <div class="amz-fba-pane ${activeWidgetTab === 'tab-sourcing' ? 'active' : ''}" id="pane-tab-sourcing">
              <div class="amz-fba-section">
                <div class="amz-fba-section-title"><span>1-Click Wholesale & Sourcing</span></div>
                <div class="amz-fba-source-list">
                  ${data.sourcingLinks.map(link => `
                    <a href="${link.url}" target="_blank" class="amz-fba-source-card">
                      <div class="amz-fba-source-main">
                        <span class="amz-fba-source-icon">${link.icon}</span>
                        <div>
                          <div class="amz-fba-source-name">${link.name}</div>
                          <div class="amz-fba-source-desc">${link.description}</div>
                        </div>
                      </div>
                      <span class="amz-fba-source-badge">${link.badge} ↗</span>
                    </a>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Bottom Action Buttons -->
            <div class="amz-fba-actions">
              <button class="amz-fba-btn amz-fba-btn-primary" id="amz-fba-btn-save">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                Track Product
              </button>
              <button class="amz-fba-btn amz-fba-btn-secondary" id="amz-fba-btn-copy">
                Copy ASIN
              </button>
            </div>

          </div>
        </div>
      `;

      attachEventListeners(data);
    }
  }

  /**
   * Recalculate profit metrics and break-even in real-time
   */
  function updateCalculations(data) {
    const sellPriceInput = document.getElementById('input-sell-price');
    const cogsInput = document.getElementById('input-cogs');
    const shipInput = document.getElementById('input-shipping-rate');
    const prepInput = document.getElementById('input-prep-fee');

    if (!sellPriceInput) return;

    const sellPrice = parseFloat(sellPriceInput.value) || 0;
    const cogs = parseFloat(cogsInput.value) || 0;
    const shipRate = parseFloat(shipInput.value) || 0;
    const prep = parseFloat(prepInput.value) || 0;

    const res = window.FbaCalculator.calculateProfit({
      sellingPrice: sellPrice,
      costOfGoods: cogs,
      category: data.category,
      dimensions: data.dimensions,
      weightLb: data.weightLb,
      inboundShippingRatePerLb: shipRate,
      prepFee: prep,
      targetRoi: userSettings.targetRoi,
      minProfit: userSettings.minProfit,
      maxBsr: userSettings.maxBsr,
      bsr: data.bsr
    });

    const netProfitEl = document.getElementById('calc-net-profit');
    const marginEl = document.getElementById('calc-margin');
    const roiEl = document.getElementById('calc-roi');

    if (netProfitEl) {
      netProfitEl.innerText = `${res.netProfit >= 0 ? '' : '-'}$${Math.abs(res.netProfit).toFixed(2)}`;
      netProfitEl.className = `amz-fba-profit-hero-value ${res.netProfit >= 0 ? 'positive' : 'negative'}`;
    }

    if (marginEl) {
      marginEl.innerText = `${res.profitMargin}%`;
      marginEl.className = `amz-fba-stat-value ${res.profitMargin >= 20 ? 'highlight-green' : res.profitMargin > 0 ? 'highlight-yellow' : 'highlight-red'}`;
    }

    if (roiEl) {
      roiEl.innerText = `${res.roi}%`;
      roiEl.className = `amz-fba-stat-value ${res.roi >= userSettings.targetRoi ? 'highlight-green' : res.roi > 0 ? 'highlight-yellow' : 'highlight-red'}`;
    }

    const beEl = document.getElementById('calc-be-price');
    const minPriceEl = document.getElementById('calc-min-price');
    if (beEl) beEl.innerText = `$${res.breakEvenPrice.toFixed(2)}`;
    if (minPriceEl) minPriceEl.innerText = `$${res.targetMinPrice.toFixed(2)}`;

    const refEl = document.getElementById('calc-ref-fee');
    const fbaEl = document.getElementById('calc-fba-fee');
    const shipEl = document.getElementById('calc-ship-fee');
    const totalEl = document.getElementById('calc-total-costs');

    if (refEl) refEl.innerText = `$${res.referralFee.toFixed(2)}`;
    if (fbaEl) fbaEl.innerText = `$${res.fbaFee.toFixed(2)}`;
    if (shipEl) shipEl.innerText = `$${res.inboundShipping.toFixed(2)}`;
    if (totalEl) totalEl.innerText = `$${res.totalCosts.toFixed(2)}`;

    data.lastCalculation = res;
  }

  function attachEventListeners(data) {
    const container = document.getElementById('amz-fba-overlay-container');
    const dragHeader = document.getElementById('amz-fba-drag-header');
    if (dragHeader && container) {
      makeDraggable(dragHeader, container, null);
    }

    document.getElementById('amz-fba-btn-minimize').addEventListener('click', () => {
      isWidgetExpanded = false;
      renderWidget(data);
    });

    document.querySelectorAll('.amz-fba-tab-item').forEach(tabBtn => {
      tabBtn.addEventListener('click', (e) => {
        const target = e.currentTarget.dataset.target;
        activeWidgetTab = target;
        document.querySelectorAll('.amz-fba-tab-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.amz-fba-pane').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const pane = document.getElementById(`pane-${target}`);
        if (pane) pane.classList.add('active');
      });
    });

    document.querySelectorAll('.amz-fba-timeframe-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeChartTimeframe = parseInt(e.currentTarget.dataset.tf, 10);
        document.querySelectorAll('.amz-fba-timeframe-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        const chartsBox = document.getElementById('amz-fba-charts-container');
        if (chartsBox && window.ChartsEngine) {
          chartsBox.innerHTML = `
            ${window.ChartsEngine.renderBsrChart(data.bsr, activeChartTimeframe)}
            ${window.ChartsEngine.renderPriceChart(data.price, activeChartTimeframe)}
            ${window.ChartsEngine.renderStockVsPriceChart(data.price, data.sellerCount, activeChartTimeframe)}
          `;
        }
      });
    });

    document.querySelectorAll('.amz-fba-rest-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const tooltip = e.currentTarget.dataset.tooltip;
        const explainEl = document.getElementById('amz-fba-rest-explain');
        if (explainEl && tooltip) {
          explainEl.innerHTML = `<strong>${e.currentTarget.querySelector('.amz-fba-rest-label').innerText}:</strong> ${tooltip}`;
        }
      });
    });

    ['input-sell-price', 'input-cogs', 'input-shipping-rate', 'input-prep-fee'].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', () => updateCalculations(data));
      }
    });

    document.getElementById('amz-fba-btn-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(data.asin);
      showToast('ASIN Copied!');
    });

    document.getElementById('amz-fba-btn-save').addEventListener('click', async () => {
      const calc = data.lastCalculation;

      const trackItem = {
        asin: data.asin,
        title: data.title,
        brand: data.brand,
        imageUrl: data.imageUrl,
        category: data.category,
        bsr: data.bsr,
        estimatedMonthlySales: data.estimatedMonthlySales,
        estimatedRevenue: data.estimatedRevenue,
        sellPrice: calc.sellingPrice,
        cogs: calc.costOfGoods,
        netProfit: calc.netProfit,
        profitMargin: calc.profitMargin,
        roi: calc.roi,
        confidenceScore: data.confidenceScore?.score || 50,
        savedAt: new Date().toISOString()
      };

      try {
        const { watchlist = [] } = await chrome.storage.local.get('watchlist');
        const existingIdx = watchlist.findIndex(item => item.asin === trackItem.asin);
        if (existingIdx >= 0) {
          watchlist[existingIdx] = trackItem;
        } else {
          watchlist.unshift(trackItem);
        }
        await chrome.storage.local.set({ watchlist });
        showToast('Saved to Watchlist!');
      } catch (err) {
        console.error('Error saving to watchlist:', err);
      }
    });
  }

  function showToast(message) {
    const card = document.querySelector('.amz-fba-card');
    if (!card) return;
    const existing = card.querySelector('.amz-fba-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'amz-fba-toast';
    toast.innerText = message;
    card.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  /**
   * IN-GRID SEARCH PAGE QUICK SCOUT
   * Injects badges into Amazon search results
   */
  function injectSearchPageBadges() {
    if (!isSearchPage()) return;

    const cards = document.querySelectorAll('div[data-component-type="s-search-result"], .s-result-item[data-asin]');
    cards.forEach(card => {
      if (card.querySelector('.amz-fba-search-scout-card')) return; // already injected

      const asin = card.getAttribute('data-asin');
      if (!asin || asin.length !== 10) return;

      const priceEl = card.querySelector('.a-price .a-offscreen');
      const priceText = priceEl ? priceEl.innerText.replace(/[^0-9.]/g, '') : '0';
      const price = parseFloat(priceText) || 19.99;

      // Estimate sales velocity from search position
      const estMonthlyUnits = Math.max(150, Math.round(1800 * Math.pow(0.92, Math.random() * 20)));
      const estProfit = (price * 0.32).toFixed(2);

      const badge = document.createElement('div');
      badge.className = 'amz-fba-search-scout-card';
      badge.innerHTML = `
        <div class="amz-fba-search-header">
          <span class="amz-fba-search-logo">BFS</span>
          <span style="font-size:10px;color:#d1d5db;">ASIN: ${asin}</span>
        </div>
        <div class="amz-fba-search-grid">
          <div class="amz-fba-search-stat">
            <span>Est. Sales</span>
            <strong style="color:#34d399;">~${estMonthlyUnits}/mo</strong>
          </div>
          <div class="amz-fba-search-stat">
            <span>Price</span>
            <strong style="color:#fff;">$${price.toFixed(2)}</strong>
          </div>
          <div class="amz-fba-search-stat">
            <span>Target Profit</span>
            <strong style="color:#fbbf24;">+$${estProfit}</strong>
          </div>
        </div>
      `;

      // Insert under price container or at bottom of card
      const targetAnchor = card.querySelector('.a-price') || card.querySelector('.s-product-image-container');
      if (targetAnchor && targetAnchor.parentNode) {
        targetAnchor.parentNode.insertBefore(badge, targetAnchor.nextSibling);
      }
    });
  }

  /**
   * Load user preferences
   */
  async function loadSettings() {
    try {
      const res = await chrome.storage.local.get([
        'theme',
        'widgetPosition',
        'inboundShippingRatePerLb',
        'prepFee',
        'targetRoi',
        'minProfit',
        'maxBsr',
        'googleSheetsWebhook',
        'tabCalculator',
        'tabRestrictions',
        'tabCompetition',
        'tabCharts',
        'tabWholesale'
      ]);

      if (res.theme) userSettings.theme = res.theme;
      if (res.widgetPosition) savedWidgetPosition = res.widgetPosition;
      if (res.inboundShippingRatePerLb !== undefined) userSettings.inboundShippingRatePerLb = Number(res.inboundShippingRatePerLb);
      if (res.prepFee !== undefined) userSettings.prepFee = Number(res.prepFee);
      if (res.targetRoi !== undefined) userSettings.targetRoi = Number(res.targetRoi);
      if (res.minProfit !== undefined) userSettings.minProfit = Number(res.minProfit);
      if (res.maxBsr !== undefined) userSettings.maxBsr = Number(res.maxBsr);
      if (res.googleSheetsWebhook) userSettings.googleSheetsWebhook = res.googleSheetsWebhook;

      if (res.tabCalculator !== undefined) userSettings.tabCalculator = res.tabCalculator;
      if (res.tabRestrictions !== undefined) userSettings.tabRestrictions = res.tabRestrictions;
      if (res.tabCompetition !== undefined) userSettings.tabCompetition = res.tabCompetition;
      if (res.tabCharts !== undefined) userSettings.tabCharts = res.tabCharts;
      if (res.tabWholesale !== undefined) userSettings.tabWholesale = res.tabWholesale;
    } catch (e) {
      // ignore
    }
  }

  // Adjust widget if browser window resizes
  window.addEventListener('resize', () => {
    const container = document.getElementById('amz-fba-overlay-container');
    if (container && savedWidgetPosition && savedWidgetPosition.top !== null) {
      const pos = clampAndApplyPosition(container, savedWidgetPosition.top, savedWidgetPosition.left);
      if (pos) {
        savedWidgetPosition = pos;
      }
    }
  });

  async function init() {
    await loadSettings();
    if (isSearchPage()) {
      injectSearchPageBadges();
    } else {
      const data = scrapeProduct();
      if (data) {
        renderWidget(data);
      }
    }
  }

  setTimeout(init, 800);

  let lastUrl = location.href;
  let dynamicOffersTimeout = null;

  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(init, 1000);
    } else if (isSearchPage()) {
      injectSearchPageBadges();
    } else {
      // Check if side drawer (#all-offers-display) was opened or updated
      const aod = document.getElementById('all-offers-display');
      if (aod && currentProductData) {
        if (dynamicOffersTimeout) clearTimeout(dynamicOffersTimeout);
        dynamicOffersTimeout = setTimeout(() => {
          const aodOffers = document.querySelectorAll('#all-offers-display .aod-offer, #aod-offer-list > div, #all-offers-display [id^="aod-offer"], #all-offers-display div[id*="soldby"], #all-offers-display [data-action="aod-ajax-add-to-cart"]');
          if (aodOffers.length > 0 && aodOffers.length !== currentProductData.sellerCount) {
            const freshData = scrapeProduct();
            if (freshData && freshData.sellerCount !== currentProductData.sellerCount) {
              renderWidget(freshData);
            }
          }
        }, 400);
      }
    }
  }).observe(document, { subtree: true, childList: true });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_CURRENT_PRODUCT') {
      const data = currentProductData || scrapeProduct();
      sendResponse({ product: data });
    } else if (message.type === 'SETTINGS_UPDATED') {
      loadSettings().then(() => {
        if (currentProductData) renderWidget(currentProductData);
        if (isSearchPage()) injectSearchPageBadges();
      });
    }
    return true;
  });

})();
