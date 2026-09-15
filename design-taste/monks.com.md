# Design Map

## Spacing Scale
- Base unit: 10px
- Component steps: 10, 20 (×48 — workhorse), 30 (grid gutter), 40 (×22), 60
- Section breath: 113.33px internal padding (×17) — sections are flush-joined, no external gaps
- Paragraph margin: 23.3px

## Font Hierarchy
- Display: 172.45px / 500 / Helvetica Now Extended — off-scale poster words
- H1: 66.67px / 500 / Helvetica Now (hero pairs it with Morian serif for one line)
- H2: 48.33px / 500 / Helvetica Now Extended (×38 uses)
- H3: 22.67px / 500 / Helvetica Now
- Lead: 18px / 400 (×36)
- Body: 15.33px / 500 (×83) — same weight as headings
- Micro: 10px / 400
- Line-height ~1.15 across all levels; scale ratio ~1.4× until the 2.6× display jump

## Color Palette
- `#EAE8E4` — warm gray page background (74.9% of painted area); doubles as text-on-dark
- `#191715` — warm near-black section/footer background (11.7%)
- `#2D2D2D` — primary text ink + dark chips/buttons
- `#DFBBFE` — lavender full-viewport event/announcement panel
- `#FFB2E8` — pink full-viewport event panel
- `#4F24EE` — vivid violet, incidental only (0.2% area) — not a component accent

## Image Ratios
- Video hero: 16:9 (1728×974)
- Feature card: 1.07:1 (645×600 hard crop, repeated 4+)
- Wide feature: 1.66:1 (997×600)
- Thumbnail: 1:1 (412×412)

## Component Tokens
- Radius: 100px pill (×106, all CTAs), 50% circle (×21, arrow buttons), 4px minor
- Shadows: effectively none (2 per 8000 elements) — depth via color-field contrast
- Grid: full-bleed, `max-width: none` at 1440px; 8 columns × 146.2px, 30px gutter; 16 grids on page
- Motion: opacity 0.2–0.3s linear, transform 0.3s, box-shadow 0.6s cubic-bezier(0.19,1,0.22,1); `prefers-reduced-motion` and `:focus-visible` both present

---

# Taste DNA

### Color Is a Chapter Break, Not a Highlighter
- **Trigger**: When the designers needed an agency site to feel expressive while showing wildly varied client work
- **Decision**: Confined all saturated color (#DFBBFE lavender, #FFB2E8 pink) to full-viewport 1440×900 panels and announcement bars, over threading an accent color through buttons, links, and icons
- **Reason**: Client work supplies the site's color; a persistent brand accent would fight every portfolio image. A rare full-screen color flood registers as an event, so announcements feel like news, not chrome
- **Evidence**: Neutrals cover ~95% of painted area (#EAE8E4 74.9%, #191715 11.7%); accent candidates contain only #EAE8E4/#2D2D2D; #4F24EE at 0.2% area; #DFBBFE and #FFB2E8 each appear as 1440×900 blocks

### Hierarchy by Size Alone, at Poster Scale
- **Trigger**: When they had to rank a promise line, section titles, and body copy without cluttering the page
- **Decision**: Kept nearly all text at weight 500 in one family and made hierarchy purely with size — 15.33px body to 66.67px h1 to an off-scale 172.45px display — over a conventional weight-and-color hierarchy (bold heads, gray body)
- **Reason**: When everything shares one voice and one ink color (#2D2D2D on #EAE8E4), a 4×–11× size jump is unmissable; readers rank content by area, and the page reads like a printed poster rather than a document outline
- **Evidence**: Weight 500 = 126 of 200 text samples spanning body and h1; 172.448px ×10 elements breaks the ~1.4× scale; line-height uniformly ~1.15; h2 switches to Helvetica Now Extended for width-based emphasis

### Restraint: No Shadows, No Cards, No Gaps
- **Trigger**: When they needed to separate dozens of content modules (work, thinking, events, video) on one 8487px page
- **Decision**: Rejected the default kit — card containers, elevation shadows, rounded content wrappers, whitespace gaps between sections — in favor of flush full-bleed color fields (#EAE8E4 ↔ #191715) with 113px of internal padding
- **Reason**: Boxes-in-boxes make a portfolio feel like a dashboard. Flat color fields joined edge-to-edge feel like turning pages of a printed portfolio, and the background swap tells scrolling readers "new chapter" faster than any divider line
- **Evidence**: 2 shadows per 8000 sampled elements; card detector returned empty; sectionGaps: [] — sections are flush; 113.333px internal padding ×17; images are flat 645×600 (1.07:1) crops

### Round Means Clickable
- **Trigger**: When links had to stay findable on busy video heroes, pale gray fields, and near-black footers alike
- **Decision**: Standardized every interactive element into two shapes — a 100px-radius pill or a 50% circle with an arrow — over color-coded links, underlines, or rectangular buttons
- **Reason**: With no accent color available, shape must carry affordance. A circle-with-arrow is recognizable at a glance in any color scheme, so the same component works on dark, light, and lavender surfaces without restyling
- **Evidence**: Border-radius 100px ×106 and 50% ×21 vs 4px ×11; the arrow-circle repeats in nav, feature cards, announcement bar, and 11+ footer policy links; buttons use default case with no letter-spacing
