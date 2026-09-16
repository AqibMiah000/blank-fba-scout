const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  const credInput = "protocol=https\nhost=github.com\n\n";
  let token = '';
  try {
    const credOut = execSync('git credential fill', { input: credInput }).toString();
    const tokenMatch = credOut.match(/password=(.+)/);
    if (tokenMatch) token = tokenMatch[1].trim();
  } catch (err) {}

  if (!token) {
    console.error('No GitHub token found in git credentials.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest.json'), 'utf8'));
  const version = manifest.version;
  const tagName = `v${version}`;

  const headers = {
    'User-Agent': 'BLANK-FBA-Scout-Release-Agent',
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json'
  };

  const releasePayload = JSON.stringify({
    tag_name: tagName,
    target_commitish: 'main',
    name: `BLANK FBA SCOUT ${tagName}`,
    body: `### 🚀 BLANK FBA SCOUT ${tagName}

**The Ultimate All-in-One Amazon FBA Research & Profit Suite (Zero Recurring Subscriptions, 100% Client-Side).**

#### ✨ What's New in ${tagName}:
- **Multi-Marketplace Auto-Detection**: Fully automated support for **Amazon US, UK, Germany, France, Italy, Spain, and Canada** with native currency symbols (\`$\`, \`£\`, \`€\`, \`CA$\`) and marketplace badges.
- **UK & EU VAT Engine**: Automatically accounts for UK 20% & European 19%–22% VAT structures in selling price and net profit calculations.
- **Zero-Lag Performance Overhaul**: Completely eliminated Amazon page slowdowns by throttling DOM mutation listeners with \`requestIdleCallback\` and caching search result card processing with \`:not([data-fba-scouted])\`.
- **1-Click Watchlist CSV Export**: Instant one-click download of all tracked products into an Excel-ready \`.csv\` file with complete product margins, ROI, BSR, and dates.
- **Optional Keepa API Integration**: Power-user toggle in Settings to pull true 365-day Keepa price & sales rank drops, with seamless automatic fallback to the instant built-in math engine.
- **2026 Inbound Placement Fee Support**: Configurable Inbound Placement Fee engine in the FBA calculator.
- **Buy Box Storefront Link Extraction**: Robust matching of \`a[href*="seller="]\`, \`/sp?\`, and \`/shops/\` to display the actual 3rd-party merchant while filtering placeholder texts.

#### 📥 Installation:
1. Download **\`blank-fba-scout-${tagName}.zip\`** below.
2. Extract the ZIP to a folder on your computer.
3. Open your browser (Opera GX, Chrome, Brave, Edge) and go to \`chrome://extensions\` or \`opera://extensions\`.
4. Turn on **Developer mode** (toggle in the top-right corner).
5. Click **Load unpacked** and select the extracted folder.`,
    draft: false,
    prerelease: false
  });

  console.log(`Checking existing release for ${tagName}...`);
  const checkRes = await request({
    hostname: 'api.github.com',
    path: `/repos/AqibMiah000/blank-fba-scout/releases/tags/${tagName}`,
    method: 'GET',
    headers
  });

  let releaseJson = null;
  if (checkRes.status === 200) {
    console.log(`Updating existing release (ID: ${checkRes.data.id})...`);
    const updateRes = await request({
      hostname: 'api.github.com',
      path: `/repos/AqibMiah000/blank-fba-scout/releases/${checkRes.data.id}`,
      method: 'PATCH',
      headers
    }, releasePayload);
    releaseJson = updateRes.data;

    // Remove old zip asset if present
    if (checkRes.data.assets && checkRes.data.assets.length > 0) {
      for (const asset of checkRes.data.assets) {
        if (asset.name.includes('.zip')) {
          console.log(`Deleting previous asset: ${asset.name}...`);
          await request({
            hostname: 'api.github.com',
            path: `/repos/AqibMiah000/blank-fba-scout/releases/assets/${asset.id}`,
            method: 'DELETE',
            headers
          });
        }
      }
    }
  } else {
    console.log(`Creating new release for ${tagName}...`);
    const createRes = await request({
      hostname: 'api.github.com',
      path: '/repos/AqibMiah000/blank-fba-scout/releases',
      method: 'POST',
      headers
    }, releasePayload);
    releaseJson = createRes.data;
  }

  if (!releaseJson || !releaseJson.upload_url) {
    console.error('Failed to create/update release:', releaseJson);
    process.exit(1);
  }

  console.log('\n[SUCCESS] Release published on GitHub!');
  console.log('Release URL:', releaseJson.html_url);

  // Upload Zip Asset
  const zipPath = path.join(__dirname, '..', `blank-fba-scout-${tagName}.zip`);
  if (fs.existsSync(zipPath)) {
    console.log(`\nUploading ${path.basename(zipPath)} asset...`);
    const uploadUrlRaw = releaseJson.upload_url.split('{')[0];
    const uploadUrl = new URL(uploadUrlRaw);
    uploadUrl.searchParams.set('name', `blank-fba-scout-${tagName}.zip`);

    const zipData = fs.readFileSync(zipPath);
    const upRes = await new Promise((resolve) => {
      const upReq = https.request({
        hostname: uploadUrl.hostname,
        path: uploadUrl.pathname + uploadUrl.search,
        method: 'POST',
        headers: {
          'User-Agent': 'BLANK-FBA-Scout-Release-Agent',
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/zip',
          'Content-Length': zipData.length
        }
      }, (res) => {
        let b = '';
        res.on('data', c => b += c);
        res.on('end', () => resolve({ status: res.statusCode }));
      });
      upReq.on('error', e => resolve({ status: 500, error: e }));
      upReq.write(zipData);
      upReq.end();
    });

    if (upRes.status === 201) {
      console.log('[SUCCESS] Downloadable ZIP attached to GitHub Release!');
    } else {
      console.log('Upload status:', upRes.status);
    }
  }
}

main().catch(console.error);
