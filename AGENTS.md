# Agent Design Notes — SVG Infographic Creation

## Prime Directive

1. **Start from the template.** Copy `templates/video-graphics-template-landscape1.svg` as your starting point. It has correct card styling, font sizes, shadows, background, and Elastic logo already baked in. **Do not write SVG from scratch.**
2. **Study the references.** Look at `references/*.svg` and their `.png` renders to understand the visual style — colors, cards, font treatments, spacing.
3. **Follow the task brief** for content and layout. The template defines *how it looks*; the task defines *what to show*.
4. **Render and compare.** After every edit, run `node render.js output.svg output.png` and compare your output to the reference PNGs side-by-side.

---

## Post-Render Checklist

After each render, check **every item**. Fix failures before moving on.

### Starting Point
- [ ] Did you start from the template file? (Don't write SVG from scratch)

### Completeness
- [ ] **Title** is present (large, bold, Inter)
- [ ] **Subtitle** is present below the title
- [ ] **All content from the task brief** is represented
- [ ] **Footer** with SOURCE attribution is present
- [ ] **Elastic logo** is in the footer area

### Typography
- [ ] Title looks the same size as in the reference PNGs (compare side-by-side)
- [ ] Body text is readable at the same zoom as references
- [ ] No text overlaps or gets cut off

### Card Styling
- [ ] Every card has **white fill** (`#ffffff`) — no colored/tinted backgrounds
- [ ] Every card has a **thick colored stroke** (accent border) — not thin grey lines
- [ ] Every card has a **drop shadow**
- [ ] Accent colors are on **borders only** — no full-width colored header bars

### Layout & Density
- [ ] No dead space inside cards (last text to card bottom: ~20–30px, not 100px+)
- [ ] No dead space between cards (gaps: 20–40px, not 80px+)
- [ ] Bullet spacing is tight (~1.3–1.5× font size between items)
- [ ] Cards are sized to fit content — **not** forced to uniform height

### Comparison
- [ ] Does your output look like it belongs in the same family as the references?

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
4. Run through the Post-Render Checklist
5. Fix issues and repeat from step 3
