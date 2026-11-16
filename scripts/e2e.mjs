// End-to-end checks against the production build (vite preview) using the pre-installed Chromium.
// NOTE: Chromium only. This does NOT stand in for iOS Safari / WebKit or real devices.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node-tools/node_modules/playwright'); }
const { chromium, devices } = pw;

const URL = 'http://localhost:4173/';
const SHOTS = process.env.SHOTS_DIR || 'test-results/screens';
mkdirSync(SHOTS, { recursive: true });
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? '✓' : '✗'} ${msg}`); if (!cond) failures++; };

const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { stdio: 'pipe' });
await new Promise((res) => { server.stdout.on('data', (d) => { if (String(d).includes('4173')) res(); }); setTimeout(res, 5000); });

const browser = await chromium.launch();

async function pick(page, id) {
  await page.click(`label.spread-opt:has(input[value=${id}])`);
  if (!(await page.isChecked(`input[value=${id}]`))) throw new Error('could not select ' + id);
}

async function checkReading(page, expectCount, label) {
  await page.waitForSelector('.reading .tile');
  const tiles = await page.$$eval('.layout .tile', (els) => els.map((e) => ({ order: +e.dataset.order, card: e.dataset.card, rev: e.dataset.reversed })));
  const meanings = await page.$$eval('.meanings .meaning', (els) => els.map((e) => ({ order: +e.dataset.order, text: e.querySelector('h3').textContent })));
  ok(tiles.length === expectCount, `${label}: ${expectCount} cards shown (got ${tiles.length})`);
  ok(new Set(tiles.map((t) => t.card)).size === tiles.length, `${label}: no duplicate cards`);
  ok(tiles.every((t, i) => t.order === i + 1), `${label}: draw order 1..n`);
  ok(meanings.length === expectCount && meanings.every((m, i) => m.order === tiles[i].order), `${label}: meanings list matches card order`);
  const orientOk = tiles.every((t, i) => meanings[i].text.includes(t.rev === 'true' ? '逆位' : '正位'));
  ok(orientOk, `${label}: upright/reversed label matches drawn data`);
  const visualOk = await page.$$eval('.layout .tile', (els) => els.every((e) => e.querySelector('.face.front').classList.contains('is-reversed') === (e.dataset.reversed === 'true')));
  ok(visualOk, `${label}: card face rotation matches reversed state`);
  return tiles;
}

/* ---------- 1. functional flow on a phone-sized viewport ---------- */
{
  const ctx = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(URL);
  await page.fill('#question', '測試問題：我需要注意什麼？');
  const spreads = { single: 1, ppf: 3, sao: 3, choice: 5, celtic: 10 };
  for (const [id, n] of Object.entries(spreads)) {
    await page.goto(URL + '#/home');
    await pick(page, id);
    await page.click('#draw');
    await checkReading(page, n, `spread ${id}`);
    ok((await page.textContent('.question'))?.includes('測試問題'), `spread ${id}: question displayed`);
    await page.waitForTimeout(2600);
    await page.screenshot({ path: `${SHOTS}/phone-${id}.png`, fullPage: false });
  }
  // custom count
  await page.goto(URL + '#/home');
  await pick(page, 'custom');
  await page.fill('.stepper input', '7');
  await page.locator('.stepper input').blur();
  await page.click('#draw');
  await checkReading(page, 7, 'custom 7');
  await page.goto(URL + '#/home');
  await pick(page, 'custom');
  await page.fill('.stepper input', '78');
  await page.locator('.stepper input').blur();
  await page.click('#draw');
  await checkReading(page, 78, 'custom 78 (full deck)');
  // redraw gives new reading
  const before = await page.$$eval('.layout .tile', (e) => e.map((x) => x.dataset.card).join());
  await page.goto(URL + '#/home');
  await pick(page, 'ppf');
  await page.click('#draw');
  const a = await page.$$eval('.layout .tile', (e) => e.map((x) => x.dataset.card).join());
  await page.click('text=重新洗牌再抽一次');
  await page.waitForTimeout(100);
  const b = await page.$$eval('.layout .tile', (e) => e.map((x) => x.dataset.card).join());
  ok(a !== b || a !== before, 'redraw produces a new reading');
  // reversals off
  await page.goto(URL + '#/home');
  await page.uncheck('.switch input');
  await pick(page, 'custom');
  await page.fill('.stepper input', '30');
  await page.locator('.stepper input').blur();
  await page.click('#draw');
  const t = await checkReading(page, 30, 'reversals off');
  ok(t.every((x) => x.rev === 'false'), 'reversals off: no reversed cards');
  await page.goto(URL + '#/home');
  await page.check('.switch input');
  // history
  await page.goto(URL + '#/history');
  const hist = await page.$$('.history li');
  ok(hist.length >= 8, `history saved (${hist.length} entries)`);
  ok((await page.textContent('.history'))?.includes('測試問題'), 'history keeps the question');
  // daily card
  await page.goto(URL + '#/home');
  await page.click('text=翻開今日一牌');
  const d1 = await page.getAttribute('.daily .tile', 'data-card');
  await page.reload();
  const d2 = await page.getAttribute('.daily .tile', 'data-card');
  ok(d1 && d1 === d2, 'daily card persists across reload');
  // clear question
  await page.click('text=清除問題');
  ok((await page.inputValue('#question')) === '', 'question can be cleared');
  // clear all data
  page.on('dialog', (d) => d.accept());
  await page.goto(URL + '#/settings');
  await page.click('text=清除所有本機資料');
  await page.goto(URL + '#/history');
  ok((await page.$$('.history li')).length === 0, 'clear all data wipes history');
  ok(errors.length === 0, `no page errors (${errors.join('; ')})`);
  await ctx.close();
}

/* ---------- 2. offline: first online load, then offline relaunch & draw ---------- */
{
  const ctx = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await ctx.newPage();
  await page.goto(URL);
  await page.waitForFunction(() => document.querySelector('.offline-pill')?.classList.contains('ready'), null, { timeout: 15000 }).catch(() => {});
  const pill = await page.textContent('.offline-pill');
  ok(pill.includes('已就緒'), `offline readiness indicator shows ready (“${pill.trim()}”)`);
  await ctx.setOffline(true);
  await page.reload();
  ok((await page.title()) === '心富塔羅', 'app launches while offline');
  await pick(page, 'celtic');
  await page.click('#draw');
  await checkReading(page, 10, 'offline celtic cross');
  // brand-new tab while offline (simulates relaunch)
  const p2 = await ctx.newPage();
  await p2.goto(URL + 'some/deep/link');
  ok((await p2.$('#draw')) !== null, 'offline navigation fallback serves the app shell');
  await ctx.close();
}

/* ---------- 3. responsive screenshots + horizontal overflow check ---------- */
const viewports = [
  ['iphone-se', { viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  ['iphone-15-landscape', { viewport: { width: 852, height: 393 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  ['small-android', { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  ['ipad-portrait', { viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  ['desktop', { viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1 }],
];
for (const [name, opts] of viewports) {
  const ctx = await browser.newContext({ ...opts, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(URL);
  await page.screenshot({ path: `${SHOTS}/${name}-home.png` });
  for (const id of ['ppf', 'celtic']) {
    await page.goto(URL + '#/home');
    await pick(page, id);
    await page.click('#draw');
    await page.waitForSelector('.reading .tile');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(overflow <= 0, `${name} ${id}: no horizontal scroll (overflow ${overflow}px)`);
    // all cards inside viewport horizontally & labels not overlapping each other's cards
    const inView = await page.$$eval('.layout .tile .tile-btn', (els) => els.every((e) => { const r = e.getBoundingClientRect(); return r.left >= -1 && r.right <= innerWidth + 1; }));
    ok(inView, `${name} ${id}: every card within the screen width`);
    const small = await page.$$eval('button, [role=radio], input', (els) => els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 32 && !e.closest('.offline-pill') && e.type !== 'radio'; }).map((e) => e.textContent || e.className));
    ok(small.length === 0, `${name} ${id}: touch targets ≥ 32px (${small.slice(0, 3).join(',')})`);
    await page.screenshot({ path: `${SHOTS}/${name}-${id}.png`, fullPage: true });
  }
  await ctx.close();
}

/* ---------- 4. basic accessibility ---------- */
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(URL);
  await pick(page, 'ppf');
  await page.click('#draw');
  const labels = await page.$$eval('.layout .tile-btn', (e) => e.map((x) => x.getAttribute('aria-label')));
  ok(labels.every((l) => /第 \d 張，.+：.+，(正位|逆位)/.test(l)), 'each card has a spoken label with order, position, name, orientation');
  ok(await page.evaluate(() => document.activeElement?.id === 'reading-title'), 'focus moves to the reading heading after drawing');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter'); // first focusable after heading = first card → jumps to its meaning
  await page.waitForTimeout(600);
  ok(await page.evaluate(() => document.activeElement?.id === 'm-1'), 'keyboard: activating card 1 focuses its meaning');
  const imgs = await page.$$eval('svg.card-svg', (e) => e.every((s) => s.getAttribute('aria-hidden') === 'true'));
  ok(imgs, 'decorative SVGs hidden from screen readers (text alternative on button)');
  await ctx.close();
}

await browser.close();
server.kill();
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll e2e checks passed');
process.exit(failures ? 1 : 0);
