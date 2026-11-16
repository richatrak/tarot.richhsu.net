import { CARDS, type Card } from '../data/cards';
import type { Spread } from '../data/spreads';
import { cryptoSource, randomInt, shuffle, type Uint32Source } from './random';

export interface DrawnCard {
  /** 1-based order in which the card was drawn. */
  order: number;
  /** Index into spread.positions (same as order - 1). */
  positionIndex: number;
  cardId: string;
  reversed: boolean;
}

export interface Reading {
  id: string;
  createdAt: string; // ISO timestamp
  spreadId: string;
  count: number;
  question: string;
  reversalsEnabled: boolean;
  cards: DrawnCard[];
}

/** Probability that a card is reversed when reversals are enabled. */
export const REVERSAL_PROBABILITY = 0.5;

export function drawCards(
  count: number,
  reversalsEnabled: boolean,
  src: Uint32Source = cryptoSource,
  deck: readonly Card[] = CARDS,
): DrawnCard[] {
  if (!Number.isInteger(count) || count < 1 || count > deck.length) {
    throw new RangeError(`count must be 1..${deck.length}`);
  }
  // Shuffle the whole deck, then take from the top: no card can repeat within a reading.
  const shuffled = shuffle(deck, src);
  return shuffled.slice(0, count).map((card, i) => ({
    order: i + 1,
    positionIndex: i,
    cardId: card.id,
    // 50%: randomInt(2) === 1. Kept as integer draw so it stays unbiased.
    reversed: reversalsEnabled ? randomInt(2, src) === 1 : false,
  }));
}

export function newId(src: Uint32Source = cryptoSource): string {
  return Date.now().toString(36) + '-' + src().toString(36);
}

export function createReading(
  spread: Spread,
  count: number,
  question: string,
  reversalsEnabled: boolean,
  src: Uint32Source = cryptoSource,
): Reading {
  return {
    id: newId(src),
    createdAt: new Date().toISOString(),
    spreadId: spread.id,
    count,
    question: question.trim(),
    reversalsEnabled,
    cards: drawCards(count, reversalsEnabled, src),
  };
}
