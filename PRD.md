# 📋 Product Requirements Document (PRD): BLANK FBA SCOUT

**Product Name:** BLANK FBA SCOUT (BFS)  
**Current Version:** v1.5.0  
**Target Platform:** Chromium-based Browsers (Opera GX, Google Chrome, Brave, Microsoft Edge)  
**Architecture:** Manifest V3, 100% Client-Side / Local Execution (Zero-Backend)  
**Repository:** `https://github.com/AqibMiah000/blank-fba-scout.git`  
**Document Status:** Approved & Production-Ready  

---

## 1. Executive Summary & Vision

### 1.1 Product Vision
**BLANK FBA SCOUT** is an all-in-one, zero-subscription browser extension designed to replace expensive (\$30–\$100/mo) Amazon FBA sourcing software (such as SellerAmp SAS, BuyBotPro, and Helium 10). It provides real-time, on-page intelligence directly inside Amazon product detail pages and search result grids.

### 1.2 Value Proposition
- **100% Client-Side & Local:** Zero external database dependencies, zero third-party telemetry, zero required monthly subscriptions.
- **2026 Fee Accuracy:** First-class support for Amazon’s 2026 fee structure, including Inbound Placement Fees, Q4 storage surcharges, and dimensional weight tiering.
- **Global Multi-Marketplace:** Automated country detection across 7 major Amazon regional marketplaces (US, UK, DE, FR, IT, ES, CA) with localized currencies and statutory VAT calculations.
- **Zero-Lag Architecture:** Non-blocking asynchronous DOM scraping utilizing `requestIdleCallback` for a native 60fps Amazon browsing experience.

---

## 2. Problem Statement & Market Opportunity

| Traditional Competitor Flaws | BLANK FBA SCOUT Solution |
| :--- | :--- |
| **Expensive Subscriptions:** \$360–\$1,200/year per user. | **Zero Recurring Fees:** 100% open-source, portable, and free forever. |
| **Buy Box Misidentification:** Often labels "Fulfilled by Amazon" or "Amazon Resale" warehouse deals as sellers. | **Pinpoint Storefront Extraction:** Direct filtering of `a[href*="seller="]`, `/sp?`, and `/shops/` to isolate actual 3rd-party merchants. |
| **Page Lag & CPU Bloat:** Heavy polling and synchronous mutation listeners degrade browser performance. | **Throttled Idle Callback:** Observer debounced to 450ms; cached card queries reduce DOM overhead by 99.9%. |
| **Single-Marketplace Lock-in:** Requires manual toggling or separate subscriptions for UK/EU marketplaces. | **Zero-Config Country Auto-Detection:** Automatically shifts currencies, fees, and VAT deductions based on domain. |

---

## 3. User Personas

### Persona A: The FBA Wholesale Sourcing Specialist ("Alex")
* **Goal:** Evaluate supplier catalogs and Amazon product pages in seconds to find profitable bulk lines.
* **Needs:** Exact break-even pricing, minimum target price for 30% ROI, restock order planning (14/30/60 days), and 1-click supplier search links (Alibaba, Google Wholesale, ThomasNet).
* **Pain Point:** Miscalculating dimensional weight or Q4 storage surge fees, resulting in negative margin inventory.

### Persona B: The Retail & Online Arbitrageur ("Sarah")
* **Goal:** Quickly scan dozens of clearance/arbitrage deals per day across Amazon US and UK.
* **Needs:** Immediate visibility into Buy Box rotation health, gated brand/hazmat risk alerts, automated VAT deduction for UK/EU listings, and a 1-click CSV export of saved deals.
* **Pain Point:** Paying high monthly software fees before achieving consistent sourcing volume.

---

## 4. System Architecture & Component Breakdown

```mermaid
graph TB
    subgraph Browser Environment
        AP["Amazon Web Page (US, UK, DE, etc.)"]
        
        subgraph BLANK FBA SCOUT Extension (MV3)
            CS["content.js (In-Page Draggable Overlay)"]
            ME["shared/marketplaces.js (Domain & VAT Engine)"]
            FC["shared/fba-calculator.js (Fee & Break-Even)"]
            BE["shared/bsr-estimator.js (Sales Velocity)"]
            CA["shared/competition-analyzer.js (Buy Box & Qty)"]
            RC["shared/restrictions-checker.js (Gating/Hazmat)"]
            CONF["shared/confidence-score.js (AI Deal Score)"]
            CH["shared/charts-engine.js (SVG Visualizer)"]
            TH["shared/themes.js (10 Color Palettes)"]
            POP["popup.js / popup.html (Dashboard & Watchlist)"]
            BG["background.js (OffscreenCanvas Icon Sync)"]
        end
        
        STORAGE[("chrome.storage.local (Watchlist & Preferences)")]
    end

    AP -->|DOM Events| CS
    CS --> ME
    CS --> FC
    CS --> BE
    CS --> CA
    CS --> RC
    CS --> CONF
    CS --> CH
    CS <--> STORAGE
    POP <--> STORAGE
    POP --> TH
    TH --> BG
```

---

## 5. Detailed Functional Specifications

### 5.1 Real-Time FBA Profit & Margin Engine (`shared/fba-calculator.js`)
* **Category-Specific Referral Fees:** Dynamic rates ranging from 8% to 15% with minimum threshold protections (\$0.30 standard floor).
* **Dimensional Weight Tiering:** Computes volumetric weight ($\frac{L \times W \times H}{139}$) against actual unit weight to allocate billable weight across 4 size tiers:
  * Small Standard ($\le 16\text{ oz}$, dimensions $\le 15'' \times 12'' \times 0.75''$)
  * Large Standard ($\le 20\text{ lb}$, dimensions $\le 18'' \times 14'' \times 8''$)
  * Large Bulky ($\le 50\text{ lb}$, length $\le 59''$)
  * Extra-Large / Oversize ($> 50\text{ lb}$)
* **2026 Inbound Placement Fee:** Configurable per-unit surcharge (defaulting to \$0.00, customizable up to \$0.50/unit) factored directly into total investment and cost-of-goods.
* **Storage Fee Projection:** Projects monthly storage per cubic foot:
  * Standard Period (January – September): \$0.78 / cu ft
  * Q4 Peak Holiday Period (October – December): \$2.40 / cu ft
* **Break-Even & Target ROI Equations:**
  $$\text{BreakEven} = \frac{\text{COGS} + \text{Inbound Shipping} + \text{Prep Fee} + \text{FBA Fee} + \text{VAT}}{1 - \text{Referral Rate}}$$
  $$\text{Target Price} = \frac{\text{Fixed Costs} + [(\text{COGS} + \text{Shipping} + \text{Prep}) \times \text{Target ROI}\%]}{1 - \text{Referral Rate}}$$

### 5.2 Multi-Marketplace & Country Auto-Detection (`shared/marketplaces.js`)
* **Automated Host Matching:** Listens to `window.location.hostname` across:
  * `amazon.com` $\rightarrow$ United States (`USD`, `$`, 0% VAT)
  * `amazon.co.uk` $\rightarrow$ United Kingdom (`GBP`, `£`, 20% VAT)
  * `amazon.de` $\rightarrow$ Germany (`EUR`, `€`, 19% VAT)
  * `amazon.fr` $\rightarrow$ France (`EUR`, `€`, 20% VAT)
  * `amazon.it` $\rightarrow$ Italy (`EUR`, `€`, 22% VAT)
  * `amazon.es` $\rightarrow$ Spain (`EUR`, `€`, 21% VAT)
  * `amazon.ca` $\rightarrow$ Canada (`CAD`, `CA$`, 5% GST/HST)
* **Automatic VAT Deduction:** On UK/EU marketplaces, gross listing price is parsed to isolate net merchant revenue:
  $$\text{Net Revenue} = \text{Gross Price} - \left(\text{Gross Price} - \frac{\text{Gross Price}}{1 + \text{VAT Rate}}\right)$$

### 5.3 Buy Box Intelligence & Competition Analyzer (`shared/competition-analyzer.js`)
* **Storefront Link Isolation:** Bypasses non-merchant anchor text (`"Amazon Resale"`, `"Fulfilled by Amazon"`, `"Learn more"`) to extract exact 3rd-party seller profile links matching `a[href*="seller="]`, `/sp?`, or `/shops/`.
* **Rotation Cycle Estimation:** Computes estimated Buy Box turnover based on active FBA seller density:
  * 1–2 Sellers: *Every 1–2 hours*
  * 3–5 Sellers: *Every 2–4 hours*
  * 6–10 Sellers: *Every 4–8 hours*
  * 10+ Sellers: *Low Rotation / Saturated*
* **Purchase Quantity Advisor:** Recommends order sizes based on monthly sales velocity and seller count:
  * 14-Day Test Order
  * 30-Day Regular Supply
  * 60-Day Bulk Order

### 5.4 AI Deal Confidence Score (`shared/confidence-score.js`)
* Multi-factor scoring model normalized from 0% to 100%:
  * ROI Performance (Weight: 35%)
  * Sales Velocity & BSR Stability (Weight: 25%)
  * Buy Box Rotation & Competitive Spread (Weight: 20%)
  * Ungating & Risk Factor Health (Weight: 20%)
* Visualized via a circular inline SVG gauge with dynamic four-tier color thresholds:
  * 85–100%: `HIGH CHANCE` (Emerald Green `#10b981`)
  * 70–84%: `ABOVE AVERAGE` (Cyan `#06b6d4`)
  * 50–69%: `AVERAGE` (Amber `#f59e0b`)
  * < 50%: `RISKY / PASS` (Crimson `#ef4444`)

### 5.5 High-Performance DOM Observer (`content/content.js`)
* **Throttled Mutation Engine:** Replaces generic DOM listeners with a 450ms debounce wrapped inside `window.requestIdleCallback`.
* **In-Grid Search Scout:** Scans Amazon search result grids using `:not([data-fba-scouted])` and immediately tags nodes to guarantee zero redundant query executions.

### 5.6 Data Portability & Watchlist (`popup/popup.js`)
* **1-Click CSV Export:** Generates RFC 4180 compliant `.csv` files directly in memory via Blob URL for instantaneous download.
* **Fields Exported:** `ASIN`, `Title`, `Brand`, `Marketplace`, `Category`, `BSR`, `Monthly Units`, `Monthly Revenue`, `Confidence %`, `Currency`, `Sell Price`, `COGS`, `Net Profit`, `Margin %`, `ROI %`, `Amazon URL`, `Tracked Date`.
* **Google Sheets Webhook Sync:** Optional direct payload transmission to user-hosted Google Apps Script webhooks.

### 5.7 Hybrid Keepa Integration (`shared/charts-engine.js`)
* **Optional API Hook:** Advanced users can supply a Keepa API Key in the Settings tab.
* **Behavior:**
  * If key is present: Queries Keepa REST API (`api.keepa.com/product`) to chart authentic 365-day price history and rank drop intervals.
  * If key is absent: Uses BFS client-side mathematical trajectory model with zero setup.

---

## 6. UI & Theming Architecture

10 pre-engineered color palettes configured via root CSS variables (`shared/themes.js`):
1. **Amazon Amber** (Classic `#ff9900`)
2. **Cyber Cyan** (Neon `#00f2fe`)
3. **Ocean Blue** (Electric Navy `#38bdf8`)
4. **Emerald Green** (Profit Mint `#10b981`)
5. **GX Purple** (Opera GX `#a855f7`)
6. **Crimson Red** (Vivid `#ef4444`)
7. **Sunset Coral** (Warm `#f97316`)
8. **Royal Gold** (Champagne `#eab308`)
9. **Synthwave Pink** (Hot `#ec4899`)
10. **Platinum Silver** (Monochrome `#94a3b8`)

* **Dynamic Browser Action Icon:** Background worker (`background.js`) dynamically paints a circular theme badge via `OffscreenCanvas` whenever the theme is switched.

---

## 7. Quality Assurance & Automated Test Framework

All modules include dedicated Node.js test suites executed via a unified runner:
* `scripts/test-calculators.js`: BSR curve equations, referral rate branches, and size tiers.
* `scripts/test-new-modules.js`: Restrictions analyzer, Buy Box rotation intervals, and theme counts.
* `scripts/test-v120.js`: Confidence score weights and SVG chart rendering.
* `scripts/test-v130.js`: Break-even math, Q4 surge calculations, and Top 100 data schema.
* `scripts/test-v150.js`: Inbound placement fee, marketplace auto-detection, VAT calculations, Keepa CSV parser, and manifest permissions.

**Execution Command:**
```bash
node scripts/run-all-tests.js
```

---

## 8. Release & Maintenance Pipeline ("Check for Updates")

The project includes an automated, self-healing continuous integration protocol triggered in chat:
1. **DOM & Selector Health Audit:** Automatically scans `content.js` against Amazon's known selector tree (`#tabular-buybox`, `#merchant-info`, `#all-offers-display`, `a[href*="seller="]`).
2. **Full Regression Test:** Halts execution if any test fails.
3. **Snapshot Archival:** Archives current working release into `backups/vX.X.X/`.
4. **Semantic Version Progression:** Bumps version numbers across manifest, scripts, styles, and docs.
5. **Automated GitHub Release:** Packages `blank-fba-scout-vX.X.X.zip`, tags Git commit, pushes to remote, and publishes the official release with attached binaries via GitHub REST API.

---

## 9. Future Roadmap (v2.0 Concepts)

* **Live Multi-Currency Arbitrage:** Real-time exchange rate conversions for sellers importing UK inventory into US FBA centers.
* **Wholesale CSV/PDF Batch Scanner:** In-browser drag-and-drop parser capable of cross-referencing 5,000-line supplier catalogs against Amazon BSR and fee databases in under 30 seconds.
* **Automated Seller Central Ungating Helper:** Auto-filling application forms using pre-stored wholesale invoices.
