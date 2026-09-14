/**
 * Theme Engine for BLANK FBA SCOUT v1.4.0
 * 10 Themes with dynamic color palette variables and toolbar icon styling
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ThemeEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const THEMES = {
    'amber': {
      name: 'Amazon Amber (Classic)',
      primary: '#ff9900',
      vars: {
        '--amz-fba-primary': '#ff9900',
        '--amz-fba-primary-hover': '#e88b00',
        '--amz-fba-bg-dark': '#131921',
        '--amz-fba-bg-card': '#1e2634',
        '--amz-fba-bg-input': '#0f141d',
        '--amz-fba-border': '#2d3848'
      }
    },
    'cyber-dark': {
      name: 'Cyber Cyan (Neon)',
      primary: '#00f2fe',
      vars: {
        '--amz-fba-primary': '#00f2fe',
        '--amz-fba-primary-hover': '#00c6d4',
        '--amz-fba-bg-dark': '#0a0e17',
        '--amz-fba-bg-card': '#111827',
        '--amz-fba-bg-input': '#06090e',
        '--amz-fba-border': '#1f293d'
      }
    },
    'ocean-blue': {
      name: 'Ocean Blue (Electric Navy)',
      primary: '#3b82f6',
      vars: {
        '--amz-fba-primary': '#3b82f6',
        '--amz-fba-primary-hover': '#2563eb',
        '--amz-fba-bg-dark': '#0a1120',
        '--amz-fba-bg-card': '#131f36',
        '--amz-fba-bg-input': '#070d19',
        '--amz-fba-border': '#1e3054'
      }
    },
    'emerald': {
      name: 'Emerald Green (Profit Mint)',
      primary: '#10b981',
      vars: {
        '--amz-fba-primary': '#10b981',
        '--amz-fba-primary-hover': '#059669',
        '--amz-fba-bg-dark': '#091813',
        '--amz-fba-bg-card': '#112c22',
        '--amz-fba-bg-input': '#05100c',
        '--amz-fba-border': '#1b4334'
      }
    },
    'gx-purple': {
      name: 'GX Purple (Opera Style)',
      primary: '#a855f7',
      vars: {
        '--amz-fba-primary': '#a855f7',
        '--amz-fba-primary-hover': '#9333ea',
        '--amz-fba-bg-dark': '#0e0717',
        '--amz-fba-bg-card': '#1b112c',
        '--amz-fba-bg-input': '#09040f',
        '--amz-fba-border': '#2f1d4c'
      }
    },
    'crimson-red': {
      name: 'Crimson Red (Vivid)',
      primary: '#ef4444',
      vars: {
        '--amz-fba-primary': '#ef4444',
        '--amz-fba-primary-hover': '#dc2626',
        '--amz-fba-bg-dark': '#180a0a',
        '--amz-fba-bg-card': '#271111',
        '--amz-fba-bg-input': '#100505',
        '--amz-fba-border': '#451a1a'
      }
    },
    'sunset-orange': {
      name: 'Sunset Coral (Warm)',
      primary: '#ff6b4a',
      vars: {
        '--amz-fba-primary': '#ff6b4a',
        '--amz-fba-primary-hover': '#fa522c',
        '--amz-fba-bg-dark': '#160c08',
        '--amz-fba-bg-card': '#251711',
        '--amz-fba-bg-input': '#0f0805',
        '--amz-fba-border': '#3d241c'
      }
    },
    'gold-luxury': {
      name: 'Royal Gold (Champagne)',
      primary: '#f59e0b',
      vars: {
        '--amz-fba-primary': '#f59e0b',
        '--amz-fba-primary-hover': '#d97706',
        '--amz-fba-bg-dark': '#161208',
        '--amz-fba-bg-card': '#251e11',
        '--amz-fba-bg-input': '#100c05',
        '--amz-fba-border': '#3d311c'
      }
    },
    'neon-pink': {
      name: 'Synthwave Pink (Hot)',
      primary: '#ec4899',
      vars: {
        '--amz-fba-primary': '#ec4899',
        '--amz-fba-primary-hover': '#db2777',
        '--amz-fba-bg-dark': '#180914',
        '--amz-fba-bg-card': '#291122',
        '--amz-fba-bg-input': '#11050e',
        '--amz-fba-border': '#431937'
      }
    },
    'midnight-mono': {
      name: 'Platinum Silver (Monochrome)',
      primary: '#e2e8f0',
      vars: {
        '--amz-fba-primary': '#e2e8f0',
        '--amz-fba-primary-hover': '#cbd5e1',
        '--amz-fba-bg-dark': '#0f1115',
        '--amz-fba-bg-card': '#181b22',
        '--amz-fba-bg-input': '#0b0d10',
        '--amz-fba-border': '#2d3340'
      }
    }
  };

  function applyTheme(themeKey, targetElement) {
    const theme = THEMES[themeKey] || THEMES['amber'];
    const el = targetElement || document.documentElement;

    for (const [key, value] of Object.entries(theme.vars)) {
      el.style.setProperty(key, value);
    }
  }

  function getTheme(themeKey) {
    return THEMES[themeKey] || THEMES['amber'];
  }

  function getAvailableThemes() {
    return Object.entries(THEMES).map(([key, t]) => ({
      key,
      name: t.name,
      primary: t.primary
    }));
  }

  return {
    THEMES,
    applyTheme,
    getTheme,
    getAvailableThemes
  };
});
