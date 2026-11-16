import { describe, expect, it } from 'vitest';
import { CARDS, getCard } from '../src/data/cards';
import { SPREADS, countFor, positionsFor, getSpread, CUSTOM_MAX } from '../src/data/spreads';
import { createReading, drawCards } from '../src/lib/draw';
import { randomInt, seededSource, shuffle, cryptoSource } from '../src/lib/random';

describe('deck', () => {
  it('has 78 unique cards: 22 major + 4×14 minor', () => {
    expect(CARDS).toHaveLength(78);
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(78);
    expect(CARDS.filter((c) => c.arcana === 'major')).toHaveLength(22);
    for (const s of ['wands', 'cups', 'swords', 'coins']) expect(CARDS.filter((c) => c.suit === s)).toHaveLength(14);
  });
  it('uses RWS numbering (Strength 8, Justice 11) and 星幣 naming', () => {
    expect(getCard('major-08').name).toBe('力量');
    expect(getCard('major-11').name).toBe('正義');
    expect(getCard('coins-01').name).toBe('星幣王牌');
    expect(getCard('cups-14').name).toBe('聖杯國王');
  });
  it('every card has non-empty upright, reversed, keywords and tip', () => {
    for (const c of CARDS) {
      for (const f of [c.name, c.nameEn, c.keywordsUpright, c.keywordsReversed, c.upright, c.reversed, c.tip]) {
        expect(f.trim().length, `${c.id}`).toBeGreaterThan(1);
      }
      expect(c.upright).not.toBe(c.reversed);
      expect(['draft', 'reviewed']).toContain(c.status);
    }
  });
});

describe('random', () => {
  it('randomInt stays in range and rejects biased values', () => {
    // A source that first returns a value in the biased tail, then a fair one.
    const vals = [0xffffffff, 7];
    const src = () => vals.shift()!;
    expect(randomInt(3, src)).toBe(7 % 3);
    expect(vals).toHaveLength(0);
  });
  it('shuffle is a permutation', () => {
    const a = Array.from({ length: 78 }, (_, i) => i);
    const s = shuffle(a, seededSource(42));
    expect([...s].sort((x, y) => x - y)).toEqual(a);
    expect(s).not.toEqual(a);
  });
  it('crypto source: first-position distribution is roughly uniform (chi-square)', () => {
    const N = 39000, k = 78, counts = new Array(k).fill(0);
    for (let i = 0; i < N; i++) counts[shuffle([...Array(k).keys()], cryptoSource)[0]]++;
    const exp = N / k;
    const chi = counts.reduce((s, c) => s + (c - exp) ** 2 / exp, 0);
    // df=77; p=0.001 critical value ≈ 122. Fails ~1/1000 runs by chance.
    expect(chi).toBeLessThan(122);
  }, 60_000);
  it('reversal rate is ~50% when enabled, 0% when disabled', () => {
    let rev = 0, total = 0;
    for (let i = 0; i < 2000; i++) for (const c of drawCards(10, true)) { total++; if (c.reversed) rev++; }
    expect(rev / total).toBeGreaterThan(0.47);
    expect(rev / total).toBeLessThan(0.53);
    for (let i = 0; i < 200; i++) expect(drawCards(10, false).some((c) => c.reversed)).toBe(false);
  });
});

describe('spreads & readings', () => {
  for (const spread of SPREADS.filter((s) => !s.custom)) {
    it(`${spread.name}: count, order, positions, uniqueness`, () => {
      const n = countFor(spread, 3);
      expect(n).toBe(spread.positions.length);
      for (let t = 0; t < 300; t++) {
        const r = createReading(spread, n, '  問題  ', true);
        expect(r.question).toBe('問題');
        expect(r.cards).toHaveLength(n);
        expect(new Set(r.cards.map((c) => c.cardId)).size).toBe(n);
        r.cards.forEach((c, i) => {
          expect(c.order).toBe(i + 1);
          expect(c.positionIndex).toBe(i);
          expect(positionsFor(spread, n)[c.positionIndex]).toBeDefined();
        });
      }
    });
  }
  it('Celtic Cross has 10 positions with #2 crossing #1 in the same cell', () => {
    const p = getSpread('celtic').positions;
    expect(p).toHaveLength(10);
    expect(p[1].crossing).toBe(true);
    expect([p[1].col, p[1].row]).toEqual([p[0].col, p[0].row]);
  });
  it('layout grid cells are unique except the crossing card', () => {
    for (const s of SPREADS.filter((x) => !x.custom)) {
      const cells = s.positions.filter((p) => !p.crossing).map((p) => `${p.col},${p.row}`);
      expect(new Set(cells).size).toBe(cells.length);
      for (const p of s.positions) {
        expect(p.col! <= s.cols && p.row! + (p.rowSpan ?? 1) - 1 <= s.rows).toBe(true);
      }
    }
  });
  it('custom spread supports 1..78 cards, all unique, and rejects out of range', () => {
    const custom = getSpread('custom');
    for (const n of [1, 2, 7, 21, CUSTOM_MAX]) {
      const r = createReading(custom, n, '', true);
      expect(r.cards).toHaveLength(n);
      expect(new Set(r.cards.map((c) => c.cardId)).size).toBe(n);
      expect(positionsFor(custom, n)).toHaveLength(n);
    }
    expect(() => drawCards(0, true)).toThrow();
    expect(() => drawCards(79, true)).toThrow();
  });
  it('is deterministic with a seeded source (for reproducible tests)', () => {
    expect(drawCards(5, true, seededSource(7))).toEqual(drawCards(5, true, seededSource(7)));
  });
});
