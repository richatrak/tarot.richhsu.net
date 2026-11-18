import { describe, expect, it } from 'vitest';
import { rasterArt } from '../src/art/decks';
import { CARDS } from '../src/data/cards';

describe('card face decks', () => {
  it('the anime deck has its own illustration for every card', () => {
    expect(CARDS).toHaveLength(78);
    const missing = CARDS.filter((c) => !rasterArt(c.id, 'anime')?.includes(`${c.id}.`)).map((c) => c.id);
    expect(missing).toEqual([]);
  });
  it('the flat deck always draws the scene', () => {
    expect(CARDS.filter((c) => rasterArt(c.id, 'flat') !== undefined)).toEqual([]);
  });
});
