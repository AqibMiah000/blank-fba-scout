# 📦 BLANK FBA SCOUT (v1.4.0)

> **All-in-One Amazon FBA Product Research, Profitability Calculator, AI Deal Confidence Score, Buy Box Rotation Intelligence, and Wholesale Sourcing Extension for Chromium Browsers (Opera GX, Google Chrome, Brave, Edge).**

---

## 🚀 Overview

**BLANK FBA SCOUT** is a lightweight, 100% client-side browser extension designed for Amazon FBA sellers, wholesale distributors, and online arbitrageurs. It provides instant, on-page product intelligence directly on Amazon product detail pages and search results.

Everything runs locally in your browser with **zero external dependencies**, **zero subscriptions**, and **zero tracking**.

---

## ✨ Key Features

### 🧮 1. Real-Time FBA Profit & Margin Calculator
- **Automated FBA Pick & Pack Fee Calculation**: Precise 2024–2026 fee tier estimation based on unit weight and dimensions (Small standard, Large standard, Oversize).
- **Referral Fee Engine**: Accurate Amazon category-specific referral rates (8%–15%).
- **Dimensional Weight vs. Unit Weight**: Automatically computes dimensional weight ($L \times W \times H / 139$) to ensure accurate shipping tiers.
- **Break-Even & Minimum Target Price**: Calculates the exact floor price before losing money ($0.00 profit) and minimum price required to achieve your target ROI (e.g. 30%).
- **Q4 Holiday Storage Estimator**: Accurately projects cubic feet storage fees during standard (Jan–Sep) vs. Q4 Peak Holiday (Oct–Dec) surcharge periods.

### 🧠 2. AI Deal Confidence Score (BuyBotPro-Style)
- **Circular SVG Gauge**: Visual score rating from 0% to 100% assessing deal quality.
- **Factor Drivers**: Evaluates ROI %, estimated sales velocity, Buy Box stability, competition density, and gating risks into one clear action rating (`HIGH CHANCE`, `ABOVE AVERAGE`, `AVERAGE`, `RISKY / PASS`).

### 🔄 3. Buy Box Rotation & Win Odds Analyzer
- **Explicit Buy Box Winner Identification**: Direct extraction of the actual 3rd-party seller storefront link, filtering out generic placeholders or Amazon Resale used returns.
- **Win Probability %**: Estimates your statistical likelihood of capturing the Buy Box based on competitive rotation.
- **Time to First Win**: Projects expected wait time before your offer enters the active Buy Box (`~2-4 hrs`, `~4-8 hrs`, `~12-24 hrs`).
- **Suggested Purchase Quantities**: Computes realistic restock recommendations:
  - **14-Day Test Order** (units & est. investment)
  - **30-Day Restock Order**
  - **60-Day Bulk Restock**

### 🛡️ 4. Can I Sell This? (Restrictions Radar)
- **Hazmat & Dangerous Goods (DG)** check.
- **IP Infringement Radar**: Warns against single-seller private label listings and high-risk brands.
- **Gating & Category Eligibility**: Instant 1-click link to check gating status directly in Amazon Seller Central.
- **Oversize Detection**: Flags bulky products that exceed standard shipping limits.

### 📈 5. Sales Velocity & Historical Trend Charts
- Pure inline responsive SVG charts (no external heavyweight charting libraries):
  - **BSR Rank History** (30D, 90D, 180D)
  - **Price History & 30D / 90D / 180D Averages**
  - **Stock vs. Price Dynamics**
- Direct quick links to **Keepa** and **CamelCamelCamel**.

### 🔗 6. 1-Click Wholesale & Sourcing Engine
- One-click supplier search shortcuts:
  - **Alibaba**: Title & keyword product search with MOQ filters.
  - **Google Wholesale**: Targeted search query for US wholesale distributors.
  - **AliExpress & eBay**: For fast liquidation or retail arbitrage cross-referencing.
  - **ThomasNet**: For North American industrial and commercial suppliers.

### 🏆 7. Top 100 Evergreen FBA Wholesale Directory
- Built-in curated directory of 100 high-velocity, evergreen wholesale products across 8 major categories:
  - *Kitchen & Dining, Beauty & Personal Care, Toys & Games, Sports & Outdoors, Home & Household, Tools, Pet Supplies, Office Products*.
- Shows typical BSR, estimated sales/mo, target buy costs, and 1-click sourcing links.

### 🔍 8. In-Grid Amazon Search Page Quick Scout
- Injects mini evaluation badges under every product card on Amazon search result pages (`amazon.com/s?k=...`).
- Shows ASIN, estimated monthly sales velocity, price, and target gross profit without opening individual tabs.

### 🎨 9. 10 Vibrant Color Themes & Dynamic Toolbar Icon
- **Live Toolbar Icon Theming**: Browser extension icon automatically changes its badge color to match your active theme.
- **10 Themes**:
  1. *Amazon Amber (Classic)* (`#ff9900`)
  2. *Cyber Cyan (Neon)* (`#00f2fe`)
  3. *Ocean Blue (Electric Navy)* (`#3b82f6`)
  4. *Emerald Green (Profit Mint)* (`#10b981`)
  5. *GX Purple (Opera Style)* (`#a855f7`)
  6. *Crimson Red (Vivid)* (`#ef4444`)
  7. *Sunset Coral (Warm)* (`#ff6b4a`)
  8. *Royal Gold (Champagne)* (`#f59e0b`)
  9. *Synthwave Pink (Hot)* (`#ec4899`)
  10. *Platinum Silver (Monochrome)* (`#e2e8f0`)

### 🖱️ 10. Universal Drag-and-Drop In-Page Widget
- Drag the floating pill badge or expanded card anywhere on your display.
- Coordinates persist across pages in local storage.
- Smart 5px movement threshold separates dragging from clicking.
- Double-click to instantly snap back to the top-right default corner.

---

## 📥 Installation

1. **Clone or Download** this repository:
   ```bash
   git clone https://github.com/<your-username>/blank-fba-scout.git
   ```
   *(Or click **Code ➔ Download ZIP** and extract it)*.

2. **Open Extensions in your Browser**:
   - **Opera GX**: Navigate to `opera://extensions`
   - **Google Chrome / Brave**: Navigate to `chrome://extensions`
   - **Microsoft Edge**: Navigate to `edge://extensions`

3. **Enable Developer Mode**:
   - Toggle the **Developer mode** switch in the top-right corner.

4. **Load the Extension**:
   - Click **Load unpacked** in the top-left corner.
   - Select the folder containing `manifest.json`.

5. **Start Scouting**:
   - Open any product page on [Amazon.com](https://www.amazon.com) (e.g. `amazon.com/dp/B08N5WRWNW`) or search results page!

---

## 🛠️ Tech Stack & Architecture

- **Manifest V3** standard (Chrome / Opera GX / Edge compatible).
- **Vanilla JavaScript (ES6+)**: Zero external runtime libraries, zero bloat.
- **Pure SVG Charts**: Lightweight inline data visualizations.
- **Chrome Storage API**: Local preference and position persistence.
- **OffscreenCanvas**: Dynamically colored toolbar icons generated at runtime.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
