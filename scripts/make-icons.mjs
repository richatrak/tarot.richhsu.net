// Renders the original app icon (SVG, drawn here) to PNG sizes using the pre-installed Chromium.
// The design echoes the card back: a gold-framed card with a crescent moon and a star.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/opt/node-tools/node_modules/playwright'); }

// variant: 'any' (own rounded corners) | 'maskable' (Android safe zone, 72%) | 'apple' (full-bleed, iOS adds its own mask)
const icon = (variant) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<rect width="512" height="512" ${variant === 'any' ? 'rx="110"' : ''} fill="#14122b"/>
<g transform="translate(256,256) scale(${variant === 'maskable' ? 0.72 : variant === 'apple' ? 0.94 : 1}) translate(-256,-256)">
<circle cx="256" cy="256" r="236" fill="#2a2360" opacity=".55"/>
<circle cx="256" cy="256" r="190" fill="#342b78" opacity=".45"/>
<g fill="#c9a7ff">
<polygon points="84,104 88.5,115.5 100,120 88.5,124.5 84,136 79.5,124.5 68,120 79.5,115.5"/>
<polygon points="428,92 431.4,100.6 440,104 431.4,107.4 428,116 424.6,107.4 416,104 424.6,100.6"/>
<polygon points="88,388 91.4,396.6 100,400 91.4,403.4 88,412 84.6,403.4 76,400 84.6,396.6"/>
<polygon points="432,380 436.5,391.5 448,396 436.5,400.5 432,412 427.5,400.5 416,396 427.5,391.5"/>
</g>
<rect x="131" y="51" width="250" height="410" rx="30" fill="#231e4a" stroke="#e3c463" stroke-width="14"/>
<rect x="155" y="75" width="202" height="362" rx="16" fill="#1a1640" stroke="#e3c463" stroke-opacity=".5" stroke-width="4"/>
<g stroke="#e3c463" stroke-width="5" stroke-linecap="round">${Array.from({ length: 16 }, (_, i) => `<line x1="256" y1="170" x2="256" y2="${i % 2 ? 162 : 157}" transform="rotate(${i * 22.5},256,256)"/>`).join('')}</g>
<circle cx="256" cy="256" r="78" fill="#2c2560" stroke="#e3c463" stroke-width="5"/>
<path d="M287.5,212.7 A50,50 0 1,0 287.5,299.3 A50,50 0 0,1 287.5,212.7 Z" fill="#e3c463"/>
<polygon points="286,230 290.5,241.5 302,246 290.5,250.5 286,262 281.5,250.5 270,246 281.5,241.5" fill="#f3eefe"/>
<g fill="#e3c463">
<polygon points="256,102 258.8,109.2 266,112 258.8,114.8 256,122 253.2,114.8 246,112 253.2,109.2"/>
<polygon points="256,390 258.8,397.2 266,400 258.8,402.8 256,410 253.2,402.8 246,400 253.2,397.2"/>
</g>
</g></svg>`;

const out = [
  ['public/icon-192.png', 192, 'any'],
  ['public/icon-512.png', 512, 'any'],
  ['public/icon-maskable-512.png', 512, 'maskable'],
  ['public/apple-touch-icon.png', 180, 'apple'],
];
const browser = await playwright.chromium.launch();
const page = await browser.newPage();
for (const [file, size, variant] of out) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:#14122b">${icon(variant).replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body></html>`);
  writeFileSync(file, await page.screenshot({ omitBackground: false }));
  console.log('wrote', file);
}
await browser.close();
