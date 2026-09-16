const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

async function main() {
  const credInput = "protocol=https\nhost=github.com\n\n";
  let token = '';
  try {
    const credOut = execSync('git credential fill', { input: credInput }).toString();
    const tokenMatch = credOut.match(/password=(.+)/);
    if (tokenMatch) {
      token = tokenMatch[1].trim();
    }
  } catch (err) {
    console.error('Failed to get git credential:', err);
  }

  if (!token) {
    console.error('No GitHub token found in git credentials.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest.json'), 'utf8'));
  const version = manifest.version;
  const tagName = `v${version}`;

  console.log(`Publishing GitHub Release for ${tagName}...`);

  const releaseData = JSON.stringify({
    tag_name: tagName,
    target_commitish: 'main',
    name: `BLANK FBA SCOUT ${tagName}`,
    body: `### BLANK FBA SCOUT ${tagName}\n\n- **Comprehensive Amazon FBA Profit, ROI & Fee Calculator**\n- **Live Buy Box Winner Extraction**: Pinpoints the actual 3rd-party seller storefront link (\`a[href*="seller="]\`), filtering out placeholder text\n- **Smart Buy Box Rotation & Win Probability Engine**: Displays estimated rotation cycle, probability of winning, and time-to-win forecast\n- **BSR Sales Velocity Estimator**: Calculates monthly units, daily velocity, and revenue across 20+ Amazon categories\n- **Dynamic Extension Icon**: Generated in real-time via \`OffscreenCanvas\` according to the active theme\n- **10 Custom UI Color Themes**: Amber, Cyber Cyan, GX Purple, Mint, Crimson, and more\n- **Top 100 Wholesale Evergreen Products Directory**: Pre-loaded catalog across 8 categories with 1-click supplier sourcing links (Alibaba, Google Wholesale, AliExpress, ThomasNet, eBay Bulk)\n- **In-Grid Search Page Scout**: Mini FBA profitability badges on Amazon search results\n\n#### Installation:\n1. Download and extract **\`blank-fba-scout-${tagName}.zip\`**\n2. Open Chrome/Opera GX and navigate to \`chrome://extensions\` or \`opera://extensions\`\n3. Enable **Developer Mode** (top-right)\n4. Click **Load unpacked** and select the unzipped folder.`,
    draft: false,
    prerelease: false
  });

  const req = https.request({
    hostname: 'api.github.com',
    path: '/repos/AqibMiah000/blank-fba-scout/releases',
    method: 'POST',
    headers: {
      'User-Agent': 'BLANK-FBA-Scout-Release-Agent',
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(releaseData)
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Release API Status Code:', res.statusCode);
      try {
        const json = JSON.parse(body);
        if (res.statusCode === 201) {
          console.log('\n[SUCCESS] Release published to GitHub Releases!');
          console.log('Release URL:', json.html_url);

          // Upload Zip Asset
          const zipPath = path.join(__dirname, '..', `blank-fba-scout-${tagName}.zip`);
          if (fs.existsSync(zipPath)) {
            console.log('\nUploading release zip asset...');
            const uploadUrlRaw = json.upload_url.split('{')[0];
            const uploadUrl = new URL(uploadUrlRaw);
            uploadUrl.searchParams.set('name', `blank-fba-scout-${tagName}.zip`);

            const zipData = fs.readFileSync(zipPath);
            const uploadReq = https.request({
              hostname: uploadUrl.hostname,
              path: uploadUrl.pathname + uploadUrl.search,
              method: 'POST',
              headers: {
                'User-Agent': 'BLANK-FBA-Scout-Release-Agent',
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/zip',
                'Content-Length': zipData.length
              }
            }, (uploadRes) => {
              let upBody = '';
              uploadRes.on('data', c => upBody += c);
              uploadRes.on('end', () => {
                console.log('Asset Upload Status:', uploadRes.statusCode);
                if (uploadRes.statusCode === 201) {
                  console.log('[SUCCESS] Downloadable ZIP attached to release!');
                }
              });
            });
            uploadReq.on('error', e => console.error('Upload error:', e));
            uploadReq.write(zipData);
            uploadReq.end();
          }
        } else {
          console.error('Release response:', json);
        }
      } catch (e) {
        console.error('Parse error:', e, body);
      }
    });
  });

  req.on('error', (e) => console.error('Request error:', e));
  req.write(releaseData);
  req.end();
}

main();
