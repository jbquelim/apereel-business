# Design Map

## Spacing Scale
- Component: 10px, 12px, 17.6px, 20px, 24px, 30px, 40px (loose ~10px base)
- Section interior padding: 160px, 320px (hero: 320px top / 160px bottom)
- Section-to-component spacing ratio ≈ 10:1; margins on h1–h3/p/ul are 0px — all rhythm from parent padding and flex gap
- Grid gutter: 24px

## Font Hierarchy
- Mega-wordmark: Oswald 256px (hero "ANTARCTICA", weight 400, line-height 1.0) and 320px (footer "WHITE DESERT")
- H2 display: Cardinal Classic Long 140px, weight 500
- H3 heading: Cardinal Classic Long 42px, weight 400, line-height 1.0
- Body: Inter Tight 16–18px, weight 500, line-height 21.6px
- UI/caption: Inter Tight 14px (dominant size — 72 occurrences), weight 500; coordinates in condensed Oswald caps

## Color Palette
- `#FFFFFF` — page background (32.4% of bg area) + text over imagery
- `#F3F1EC` — warm bone section/footer background
- `#1F2A44` — deep navy: primary text, footer mega-wordmark
- `#535353` — secondary text and links
- `#FF7E15` — single-use accent (one fixed side tab only)
- `rgba(0,0,0,0.1–0.2)` — glass overlay surfaces over photography (21.2% of bg area)

## Image Ratios
- Hero full-bleed: 1.60:1 (1440×900)
- Feature: 1.50:1 – 1.60:1 (rendered 680px in 12-col grid)
- Cloud strips: 2.62:1
- Portrait thumbnail: 0.80:1

## Component Tokens
- Border-radius: 2px on buttons/nav pills (dominant, ×38); 0px on content panels; 4–6px minor; 50% only on small icon dots
- Shadow: none (zero drop shadows); single recurring effect is a 2-layer white inset hairline `inset 0.35px 0.35px 0 rgba(255,255,255,0.2), inset 0 0 1.75px rgba(255,255,255,0.2)` on glass buttons
- Grid: 12 columns × 118px, 24px gutter, full-bleed container (`max-width: none`, 0 body padding)
- Buttons: 16px / weight 400, glass background, 2px radius
- Motion: transform/color/width transitions, 0.3–0.6s, custom cubic-beziers `(0.76,0,0.24,1)` and `(0.4,0,0.2,1)`; no reduced-motion query, no :focus-visible

---

# Taste DNA

### Landscape Is the Interface
- **Trigger**: When placing navigation, cards, and CTAs on top of continuous full-bleed Antarctic photography and video
- **Decision**: Translucent glass surfaces — `rgba(0,0,0,0.1–0.2)` pills, white translucent panels, 2-layer white inset hairlines — over opaque white cards, drop shadows, or letterboxing the imagery in a contained column
- **Reason**: A visitor deciding on a six-figure expedition is buying the place, not the website; every opaque pixel of UI is a pixel of Antarctica they cannot see, so the interface must behave like a window annotation, not a document
- **Evidence**: 0 drop shadows on the entire page; only shadow is `rgba(255,255,255,0.2) 0.35px` inset ×12; translucent black backgrounds cover 21.2% of bg area; `containerMaxWidth: none`, body padding 0

### Type as Territory Marker
- **Trigger**: When making a scrolling page about vast empty terrain feel vast rather than like a brochure
- **Decision**: A jump scale with ~3× leaps — 14px UI, 42px serif headings, then 140/256/320px condensed wordmarks — over a conventional 1.25× modular ratio that would fill the 50–130px middle band
- **Reason**: Monument-scale type that overflows the viewport makes the reader feel physically small relative to the word, mimicking standing before the landscape; mid-size headlines would read as marketing, not geography
- **Evidence**: sizeDistribution 14px ×72, 42px ×14, 140px ×1, 256px ×1, 320px ×1; near-empty 50–130px band; h1 = 256px/256px Oswald weight 400; footer wordmark 320px spanning 1440px

### One Orange Pin
- **Trigger**: When they could have deployed a brand accent across CTAs, links, icons, and hovers, as luxury-travel competitors do with gold or brand hues
- **Decision**: Let photography carry 100% of the chroma and restricted saturated color to a single element — the fixed `#FF7E15` "How it works" tab — over accent-colored CTAs; even Rates and Enquire are colorless glass
- **Reason**: Expedition gear logic — in a white-and-ice world, one orange marker is instantly findable precisely because nothing else competes; a second orange element would halve the first one's power
- **Evidence**: `#FF7E15` count: 1 in the full-page text-color census; accentCandidates all navy/gray/white; palette otherwise `#1F2A44`, `#535353`, `#FFFFFF`, `#F3F1EC`

### Slow-Ease Traversal
- **Trigger**: When deciding how a 20782px, 14-viewport-deep narrative page should feel to move through
- **Decision**: Long heavy easing — `0.45s cubic-bezier(0.76,0,0.24,1)`, `transform 0.6s cubic-bezier(0.4,0,0.2,1)` — over snappy 150–200ms ease-out microinteractions, accepting no `prefers-reduced-motion` and no `:focus-visible` support
- **Reason**: Sub-200ms motion says efficient tool; 450–600ms motion with symmetric-power easing says heavy things moving through cold air — the pacing itself communicates expedition gravity, a deliberate bet of cinematic mood over accessibility hedging
- **Evidence**: transitions 0.3–0.6s with three custom cubic-beziers; `reducedMotion: false`; `focusVisible: false`; page height 20782px; section padding 160–320px as pacing device
