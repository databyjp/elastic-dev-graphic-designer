# Agent Design Notes — SVG Infographic Creation

## Prime Directive

1. **Start from the template.** Copy `templates/video-graphics-template-landscape1.svg` as your starting point. It has correct card styling, font sizes, shadows, background, and Elastic logo already baked in. **Do not write SVG from scratch.**
2. **Study the references.** Look at `references/*.svg` and their `.png` renders to understand the visual style — colors, cards, font treatments, spacing.
3. **Follow the task brief** for content and layout. The template defines *how it looks*; the task defines *what to show*.
4. **Render and compare.** After every edit, run `node render.js output.svg output.png` and compare your output to the reference PNGs side-by-side.
5. **Omit complex bitmap elements** Instead, add placeholders and let the user know what they should add instead. The user has access to Pixelmator Pro.

---

## Rendering

- `node render.js <input.svg> <output.png>` — renders SVG to PNG at 1600px wide
- Set the SVG `viewBox` ratio to match the desired aspect ratio (e.g. `2400 1350` for 16:9)
- **Do not modify `render.js`**

## resvg Quirks

- **No web fonts.** resvg only uses locally installed system fonts. Always include fallback chains.
- **Inline styles are more reliable** than `<style>` blocks. Use `style=""` or direct SVG attributes.
- **Use `<tspan>` for inline color changes** inside a single `<text>` — don't use separate `<text>` elements for syntax highlighting.
- **Whitespace in `<tspan>` is collapsed.** For code indentation, use separate `<text>` elements with explicit `x` coordinates.
- **Shadows:** use `filterUnits="objectBoundingBox"` with percentage-based regions to avoid clipping issues.

## Color Palette

| Role | Color |
|------|-------|
| Background | `#F0F3F8` |
| Card fill | `#ffffff` (always white) |
| Card border | `#D3DAE6` (subtle) or `#8B95A5` (strong) |
| Title text | `#1C1E23` |
| Body text | `#3D4250` |
| Muted text | `#5A6068` |
| Dimmed text | `#98A2B3` |
| Code/link | `#0B64DD` |
| String/success | `#36B37E` |

**Accent colors** (one per card/section, on the border stroke):
`#FEC514` (yellow), `#48EFCF` (teal), `#FF957D` (coral), `#F04E98` (pink), `#0B64DD` (blue), `#153385` (navy)

## Fonts

- **Proportional:** `Inter, system-ui, -apple-system, sans-serif`
- **Monospace:** `'Space Mono', 'JetBrains Mono', monospace`

## Font Size Reference

These are the target sizes. The template file already uses these — but if you add or modify text, use this table.

**Note:** These sizes are intentionally ~40% larger than what the reference SVG files contain. The references were created at smaller sizes; we've learned they need to be bigger for YouTube/video readability. Follow this table, not raw values in reference SVGs.

### Summary (by canvas width)

| Context | Title | Body | Labels | Code | Footer |
|---------|-------|------|--------|------|--------|
| Cheat-sheet (860px wide) | 48px | 15.5px | 11.5px | 12.5px | 12px |
| Pipeline/presentation (2400px wide) | 100px | 34–38px | 38px | 36px | 24px |

For other canvas sizes, scale proportionally (title ≈ 4.2% of width, body ≈ 1.4–1.6%, labels ≈ 1.6%, code ≈ 1.5%, footer ≈ 1%).

### Detailed (2400px canvas)

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Title | Inter | 100px | 700 | `#1C1E23` |
| Subtitle | Inter / Space Mono | 50px | 400–700 | `#5A6068` |
| Path/section headers | Inter | 38px | 700 | Accent color |
| Category labels | Inter | 38px | 700 | `#5A6068` |
| Content names | Space Mono | 38px | 700 | `#1C1E23` |
| Featured text | Inter | 46–59px | 700 | `#1C1E23` |
| Model names | Space Mono | 36px | 700 | `#1C1E23` |
| Description text | Inter | 34px | 400 | `#5A6068` |
| Key callout text | Space Mono | 36px | 700 | `#0B64DD` |
| Footer/source | Space Mono | 24px | 700 | `#98A2B3` |

---

## Card / Box Structure

The universal building block across ALL graphic types:

```
┌─────────────────────────┐
│  LABEL (uppercase)       │  ← Inter bold, muted or accent color
│  Content Name            │  ← Space Mono bold, #1C1E23
│                          │
│  (description or detail) │  ← Inter regular, #5A6068
└─────────────────────────┘
```

**Core card styling:**
- `fill="#ffffff"` — always white, never colored/tinted
- Colored `stroke` from the accent palette — each card uses a **different accent color**
- Rounded corners (`rx` proportional to card size)
- Drop shadow via `<filter>` with `feGaussianBlur`
- Text hierarchy: uppercase label → bold content → regular description

**Accent color = stroke only.** The only place accent colors appear as fills are in small label pills (~100×30px rounded-rect with white text). Never on the card itself.

**Sizing:** Cards should fit content snugly (~20–30px padding below last text). Don't create cards that are 50%+ empty space. Cards do NOT all need the same height in a grid.

**Bullet spacing:** ~1.3–1.5× the font size between items (e.g. 34px font → ~45–50px between bullet y-positions). Not 80–100px.

---

## Template Specs

The template `templates/video-graphics-template-landscape1.svg` is a 2400×1350 (16:9) SVG containing:

- **Background:** `#F0F3F8` fill + grid pattern overlay (90px squares, `#5a6068` stroke)
- **Cluster watermark:** Full `elastic-cluster-3d-lightonly.svg` at opacity 0.25, behind all cards
- **Title:** Inter 96px bold, `#1C1E23`, letter-spacing -2.3
- **Subtitle:** Inter 48px, `#5A6068`
- **Cards:** White fill, `#8B95A5` stroke (4.3px), rounded corners, prominent drop shadow (`stdDeviation="12.8"`, `dx="4.3" dy="8.5"`, `flood-opacity="0.18"`)
- **Card header tab:** White rounded-rect overlapping top border, with accent color strip (5px) at top
- **Card header text:** Inter 24.5px bold, `#1C1E23`, letter-spacing 4.7
- **Body text:** Inter ~33px, `#3D4250`
- **Monospace:** Space Mono ~25.6px
- **Footer labels:** Space Mono 25.6px bold, `#5A6068`, letter-spacing 3.2
- **Elastic logo:** Bottom-right, inside a rounded-rect badge with `#FEC514` stroke

**How to use:** Copy the template, then:
1. Replace title and subtitle text
2. Modify/duplicate card groups for your content
3. Change accent colors on card borders and header tabs
4. Adjust card heights to fit content (keep tight)
5. Add/remove cards as needed

---

## Key Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Write SVG from scratch | Copy the template and modify |
| Colored/tinted card backgrounds | White card fill, always |
| Full-width colored header bars | Small accent pill or colored border stroke |
| Guess font sizes | Match the template's sizes (compare rendered output) |
| Thin grey card borders | Thick colored borders from accent palette |
| Force all cards to same height | Size each card to its content |
| Wide bullet spacing (80px+ gaps) | Tight spacing (~1.3–1.5× font size) |

---

## File Structure

```
designer/
├── AGENTS.md              ← This file
├── render.js              ← SVG → PNG rendering script
├── templates/
│   └── video-graphics-template-landscape1.svg  ← COPY THIS as starting point
├── references/
│   ├── mappings.svg / .png
│   ├── vec-sims.svg / .png
│   ├── 202607-search-pipeline.svg / .png
│   ├── 202607-omnimodal-ingestion.svg / .png
│   └── 202607-omnimodal-architecture.svg / .png
├── assets/
│   ├── elastic-cluster-3d-lightonly.svg
│   ├── elastic-3d-cluster.svg
│   └── logo-elastic-horizontal-color.svg
└── tasks/
```

## Workflow

1. Copy the template → `output.svg`
2. Modify content, layout, and card structure to match the task
3. Run `node render.js output.svg output.png`
4. Compare rendered output to reference PNGs — fix any issues
5. Repeat from step 3 until output matches the reference style
