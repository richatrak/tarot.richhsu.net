/**
 * Procedurally generated, original card faces (SVG).
 * Design: flat layered illustration. Each face is a small scene built from shared
 * primitives (sky, hills, sun, moon, waves...) plus detailed suit objects.
 * Uses only generic traditional symbol *concepts* (wand, cup, sword, coin, star,
 * moon, sun, wheel, scales...). It does not copy the composition, characters,
 * palette or linework of any published deck.
 *
 * No <defs>/ids are used on purpose: many card SVGs share one document, and
 * duplicated ids break when the first owner is hidden. Clipping is done with a
 * nested <svg> instead.
 */
import type { JSX } from 'preact';
import { useContext } from 'preact/hooks';
import { getCard, roman, RANK_NAMES, SUIT_INFO, type Card, type Suit } from '../data/cards';
import { DeckContext, rasterArt } from './decks';

const W = 200;
const H = 340;
/* Art panel, in coordinates centred on the panel. */
const X0 = -84, X1 = 84, Y0 = -118, Y1 = 112;
const PW = X1 - X0, PH = Y1 - Y0;

type J = JSX.Element;
type Bands = [string, string, string];
interface Pal { main: string; light: string; deep: string; sky: Bands; ground: string }

const PAL: Record<Suit, Pal> = {
  wands: { main: '#e0793f', light: '#f6c453', deep: '#8a3b1c', sky: ['#2c1a3c', '#5a2638', '#96442f'], ground: '#3a1c2a' },
  cups: { main: '#4fa3d1', light: '#a8dcf2', deep: '#1f4e79', sky: ['#141a45', '#1b2f63', '#24497f'], ground: '#132450' },
  swords: { main: '#b9c4d6', light: '#eef3fa', deep: '#51607a', sky: ['#1b1d3a', '#2b3156', '#434d72'], ground: '#222743' },
  coins: { main: '#d9b44a', light: '#f5e19a', deep: '#8a6a1c', sky: ['#12302f', '#1c4439', '#2d6043'], ground: '#143226' },
};
export const SUIT_COLOR: Record<Suit, string> = { wands: PAL.wands.main, cups: PAL.cups.main, swords: PAL.swords.main, coins: PAL.coins.main };

const MAJOR_COLOR = '#c9a7ff';
const GOLD = '#e3c463';
const OUT = '#15122c';
const WHITE = '#f3eefe';
const ROSE = '#e07a8f';
const LEAF = '#6fb45a';
const WOOD = '#b5713a';
const NIGHT: Bands = ['#161238', '#281c5a', '#3f2c7a'];
const DAY: Bands = ['#25487c', '#3d73a8', '#79aed0'];
const DUSK: Bands = ['#2a1d5c', '#6d3a70', '#c56f5c'];
const FIRE: Bands = ['#160d1e', '#3a1422', '#6a2220'];

/* ---------- scene primitives ---------- */
const sky = (b: Bands) => (
  <>
    <rect x={X0} y={Y0} width={PW} height={PH} fill={b[0]} />
    <rect x={X0} y={-44} width={PW} height={Y1 + 44} fill={b[1]} />
    <rect x={X0} y={26} width={PW} height={Y1 - 26} fill={b[2]} />
  </>
);
const hills = (c: string, y = 70, o = 1) => <path d={`M${X0},${Y1} V${y} Q-45,${y - 24} -5,${y - 4} T${X1},${y - 12} V${Y1} Z`} fill={c} opacity={o} />;
const mountains = (c: string, y = 60, snow?: string) => (
  <>
    <path d={`M-84,${Y1} V${y} L-52,${y - 48} L-28,${y - 12} L4,${y - 66} L38,${y - 18} L60,${y - 40} L84,${y - 8} V${Y1} Z`} fill={c} />
    {snow && <path d={`M-52,${y - 48} l-9,13 l6,-3 l4,5 l5,-5 l4,2 Z M4,${y - 66} l-11,18 l7,-4 l5,6 l6,-7 l5,3 Z M60,${y - 40} l-7,10 l5,-2 l4,4 l4,-4 Z`} fill={snow} />}
  </>
);
const water = (c: string, line: string, y = 70) => (
  <>
    <rect x={X0} y={y} width={PW} height={Y1 - y} fill={c} />
    {[0, 13, 26].map((i) => <path d={`M-84,${y + 4 + i} q10.5,-6 21,0 t21,0 t21,0 t21,0 t21,0 t21,0 t21,0 t21,0`} stroke={line} stroke-width="1.8" fill="none" opacity={0.75 - i * 0.015} />)}
  </>
);
const sun = (x: number, y: number, r: number, c = GOLD, rays = 12) => (
  <g transform={`translate(${x},${y})`}>
    {Array.from({ length: rays }, (_, i) => <path d={`M-${r * 0.16},-${r * 1.25} L0,-${i % 2 ? r * 1.7 : r * 2} L${r * 0.16},-${r * 1.25} Z`} fill={c} transform={`rotate(${(360 / rays) * i})`} />)}
    <circle r={r} fill={c} />
    <circle r={r * 0.72} fill="#fff1c2" opacity=".55" />
  </g>
);
const burst = (x: number, y: number, r: number, c: string, n = 18, o = 0.28) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    {Array.from({ length: n }, (_, i) => <path d={`M0,0 L-${r * 0.07},-${r} L${r * 0.07},-${r} Z`} fill={c} transform={`rotate(${(360 / n) * i})`} />)}
  </g>
);
const moon = (x: number, y: number, r: number, c = WHITE) => {
  const px = (x + r * 0.75).toFixed(1), dy = r * 0.866;
  return <path d={`M${px},${(y - dy).toFixed(1)} A${r},${r} 0 1,0 ${px},${(y + dy).toFixed(1)} A${r},${r} 0 0,1 ${px},${(y - dy).toFixed(1)} Z`} fill={c} />;
};
const star = (cx: number, cy: number, r: number, points = 4, fill = WHITE, o = 1) => {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI * i) / points - Math.PI / 2;
    const rr = i % 2 ? r * 0.4 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return <polygon points={pts.join(' ')} fill={fill} opacity={o} />;
};
const STARS: [number, number, number][] = [[-66, -100, 3], [-30, -84, 2], [22, -104, 2.5], [60, -86, 3], [74, -40, 2], [-74, -44, 2.5], [-48, -62, 1.8], [44, -58, 1.8], [0, -72, 2]];
const stars = (c = WHITE, o = 0.8) => <>{STARS.map(([x, y, r]) => star(x, y, r, 4, c, o))}</>;
const cloud = (x: number, y: number, s = 1, c = WHITE, o = 0.5) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill={c} opacity={o}>
    <ellipse rx="24" ry="8" /><circle cx="-9" cy="-6" r="9" /><circle cx="7" cy="-9" r="12" />
  </g>
);
const rain = (c: string, o = 0.6) => (
  <g stroke={c} stroke-width="1.6" stroke-linecap="round" opacity={o}>
    {[-70, -46, -22, 2, 26, 50, 74].map((x, i) => [0, 1, 2, 3].map((k) => <line x1={x + (k % 2) * 10} y1={-80 + k * 46 + (i % 2) * 14} x2={x + (k % 2) * 10 - 4} y2={-66 + k * 46 + (i % 2) * 14} />))}
  </g>
);
const heart = (x: number, y: number, s: number, c = ROSE) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M0,11 C-24,-6 -13,-25 0,-12 C13,-25 24,-6 0,11 Z" fill={c} stroke={OUT} stroke-width=".6" />
    <path d="M-10,-9 q-4,4 -1,9" stroke="#ffd2da" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7" />
  </g>
);
const wreath = (x: number, y: number, rx: number, ry: number, c = LEAF, n = 22) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const a = (2 * Math.PI * i) / n;
      const cx = x + rx * Math.cos(a), cy = y + ry * Math.sin(a);
      return <ellipse cx={cx.toFixed(1)} cy={cy.toFixed(1)} rx={Math.max(4, rx * 0.2)} ry={Math.max(1.8, rx * 0.085)} fill={i % 2 ? c : '#8fce6f'} transform={`rotate(${((a * 180) / Math.PI + 60).toFixed(0)},${cx.toFixed(1)},${cy.toFixed(1)})`} />;
    })}
  </g>
);
const rainbow = (x: number, y: number, r: number) => (
  <g fill="none" stroke-width="6" opacity=".85">
    {['#e07a8f', '#f6c453', '#6fb45a', '#4fa3d1', '#c9a7ff'].map((c, i) => <path d={`M${x - r + i * 6},${y} a${r - i * 6},${r - i * 6} 0 0,1 ${2 * (r - i * 6)},0`} stroke={c} />)}
  </g>
);
const arch = (c: string, inner: string) => (
  <>
    <path d="M-66,112 V-20 A66,66 0 0,1 66,-20 V112 H50 V-20 A50,50 0 0,0 -50,-20 V112 Z" fill={c} stroke={OUT} stroke-width="1" />
    <path d="M-50,112 V-20 A50,50 0 0,1 50,-20 V112 Z" fill={inner} opacity=".45" />
    {[-58, 58].map((x) => [20, 50, 80].map((y) => <line x1={x - 8} x2={x + 8} y1={y} y2={y} stroke={OUT} stroke-width="1" opacity=".5" />))}
  </>
);
const pathRoad = (c: string, o = 0.8) => <path d="M-20,112 Q14,84 -4,62 Q-16,46 2,34 L7,34 Q-4,48 12,64 Q34,86 24,112 Z" fill={c} opacity={o} />;
const flames = (y: number, c1 = '#e0793f', c2 = '#f6c453') => (
  <>
    {[-72, -48, -24, 0, 24, 48, 72].map((x, i) => (
      <g transform={`translate(${x},${y}) scale(${i % 2 ? 1.25 : 1})`}>
        <path d="M0,-34 q14,16 10,28 q-3,10 -10,10 q-7,0 -10,-10 q-4,-12 10,-28z" fill={c1} />
        <path d="M0,-18 q7,9 5,15 q-2,5 -5,5 q-3,0 -5,-5 q-2,-6 5,-15z" fill={c2} />
      </g>
    ))}
    <rect x={X0} y={y} width={PW} height={Y1 - y} fill={c1} />
  </>
);
const bolt = (x: number, y: number, s = 1, c = '#ffe27a') => <path d="M8,-40 L-12,2 H0 L-8,40 L16,-8 H3 Z" fill={c} stroke={OUT} stroke-width=".8" transform={`translate(${x},${y}) scale(${s})`} />;
const lemniscate = (x: number, y: number, s: number, c: string) => <path d="M0,0 c-12,-16 -34,-16 -34,0 s22,16 34,0 s34,-16 34,0 s-22,16 -34,0" fill="none" stroke={c} stroke-width={4 / s} stroke-linecap="round" transform={`translate(${x},${y}) scale(${s})`} />;
/** A leafy stem passing through the given points. */
const vine = (pts: [number, number][], c = LEAF) => (
  <g>
    <path d={'M' + pts.map(([x, y], i) => (i ? `Q${(pts[i - 1][0] + x) / 2 + (i % 2 ? 16 : -16)},${(pts[i - 1][1] + y) / 2} ${x},${y}` : `${x},${y}`)).join(' ')} fill="none" stroke={c} stroke-width="2.5" stroke-linecap="round" />
    {pts.slice(1).map(([x, y], i) => {
      const mx = (pts[i][0] + x) / 2, my = (pts[i][1] + y) / 2;
      return <path d="M0,0 q8,-9 15,-3 q-7,7 -15,3z" fill={i % 2 ? '#8fce6f' : c} transform={`translate(${mx + (i % 2 ? -4 : 4)},${my}) rotate(${i % 2 ? 200 : -20})`} />;
    })}
  </g>
);
const pillar = (x: number, fill: string, top = -76, w = 22) => (
  <g>
    <rect x={x} y={top} width={w} height={Y1 - top} fill={fill} stroke={OUT} stroke-width="1" />
    <rect x={x - 4} y={top - 8} width={w + 8} height="9" rx="2" fill={fill} stroke={OUT} stroke-width="1" />
    {[0.33, 0.66].map((f) => <line x1={x + w * f} x2={x + w * f} y1={top + 4} y2={Y1} stroke={OUT} stroke-width="1" opacity=".3" />)}
  </g>
);
const scales = (x: number, y: number, s: number, c = GOLD) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={c} fill="none" stroke-width="2.4" stroke-linecap="round">
    <line x1="-48" x2="48" /><circle r="4" fill={c} />
    <path d="M-48,0 l-12,26 M-48,0 l12,26 M48,0 l-12,26 M48,0 l12,26" stroke-width="1.2" />
    <path d="M-62,26 h28 q-14,14 -28,0z M34,26 h28 q-14,14 -28,0z" fill={c} stroke={OUT} stroke-width=".8" />
  </g>
);

/* ---------- suit objects, centred at (0,0), about 40 tall ---------- */
function Sym({ suit }: { suit: Suit }) {
  const p = PAL[suit];
  switch (suit) {
    case 'wands':
      return (
        <g>
          <path d="M0,-28 q6,6 4,11 q-2,4 -4,4 q-2,0 -4,-4 q-2,-5 4,-11z" fill="#f6c453" />
          <path d="M0,-23 q3,3.5 2,6 q-1,2 -2,2 q-1,0 -2,-2 q-1,-2.5 2,-6z" fill="#fff1c2" />
          <path d="M-3.2,19 L-2.2,-14 Q0,-18 2.2,-14 L3.2,19 Q0,21 -3.2,19Z" fill={WOOD} stroke={OUT} stroke-width=".8" />
          <path d="M-.9,16 L-.4,-13" stroke="#e7ad6e" stroke-width="1.1" stroke-linecap="round" />
          <path d="M2,-7 q7,-7 12,-2 q-6,5 -12,2z" fill="#8fce6f" stroke={OUT} stroke-width=".5" />
          <path d="M-2,3 q-7,-7 -12,-2 q6,5 12,2z" fill={LEAF} stroke={OUT} stroke-width=".5" />
          <path d="M2.5,11 q6,-5 10,-1 q-5,4 -10,1z" fill="#8fce6f" stroke={OUT} stroke-width=".5" />
        </g>
      );
    case 'cups':
      return (
        <g>
          <path d="M-9,18 Q0,11 9,18 Q0,21 -9,18Z" fill={p.main} stroke={OUT} stroke-width=".8" />
          <rect x="-1.8" y="5" width="3.6" height="10" fill={p.main} stroke={OUT} stroke-width=".6" />
          <ellipse cy="9" rx="3.8" ry="2.2" fill={p.light} stroke={OUT} stroke-width=".5" />
          <path d="M-13,-15 Q-13,4 0,7 Q13,4 13,-15 Z" fill={p.main} stroke={OUT} stroke-width=".8" />
          <ellipse cy="-15" rx="13" ry="3.6" fill={p.light} stroke={OUT} stroke-width=".8" />
          <ellipse cy="-15" rx="10" ry="2.2" fill={p.deep} />
          <path d="M-9,-9 Q-9,0 -3,3.5" stroke={p.light} stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8" />
        </g>
      );
    case 'swords':
      return (
        <g>
          <path d="M0,-21 L3.2,-15 L2.5,8 L-2.5,8 L-3.2,-15 Z" fill={p.light} stroke={OUT} stroke-width=".8" />
          <path d="M0,-21 L3.2,-15 L2.5,8 L0,8 Z" fill={p.main} />
          <line y1="-14" y2="6" stroke={p.deep} stroke-width=".7" />
          <rect x="-9.5" y="7.5" width="19" height="3.4" rx="1.7" fill={GOLD} stroke={OUT} stroke-width=".7" />
          <rect x="-1.9" y="10.9" width="3.8" height="7" fill="#6b3a52" stroke={OUT} stroke-width=".6" />
          <circle cy="20" r="2.8" fill={GOLD} stroke={OUT} stroke-width=".7" />
        </g>
      );
    case 'coins':
      return (
        <g>
          <circle r="15" fill={p.main} stroke={OUT} stroke-width=".8" />
          <circle r="11.5" fill={p.light} stroke={p.deep} stroke-width="1" />
          <polygon points="0,-9 2.1,-2.9 8.6,-2.8 3.4,1.1 5.3,7.3 0,3.6 -5.3,7.3 -3.4,1.1 -8.6,-2.8 -2.1,-2.9" fill={p.deep} />
          <path d="M-11,-7 a13,13 0 0,1 8,-6" stroke="#fff8d8" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8" />
        </g>
      );
  }
}

/* ---------- pip layouts: [x, y, rotation°, scale] ---------- */
type Pip = [number, number, number?, number?];
const GRID: Record<number, Pip[]> = {
  1: [[0, 0, 0, 3]],
  2: [[0, -52, 0, 1.5], [0, 52, 0, 1.5]],
  3: [[0, -66, 0, 1.3], [0, 0, 0, 1.3], [0, 66, 0, 1.3]],
  4: [[-36, -50, 0, 1.4], [36, -50, 0, 1.4], [-36, 50, 0, 1.4], [36, 50, 0, 1.4]],
  5: [[-38, -60], [38, -60], [0, 0], [-38, 60], [38, 60]],
  6: [[-38, -66], [38, -66], [-38, 0], [38, 0], [-38, 66], [38, 66]],
  7: [[-38, -72], [38, -72], [0, -36], [-38, 0], [38, 0], [-38, 72], [38, 72]],
  8: [[-38, -78], [38, -78], [-38, -26], [38, -26], [-38, 26], [38, 26], [-38, 78], [38, 78]],
  9: [[-38, -78], [38, -78], [-38, -26], [38, -26], [0, 0], [-38, 26], [38, 26], [-38, 78], [38, 78]],
  10: [[-38, -82], [38, -82], [0, -54], [-38, -24], [38, -24], [-38, 24], [38, 24], [0, 54], [-38, 82], [38, 82]],
};
const row = (n: number, x0: number, x1: number, f: (i: number, x: number) => Pip): Pip[] => Array.from({ length: n }, (_, i) => f(i, n === 1 ? 0 : x0 + ((x1 - x0) * i) / (n - 1)));

interface Scene { bg?: J; fg?: J; pips?: Pip[] }
/** Per-card scene: backdrop, optional custom arrangement, optional foreground. */
function scene(suit: Suit, n: number): Scene {
  const p = PAL[suit];
  const key = `${suit}-${n}`;
  switch (key) {
    /* Wands — fire, drive */
    case 'wands-1': return { bg: <>{burst(0, 0, 150, p.light)}{hills(p.ground, 84)}</> };
    case 'wands-2': return { bg: <>{sun(0, 30, 16, p.light)}{hills(p.ground, 62)}</>, pips: [[-50, 0, 0, 3], [50, 0, 0, 3]] };
    case 'wands-3': return { bg: <>{sun(0, 44, 15, p.light)}{water('#5a2638', p.light, 52)}</>, pips: [[-54, -4, 0, 2.9], [0, -22, 0, 2.3], [54, -4, 0, 2.9]] };
    case 'wands-4': return { bg: <>{hills(p.ground, 84)}{wreath(0, 0, 22, 22)}{star(0, 0, 9, 8, p.light)}</> };
    case 'wands-5': return { bg: <>{burst(0, 0, 150, p.main, 10, 0.22)}{hills(p.ground, 88)}</>, pips: [[-42, -44, -28, 1.9], [40, -50, 24, 1.9], [0, 0, 62, 1.9], [-38, 52, 34, 1.9], [40, 50, -36, 1.9]] };
    case 'wands-6': return { bg: <>{sun(0, -62, 20, p.light)}{hills(p.ground, 80)}{wreath(0, -62, 30, 30)}</>, pips: [[0, -34, 0, 2.3], ...row(5, -52, 52, (i, x): Pip => [x, 62, -24 + i * 12, 1.5])] };
    case 'wands-7': return { bg: <>{mountains(p.ground, 30)}{burst(0, -50, 70, p.light, 14)}</>, pips: [[0, -46, 0, 2.3], ...row(6, -62, 62, (i, x): Pip => [x, 78, -25 + i * 10, 1.5])] };
    case 'wands-8': return { bg: <>{cloud(-44, 78, 1.1)}{cloud(46, -80, 1)}{hills(p.ground, 98)}</>, pips: row(8, -50, 50, (i, x): Pip => [x, i % 2 ? 16 : -16, 40, 1.6]) };
    case 'wands-9': return { bg: <>{moon(52, -78, 14, p.light)}{stars(p.light, 0.6)}{hills(p.ground, 60)}</>, pips: [...row(8, -66, 66, (_i, x): Pip => [x, 44, 0, 1.7]), [0, -14, 0, 2.9]] };
    case 'wands-10': return { bg: <>{cloud(-40, -88, 1.2, p.light, 0.25)}{cloud(44, -70, 1, p.light, 0.25)}{hills(p.ground, 86)}</>, pips: row(10, -45, 45, (i, x): Pip => [x, 6 + Math.abs(i - 4.5) * 2, -22 + i * 4.9, 3]) };
    /* Cups — water, feeling */
    case 'cups-1': return { bg: <>{burst(0, -10, 150, p.light)}{water(p.deep, p.light, 66)}</> };
    case 'cups-2': return { bg: <>{burst(0, -58, 60, ROSE, 14, 0.3)}{water(p.deep, p.light, 78)}{heart(0, -56, 1.5)}</>, pips: [[-36, 26, 0, 2.1], [36, 26, 0, 2.1]] };
    case 'cups-3': return { bg: <>{wreath(0, 4, 68, 84)}{[[-52, -78], [50, -84], [0, 78], [-64, 30], [64, 20]].map(([x, y]) => star(x, y, 5, 4, GOLD))}</>, pips: [[0, -42, 0, 1.9], [-34, 30, 0, 1.9], [34, 30, 0, 1.9]] };
    case 'cups-4': return { bg: <>{cloud(-48, -4, 1, WHITE, 0.3)}{cloud(50, 6, 0.9, WHITE, 0.3)}{cloud(0, -96, 1.1, WHITE, 0.3)}{hills(p.ground, 92)}</> };
    case 'cups-5': return { bg: <>{rain(p.light, 0.45)}{hills(p.ground, 60)}</>, pips: [[-44, 72, 100, 1.4], [-4, 86, 250, 1.4], [-34, 40, 78, 1.4], [30, -14, 0, 1.9], [56, 44, 0, 1.6]] };
    case 'cups-6': return { bg: <>{stars(p.light, 0.5)}{hills(p.ground, 96)}{[[-38, -92], [38, -92], [-38, -26], [38, -26], [-38, 40], [38, 40]].map(([x, y]) => <>{star(x, y, 6, 5, WHITE)}<circle cx={x} cy={y} r="1.8" fill={GOLD} /></>)}</> };
    case 'cups-7': return { bg: <>{moon(-56, -92, 10, p.light)}{stars(p.light, 0.7)}{[[-38, -50], [38, -50], [0, -14], [-38, 22], [38, 22], [-38, 94], [38, 94]].map(([x, y]) => cloud(x, y, 0.9, WHITE, 0.35))}</> };
    case 'cups-8': return { bg: <>{moon(40, -82, 16, p.light)}{stars(p.light, 0.6)}{mountains('#2b3f7a', 26, p.light)}{hills(p.ground, 58)}{pathRoad(p.light, 0.5)}</>, pips: [-64, -36, 36, 64].flatMap((x): Pip[] => [[x, 50, 0, 1.05], [x, 90, 0, 1.05]]) };
    case 'cups-9': return { bg: <>{sun(0, 38, 20, GOLD)}{hills(p.ground, 92)}</>, pips: ([[-66, 62], [-62, 18], [-47, -22], [-25, -52], [0, -66], [25, -52], [47, -22], [62, 18], [66, 62]] as [number, number][]).map(([x, y]): Pip => [x, y, 0, 0.95]) };
    case 'cups-10': return { bg: <>{rainbow(0, -16, 76)}{hills('#1f5a4a', 94)}</>, pips: [...row(5, -66, 66, (_i, x): Pip => [x, 22, 0, 1.1]), ...row(5, -66, 66, (_i, x): Pip => [x, 74, 0, 1.1])] };
    /* Swords — air, mind */
    case 'swords-1': return { bg: <>{burst(0, -30, 150, p.light)}{cloud(-46, 84, 1.3)}{cloud(46, 92, 1.2)}</> };
    case 'swords-2': return { bg: <>{moon(0, -92, 12, p.light)}{water(p.deep, p.light, 78)}</>, pips: [[0, 0, 36, 3.6], [0, 0, -36, 3.6]] };
    case 'swords-3': return { bg: <>{cloud(-44, -92, 1.2, p.main, 0.5)}{cloud(40, -98, 1.3, p.main, 0.5)}{rain(p.light, 0.4)}{heart(0, 16, 3.3, '#b8455e')}</>, pips: [[-26, -6, 152, 3.1], [26, -6, 208, 3.1], [0, -12, 180, 3.3]] };
    case 'swords-4': return { bg: <>{moon(54, -6, 13, p.light)}{stars(p.light, 0.6)}{hills(p.ground, 78)}</>, pips: [[0, -86, 90, 3.2], [0, -62, 270, 3.2], [0, -38, 90, 3.2], [0, 60, 90, 3.4]] };
    case 'swords-5': return { bg: <>{cloud(-50, -92, 1.3, p.main, 0.4)}{cloud(30, -70, 1.5, p.main, 0.4)}{cloud(-10, -40, 1.1, p.main, 0.3)}{hills(p.ground, 70)}</>, pips: [[-32, -20, -22, 3], [0, -32, 0, 3], [32, -20, 22, 3], [-36, 86, 82, 1.7], [38, 96, 262, 1.7]] };
    case 'swords-6': return { bg: <>{moon(-54, -88, 11, p.light)}{mountains(p.ground, 20)}</>, pips: row(6, -58, 58, (i, x): Pip => [x, -6 - (i % 2) * 14, 0, 2.7]), fg: water(p.deep, p.light, 72) };
    case 'swords-7': return { bg: <>{moon(56, -90, 11, p.light)}{stars(p.light, 0.6)}{hills(p.ground, 66)}</>, pips: [...row(5, -50, 2, (i, x): Pip => [x, -8 + i * 3, -20 + i * 7, 2.4]), [44, 30, 180, 2.1], [66, 38, 180, 2.1]] };
    case 'swords-8': return { bg: <>{cloud(-50, -96, 1.2, p.main, 0.35)}{cloud(52, 98, 1.2, p.main, 0.35)}{burst(0, 0, 40, p.light, 12, 0.5)}<circle r="9" fill="#fff1c2" /></>, pips: Array.from({ length: 8 }, (_, i): Pip => { const a = (i * 45 + 22.5) * (Math.PI / 180); return [46 * Math.cos(a), 60 * Math.sin(a), i * 45 + 22.5 - 90, 1.6]; }) };
    case 'swords-9': return { bg: <>{moon(0, 74, 16, p.light)}{stars(p.light, 0.35)}{[[-50, 60], [48, 84], [-24, 96]].map(([x, y]) => star(x, y, 3, 4, p.light, 0.7))}</>, pips: row(9, -66, 66, (i, x): Pip => [x, -54 + (4 - Math.abs(i - 4)) * 14, 180, 2.3]) };
    case 'swords-10': return { bg: <>{sun(0, 58, 18, GOLD)}{mountains(p.ground, 74)}</>, pips: row(10, -68, 68, (i, x): Pip => [x, 34 - (i % 2) * 14, 180, 2.4]), fg: hills('#171a30', 100) };
    /* Coins — earth, craft */
    case 'coins-1': return { bg: <>{burst(0, 0, 150, p.light)}{hills(p.ground, 80)}{vine([[-84, 96], [-50, 78], [-20, 92], [20, 80], [52, 94], [84, 82]])}</> };
    case 'coins-2': return { bg: <>{water('#1c4a52', p.light, 84)}{<g transform="rotate(90)">{lemniscate(0, 0, 3.1, p.light)}</g>}</>, pips: [[0, -52, 0, 1.9], [0, 52, 0, 1.9]] };
    case 'coins-3': return { bg: <>{arch('#6f7f74', p.light)}</>, pips: [[0, -34, 0, 1.5], [-24, 16, 0, 1.5], [24, 16, 0, 1.5]] };
    case 'coins-4': return { bg: <>{hills(p.ground, 92)}<rect x="-62" y="-66" width="124" height="132" rx="10" fill={OUT} opacity=".35" /><rect x="-62" y="-66" width="124" height="132" rx="10" fill="none" stroke={p.main} stroke-width="3" />{[[-62, -66], [62, -66], [-62, 66], [62, 66]].map(([x, y]) => <circle cx={x} cy={y} r="5" fill={p.main} stroke={OUT} />)}</>, pips: [[-28, -30, 0, 1.6], [28, -30, 0, 1.6], [-28, 30, 0, 1.6], [28, 30, 0, 1.6]] };
    case 'coins-5': return { bg: <>{cloud(-40, -98, 1.3, WHITE, 0.3)}{cloud(44, -92, 1.2, WHITE, 0.3)}{[[-66, -60], [-20, -30], [22, -70], [64, -20], [-60, 20], [0, 34], [60, 40], [-22, 92], [26, 96], [-70, 84], [70, 92], [0, -96]].map(([x, y]) => <circle cx={x} cy={y} r="2.4" fill={WHITE} opacity=".8" />)}{hills('#dfe8ef', 100, 0.5)}</> };
    case 'coins-6': return { bg: <>{hills(p.ground, 88)}<line y1="-70" y2="92" stroke={GOLD} stroke-width="4" /><path d="M-24,96 h48 l-8,-10 h-32z" fill={GOLD} stroke={OUT} />{scales(0, -70, 1.15)}</>, pips: [[-66, -52, 0, 0.72], [-44, -52, 0, 0.72], [-55, -70, 0, 0.72], [55, -54, 0, 0.72], [-22, 40, 0, 0.9], [24, 62, 0, 0.9]] };
    case 'coins-7': return { bg: <>{sun(54, -92, 9, p.light)}{hills(p.ground, 92)}{vine([[0, 112], [-38, 72], [38, 72], [-38, 0], [38, 0], [0, -36], [-38, -72], [38, -72]])}</> };
    case 'coins-8': return { bg: <>{hills(p.ground, 96)}<g transform="rotate(-35)"><rect x="-3" y="-34" width="6" height="68" rx="3" fill={WOOD} stroke={OUT} /><rect x="-15" y="-46" width="30" height="16" rx="3" fill={PAL.swords.main} stroke={OUT} /></g>{[[-10, -56], [14, -60], [20, -40]].map(([x, y]) => star(x, y, 4, 4, p.light))}</> };
    case 'coins-9': return { bg: <>{sun(0, -4, 12, p.light)}{hills(p.ground, 96)}{vine([[-84, 100], [-38, 78], [38, 78], [-38, 26], [38, 26], [-38, -26], [38, -26], [-38, -78], [38, -78], [84, -100]])}</>, pips: [...GRID[9].filter(([x]) => x !== 0), [0, 52]] };
    case 'coins-10': return { bg: <>{hills(p.ground, 96)}{arch('#6f7f74', p.light)}</>, pips: [[0, -66], [-20, -40], [20, -40], [-30, -8], [0, -8], [30, -8], [-30, 26], [0, 26], [30, 26], [0, 60]].map(([x, y]): Pip => [x, y, 0, 0.82]) };
    default: return {};
  }
}

/* ---------- court cards: a simple figure holding the suit object ---------- */
function Court({ rank, suit }: { rank: number; suit: Suit }) {
  const p = PAL[suit];
  const skin = '#f0d9c0';
  const hair = { wands: '#b5522a', cups: '#3a2a4a', swords: '#d9dbe6', coins: '#4a2e22' }[suit];
  const tall = suit === 'wands' || suit === 'swords';
  const backdrop = {
    wands: <>{sun(-50, -80, 13, p.light)}{hills(p.ground, 70)}</>,
    cups: <>{moon(-54, -84, 12, p.light)}{water(p.deep, p.light, 72)}</>,
    swords: <>{cloud(-48, -84, 1.2, p.light, 0.45)}{cloud(50, -56, 1, p.light, 0.35)}{mountains(p.ground, 60, p.light)}</>,
    coins: <>{sun(-52, -82, 12, p.light)}{hills(p.ground, 66)}{vine([[-84, 60], [-60, 40], [-74, 10], [-58, -16]])}</>,
  }[suit];
  return (
    <g>
      {backdrop}
      <g transform={`translate(${tall ? -10 : 0},6)`}>
        {rank === 13 && <path d="M-26,-28 Q-40,24 -32,58 L-12,34 V-10 Z M26,-28 Q40,24 32,58 L12,34 V-10 Z" fill={hair} stroke={OUT} stroke-width=".8" />}
        {/* robe */}
        <path d="M-60,106 Q-58,30 -24,16 L24,16 Q58,30 60,106 Z" fill={p.deep} stroke={OUT} stroke-width="1" />
        <path d="M-24,16 Q0,46 24,16 L15,13 Q0,32 -15,13 Z" fill={p.light} stroke={OUT} stroke-width=".6" />
        <path d="M0,40 V106" stroke={p.main} stroke-width="4" opacity=".7" />
        {rank >= 13 && <path d="M-60,106 Q-58,60 -46,36 L-34,44 Q-44,70 -44,106 Z M60,106 Q58,60 46,36 L34,44 Q44,70 44,106 Z" fill={p.main} opacity=".8" />}
        {/* head */}
        <rect x="-7" y="-4" width="14" height="22" fill={skin} stroke={OUT} stroke-width=".6" />
        <circle cy="-20" r="22" fill={skin} stroke={OUT} stroke-width="1" />
        {rank !== 12 && <path d="M-22,-20 Q-25,-46 0,-44 Q25,-46 22,-20 Q10,-36 -22,-20 Z" fill={hair} stroke={OUT} stroke-width=".6" />}
        {rank === 14 && <path d="M-19,-12 Q-17,16 0,20 Q17,16 19,-12 Q10,-1 0,-1 Q-10,-1 -19,-12 Z" fill={hair} stroke={OUT} stroke-width=".6" />}
        <path d="M-12,-19 q3.5,3 7,0 M5,-19 q3.5,3 7,0" stroke="#3a2a35" stroke-width="1.7" fill="none" stroke-linecap="round" />
        {rank !== 14 && <path d="M-4,-8 q4,3 8,0" stroke="#b0606a" stroke-width="1.5" fill="none" stroke-linecap="round" />}
        {/* headwear */}
        {rank === 11 && <><path d="M16,-42 q16,-24 30,-18 q-10,16 -30,18z" fill={p.light} stroke={OUT} stroke-width=".6" /><path d="M-27,-33 Q-10,-60 22,-45 Q31,-37 20,-32 Q0,-43 -27,-33 Z" fill={p.main} stroke={OUT} stroke-width=".8" /></>}
        {rank === 12 && <><path d="M0,-46 q-8,-28 18,-32 q10,10 -4,20 q16,-2 18,10 q-14,10 -32,2z" fill={p.main} stroke={OUT} stroke-width=".8" /><path d="M-25,-14 Q-27,-47 0,-47 Q27,-47 25,-14 L25,-2 L13,-2 L13,-25 L-13,-25 L-13,-2 L-25,-2 Z" fill="#aeb9cc" stroke={OUT} stroke-width="1" /><path d="M-25,-30 h50" stroke={OUT} stroke-width=".8" opacity=".5" /></>}
        {rank === 13 && <><path d="M-19,-38 L-21,-54 L-10,-47 L0,-58 L10,-47 L21,-54 L19,-38 Z" fill={GOLD} stroke={OUT} stroke-width=".8" />{[-21, 0, 21].map((x) => <circle cx={x} cy={x ? -55 : -59} r="3" fill={WHITE} stroke={OUT} stroke-width=".6" />)}</>}
        {rank === 14 && <><path d="M-23,-36 L-25,-62 L-12,-50 L0,-67 L12,-50 L25,-62 L23,-36 Z" fill={GOLD} stroke={OUT} stroke-width=".8" /><circle cy="-44" r="3.6" fill={p.main} stroke={OUT} stroke-width=".6" /></>}
        {/* held object */}
        {tall ? (
          <>
            <g transform="translate(62,6) scale(3.1)"><Sym suit={suit} /></g>
            <path d="M30,28 Q54,28 66,44 L56,54 Q46,44 28,46 Z" fill={p.main} stroke={OUT} stroke-width=".8" />
            <circle cx="62" cy="46" r="7" fill={skin} stroke={OUT} stroke-width=".8" />
          </>
        ) : (
          <>
            <g transform="translate(0,70) scale(1.9)"><Sym suit={suit} /></g>
            <circle cx="-20" cy="84" r="6.5" fill={skin} stroke={OUT} stroke-width=".8" />
            <circle cx="20" cy="84" r="6.5" fill={skin} stroke={OUT} stroke-width=".8" />
          </>
        )}
      </g>
    </g>
  );
}

/* ---------- Major arcana scenes ---------- */
function Major({ n }: { n: number }) {
  const V = MAJOR_COLOR;
  const at = (suit: Suit, x: number, y: number, s: number, r = 0) => <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}><Sym suit={suit} /></g>;
  switch (n) {
    case 0: // Fool — a road to the edge of open sky, a traveller's bundle
      return <>{sky(DAY)}{sun(-48, -74, 15)}{cloud(40, -84, 1.1)}{mountains('#6f95bd', 66, WHITE)}
        <path d="M-84,112 V44 Q-30,30 14,44 L30,58 L22,112 Z" fill="#3f7a56" stroke={OUT} stroke-width="1" />
        <path d="M-70,112 Q-30,80 -6,56 L4,58 Q-16,84 -44,112 Z" fill="#e9d9a6" opacity=".8" />
        <line x1="2" y1="52" x2="26" y2="-14" stroke={WOOD} stroke-width="4" stroke-linecap="round" />
        <circle cx="24" cy="-18" r="12" fill={ROSE} stroke={OUT} /><path d="M16,-12 q8,-4 14,2" stroke={OUT} fill="none" />
        {star(-44, 62, 7, 5, WHITE)}<circle cx="-44" cy="62" r="2" fill={GOLD} />
        <path d="M44,-40 q5,-6 10,0 q5,-6 10,0 M58,-58 q4,-5 8,0 q4,-5 8,0" stroke={OUT} stroke-width="1.6" fill="none" /></>;
    case 1: // Magician — the four tools on a table under the sign of infinity
      return <>{sky(NIGHT)}{stars()}{burst(0, -74, 90, GOLD, 16, 0.3)}{lemniscate(0, -78, 0.8, GOLD)}
        {at('wands', 0, -22, 2.2)}
        <rect x="-66" y="52" width="132" height="12" rx="2" fill={WOOD} stroke={OUT} /><path d="M-56,64 v48 h10 v-48 M46,64 v48 h10 v-48" fill="#8a5428" stroke={OUT} />
        <path d="M-66,64 h132 v10 q-66,14 -132,0z" fill={ROSE} opacity=".8" />
        {at('cups', -44, 32, 0.95)}{at('swords', -15, 30, 1, 20)}{at('coins', 16, 36, 0.9)}{at('wands', 46, 30, 1, -20)}</>;
    case 2: // High Priestess — two pillars, a veil of stars, the crescent
      return <>{sky(NIGHT)}
        <rect x="-40" y="-84" width="80" height="150" fill="#3d2a78" opacity=".7" />{[[-24, -60], [0, -70], [24, -60], [-12, -36], [12, -36], [-24, 30], [24, 30], [0, 44]].map(([x, y]) => star(x, y, 4, 4, GOLD, 0.8))}
        {water('#1b2f63', V, 70)}{pillar(-66, '#f0edf9')}{pillar(44, '#221d3c')}
        {moon(-4, -2, 26, WHITE)}</>;
    case 3: // Empress — abundance: ripe grain, green hills, the heart's sign
      return <>{sky(DAY)}{sun(50, -80, 13)}{hills('#3f7a56', 40)}{hills('#2f6146', 70)}
        <circle cy="-34" r="26" fill="none" stroke={ROSE} stroke-width="7" /><path d="M0,-8 V34 M-16,16 H16" stroke={ROSE} stroke-width="7" stroke-linecap="round" />{heart(0, -32, 1)}
        {[-70, -52, -34, 34, 52, 70].map((x, i) => <g transform={`translate(${x},${86 - (i % 2) * 6})`}><line y1="26" y2="-14" stroke={GOLD} stroke-width="2" />{[-12, -4, 4].map((y) => <path d={`M0,${y} l-6,-7 M0,${y} l6,-7`} stroke={GOLD} stroke-width="2.4" stroke-linecap="round" />)}</g>)}</>;
    case 4: // Emperor — a stone seat before the mountains
      return <>{sky(DUSK)}{mountains('#8f3f33', 40)}{hills('#3a1c2a', 96)}
        <rect x="-32" y="-78" width="64" height="60" rx="4" fill="#9a97b4" stroke={OUT} /><rect x="-44" y="-24" width="88" height="124" fill="#8482a0" stroke={OUT} /><rect x="-54" y="14" width="18" height="86" fill="#9a97b4" stroke={OUT} /><rect x="36" y="14" width="18" height="86" fill="#9a97b4" stroke={OUT} />
        <path d="M-32,-78 q-22,-8 -18,10 q8,10 14,0 M32,-78 q22,-8 18,10 q-8,10 -14,0" fill="none" stroke={GOLD} stroke-width="4" stroke-linecap="round" />
        <rect x="-44" y="30" width="88" height="8" fill={ROSE} stroke={OUT} />
        <circle cy="-4" r="15" fill={GOLD} stroke={OUT} /><path d="M-15,-4 h30 M0,-19 v-14 M-6,-27 h12" stroke={OUT} stroke-width="2" /></>;
    case 5: // Hierophant — the triple staff and the crossed keys
      return <>{sky(NIGHT)}{burst(0, -60, 90, GOLD, 14, 0.25)}{pillar(-72, '#8482a0', -70, 20)}{pillar(52, '#8482a0', -70, 20)}
        <line y1="-96" y2="40" stroke={GOLD} stroke-width="5" stroke-linecap="round" />{[-80, -62, -44].map((y, i) => <line x1={-12 - i * 7} x2={12 + i * 7} y1={y} y2={y} stroke={GOLD} stroke-width="5" stroke-linecap="round" />)}
        {[35, -35].map((r) => <g transform={`translate(0,72) rotate(${r})`} stroke={r > 0 ? GOLD : WHITE} stroke-width="4" fill="none" stroke-linecap="round"><circle cx="-34" r="9" /><line x1="-25" x2="34" /><path d="M24,0 v10 M34,0 v10" /></g>)}</>;
    case 6: // Lovers — two hearts joined beneath a blessing light
      return <>{sky(DAY)}{burst(0, -70, 120, GOLD, 20, 0.3)}{sun(0, -70, 16)}{hills('#3f7a56', 76)}
        {heart(-17, 26, 2.6, ROSE)}<g opacity=".88">{heart(17, 26, 2.6, V)}</g>
        {star(0, 94, 6, 5, WHITE)}{star(-56, 92, 5, 5, WHITE)}{star(56, 92, 5, 5, WHITE)}</>;
    case 7: // Chariot — a starry canopy on two wheels
      return <>{sky(NIGHT)}{stars()}{hills('#1d1746', 84)}<path d="M-84,112 L-30,84 H30 L84,112 Z" fill="#e9d9a6" opacity=".5" />
        <path d="M-50,-40 h100 l-10,-26 h-80 z" fill="#2f3f8a" stroke={OUT} />{[-28, 0, 28].map((x) => star(x, -53, 6, 4, GOLD))}
        <path d="M-42,-40 v40 M42,-40 v40" stroke={GOLD} stroke-width="4" />
        <rect x="-46" y="0" width="92" height="52" rx="6" fill={GOLD} stroke={OUT} />{moon(-3, 26, 13, '#2f3f8a')}
        {[-40, 40].map((x) => <g transform={`translate(${x},72)`}><circle r="22" fill="#3d2a78" stroke={WHITE} stroke-width="4" />{[0, 45, 90, 135].map((a) => <line x1="-20" x2="20" stroke={WHITE} stroke-width="2" transform={`rotate(${a})`} />)}<circle r="5" fill={GOLD} /></g>)}</>;
    case 8: // Strength — a calm lion under the sign of infinity
      return <>{sky(['#3a2450', '#8a4a4a', '#d98a4a'])}{lemniscate(0, -84, 0.75, WHITE)}{hills('#5a2f2a', 84)}
        {sun(0, 22, 31, '#d9772f', 16)}
        <path d="M-26,-6 l-6,-18 l16,8 Z M26,-6 l6,-18 l-16,8 Z" fill="#f2c46b" stroke={OUT} />
        <circle cy="22" r="30" fill="#f2c46b" stroke={OUT} />
        <path d="M-16,14 q5,5 10,0 M6,14 q5,5 10,0" stroke={OUT} stroke-width="2.2" fill="none" stroke-linecap="round" />
        <path d="M-6,26 h12 l-6,7 z" fill="#8a3b1c" /><path d="M0,33 v5 M0,38 q-6,6 -11,1 M0,38 q6,6 11,1" stroke={OUT} stroke-width="1.8" fill="none" stroke-linecap="round" />
        {heart(0, 86, 1, ROSE)}{[-36, 36].map((x) => <>{star(x, 90, 7, 5, WHITE)}<circle cx={x} cy="90" r="2" fill={GOLD} /></>)}</>;
    case 9: // Hermit — a lantern on the mountain at night
      return <>{sky(NIGHT)}{stars(WHITE, 0.5)}{mountains('#3a3f6a', 64, WHITE)}{hills('#161238', 98)}
        <line x1="44" y1="-96" x2="44" y2="112" stroke={WOOD} stroke-width="6" stroke-linecap="round" />
        <circle cx="-12" cy="4" r="52" fill="#fff1c2" opacity=".14" /><circle cx="-12" cy="4" r="34" fill="#fff1c2" opacity=".22" />
        <path d="M-12,-46 q-12,0 -12,12 M-12,-46 q12,0 12,12" stroke={GOLD} stroke-width="3" fill="none" /><path d="M-34,-30 h44 l-6,-10 h-32 z" fill={GOLD} stroke={OUT} />
        <rect x="-32" y="-30" width="40" height="62" fill="#2a2540" stroke={GOLD} stroke-width="3" /><rect x="-36" y="32" width="48" height="9" rx="2" fill={GOLD} stroke={OUT} />
        {star(-12, 2, 17, 6, '#ffe27a')}</>;
    case 10: // Wheel of Fortune — the turning wheel among the clouds
      return <>{sky(['#1f1a55', '#3a2f86', '#6a55b5'])}{cloud(-52, -92, 1.2)}{cloud(54, -90, 1.1)}{cloud(-54, 98, 1.2)}{cloud(54, 100, 1.1)}
        <circle r="64" fill={GOLD} stroke={OUT} /><circle r="54" fill="#2a1d5c" stroke={OUT} /><circle r="36" fill="#3d2a78" stroke={GOLD} stroke-width="2.5" />
        {[0, 45, 90, 135].map((a) => <line x1="-54" x2="54" stroke={GOLD} stroke-width="3" transform={`rotate(${a})`} />)}
        {Array.from({ length: 8 }, (_, i) => <g transform={`rotate(${i * 45 + 22.5})`}>{star(0, -45, 5, 4, i % 2 ? WHITE : ROSE)}</g>)}
        <circle r="12" fill={GOLD} stroke={OUT} />{star(0, 0, 8, 8, '#2a1d5c')}</>;
    case 11: // Justice — the upright sword and the level scales
      return <>{sky(NIGHT)}{pillar(-74, '#8482a0', -60, 18)}{pillar(56, '#8482a0', -60, 18)}{hills('#1d1746', 98)}
        {at('swords', 0, 14, 4.6)}{scales(0, -34, 1.2)}</>;
    case 12: // Hanged Man — stillness, a new angle, a quiet light
      return <>{sky(DUSK)}{hills('#3a1c2a', 92)}
        <path d="M-56,112 V-84 M56,112 V-84" stroke={WOOD} stroke-width="8" stroke-linecap="round" /><line x1="-64" x2="64" y1="-84" y2="-84" stroke={WOOD} stroke-width="9" stroke-linecap="round" />
        {[[-50, -84, 200], [-20, -84, -30], [24, -84, 210], [52, -84, -20], [-56, -30, 190], [56, -10, -10]].map(([x, y, r]) => <path d="M0,0 q8,-9 15,-3 q-7,7 -15,3z" fill={LEAF} transform={`translate(${x},${y}) rotate(${r})`} />)}
        <line y1="-84" y2="-40" stroke={WHITE} stroke-width="2.5" />
        <path d="M-30,-40 h60 l-30,54 z" fill={V} stroke={OUT} /><path d="M-14,-40 l14,26 l14,-26" fill="none" stroke={OUT} opacity=".4" />
        {burst(0, 40, 44, '#fff1c2', 14, 0.5)}<circle cy="40" r="17" fill="#fff1c2" stroke={GOLD} stroke-width="3" /></>;
    case 13: // Death — an ending and a sunrise; the white rose
      return <>{sky(DUSK)}{sun(0, 34, 20)}
        <rect x={X0} y="34" width={PW} height={Y1 - 34} fill="#2a1d3c" />
        {[-56, 40].map((x) => <g><rect x={x} y="-10" width="18" height="46" fill="#3a2f55" stroke={OUT} /><path d={`M${x - 2},-10 h22 v-8 h-5 v4 h-4 v-4 h-4 v4 h-4 v-4 h-5 z`} fill="#3a2f55" stroke={OUT} /></g>)}
        <path d="M-10,34 Q20,60 -8,80 Q-30,96 -14,112 H30 Q10,96 26,80 Q50,58 10,34 Z" fill="#6fa3c7" opacity=".7" />
        <rect x="-30" y="-104" width="60" height="70" fill="#0e0c1e" stroke={WHITE} stroke-width="2" /><path d="M-30,-34 l10,10 l10,-10 l10,10 l10,-10 l10,10 l10,-10" fill="#0e0c1e" stroke={WHITE} stroke-width="2" />
        {[0, 72, 144, 216, 288].map((a) => <circle cy="-11" r="9" fill={WHITE} transform={`translate(0,-68) rotate(${a})`} />)}<circle cy="-68" r="6" fill={GOLD} /></>;
    case 14: // Temperance — pouring between two cups, land and water
      return <>{sky(DAY)}{sun(40, 22, 14)}{hills('#3f7a56', 50)}{water('#24497f', WHITE, 76)}<path d="M20,112 Q44,80 42,52 l6,0 Q56,84 44,112 Z" fill="#e9d9a6" opacity=".7" />
        {burst(0, -10, 80, WHITE, 16, 0.18)}
        <path d="M-26,-50 C10,-40 -14,-6 22,8" fill="none" stroke="#a8dcf2" stroke-width="7" stroke-linecap="round" /><path d="M-26,-50 C10,-40 -14,-6 22,8" fill="none" stroke={WHITE} stroke-width="2" stroke-linecap="round" />
        {at('cups', -40, -64, 1.9, 55)}{at('cups', 34, 30, 1.9, -12)}</>;
    case 15: // Devil — loose chains above the fire
      return <>{sky(FIRE)}{flames(92)}
        <g transform="translate(0,-62) rotate(180)">{star(0, 0, 30, 5, '#0e0c1e')}</g><g transform="translate(0,-62) rotate(180)" opacity=".9">{star(0, 0, 18, 5, ROSE)}</g>
        <path d="M-30,-84 q-30,-10 -34,-34 M30,-84 q30,-10 34,-34" stroke={V} stroke-width="6" fill="none" stroke-linecap="round" />
        <g fill="none" stroke="#aeb9cc" stroke-width="5">{[-24, -8, 8, 24].map((y, i) => <ellipse cx={-30 + (i % 2) * 4} cy={y} rx="8" ry="12" />)}{[-24, -8, 8, 24].map((y, i) => <ellipse cx={30 - (i % 2) * 4} cy={y} rx="8" ry="12" />)}
          <path d="M-28,38 q28,26 56,0" /></g>
        <circle cx="-28" cy="38" r="5" fill="#aeb9cc" /><circle cx="28" cy="38" r="5" fill="#aeb9cc" /></>;
    case 16: // Tower — lightning strikes the tower
      return <>{sky(FIRE)}{cloud(-50, -92, 1.5, '#3a2f55', 0.9)}{cloud(52, -84, 1.4, '#3a2f55', 0.9)}{cloud(0, -104, 1.3, '#3a2f55', 0.9)}
        <path d="M-84,112 L-40,70 H40 L84,112 Z" fill="#2a2540" stroke={OUT} />
        <path d="M-26,72 L-20,-44 H20 L26,72 Z" fill="#8482a0" stroke={OUT} /><path d="M0,-44 H20 L26,72 H0 Z" fill="#6b698a" />
        <path d="M-26,-44 h52 v-12 h-10 v6 h-8 v-6 h-10 v6 h-8 v-6 h-16 z" fill="#8482a0" stroke={OUT} />
        {[[-9, -24], [9, 6], [-9, 36]].map(([x, y]) => <><rect x={x - 6} y={y} width="12" height="18" rx="6" fill="#160d1e" /><path d={`M${x},${y + 2} q6,7 4,12 q-4,5 -8,0 q-2,-5 4,-12z`} fill="#f6c453" /></>)}
        <path d="M-16,-10 L-20,-28 L-8,-20 L0,-32 L8,-20 L20,-28 L16,-10 Z" fill={GOLD} stroke={OUT} transform="translate(44,-58) rotate(35)" />
        {bolt(-34, -50, 1.3)}
        {[[-58, 0], [-48, 30], [56, 10], [46, 40], [62, -24], [-64, -30]].map(([x, y]) => <path d="M0,-6 q4,5 0,9 q-4,-4 0,-9z" fill="#f6c453" transform={`translate(${x},${y})`} />)}</>;
    case 17: // Star — one great star, seven small, and still water
      return <>{sky(NIGHT)}{burst(0, -44, 80, GOLD, 16, 0.22)}{star(0, -44, 38, 8, GOLD)}{star(0, -44, 16, 8, '#fff1c2')}
        {[[-62, -92], [-34, -98], [36, -98], [62, -88], [-66, -30], [66, -24], [0, -104]].map(([x, y]) => star(x, y, 7, 8, WHITE))}
        {hills('#1d1746', 56)}<ellipse cy="82" rx="70" ry="24" fill="#24497f" stroke={OUT} />{[52, 34, 16].map((r) => <ellipse cy="82" rx={r} ry={r * 0.32} fill="none" stroke="#a8dcf2" stroke-width="1.6" opacity=".7" />)}
        {star(0, 82, 6, 8, GOLD, 0.8)}</>;
    case 18: // Moon — a path from the water between two towers
      return <>{sky(NIGHT)}{stars(WHITE, 0.5)}
        <circle cy="-62" r="36" fill="#fff1c2" opacity=".15" /><circle cy="-62" r="27" fill="#efe3ff" stroke={OUT} />{moon(-6, -62, 20, '#b9a2e6')}
        {[[-44, -16], [-22, -8], [22, -8], [44, -16], [0, -18]].map(([x, y]) => <path d="M0,-6 q5,7 0,11 q-5,-4 0,-11z" fill={GOLD} transform={`translate(${x},${y})`} />)}
        {hills('#241c58', 58)}
        {[-66, 46].map((x) => <g><rect x={x} y="4" width="20" height="60" fill="#4a4370" stroke={OUT} /><path d={`M${x - 3},4 h26 v-9 h-6 v5 h-5 v-5 h-4 v5 h-5 v-5 h-6 z`} fill="#4a4370" stroke={OUT} /><rect x={x + 7} y="18" width="6" height="12" rx="3" fill="#ffe27a" /></g>)}
        <path d="M-16,90 Q20,72 -2,54 Q-14,44 0,34 L5,34 Q-4,46 10,56 Q36,74 16,90 Z" fill="#e9d9a6" opacity=".75" />
        {water('#1b2f63', V, 88)}</>;
    case 19: // Sun — a great sun over a garden wall of sunflowers
      return <>{sky(['#2f6fb0', '#58a0d0', '#a8d6ea'])}{burst(0, -44, 150, '#fff1c2', 24, 0.3)}{sun(0, -44, 34, GOLD, 16)}
        {[-60, -20, 20, 60].map((x, i) => <g transform={`translate(${x},${40 - (i % 2) * 10})`}><path d="M0,10 V60" stroke="#3f7a56" stroke-width="4" /><path d="M0,34 q10,-8 16,0 q-8,6 -16,0z M0,44 q-10,-8 -16,0 q8,6 16,0z" fill={LEAF} />{sun(0, 0, 8, '#f6c453', 12)}<circle r="7" fill="#6b3a1c" stroke={OUT} /></g>)}
        <rect x={X0} y="80" width={PW} height="32" fill="#c9b08a" stroke={OUT} />{[[-84, 96, 168], [-56, 80, 0], [0, 80, 0], [56, 80, 0], [-28, 96, 0], [28, 96, 0]].map(([x, y, w]) => (w ? <line x1={x} x2={x + w} y1={y} y2={y} stroke={OUT} opacity=".5" /> : <line x1={x} x2={x} y1={y} y2={y + 16} stroke={OUT} opacity=".5" />))}</>;
    case 20: // Judgement — a call from above, an answer rising
      return <>{sky(DAY)}{burst(26, -70, 150, '#fff1c2', 20, 0.3)}{cloud(40, -92, 1.6, WHITE, 0.9)}{cloud(-44, -98, 1.2, WHITE, 0.7)}{mountains('#6f95bd', 78, WHITE)}
        <path d="M34,-84 L-34,-48 L-46,-66 Q-58,-48 -40,-30 L-30,-46 L40,-72 Z" fill={GOLD} stroke={OUT} />
        <rect x="-18" y="-50" width="30" height="30" fill={WHITE} stroke={OUT} transform="rotate(-27,-3,-50)" /><path d="M-9,-30 h20 M1,-40 v20" stroke={ROSE} stroke-width="4" transform="rotate(-27,-3,-50)" />
        {[-52, -18, 16, 50].map((x, i) => <g transform={`translate(${x},${84 - (i % 2) * 10})`}><path d="M-10,28 Q-10,4 0,2 Q10,4 10,28 Z" fill={i % 2 ? V : WHITE} stroke={OUT} /><circle cy="-8" r="8" fill="#f0d9c0" stroke={OUT} /><path d="M-8,10 L-18,-12 M8,10 L18,-12" stroke={i % 2 ? V : WHITE} stroke-width="4" stroke-linecap="round" /></g>)}</>;
    default: // 21 World — the wreath of completion
      return <>{sky(NIGHT)}{burst(0, 0, 150, V, 20, 0.16)}
        {[[-62, -94], [62, -94], [-62, 88], [62, 88]].map(([x, y]) => star(x, y, 11, 4, GOLD))}
        {wreath(0, -2, 52, 78, LEAF, 30)}{wreath(0, -2, 44, 70, '#3f7a56', 26)}
        <circle cy="-2" r="30" fill="#3d73a8" stroke={OUT} /><path d="M-22,-16 q10,-10 22,-4 q4,10 -8,12 q-10,6 -14,-8z M4,8 q14,-6 20,4 q-6,12 -16,8z M-18,12 q8,0 8,8 q-6,2 -8,-8z" fill={LEAF} /><path d="M-22,-14 a30,30 0 0,1 16,-14" stroke={WHITE} stroke-width="2" fill="none" opacity=".6" />
        {[-82, 78].map((y) => <path d={`M-10,${y} q-12,-10 -14,4 q8,6 14,-4z M10,${y} q12,-10 14,4 q-8,6 -14,-4z`} fill={ROSE} stroke={OUT} stroke-width=".6" />)}</>;
  }
}

/* ---------- frame ---------- */
/** `raster`: an illustration to show in the art panel instead of the drawn scene. */
function Face({ card, raster }: { card: Card; raster?: string }) {
  const major = card.arcana === 'major';
  const suit = card.suit;
  const color = major ? MAJOR_COLOR : PAL[suit!].main;
  const n = card.number;
  let art: J;
  if (raster) art = <image href={raster} x={X0} y={Y0} width={PW} height={PH} preserveAspectRatio="xMidYMid slice" />;
  else if (major) art = <Major n={n} />;
  else if (n > 10) art = <>{sky(PAL[suit!].sky)}<Court rank={n} suit={suit!} /></>;
  else {
    const sc = scene(suit!, n);
    art = (
      <>
        {sky(PAL[suit!].sky)}
        {sc.bg}
        {(sc.pips ?? GRID[n]).map(([x, y, r = 0, s = 1]) => <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${r}) scale(${s})`}><Sym suit={suit!} /></g>)}
        {sc.fg}
      </>
    );
  }
  const label = major ? roman(n) : n === 1 ? 'A' : n <= 10 ? String(n) : RANK_NAMES[n];
  return (
    <>
      <rect x="1" y="1" width={W - 2} height={H - 2} rx="12" fill="#14112b" stroke={GOLD} stroke-width="2" />
      <rect x="7" y="7" width={W - 14} height={H - 14} rx="8" fill="none" stroke={color} stroke-opacity=".5" stroke-width="1" />
      <svg x="16" y="52" width={PW} height={PH} viewBox={`${X0} ${Y0} ${PW} ${PH}`}>{art}</svg>
      <rect x="16" y="52" width={PW} height={PH} fill="none" stroke={GOLD} stroke-width="1.5" />
      {major ? (
        <>
          <text x={W / 2} y="38" text-anchor="middle" font-size="22" fill={GOLD} font-family="Georgia, serif">{label}</text>
          {star(40, 31, 5, 4, GOLD, 0.8)}{star(W - 40, 31, 5, 4, GOLD, 0.8)}
        </>
      ) : (
        <>
          <text x="20" y="39" font-size={n > 10 ? 18 : 24} fill={color} font-family="Georgia, serif" font-weight="700">{label}</text>
          <text x={W - 20} y="38" text-anchor="end" font-size="15" fill={color}>{SUIT_INFO[suit!].element}</text>
          <g transform={`translate(${W / 2},30) scale(.62)`}><Sym suit={suit!} /></g>
        </>
      )}
      {star(W / 2 - 62, H - 30, 4, 4, GOLD, 0.7)}{star(W / 2 + 62, H - 30, 4, 4, GOLD, 0.7)}
      <text x={W / 2} y={H - 23} text-anchor="middle" font-size="21" fill={WHITE} font-weight="600">{card.name}</text>
    </>
  );
}

export function CardBack() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} class="card-svg" aria-hidden="true">
      <rect x="1" y="1" width={W - 2} height={H - 2} rx="12" fill="#231e4a" stroke={GOLD} stroke-width="2" />
      <rect x="12" y="12" width={W - 24} height={H - 24} rx="8" fill="#1a1640" stroke={GOLD} stroke-opacity=".6" />
      {[[26, 26], [W - 26, 26], [26, H - 26], [W - 26, H - 26]].map(([x, y]) => star(x, y, 7, 4, GOLD, 0.8))}
      <g transform={`translate(${W / 2},${H / 2})`}>
        {burst(0, 0, 120, GOLD, 24, 0.14)}
        {Array.from({ length: 8 }, (_, i) => <g transform={`rotate(${i * 45})`}>{star(0, -84, 6, 4, GOLD, 0.7)}</g>)}
        <circle r="62" fill="none" stroke={GOLD} stroke-opacity=".8" stroke-width="1.5" /><circle r="46" fill="#2c2560" stroke={GOLD} stroke-width="1.5" />
        {Array.from({ length: 16 }, (_, i) => <line y1="-50" y2={i % 2 ? '-58' : '-62'} stroke={GOLD} stroke-opacity=".8" transform={`rotate(${i * 22.5})`} />)}
        {moon(-4, 0, 24, GOLD)}{star(14, -4, 8, 4, WHITE)}
      </g>
    </svg>
  );
}

/** A card's face in the deck chosen in settings (see ./decks). */
export function CardFace({ cardId }: { cardId: string }) {
  const raster = rasterArt(cardId, useContext(DeckContext));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} class="card-svg" aria-hidden="true">
      <Face card={getCard(cardId)} raster={raster} />
    </svg>
  );
}
