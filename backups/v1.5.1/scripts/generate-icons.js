const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure Node.js PNG generator
function createPng(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression: deflate
  ihdrData[11] = 0; // Filter: standard
  ihdrData[12] = 0; // Interlace: none
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte (0 = none) at start of each scanline
  const rowBytes = width * 4;
  const scanlines = [];

  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + rowBytes);
    row[0] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const idx = 1 + x * 4;
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.hypot(x - cx, y - cy);
      const radius = width * 0.46;

      if (dist <= radius) {
        const isBorder = dist >= radius - (width > 32 ? 3 : 1.5);
        if (isBorder) {
          row[idx] = 255;     // R
          row[idx + 1] = 153; // G
          row[idx + 2] = 0;   // B (Amazon Orange #FF9900)
          row[idx + 3] = 255; // Alpha
        } else {
          // Dark background #131921
          row[idx] = 19;
          row[idx + 1] = 25;
          row[idx + 2] = 33;
          row[idx + 3] = 255;
          
          // Small bar/chart icon in center
          const relX = (x - cx) / (width * 0.35);
          const relY = (y - cy) / (height * 0.35);
          if (relY > -0.5 && relY < 0.5) {
            if ((relX > -0.7 && relX < -0.3 && relY > -0.1) ||
                (relX > -0.2 && relX < 0.2 && relY > -0.4) ||
                (relX > 0.3 && relX < 0.7 && relY > -0.7)) {
              row[idx] = 255;
              row[idx + 1] = 153;
              row[idx + 2] = 0;
            }
          }
        }
      } else {
        // Transparent outside
        row[idx] = 0;
        row[idx + 1] = 0;
        row[idx + 2] = 0;
        row[idx + 3] = 0;
      }
    }
    scanlines.push(row);
  }

  const rawData = Buffer.concat(scanlines);
  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);

  // IEND chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate the 3 required sizes
const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach(size => {
  const png = createPng(size, size, 255, 153, 0);
  const file = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(file, png);
  console.log(`Generated: ${file} (${size}x${size}, ${png.length} bytes)`);
});
