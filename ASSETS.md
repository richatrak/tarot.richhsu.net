# Asset provenance & licensing

| Asset | Source | How it was made | License |
|---|---|---|---|
| 78 card faces + card back (`src/art/CardArt.tsx`) | Original to this project | Drawn **procedurally in code** as SVG from simple geometric primitives (lines, circles, polygons). No images, no tracing, no AI image generation. | Project-owned |
| App icons (`public/icon-*.png`, `apple-touch-icon.png`, `favicon.svg`) | Original | SVG written by hand in `scripts/make-icons.mjs`, rasterised with headless Chromium (`npm run icons`). | Project-owned |
| Card meanings, keywords, reflection tips (`src/data/cards.ts`) | Original writing | AI-assisted first draft, written fresh for this project — **not** adapted from any book, deck guidebook or website. Status `draft` = not yet human-reviewed. | Project-owned |
| Fonts | None bundled | Uses the device's system fonts. | — |

## Design boundary
Card faces use only generic, traditional *symbol concepts* that belong to the tarot tradition at large
(wand, cup, sword, coin, scales, wheel, star, moon, sun, tower, lantern...), and RWS numbering/structure.
They do **not** reproduce the composition, figures, poses, colour palette, line work or titles/branding of
any published deck (including the Rider–Waite–Smith artwork, the "Rider-Waite" trademark, Thoth, Marseille
editions, etc.).

Original work reduces, but cannot absolutely rule out, infringement risk. Before public commercial release,
consider a professional review.

## Status
These faces are **schematic placeholders** (symbolic, no illustrated figures), clearly labelled as such
in the app's About section. The data model (`cardId` → face) lets each face be replaced individually by
commissioned illustrations later without code changes elsewhere.
