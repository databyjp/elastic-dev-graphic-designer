# Agent Design Notes — SVG Infographic Creation

## Overview
This project creates SVG infographics (e.g. Elastic dev-advocacy cheat-sheets) and renders them to PNG via `@resvg/resvg-js`. This file captures key learnings for any agent recreating or extending these designs.

---

## Rendering Pipeline

### Setup
- **resvg-js** is installed globally at `/Users/jphwang/.local/share/mise/installs/node/22.22.0/lib/node_modules/@resvg/resvg-js`
- Use `render.js` to convert SVG → PNG: `node render.js <input.svg> <output.png>`
- resvg loads system fonts, so `font-family` values should include fallbacks (e.g. `Inter, system-ui, -apple-system, sans-serif`)

### Important: resvg Limitations
- **No CSS `@import` or Google Fonts loading.** resvg does not fetch external resources. It only uses locally installed system fonts. If the font isn't installed on the system, it falls back silently.
- **`<style>` blocks are partially supported.** Inline `style=""` attributes or direct SVG attributes (e.g. `font-weight="700"`) are more reliable than `<style>` rules.
- **Filters work** (`<feDropShadow>`, etc.) but keep them simple — complex filter chains can slow rendering.

---

## Typography & Font Sizing

### Monospace Character Width Rule
**At `font-size: 12.5` with Source Code Pro / Courier New, each character is approximately 7.5px wide.**

This is critical for aligning code blocks. Use this formula:
```
x_position = base_x + (column_number × 7.5)
```

For other monospace sizes, scale proportionally:
| Font Size | Approx Char Width |
|-----------|------------------|
| 11        | ~6.6px           |
| 12        | ~7.2px           |
| 12.5      | ~7.5px           |
| 13        | ~7.8px           |
| 14        | ~8.4px           |

### Proportional (Inter) Text
- **Do not try to calculate exact pixel widths** for proportional fonts. They vary by character.
- For inline code badges within prose, estimate width by character count × ~7.5px (for the monospace portion) and add ~12px padding.
- For section header text with `letter-spacing: 2.2`, the text will be roughly 20-30% wider than default.

### Using `<tspan>` for Inline Color Changes
Use `<tspan>` elements inside a single `<text>` for syntax highlighting:
```xml
<text x="435" y="120">
  <tspan fill="#0B64DD">"title"</tspan>
  <tspan fill="#5A6068">: </tspan>
  <tspan fill="#36B37E">"Hello"</tspan>
  <tspan fill="#5A6068">,</tspan>
</text>
```
**This is much better than separate `<text>` elements** because:
1. Character spacing is natural — the browser/renderer advances the cursor correctly
2. No need to manually calculate x-positions for each colored segment
3. Fewer elements = simpler SVG

**Only use separate `<text>` elements** when you need a large gap (e.g. aligning comments at a fixed column away from code).

---

## Design System — Elastic Infographic Style

### Color Palette
| Role | Color | Usage |
|------|-------|-------|
| Background | `#F0F3F8` | Page fill |
| Card fill | `white` | Card backgrounds |
| Card border | `#D3DAE6` | Subtle borders |
| Title text | `#1C1E23` | Headings, bold text |
| Body text | `#3D4250` | Paragraphs, bullets |
| Muted text | `#98A2B3` | Code comments |
| Code key | `#0B64DD` | JSON keys, PUT/GET verbs |
| Code string | `#36B37E` | String values, POST verb |
| Code number | `#D94C4C` | Numeric values |
| Code punct | `#5A6068` | Brackets, colons, commas |
| Inline code bg | `#E6EBF2` | Badge background for inline code |
| Accent green | `#36B37E` | Dynamic mapping section |
| Accent blue | `#0B64DD` | Explicit mapping section |
| Accent pink | `#E0558A` | Runtime fields section |
| Accent teal | `#00BFB3` | Runtime fields gradient start |

### Section Accent Colors
Each card section has a colored accent strip at the top of its header tab. The color communicates the "level" of the concept:
- **Green** = easy/starter
- **Blue** = recommended/production
- **Pink/Magenta** = advanced/specialized

### Layout Grid
- **Canvas**: 860 × 1280 (roughly 2:3 aspect ratio)
- **Outer margin**: 36–44px
- **Card width**: 788px (= 860 - 2×36)
- **Card padding**: 24–26px internal
- **Card corner radius**: 10px
- **Code block**: starts at x=406 inside card, width=368, corner radius=8px
- **Bullet text column**: x=52 (after 40px indent + 12px for bullet)
- **Bullet text max width**: ~340px (to leave room for code block)
- **Section gap**: ~45px between cards

### Card Structure Pattern
```
┌─────────────────────────────────────────────┐
│ ┌──[ACCENT BAR]──────────────┐              │
│ │  SECTION HEADER LABEL      │              │
│ └────────────────────────────┘              │
│                                             │
│ Bold intro sentence. Regular continuation.  │
│                                             │
│ • Bullet point 1           ┌─────────────┐  │
│ • Bullet point 2           │ CODE BLOCK  │  │
│ • Bullet with `inline`     │ with syntax │  │
│ • Bullet point 4           │ highlighting│  │
│                            └─────────────┘  │
└─────────────────────────────────────────────┘
```

### Header Tab
- Positioned at y=-15 relative to card top (overlapping the border)
- Height: 30px, rounded corners (rx=5)
- Accent color strip: 4px tall at the top of the tab
- Text: uppercase, letter-spacing 2.2, font-size 11.5, font-weight 700
- Use `·` (middle dot) as separator between title parts

### Inline Code Badges
- Background rect with `rx="4"`, fill `#E6EBF2`
- Add ~8px horizontal padding, ~4px vertical padding around the text
- Monospace font at 12.5px

### Background Decorations
- **Grid pattern**: 40px squares, very light (`#CBD2DC`, opacity 0.5, stroke-width 0.5)
- **Radiating lines**: bottom-right corner, emanating from corner point, opacity 0.12
- **Cluster watermark**: the Elastic 3D cluster SVG path, opacity 0.05, scaled ~0.26, positioned in bottom-right

---

## Common Pitfalls

### 1. Monospace text overlap
**Problem**: Placing monospace `<text>` elements at manually-calculated x-positions often leads to overlap or gaps.
**Solution**: Use `<tspan>` inside a single `<text>` element. Only use separate `<text>` for widely-separated columns (e.g. code vs. trailing comment).

### 2. Font not rendering
**Problem**: Text renders in a fallback serif font.
**Solution**: Ensure the font is installed on the system. resvg does NOT load web fonts. Use `font-family` fallback chains with `system-ui` and `-apple-system`.

### 3. `<defs>` placement
**Problem**: `<clipPath>` or other defs inside a `<g>` may not work in all renderers.
**Solution**: Place all `<defs>` at the top level of the SVG, or at least ensure IDs are globally unique. (resvg handles nested defs but it's safer to hoist them.)

### 4. Card shadow clipping
**Problem**: Drop shadow filter gets clipped by the SVG viewport.
**Solution**: Use `x="-2%" y="-1%" width="104%" height="104%"` on the filter element to expand the filter region.

### 5. Letter-spacing widens header tabs
**Problem**: Section header text with `letter-spacing: 2.2` is wider than expected, overflowing the tab.
**Solution**: Estimate ~1.3× the normal text width when using letter-spacing values > 1. Test and measure.

---

## File Structure
```
designer/
├── AGENT.md              ← This file (design learnings)
├── render.js             ← SVG → PNG rendering script
├── output.svg            ← Generated infographic SVG
├── output.png            ← Rendered PNG
├── assets/
│   └── elastic-3d-cluster.svg  ← Cluster logo (two variants: light bg + blue bg)
└── examples/
    └── mappings.jpeg     ← Original reference image
```

## Iterative Workflow
1. Write/edit `output.svg`
2. Run `node render.js output.svg output.png`
3. Review the PNG — check for text overlap, alignment, missing fonts
4. Adjust and repeat

Typical issues per iteration:
- **Iter 1**: Layout structure, rough positioning → discover font fallback issues, text overlap
- **Iter 2**: Fix monospace spacing by switching to `<tspan>` → discover inline code badge misalignment
- **Iter 3**: Fine-tune positions, verify final output
