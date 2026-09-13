/**
 * BLANK FBA SCOUT - Popup Script v1.3.0
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  let currentActiveProduct = null;
  let activeCategoryFilter = 'All';

  await loadSettings();
  await loadActiveTabProduct();
  await renderWatchlist();
  renderTop100();

  /**
   * 1. Active Tab Product Inspection
   */
  async function loadActiveTabProduct() {
    const loadingEl = document.getElementById('active-product-loading');
    const noneEl = document.getElementById('active-product-none');
    const cardEl = document.getElementById('active-product-card');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url || !tab.url.includes('amazon.com')) {
        loadingEl.classList.add('hidden');
        noneEl.classList.remove('hidden');
        return;
      }

      chrome.tabs.sendMessage(tab.id, { type: 'GET_CURRENT_PRODUCT' }, (response) => {
        loadingEl.classList.add('hidden');

        if (chrome.runtime.lastError || !response || !response.product) {
          noneEl.classList.remove('hidden');
          return;
        }

        const p = response.product;
        currentActiveProduct = p;

        document.getElementById('active-img').src = p.imageUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="%23999"><path d="M4 4h16v16H4z"/></svg>';
        document.getElementById('active-title').innerText = p.title || 'Amazon Product';
        document.getElementById('active-asin').innerText = p.asin;
        document.getElementById('active-cat').innerText = p.category || 'General';

        const scoreEl = document.getElementById('active-score');
        if (scoreEl && p.confidenceScore) {
          scoreEl.innerText = `Score: ${p.confidenceScore.score}% (${p.confidenceScore.ratingLabel})`;
          scoreEl.style.color = p.confidenceScore.ratingColor;
        }

        document.getElementById('active-bsr').innerText = p.bsr > 0 ? `#${p.bsr.toLocaleString()}` : 'Unranked';
        document.getElementById('active-sales').innerText = `${(p.estimatedMonthlySales || 0).toLocaleString()} /mo`;
        document.getElementById('active-price').innerText = `$${(p.price || 0).toFixed(2)}`;
        document.getElementById('active-revenue').innerText = `$${Math.round(p.estimatedRevenue || 0).toLocaleString()}`;

        if (p.restrictions) {
          const r = p.restrictions;
          setDotStatus('rest-hazmat', r.hazmat?.status, r.hazmat?.msg);
          setDotStatus('rest-eligible', r.eligible?.status, r.eligible?.msg);
          setDotStatus('rest-dg', r.dg?.status, r.dg?.msg);
          setDotStatus('rest-ip', r.ipRadar?.status, r.ipRadar?.msg);
          setDotStatus('rest-bb', r.bbAnalysis?.status, r.bbAnalysis?.msg);
          setDotStatus('rest-oversize', r.oversize?.status, r.oversize?.msg);
        }

        cardEl.classList.remove('hidden');
      });
    } catch (err) {
      loadingEl.classList.add('hidden');
      noneEl.classList.remove('hidden');
    }
  }

  function setDotStatus(cellId, status, tooltip) {
    const cell = document.getElementById(cellId);
    if (!cell) return;
    const dot = cell.querySelector('.status-dot');
    dot.className = `status-dot ${status === 'pass' ? 'dot-green' : status === 'warning' ? 'dot-amber' : 'dot-red'}`;
    if (tooltip) cell.title = tooltip;
  }

  // Save current active product from popup
  document.getElementById('btn-save-current').addEventListener('click', async () => {
    if (!currentActiveProduct) return;

    const { watchlist = [] } = await chrome.storage.local.get('watchlist');
    const existingIdx = watchlist.findIndex(item => item.asin === currentActiveProduct.asin);

    const calc = currentActiveProduct.lastCalculation || {};

    const saveObj = {
      asin: currentActiveProduct.asin,
      title: currentActiveProduct.title,
      brand: currentActiveProduct.brand,
      imageUrl: currentActiveProduct.imageUrl,
      category: currentActiveProduct.category,
      bsr: currentActiveProduct.bsr,
      estimatedMonthlySales: currentActiveProduct.estimatedMonthlySales,
      estimatedRevenue: currentActiveProduct.estimatedRevenue,
      sellPrice: currentActiveProduct.price,
      cogs: calc.costOfGoods || 0,
      netProfit: calc.netProfit || currentActiveProduct.price * 0.35,
      profitMargin: calc.profitMargin || 35,
      roi: calc.roi || 0,
      confidenceScore: currentActiveProduct.confidenceScore?.score || 50,
      savedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      watchlist[existingIdx] = saveObj;
    } else {
      watchlist.unshift(saveObj);
    }

    await chrome.storage.local.set({ watchlist });
    await renderWatchlist();

    const saveBtn = document.getElementById('btn-save-current');
    saveBtn.innerText = '✓ Saved to Watchlist!';
    setTimeout(() => {
      saveBtn.innerText = '⭐ Add to Watchlist & Tracker';
    }, 2000);
  });

  /**
   * 2. Watchlist Management
   */
  async function renderWatchlist() {
    const { watchlist = [] } = await chrome.storage.local.get('watchlist');
    const countBadge = document.getElementById('watchlist-count');
    const emptyEl = document.getElementById('watchlist-empty');
    const itemsEl = document.getElementById('watchlist-items');

    countBadge.innerText = watchlist.length;

    if (watchlist.length === 0) {
      emptyEl.classList.remove('hidden');
      itemsEl.innerHTML = '';
      return;
    }

    emptyEl.classList.add('hidden');
    itemsEl.innerHTML = watchlist.map((item, idx) => `
      <div class="watchlist-card" data-asin="${item.asin}">
        <img src="${item.imageUrl || ''}" alt="Product" onerror="this.style.display='none'">
        <div class="watchlist-details">
          <div class="watchlist-title" title="${item.title}">${item.title}</div>
          <div class="watchlist-metrics">
            BSR: <strong>#${(item.bsr || 0).toLocaleString()}</strong> • 
            Sales: <strong>${(item.estimatedMonthlySales || 0).toLocaleString()}/mo</strong> • 
            Score: <strong style="color:#10b981;">${item.confidenceScore || 50}%</strong>
          </div>
          <div class="watchlist-metrics" style="margin-top:2px;">
            Price: $${(item.sellPrice || 0).toFixed(2)} • Profit: <strong>$${(item.netProfit || 0).toFixed(2)}</strong> (${item.profitMargin || 0}%)
          </div>
        </div>
        <button class="watchlist-remove-btn" data-index="${idx}" title="Remove">
          ✕
        </button>
      </div>
    `).join('');

    itemsEl.querySelectorAll('.watchlist-remove-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const index = parseInt(e.currentTarget.dataset.index, 10);
        watchlist.splice(index, 1);
        await chrome.storage.local.set({ watchlist });
        await renderWatchlist();
      });
    });
  }

  // Clear Watchlist
  document.getElementById('btn-clear-watchlist').addEventListener('click', async () => {
    if (confirm('Clear all tracked products from your watchlist?')) {
      await chrome.storage.local.set({ watchlist: [] });
      await renderWatchlist();
    }
  });

  // Export to CSV
  document.getElementById('btn-export-csv').addEventListener('click', async () => {
    const { watchlist = [] } = await chrome.storage.local.get('watchlist');
    if (watchlist.length === 0) {
      alert('Your watchlist is empty. Track some products first!');
      return;
    }

    const headers = [
      'ASIN',
      'Title',
      'Brand',
      'Category',
      'BSR',
      'Estimated Monthly Units',
      'Estimated Monthly Revenue',
      'Confidence Score %',
      'Sell Price',
      'COGS',
      'Net Profit',
      'Profit Margin %',
      'ROI %',
      'Amazon URL',
      'Tracked Date'
    ];

    const rows = watchlist.map(item => [
      `"${item.asin}"`,
      `"${(item.title || '').replace(/"/g, '""')}"`,
      `"${(item.brand || '').replace(/"/g, '""')}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      item.bsr || 0,
      item.estimatedMonthlySales || 0,
      (item.estimatedRevenue || 0).toFixed(2),
      item.confidenceScore || 50,
      (item.sellPrice || 0).toFixed(2),
      (item.cogs || 0).toFixed(2),
      (item.netProfit || 0).toFixed(2),
      (item.profitMargin || 0).toFixed(1),
      (item.roi || 0).toFixed(1),
      `"https://www.amazon.com/dp/${item.asin}"`,
      `"${item.savedAt ? new Date(item.savedAt).toLocaleDateString() : ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `blank_fba_scout_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Sync with Google Sheets Webhook
  document.getElementById('btn-sync-sheets').addEventListener('click', async () => {
    const { googleSheetsWebhook, watchlist = [] } = await chrome.storage.local.get(['googleSheetsWebhook', 'watchlist']);
    if (!googleSheetsWebhook) {
      alert('Please set your Google Sheets Webhook URL in the Settings tab first!');
      return;
    }
    if (watchlist.length === 0) {
      alert('Your watchlist is empty. Track some products first!');
      return;
    }

    try {
      const resp = await fetch(googleSheetsWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: watchlist, syncedAt: new Date().toISOString() })
      });
      alert('Successfully synced Watchlist to Google Sheets!');
    } catch (e) {
      alert('Could not sync to Google Sheets. Verify your Webhook URL in Settings.');
    }
  });

  /**
   * 3. Top 100 Wholesale Directory
   */
  function renderTop100() {
    if (!window.TopWholesaleProducts) return;
    const container = document.getElementById('top100-list');
    const products = window.TopWholesaleProducts.getProductsByCategory(activeCategoryFilter);

    container.innerHTML = products.map(item => `
      <div class="top100-card">
        <div class="top100-header">
          <span class="top100-title">${item.id}. ${item.name}</span>
          <span class="top100-cat-badge">${item.category}</span>
        </div>
        <div class="top100-metrics">
          <div class="top100-stat">
            <span>BSR</span>
            <strong style="color:#fbbf24;">#${item.typicalBsr.toLocaleString()}</strong>
          </div>
          <div class="top100-stat">
            <span>Sales</span>
            <strong style="color:#34d399;">~${item.estMonthlySales}/mo</strong>
          </div>
          <div class="top100-stat">
            <span>Retail</span>
            <strong>$${item.retailPrice.toFixed(2)}</strong>
          </div>
          <div class="top100-stat">
            <span>Target Cost</span>
            <strong style="color:#60a5fa;">$${item.targetCost.toFixed(2)}</strong>
          </div>
        </div>
        <div class="top100-actions">
          <a href="https://www.amazon.com/s?k=${encodeURIComponent(item.name)}" target="_blank" class="top100-btn">
            Amazon ↗
          </a>
          <a href="https://www.alibaba.com/trade/search?fsb=y&IndexArea=product_en&SearchText=${encodeURIComponent(item.query)}" target="_blank" class="top100-btn" style="color:#ff9900;border-color:rgba(255,153,0,0.3);">
            Alibaba ↗
          </a>
          <a href="https://www.google.com/search?q=${encodeURIComponent(item.name)}+wholesale+distributor+supplier+MOQ" target="_blank" class="top100-btn">
            Google ↗
          </a>
        </div>
      </div>
    `).join('');

    // Attach category filter buttons
    document.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        activeCategoryFilter = e.currentTarget.dataset.cat;
        renderTop100();
      });
    });
  }

  /**
   * Dynamic toolbar icon color generator
   */
  function updateActionIcon(themeKey) {
    const theme = window.ThemeEngine ? window.ThemeEngine.getTheme(themeKey) : null;
    const primaryColor = theme ? theme.primary : '#ff9900';

    if (chrome.action && chrome.action.setIcon) {
      try {
        const sizes = [16, 32];
        const imageDataObj = {};

        sizes.forEach(size => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.clearRect(0, 0, size, size);

          const center = size / 2;
          const radius = Math.max(1, center - 1.5);

          ctx.beginPath();
          ctx.arc(center, center, radius, 0, 2 * Math.PI);
          ctx.fillStyle = primaryColor;
          ctx.fill();

          ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.lineWidth = size >= 32 ? 1.5 : 1;
          ctx.stroke();

          const isLightColor = ['#e2e8f0', '#00f2fe', '#ff9900', '#f59e0b', '#10b981'].includes(primaryColor.toLowerCase());
          ctx.fillStyle = isLightColor ? '#0a0e17' : '#ffffff';
          ctx.font = `900 ${Math.round(size * 0.4)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('BFS', center, center + (size >= 32 ? 1 : 0.5));

          imageDataObj[size] = ctx.getImageData(0, 0, size, size);
        });

        chrome.action.setIcon({ imageData: imageDataObj }, () => {
          if (chrome.runtime.lastError) { /* ignore */ }
        });
      } catch (err) {
        console.warn('Could not update action icon from popup:', err);
      }
    }

    try {
      chrome.runtime.sendMessage({ type: 'UPDATE_TOOLBAR_ICON', theme: themeKey });
    } catch (e) {}
  }

  /**
   * 4. Settings Management
   */
  async function loadSettings() {
    const res = await chrome.storage.local.get([
      'theme',
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

    const theme = res.theme || 'amber';
    document.getElementById('setting-theme').value = theme;
    if (window.ThemeEngine) {
      window.ThemeEngine.applyTheme(theme, document.documentElement);
    }
    updateActionIcon(theme);

    if (res.inboundShippingRatePerLb !== undefined) {
      document.getElementById('setting-shipping').value = Number(res.inboundShippingRatePerLb);
    }
    if (res.prepFee !== undefined) {
      document.getElementById('setting-prep').value = Number(res.prepFee);
    }
    if (res.targetRoi !== undefined) {
      document.getElementById('setting-roi').value = Number(res.targetRoi);
    }
    if (res.minProfit !== undefined) {
      document.getElementById('setting-min-profit').value = Number(res.minProfit);
    }
    if (res.maxBsr !== undefined) {
      document.getElementById('setting-max-bsr').value = Number(res.maxBsr);
    }
    if (res.googleSheetsWebhook) {
      document.getElementById('setting-webhook').value = res.googleSheetsWebhook;
    }

    document.getElementById('setting-tab-calc').checked = res.tabCalculator !== false;
    document.getElementById('setting-tab-rest').checked = res.tabRestrictions !== false;
    document.getElementById('setting-tab-comp').checked = res.tabCompetition !== false;
    document.getElementById('setting-tab-charts').checked = res.tabCharts !== false;
    document.getElementById('setting-tab-sourcing').checked = res.tabWholesale !== false;
  }

  document.getElementById('setting-theme').addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    if (window.ThemeEngine) {
      window.ThemeEngine.applyTheme(selectedTheme, document.documentElement);
    }
    updateActionIcon(selectedTheme);
  });

  document.getElementById('btn-save-settings').addEventListener('click', async () => {
    const theme = document.getElementById('setting-theme').value;
    const shipping = parseFloat(document.getElementById('setting-shipping').value) || 0.40;
    const prep = parseFloat(document.getElementById('setting-prep').value) || 0.20;
    const roi = parseFloat(document.getElementById('setting-roi').value) || 30;
    const minProfit = parseFloat(document.getElementById('setting-min-profit').value) || 3.00;
    const maxBsr = parseInt(document.getElementById('setting-max-bsr').value, 10) || 50000;
    const webhook = document.getElementById('setting-webhook').value.trim();

    const tabCalc = document.getElementById('setting-tab-calc').checked;
    const tabRest = document.getElementById('setting-tab-rest').checked;
    const tabComp = document.getElementById('setting-tab-comp').checked;
    const tabCharts = document.getElementById('setting-tab-charts').checked;
    const tabSourcing = document.getElementById('setting-tab-sourcing').checked;

    await chrome.storage.local.set({
      theme,
      inboundShippingRatePerLb: shipping,
      prepFee: prep,
      targetRoi: roi,
      minProfit,
      maxBsr,
      googleSheetsWebhook: webhook,
      tabCalculator: tabCalc,
      tabRestrictions: tabRest,
      tabCompetition: tabComp,
      tabCharts: tabCharts,
      tabWholesale: tabSourcing
    });

    if (window.ThemeEngine) {
      window.ThemeEngine.applyTheme(theme, document.documentElement);
    }
    updateActionIcon(theme);

    try {
      const tabs = await chrome.tabs.query({ url: '*://*.amazon.com/*' });
      for (const t of tabs) {
        chrome.tabs.sendMessage(t.id, { type: 'SETTINGS_UPDATED' });
      }
    } catch (e) {}

    const msg = document.getElementById('settings-saved-msg');
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 2500);
  });
});
