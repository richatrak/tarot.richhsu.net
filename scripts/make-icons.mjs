// Renders the original app icon (SVG, drawn here) to PNG sizes using the pre-installed Chromium.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/opt/node-tools/node_modules/playwright'); }

const icon = (maskable) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<rect width="512" height="512" ${maskable ? '' : 'rx="110"'} fill="#14122b"/>
<g transform="${maskable ? 'translate(256,256) scale(.72) translate(-256,-256)' : ''}">
<rect x="136" y="64" width="240" height="384" rx="28" fill="#231e4a" stroke="#e3c463" stroke-width="14"/>
<rect x="160" y="88" width="192" height="336" rx="16" fill="none" stroke="#e3c463" stroke-opacity=".45" stroke-width="4"/>
<path d="M286,170 a92,92 0 1,0 0,172 a70,70 0 1,1 0,-172" fill="#e3c463"/>
<g fill="#c9a7ff"><circle cx="300" cy="140" r="7"/><circle cx="214" cy="380" r="5"/><circle cx="320" cy="370" r="6"/></g>
</g></svg>`;

const out = [
  ['public/icon-192.png', 192, false],
  ['public/icon-512.png', 512, false],
  ['public/icon-maskable-512.png', 512, true],
  ['public/apple-touch-icon.png', 180, true], // iOS adds its own rounded mask
];
const browser = await playwright.chromium.launch();
const page = await browser.newPage();
for (const [file, size, maskable] of out) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:#14122b">${icon(maskable).replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body></html>`);
  writeFileSync(file, await page.screenshot({ omitBackground: false }));
  console.log('wrote', file);
}
await browser.close();
