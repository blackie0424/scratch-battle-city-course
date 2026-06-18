// Download Noto Sans CJK TC for PDF rendering (CJK glyph support)
const fs = require('fs');
const path = require('path');
const https = require('https');

const URL = 'https://github.com/notofonts/noto-cjk/raw/main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Regular.otf';
const DEST_DIR = path.join(__dirname, '..', 'fonts');
const DEST = path.join(DEST_DIR, 'NotoSansTC-Regular.otf');

if (fs.existsSync(DEST)) {
  console.log('font already exists:', DEST);
  process.exit(0);
}
fs.mkdirSync(DEST_DIR, { recursive: true });

console.log('downloading Noto Sans CJK TC...');
function get(url, cb) {
  https.get(url, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return get(res.headers.location, cb);
    }
    if (res.statusCode !== 200) {
      console.error('HTTP', res.statusCode);
      process.exit(1);
    }
    const out = fs.createWriteStream(DEST);
    res.pipe(out);
    out.on('finish', () => { out.close(); cb(); });
  }).on('error', err => { console.error(err.message); process.exit(1); });
}
get(URL, () => {
  const s = fs.statSync(DEST);
  console.log('done:', DEST, '(' + (s.size/1024/1024).toFixed(1) + ' MB)');
});
