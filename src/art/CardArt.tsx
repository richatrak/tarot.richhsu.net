/**
 * Procedurally generated, original card faces (SVG).
 * Design: geometric/symbolic. Uses only generic traditional symbol *concepts*
 * (wand, cup, sword, coin, star, moon, sun, wheel, scales...). It does not copy
 * the composition, characters, palette or linework of any published deck.
 */
import type { JSX } from 'preact';
import { getCard, roman, RANK_NAMES, SUIT_INFO, type Card, type Suit } from '../data/cards';

const W = 200;
const H = 340;

export const SUIT_COLOR: Record<Suit, string> = {
  wands: '#e0793f',
  cups: '#4fa3d1',
  swords: '#b9c4d6',
  coins: '#d9b44a',
};
const MAJOR_COLOR = '#c9a7ff';
const GOLD = '#d9b44a';

/* ---------- suit symbols, drawn centred at (0,0), roughly 40×40 ---------- */
function Symbol({ suit, color }: { suit: Suit; color: string }) {
  switch (suit) {
    case 'wands':
      return (
        <g stroke={color} stroke-width="3" stroke-linecap="round" fill="none">
          <line x1="-4" y1="18" x2="4" y2="-18" />
          <path d="M3,-12 q7,-2 9,-8" />
          <path d="M-1,2 q-8,0 -10,-6" />
        </g>
      );
    case 'cups':
      return (
        <g stroke={color} stroke-width="3" fill="none" stroke-linejoin="round">
          <path d="M-12,-14 h24 q0,16 -12,18 q-12,-2 -12,-18 z" />
          <line x1="0" y1="4" x2="0" y2="13" />
          <line x1="-8" y1="15" x2="8" y2="15" />
        </g>
      );
    case 'swords':
      return (
        <g stroke={color} stroke-width="3" stroke-linecap="round" fill="none">
          <line x1="0" y1="-20" x2="0" y2="10" />
          <line x1="-9" y1="10" x2="9" y2="10" />
          <line x1="0" y1="10" x2="0" y2="18" />
        </g>
      );
    case 'coins':
      return (
        <g stroke={color} stroke-width="3" fill="none">
          <circle r="14" />
          <circle r="8" stroke-width="1.5" />
          <rect x="-3" y="-3" width="6" height="6" transform="rotate(45)" fill={color} stroke="none" />
        </g>
      );
  }
}

/* Pip positions inside a 140×200 field centred at (0,0) */
const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[0, -55], [0, 55]],
  3: [[0, -65], [0, 0], [0, 65]],
  4: [[-35, -50], [35, -50], [-35, 50], [35, 50]],
  5: [[-35, -60], [35, -60], [0, 0], [-35, 60], [35, 60]],
  6: [[-35, -65], [35, -65], [-35, 0], [35, 0], [-35, 65], [35, 65]],
  7: [[-35, -70], [35, -70], [0, -35], [-35, 0], [35, 0], [-35, 70], [35, 70]],
  8: [[-35, -75], [35, -75], [-35, -25], [35, -25], [-35, 25], [35, 25], [-35, 75], [35, 75]],
  9: [[-35, -75], [35, -75], [-35, -25], [35, -25], [0, 0], [-35, 25], [35, 25], [-35, 75], [35, 75]],
  10: [[-35, -80], [35, -80], [0, -50], [-35, -20], [35, -20], [-35, 20], [35, 20], [0, 50], [-35, 80], [35, 80]],
};

/* Court card emblems (generic geometric headwear / mount glyphs). */
function CourtGlyph({ rank, color }: { rank: number; color: string }) {
  const s = { stroke: color, 'stroke-width': 3, fill: 'none', 'stroke-linejoin': 'round' as const };
  switch (rank) {
    case 11: // 侍者 — small open circle (a student's seal)
      return <circle cx="0" cy="-58" r="10" {...s} />;
    case 12: // 騎士 — forward chevrons (movement)
      return <path d="M-22,-50 l12,-12 l-12,-12 M-4,-50 l12,-12 l-12,-12 M14,-50 l12,-12 l-12,-12" {...s} />;
    case 13: // 皇后 — rounded crown
      return <path d="M-24,-46 v-16 q6,10 12,-6 q6,16 12,0 q6,16 12,6 q6,-4 12,-6 v22 z" {...s} />;
    default: // 國王 — pointed crown
      return <path d="M-24,-46 v-24 l12,12 l12,-18 l12,18 l12,-12 v24 z" {...s} />;
  }
}

/* ---------- Major arcana emblems, drawn in a ~140×170 box centred at (0,0) ---------- */
function MajorEmblem({ n, c }: { n: number; c: string }) {
  const s = { stroke: c, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' as const, 'stroke-linejoin': 'round' as const };
  const thin = { ...s, 'stroke-width': 1.5 };
  const star = (cx: number, cy: number, r: number, points = 8) => {
    const pts: string[] = [];
    for (let i = 0; i < points * 2; i++) {
      const a = (Math.PI * i) / points - Math.PI / 2;
      const rr = i % 2 ? r * 0.42 : r;
      pts.push(`${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`);
    }
    return <polygon points={pts.join(' ')} {...s} />;
  };
  switch (n) {
    case 0: // Fool — a small figure-less path toward an open sky, with a bundle (circle) and edge
      return <g><path d="M-60,70 Q-10,40 20,0 T60,-60" {...s} /><circle cx="60" cy="-60" r="8" {...s} /><path d="M-60,70 h20" {...thin} />{star(-35, -55, 10, 5)}</g>;
    case 1: // Magician — lemniscate over four suit marks
      return <g><path d="M0,-55 c-15,-18 -40,-18 -40,0 s25,18 40,0 s40,-18 40,0 s-25,18 -40,0" {...s} /><line x1="0" y1="-30" x2="0" y2="30" {...s} />
        <g transform="translate(-45,60) scale(.55)"><Symbol suit="wands" color={c} /></g><g transform="translate(-15,60) scale(.55)"><Symbol suit="cups" color={c} /></g>
        <g transform="translate(15,60) scale(.55)"><Symbol suit="swords" color={c} /></g><g transform="translate(45,60) scale(.55)"><Symbol suit="coins" color={c} /></g></g>;
    case 2: // High Priestess — two pillars and a crescent
      return <g><rect x="-55" y="-60" width="18" height="125" {...s} /><rect x="37" y="-60" width="18" height="125" fill={c} fill-opacity=".25" stroke={c} stroke-width="3" />
        <path d="M-8,-20 a22,22 0 1,0 0,40 a16,16 0 1,1 0,-40" {...s} /></g>;
    case 3: // Empress — venus-like circle over a field of grain lines
      return <g><circle cy="-30" r="25" {...s} /><line y1="-5" y2="30" {...s} /><line x1="-15" y1="15" x2="15" y2="15" {...s} />
        {[-50, -30, -10, 10, 30, 50].map((x) => <path d={`M${x},70 v-25 m0,0 l-5,-6 m5,6 l5,-6`} {...thin} />)}</g>;
    case 4: // Emperor — a square throne and spiralled corners
      return <g><rect x="-40" y="-40" width="80" height="90" {...s} /><path d="M-40,-40 q-15,-15 0,-25 q10,10 0,25 M40,-40 q15,-15 0,-25 q-10,10 0,25" {...s} /><line x1="-40" y1="10" x2="40" y2="10" {...thin} /></g>;
    case 5: // Hierophant — triple-barred staff and two keys crossed
      return <g><line y1="-70" y2="60" {...s} />{[-55, -42, -29].map((y, i) => <line x1={-10 - i * 4} x2={10 + i * 4} y1={y} y2={y} {...s} />)}
        <g transform="translate(0,45) rotate(35)"><circle cx="-28" r="6" {...thin} /><line x1="-22" x2="20" {...thin} /><path d="M14,0 v6 M20,0 v6" {...thin} /></g>
        <g transform="translate(0,45) rotate(-35)"><circle cx="28" r="6" {...thin} /><line x1="22" x2="-20" {...thin} /><path d="M-14,0 v6 M-20,0 v6" {...thin} /></g></g>;
    case 6: // Lovers — two overlapping circles beneath a radiant point
      return <g><circle cx="-18" cy="20" r="32" {...s} /><circle cx="18" cy="20" r="32" {...s} />{star(0, -55, 14)}</g>;
    case 7: // Chariot — a canopy box with two wheels
      return <g><rect x="-40" y="-30" width="80" height="55" {...s} /><path d="M-48,-30 h96 l-8,-18 h-80 z" {...s} /><circle cx="-30" cy="45" r="16" {...s} /><circle cx="30" cy="45" r="16" {...s} />{star(0, -2, 10, 6)}</g>;
    case 8: // Strength — lemniscate above a gentle open hand-like arc
      return <g><path d="M0,-50 c-12,-14 -32,-14 -32,0 s20,14 32,0 s32,-14 32,0 s-20,14 -32,0" {...s} /><path d="M-45,20 q45,50 90,0" {...s} /><path d="M-30,10 q30,25 60,0" {...thin} /></g>;
    case 9: // Hermit — lantern with a star, and a staff
      return <g><line x1="35" y1="-70" x2="35" y2="70" {...s} /><path d="M-30,-20 h30 v40 h-30 z" {...s} /><path d="M-30,-20 l15,-15 l15,15" {...s} />{star(-15, 0, 10, 6)}</g>;
    case 10: // Wheel — eight-spoke wheel
      return <g><circle r="55" {...s} /><circle r="18" {...s} />{[0, 45, 90, 135].map((a) => <line x1="-55" x2="55" transform={`rotate(${a})`} {...thin} />)}</g>;
    case 11: // Justice — balance scales
      return <g><line y1="-60" y2="60" {...s} /><line x1="-50" y1="-40" x2="50" y2="-40" {...s} /><path d="M-50,-40 l-15,35 h30 z M50,-40 l-15,35 h30 z" {...s} /><line x1="-25" y1="60" x2="25" y2="60" {...s} /></g>;
    case 12: // Hanged Man — inverted triangle over a cross (bar)
      return <g><line x1="-45" y1="-65" x2="45" y2="-65" {...s} /><line y1="-65" y2="-20" {...s} /><path d="M-30,-20 h60 l-30,52 z" {...s} /><circle cy="50" r="12" {...s} /></g>;
    case 13: // Death — a setting sun between two horizon lines and a single rose-form
      return <g><path d="M-55,15 h110" {...s} /><path d="M-30,15 a30,30 0 0,1 60,0" {...s} /><path d="M-55,35 h110" {...thin} />
        <g transform="translate(0,-45)"><circle r="14" {...s} /><path d="M0,-14 q8,14 0,14 q-8,0 0,-14 M-14,0 q14,8 14,0 q0,-8 -14,0" {...thin} /></g></g>;
    case 14: // Temperance — two cups and a flowing stream between them
      return <g><g transform="translate(-30,-35)"><Symbol suit="cups" color={c} /></g><g transform="translate(30,35)"><Symbol suit="cups" color={c} /></g><path d="M-20,-20 C10,-10 -10,10 20,20" {...s} /></g>;
    case 15: // Devil — two loose chain links and an inward-pointing arc
      return <g><path d="M-45,-55 q45,50 90,0" {...s} /><ellipse cx="-16" cy="25" rx="14" ry="22" {...s} /><ellipse cx="16" cy="25" rx="14" ry="22" {...s} /><line x1="-16" y1="47" x2="-16" y2="70" {...thin} /><line x1="16" y1="47" x2="16" y2="70" {...thin} /></g>;
    case 16: // Tower — tower with a lightning bolt
      return <g><path d="M-25,70 v-100 h50 v100" {...s} /><path d="M-30,-30 h60" {...s} /><path d="M20,-75 l-20,30 h15 l-22,32" {...s} /><rect x="-8" y="20" width="16" height="25" {...thin} /></g>;
    case 17: // Star — large eight-point star and seven small ones
      return <g>{star(0, -20, 38)}{[[-50, 40], [-25, 55], [0, 62], [25, 55], [50, 40], [-50, -65], [50, -65]].map(([x, y]) => star(x, y, 7))}</g>;
    case 18: // Moon — crescent over a winding path and droplets
      return <g><path d="M10,-75 a35,35 0 1,0 0,70 a27,27 0 1,1 0,-70" {...s} /><path d="M0,70 Q-30,50 0,35 T0,5" {...s} />{[-35, -15, 25, 45].map((x) => <path d={`M${x},10 q4,6 0,9 q-4,-3 0,-9`} {...thin} />)}</g>;
    case 19: // Sun — radiant disk
      return <g><circle r="32" {...s} />{Array.from({ length: 12 }, (_, i) => <line y1="-42" y2={i % 2 ? '-55' : '-65'} transform={`rotate(${i * 30})`} {...s} />)}</g>;
    case 20: // Judgement — horn sounding over rising lines
      return <g><path d="M-45,-55 l70,-10 l10,20 z" {...s} /><path d="M35,-55 l18,-8 M35,-48 l20,0 M35,-41 l18,8" {...thin} />{[-40, -15, 10, 35].map((x) => <path d={`M${x},65 v-40 l-6,8 m6,-8 l6,8`} {...s} />)}</g>;
    default: // 21 World — laurel ellipse with four corner points
      return <g><ellipse rx="40" ry="60" {...s} /><ellipse rx="30" ry="50" {...thin} />{[[-60, -70], [60, -70], [-60, 70], [60, 70]].map(([x, y]) => star(x, y, 9, 4))}</g>;
  }
}

function Frame({ color, children }: { color: string; children: JSX.Element | JSX.Element[] }) {
  return (
    <>
      <rect x="1" y="1" width={W - 2} height={H - 2} rx="12" fill="#191634" stroke={GOLD} stroke-width="2" />
      <rect x="9" y="9" width={W - 18} height={H - 18} rx="8" fill="none" stroke={color} stroke-opacity=".55" stroke-width="1" />
      {children}
    </>
  );
}

function Face({ card }: { card: Card }) {
  if (card.arcana === 'major') {
    return (
      <Frame color={MAJOR_COLOR}>
        <text x={W / 2} y="38" text-anchor="middle" font-size="20" fill={GOLD} font-family="Georgia, serif">{roman(card.number)}</text>
        <g transform={`translate(${W / 2},${H / 2 + 2})`}><MajorEmblem n={card.number} c={MAJOR_COLOR} /></g>
        <text x={W / 2} y={H - 26} text-anchor="middle" font-size="22" fill="#f3eefe" font-weight="600">{card.name}</text>
      </Frame>
    );
  }
  const suit = card.suit!;
  const color = SUIT_COLOR[suit];
  const n = card.number;
  const label = n === 1 ? 'A' : n <= 10 ? String(n) : RANK_NAMES[n];
  return (
    <Frame color={color}>
      <text x="22" y="38" font-size={n > 10 ? 16 : 20} fill={color} font-family="Georgia, serif">{label}</text>
      <text x={W - 22} y="38" text-anchor="end" font-size="14" fill={color}>{SUIT_INFO[suit].element}</text>
      <g transform={`translate(${W / 2},${H / 2 - 2})`}>
        {n <= 10 ? (
          PIPS[n].map(([x, y]) => (
            <g transform={`translate(${x},${y}) scale(${n === 1 ? 2.2 : 0.95})`}><Symbol suit={suit} color={color} /></g>
          ))
        ) : (
          <>
            <CourtGlyph rank={n} color={color} />
            <g transform="translate(0,20) scale(2)"><Symbol suit={suit} color={color} /></g>
          </>
        )}
      </g>
      <text x={W / 2} y={H - 26} text-anchor="middle" font-size="21" fill="#f3eefe" font-weight="600">{card.name}</text>
    </Frame>
  );
}

export function CardBack() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} class="card-svg" aria-hidden="true">
      <rect x="1" y="1" width={W - 2} height={H - 2} rx="12" fill="#231e4a" stroke={GOLD} stroke-width="2" />
      <rect x="12" y="12" width={W - 24} height={H - 24} rx="8" fill="none" stroke={GOLD} stroke-opacity=".5" />
      <g transform={`translate(${W / 2},${H / 2})`} stroke={GOLD} fill="none" stroke-opacity=".8">
        <circle r="46" /><circle r="30" />
        {Array.from({ length: 8 }, (_, i) => <line y1="-46" y2="-70" transform={`rotate(${i * 45})`} />)}
        <path d="M8,-18 a18,18 0 1,0 0,36 a13,13 0 1,1 0,-36" fill={GOLD} fill-opacity=".35" />
      </g>
    </svg>
  );
}

export function CardFace({ cardId }: { cardId: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} class="card-svg" aria-hidden="true">
      <Face card={getCard(cardId)} />
    </svg>
  );
}
