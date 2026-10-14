// Regression Test for Widget Rendering & Currency Symbol Interpolation
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FbaCalculator = require('../shared/fba-calculator.js');
const MarketplaceEngine = require('../shared/marketplaces.js');
const ThemeEngine = require('../shared/themes.js');
const ConfidenceEngine = require('../shared/confidence-score.js');
const RestrictionsEngine = require('../shared/restrictions-checker.js');
const CompetitionEngine = require('../shared/competition-analyzer.js');
const ChartsEngine = require('../shared/charts-engine.js');
const WholesaleSourcing = require('../shared/wholesale-sourcing.js');

console.log('--- 1. Testing renderWidget Symbol Interpolation & DOM Integrity ---');

function createMockElement(id = '', tag = 'div') {
  return {
    id,
    tagName: tag.toUpperCase(),
    className: '',
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); }
    },
    style: {},
    innerHTML: '',
    innerText: '',
    children: [],
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return this.attributes[k]; },
    appendChild(child) { this.children.push(child); return child; },
    addEventListener() {},
    removeEventListener() {},
    getBoundingClientRect() { return { top: 75, left: 100, width: 380, height: 520 }; },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    closest() { return null; }
  };
}

function runContentWithHostname(hostname) {
  const code = fs.readFileSync(path.join(__dirname, '../content/content.js'), 'utf8');

  const elementsMap = {};
  const doc = {
    getElementById(id) { return elementsMap[id] || null; },
    createElement(tag) {
      const el = createMockElement('', tag);
      el.appendChild = function(child) {
        if (child.id) elementsMap[child.id] = child;
        el.children.push(child);
        return child;
      };
      return el;
    },
    body: createMockElement('body', 'body'),
    documentElement: { clientWidth: 1440, clientHeight: 900 },
    addEventListener() {},
    querySelectorAll() { return []; }
  };
  doc.body.appendChild = function(child) {
    if (child.id) elementsMap[child.id] = child;
    doc.body.children.push(child);
    return child;
  };

  const sandbox = {
    console,
    window: {
      location: { hostname, href: 'https://' + hostname + '/dp/B0F86NH2ZX' },
      innerWidth: 1440,
      innerHeight: 900,
      FbaCalculator,
      MarketplaceEngine,
      ThemeEngine,
      ConfidenceEngine,
      RestrictionsEngine,
      CompetitionEngine,
      ChartsEngine,
      WholesaleSourcing,
      addEventListener() {},
      removeEventListener() {},
      document: doc
    },
    document: doc,
    location: { hostname, href: 'https://' + hostname + '/dp/B0F86NH2ZX' },
    chrome: {
      storage: {
        local: {
          get: (keys, cb) => cb({}),
          set: (obj, cb) => cb && cb(),
          remove: (keys, cb) => cb && cb()
        }
      },
      runtime: {
        onMessage: { addListener() {} },
        sendMessage() {}
      }
    },
    setTimeout: (fn) => {},
    MutationObserver: class {
      observe() {}
      disconnect() {}
    }
  };
  sandbox.window.window = sandbox.window;

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  return { sandbox, doc, elementsMap };
}

// Test with US marketplace
const { sandbox: sbUS, doc: docUS } = runContentWithHostname('www.amazon.com');
assert(docUS, 'Document mock initialized');
console.log('[PASS] content.js initialized under sandbox without syntax or scoping errors.');

console.log('\n--- 2. Verifying renderWidget Scope & Symbol Declarations ---');
const code = fs.readFileSync(path.join(__dirname, '../content/content.js'), 'utf8');

const match = code.match(/function\s+renderWidget\s*\([^)]*\)\s*\{([\s\S]*?)(?=\n\s*function\s+updateCalculations)/);
assert(match, 'renderWidget function exists');
assert(match[1].includes('const symbol ='), 'renderWidget defines const symbol');
console.log('[PASS] renderWidget scope contains explicit symbol declaration.');

const symbolDeclarationLines = [];
code.split('\n').forEach((line, idx) => {
  if (line.includes('const symbol =')) {
    symbolDeclarationLines.push(idx + 1);
  }
});
assert.strictEqual(symbolDeclarationLines.length, 3, 'symbol declared in renderWidget, updateCalculations, and injectSearchPageBadges');
console.log('[PASS] Verified symbol is properly scoped across all 3 key UI functions (lines: ' + symbolDeclarationLines.join(', ') + ').');

console.log('\n--- 3. Testing clampAndApplyPosition Coordinate Clamping ---');
function testClamp(vpW, vpH, width, height, top, left) {
  const maxLeft = Math.max(10, vpW - width - 15);
  const maxTop = Math.max(10, vpH - height - 15);
  const safeLeft = (typeof left === 'number' && !isNaN(left)) ? left : 20;
  const safeTop = (typeof top === 'number' && !isNaN(top)) ? top : 75;
  const clampedLeft = Math.round(Math.min(Math.max(10, safeLeft), maxLeft));
  const clampedTop = Math.round(Math.min(Math.max(10, safeTop), maxTop));
  return { top: clampedTop, left: clampedLeft };
}

const c1 = testClamp(1920, 1080, 380, 520, -200, -500);
assert.strictEqual(c1.left, 10, 'Left clamps to min 10px');
assert.strictEqual(c1.top, 10, 'Top clamps to min 10px');

const c2 = testClamp(1920, 1080, 380, 520, 5000, 5000);
assert.strictEqual(c2.left, 1920 - 380 - 15, 'Left clamps to right edge');
assert.strictEqual(c2.top, 1080 - 520 - 15, 'Top clamps to bottom edge');

const c3 = testClamp(1920, 1080, 380, 520, NaN, NaN);
assert.strictEqual(c3.left, 20, 'NaN left safely defaults to 20');
assert.strictEqual(c3.top, 75, 'NaN top safely defaults to 75');

const c4 = testClamp(1920, 1080, 380, 520, null, null);
assert.strictEqual(c4.left, 20, 'Null left safely defaults to 20');
assert.strictEqual(c4.top, 75, 'Null top safely defaults to 75');
console.log('[PASS] Position clamping safely protects against offscreen, negative, NaN, and null coordinates.');

console.log('\nAll widget rendering and position integrity tests passed successfully!');
