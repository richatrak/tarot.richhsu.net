# Asset provenance & licensing

| Asset | Source | How it was made | License |
|---|---|---|---|
| "Flat" deck: 78 card faces, plus the card back and the frame, numeral and name on every face (`src/art/CardArt.tsx`) | Original to this project | Drawn **procedurally in code** as SVG from simple geometric primitives (lines, circles, polygons). No images, no tracing, no AI image generation. | Project-owned |
| "Anime" deck: 78 card illustrations (`src/art/ai/*.webp`) | Generated for this project, 2026-11-19 | **AI-generated** with OpenAI's image generation from scene descriptions written for this project, one per card. The descriptions name no artist, publisher, game or deck. The original PNGs (not in this repo) carry OpenAI's C2PA record: software agent `ChatGPT`, version `gpt-image`, source type `trainedAlgorithmicMedia`. Scaled to 600×800 WebP for the app. | No third-party licence. Whether AI-generated images are protected by copyright is unsettled and varies by country. |
| App icons (`public/icon-*.png`, `apple-touch-icon.png`, `favicon.svg`) | Original | SVG written by hand in `scripts/make-icons.mjs`, rasterised with headless Chromium (`npm run icons`). | Project-owned |
| Card meanings, keywords, reflection tips (`src/data/cards.ts`) | Original writing | AI-assisted first draft, written fresh for this project — **not** adapted from any book, deck guidebook or website. Status `draft` = not yet human-reviewed. | Project-owned |
| Fonts | None bundled | Uses the device's system fonts. | — |

## Design boundary
Card faces use only generic, traditional *symbol concepts* that belong to the tarot tradition at large
(wand, cup, sword, coin, scales, wheel, star, moon, sun, tower, lantern...), and RWS numbering/structure.
They do **not** reproduce the composition, figures, poses, colour palette, line work or titles/branding of
any published deck (including the Rider–Waite–Smith artwork, the "Rider-Waite" trademark, Thoth, Marseille
editions, etc.).

For the anime deck this boundary was written into the scene descriptions (each one lists the deck-specific
renderings to avoid), and the generated images were reviewed against it. An AI model's output can still
resemble existing work in ways a visual review does not catch.

Original work reduces, but cannot absolutely rule out, infringement risk. Before public commercial release,
consider a professional review.

## Status
The app ships two decks, switchable in Settings (`src/art/decks.ts`):

- **Anime** (default): AI-generated illustrations, one per card, shown inside the frame drawn in code.
- **Flat**: **original flat-style scenes drawn in code** (shared scene primitives plus the four suit
  objects; court cards show simple figures).

Neither deck is hand-painted, and the app's About section says so. The data model (`cardId` → face) lets
each face be replaced individually by commissioned illustrations later without code changes elsewhere.
