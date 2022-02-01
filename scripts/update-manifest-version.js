const fs = require('fs');
const path = require('path');
const { version } = require(path.join(__dirname, '../package.json'));
const manifestPath = path.join(__dirname, '../src/manifest.json');
const manifest = require(manifestPath);
manifest.version = version;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
