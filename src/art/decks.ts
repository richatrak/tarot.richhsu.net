import { createContext } from 'preact';
import type { Deck } from '../lib/storage';

/**
 * The "anime" deck: one raster illustration per card in ./ai/<cardId>.webp|png|jpg.
 * CardArt shows it inside the art panel in place of the drawn scene; the frame,
 * numeral and name are still drawn in code. The "flat" deck always uses the drawn scenes.
 */
const ANIME_ART: Record<string, string> = Object.fromEntries(
  Object.entries(import.meta.glob<string>('./ai/*.{webp,png,jpg}', { eager: true, query: '?url', import: 'default' }))
    .map(([path, url]) => [path.replace(/^.*\/|\.\w+$/g, ''), url]),
);

/** URL of the card's illustration in the given deck, or undefined to draw the scene. */
export function rasterArt(cardId: string, deck: Deck): string | undefined {
  return deck === 'anime' ? ANIME_ART[cardId] : undefined;
}

/** The deck chosen in settings. App provides it; without a provider the drawn scenes are shown. */
export const DeckContext = createContext<Deck>('flat');
