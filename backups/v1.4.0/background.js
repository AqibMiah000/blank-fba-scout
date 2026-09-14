/**
 * BLANK FBA SCOUT - Background Service Worker v1.4.0
 * Handles dynamic toolbar icon color theming and extension lifecycle
 */

const THEME_PRIMARY_COLORS = {
  'amber': '#ff9900',
  'cyber-dark': '#00f2fe',
  'ocean-blue': '#3b82f6',
  'emerald': '#10b981',
  'gx-purple': '#a855f7',
  'crimson-red': '#ef4444',
  'sunset-orange': '#ff6b4a',
  'gold-luxury': '#f59e0b',
  'neon-pink': '#ec4899',
  'midnight-mono': '#e2e8f0'
};

/**
 * Generate dynamic badge icon with the theme color
 */
function createThemeIconImageData(primaryColor, size = 32) {
  if (typeof OffscreenCanvas === 'undefined') return null;

  try {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Clear background
    ctx.clearRect(0, 0, size, size);

    // Draw circular badge with primary theme color
    const center = size / 2;
    const radius = Math.max(1, center - 1.5);

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.fillStyle = primaryColor;
    ctx.fill();

    // Subtle dark outer border for crisp definition on all browser tab bars
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = size >= 32 ? 1.5 : 1;
    ctx.stroke();

    // Contrast text calculation
    const isLightColor = ['#e2e8f0', '#00f2fe', '#ff9900', '#f59e0b', '#10b981'].includes(primaryColor.toLowerCase());
    ctx.fillStyle = isLightColor ? '#0a0e17' : '#ffffff';
    ctx.font = `900 ${Math.round(size * 0.4)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BFS', center, center + (size >= 32 ? 1 : 0.5));

    return ctx.getImageData(0, 0, size, size);
  } catch (err) {
    console.warn('Could not generate offscreen icon:', err);
    return null;
  }
}

/**
 * Updates extension action icon to match the theme
 */
function updateToolbarIcon(themeKey) {
  const primaryColor = THEME_PRIMARY_COLORS[themeKey] || THEME_PRIMARY_COLORS['amber'];
  
  if (!chrome.action || !chrome.action.setIcon) return;

  const icon16 = createThemeIconImageData(primaryColor, 16);
  const icon32 = createThemeIconImageData(primaryColor, 32);

  if (icon16 && icon32) {
    chrome.action.setIcon({
      imageData: {
        16: icon16,
        32: icon32
      }
    }, () => {
      if (chrome.runtime.lastError) {
        // Suppress benign context error
      }
    });
  }
}

// Initialize icon on install/startup
chrome.runtime.onInstalled.addListener(async () => {
  const { theme = 'amber' } = await chrome.storage.local.get('theme');
  updateToolbarIcon(theme);
});

chrome.runtime.onStartup.addListener(async () => {
  const { theme = 'amber' } = await chrome.storage.local.get('theme');
  updateToolbarIcon(theme);
});

// React immediately when theme setting changes in storage
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.theme) {
    updateToolbarIcon(changes.theme.newValue);
  }
});

// Listen for direct update messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_TOOLBAR_ICON') {
    updateToolbarIcon(message.theme);
    sendResponse({ success: true });
  }
  return true;
});
