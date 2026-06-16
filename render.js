const fs = require('fs');
const path = require('path');
const { Resvg } = require('/Users/jphwang/.local/share/mise/installs/node/22.22.0/lib/node_modules/@resvg/resvg-js');

const svgPath = process.argv[2] || 'output.svg';
const pngPath = process.argv[3] || svgPath.replace('.svg', '.png');

const svg = fs.readFileSync(svgPath, 'utf-8');
const opts = {
  fitTo: { mode: 'width', value: 1600 },
  font: {
    loadSystemFonts: true,
  },
};

const resvg = new Resvg(svg, opts);
const pngData = resvg.render();
const pngBuffer = pngData.asPng();

fs.writeFileSync(pngPath, pngBuffer);
console.log(`Rendered ${svgPath} -> ${pngPath} (${pngBuffer.length} bytes, ${pngData.width}x${pngData.height})`);
