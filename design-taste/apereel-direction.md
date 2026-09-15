# Apereel Design Direction

Synthesized from taste extractions of the three reference sites John chose:
monks.com, white-desert.com, cerebrium.ai (profiles + tokens in this folder).
Where all three agree, that agreement *is* the taste target. Current Apereel
tokens from `app/globals.css` and component idioms from `components/*.tsx`.

## What all three references agree on

1. **Zero box-shadows.** Monks: 2 per 8,000 elements. White Desert: 0.
   Cerebrium: 0. Depth comes from stepped background planes (Cerebrium
   `#FFFFFF → #EEF2F5 → #DBE5ED`), flush color-field chapters (Monks
   `#EAE8E4 ↔ #191715`), or glass over photography (White Desert).

2. **The accent is rationed to near-extinction.** Monks: no persistent accent
   at all — saturated color appears only as full-viewport event panels.
   White Desert: exactly one orange element (`#FF7E15`) on a 20,782px page.
   Cerebrium: pink (`#FF488B`) at 0.2% of painted area, CTAs only. In all
   three, an accent-colored element means "this is the action," never
   "this is on-brand."

3. **Neutrals own ~90%+ of the surface, and they're tinted, not pure.**
   Monks warm (`#EAE8E4`/`#191715`), Cerebrium cool blue-tinted toward its
   ink (`#EEF2F5`, `#DBE5ED`), White Desert bone (`#F3F1EC`).

4. **Hierarchy is size, not weight or color.** Monks: one family at weight
   500 from 15px body to 172px display. White Desert: 3× jump-scale leaps
   (14 → 42 → 140 → 256px), weight 400. Cerebrium: weight *300* at 86px.
   All three pair huge sizes with light weights and tight line-height
   (1.0–1.15 display).

5. **No bordered-card kit.** Monks' card detector returned empty; Cerebrium's
   cards are flat borderless color blocks; White Desert uses translucent
   glass. None of the three wraps content in `border + rounded + shadow`
   containers.

6. **Sections are flush chapters, not gapped blocks.** Background swaps
   announce new sections; internal padding is huge (Monks 113px, White
   Desert 160–320px, Cerebrium fluid 82–128px); gaps between sections ≈ 0.

## Where they diverge (pick per decision, don't average)

- **Radius:** Monks 100px pills / 50% circles; White Desert 2px; Cerebrium
  7px children inside 10px parents. → For Apereel take Cerebrium's
  concentric 7/10px system: the audit tool renders data, and near-square
  corners read technical; pills would fight the tables.
- **Control voice:** Cerebrium splits mono-uppercase controls from
  sentence-case prose. Monks uses default-case pills. → Take Cerebrium's
  split: Apereel already uses IBM Plex Mono for data — formalize it as
  "mono = machine-measured fact, sans = human argument" and stop using
  uppercase-tracked labels as decoration.
- **Dark vs light field:** Monks is light-first with dark chapters;
  Cerebrium is light-middle with dark theatrical ends; White Desert is
  photography. → Keep Apereel navy-first (brand constitution), but adopt
  Cerebrium's structure: theatrical dark at entry/exit, calmer evaluative
  surfaces for dense data sections.

## Apereel today vs the target

| Dimension | Apereel now | References | Verdict |
|---|---|---|---|
| Accent usage | `--electric #3d9eff` on labels, chips, numbers, borders, rings, icons throughout | One pin / CTA-only / event-only | **Biggest gap.** Demote electric to CTAs + at most one highlighted element per view |
| Containers | `rounded-2xl border border-white/10 bg-navy-mid` card per section | Flush color-field chapters, no borders | **Second biggest.** Replace card borders with background steps (navy → navy-mid → navy-lift as elevation scale) |
| Type scale | Plus Jakarta, conventional sizes, hierarchy via weight + electric labels | Size-driven jump scale, light weights, 1.0–1.15 display line-height | Introduce a display tier (~clamp(56px, 8vw, 120px), weight 400–500, lh 1.05); kill decorative 11px uppercase-tracked chips |
| Shadows | Present in places, plus glow effects | Zero, everywhere | Remove all; depth = background step only |
| Radius | 16px (`rounded-2xl`) + pill chips mixed | One deliberate system | Concentric 10px parent / 7px child; chips only where they carry data |
| Section rhythm | Stacked gapped cards | Flush chapters, 100px+ internal padding | Full-bleed background-swap chapters |

The current idiom — bordered rounded panels on dark, accent threaded through
every micro-label, uppercase tracking as texture — is precisely the shared
signature of AI-generated dashboards. The references earn their look by
subtraction; every "premium" cue they use is a removal.

## Execution plan (Impeccable passes, per surface)

Order: homepage → audit results → inner pages. Each surface: work on a
branch, then `quieter` → `distill` → typeset display tier → `polish` →
premium-design-critic gate → responsive-accessibility check → ship.

1. **Tokens first** (`app/globals.css`): add display type tier; define the
   navy elevation scale as the only depth mechanism; add a `--radius-parent:
   10px / --radius-child: 7px` pair; delete shadow/glow utilities.
2. **Quieter pass:** strip electric from everything that isn't a CTA or the
   single per-view highlight; replace `border-white/10` card borders with
   background steps.
3. **Distill pass:** merge/flush sections into chapters with background
   swaps; remove chip ornaments that carry no data.
4. **Typeset pass:** display-scale headlines (weight 400–500, lh ≤1.1,
   negative tracking at large sizes); formalize mono-for-data rule.
5. **Polish pass:** states, spacing rhythm on the 4px grid, motion at
   200–450ms with one easing family; `prefers-reduced-motion` respected
   (do NOT copy White Desert's accessibility bet).

Constraints that survive from the existing constitution: navy palette,
restrained red as signal, no fake proof, Core Web Vitals budget (no WebGL
heroes — Cerebrium's spectacle stays out; its *spreadsheet middle* is the
part we take).
