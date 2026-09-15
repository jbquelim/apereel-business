# Design Map

## Spacing Scale
- Base unit: 4px
- Component scale: 4 / 8 / 16 / **20 (dominant, 77 uses)** / 24 / 30 / 50px
- Section rhythm (fluid at 1440w): 82px and 128px (`mb-fluid-*`, viewport-scaled)
- Grid gap: 20px

## Font Hierarchy
- Hero h1: 86px (fluid) / weight 300 / ABC Favorit / line-height 1.0 / letter-spacing −2.15px
- Display steps (fluid, ~1.25 ratio): 72.6 → 57.4 → 43.9 → 36.1 → 26.5px, all weight 300 ABC Favorit
- Body: 17px / 400 / Suisse Intl / line-height 1.35
- UI secondary: 15–16px / 400–500 / Suisse Intl
- Controls & badges: 13px / 400 / Suisse Intl Mono / UPPERCASE / −0.325px tracking (most frequent size on page: 57 nodes)
- Weights used: 300 / 400 / 500 only — nothing bolder exists

## Color Palette
- `#FFFFFF` — light section background (41.3% of painted area)
- `#EEF2F5` — secondary light background (33.2%)
- `#DBE5ED` — card fill (15.1%)
- WebGL canvas ~`#0A0208`→`#8A1F6E` — dark magenta-ribbon hero/footer surfaces (rendered, not CSS)
- `#172B76` — primary text ink + navy button fill
- `#586490` — secondary text
- `#101421` — dark button
- `#FF488B` — accent, CTAs only (0.2% of surface)
- `#CFD7E7` — muted borders/dividers

## Image Ratios
- Hero: full-bleed WebGL canvas (no `<img>`)
- Logo wall: SVGs 2.3:1–6.6:1, normalized to 136px rendered width
- Case-study cards: 0.75:1 portrait (~442×592px), flat `#DBE5ED` fill

## Component Tokens
- Border radius: **7px system radius (236 uses)**; 10px large panels; nested rule 10px parent → 7px child
- Shadows: none — zero box-shadows page-wide; depth from background steps
- Grid: 2 columns `670px 670px`, 20px gutter, 1360px content width on 1440 viewport (40px margins)
- Buttons: 13px uppercase mono label, 7px radius; variants pink `#FF488B`, navy `#172B76`, near-black `#101421`, light `#DBE5ED`
- Motion: opacity/transform/color only, 0.2–0.3s, `cubic-bezier(0.4,0,0.2,1)` and `(0.645,0.045,0.355,1)`; `:focus-visible` and `prefers-reduced-motion` respected
- Alignment: left-aligned everywhere, hero to footer — no centered sections

---

# Taste DNA

### Spectacle at the Doors, Spreadsheet in the Room
- **Trigger**: When selling GPU infrastructure that must feel both cutting-edge and dependable on one homepage…
- **Decision**: They confined the theatrical dark WebGL ribbon scenes to entry (hero) and exit (closing CTA + footer), and ran the entire evaluative middle on flat white and cool grays — over a full dark-mode developer site, the Vercel/Linear default for infra companies.
- **Reason**: A visitor decides to *feel* in the first second and decides to *buy* over the next five minutes; awe works on a black canvas, but comparing cold-start numbers, region lists, and case studies works on paper-white.
- **Evidence**: Light surfaces total 89.6% of painted area (`#FFFFFF` 41.3% + `#EEF2F5` 33.2% + `#DBE5ED` 15.1%), yet hero, mid-globe, and footer screenshots are near-black; body background is `rgba(0,0,0,0)` over a WebGL canvas.

### The Accent Is a Button, Not a Brand
- **Trigger**: When holding a memorable signature color (`#FF488B`) that already saturates the WebGL ribbon scenes…
- **Decision**: They rationed pink to 0.2% of the painted surface — sign-up CTAs, map markers, and the single hero word "scales" — over amortizing the accent across headings, icons, and link underlines the way most branded sites do. (Restraint.)
- **Reason**: When a color appears only where clicking has value, users read it as instruction rather than decoration; the 10,870px-tall page can be navigated by scanning for pink alone.
- **Evidence**: `#FF488B` at 0.2% areaPct, 9 background uses, 5 text nodes; the only pink elements in all five screenshots are CTAs (SIGN UP, TRY IT NOW, GET STARTED, STATUS PAGE) and the highlighted verb "scales".

### Controls Speak Terminal, Prose Speaks Human
- **Trigger**: When labeling buttons, nav items, badges, and data readouts for an audience that lives in a shell…
- **Decision**: They enforced a hard typographic split — every control and metadata string is 13px uppercase Suisse Intl Mono with −0.325px tracking, while explanations stay 17px sentence-case Suisse Intl — over the conventional single-voice UI where buttons are just bolder body text.
- **Reason**: Developers parse monospace-uppercase as machine surface and proportional lowercase as documentation; CLI syntax in the chrome ("REGIONS : US-EAST-1") makes the product demo itself inside the marketing page.
- **Evidence**: Suisse Intl Mono on 81 elements; 13px is the page's most frequent text size (57 nodes); button spec `13px/400/uppercase/−0.325px` mono; badges "CAPACITY : 2500+", "TERMINAL", "REGIONS : US-EAST-1, EU-WEST-2".

### Depth Is Paint, Never Shadow
- **Trigger**: When stacking cards, terminal windows, a world map, and doc-link panels on light sections…
- **Decision**: They used zero box-shadows page-wide — elevation comes from stepping a blue-tinted neutral scale (`#FFFFFF` → `#EEF2F5` → `#DBE5ED`) and concentric radii (10px parents, 7px children) — over the standard SaaS soft multi-layer drop shadow on every card. (Restraint + craft.)
- **Reason**: The WebGL scenes are the page's only light source; competing simulated light would cheapen both. Flat tinted planes make dense technical content read as a printed spec-sheet, flattering a product whose pitch is solidity.
- **Evidence**: `shadows: []` across 8000 sampled elements; every neutral cool-tinted toward the `#172B76` ink (no pure gray); nested radius delta 10px → 7px; 7px radius used 236 times.
