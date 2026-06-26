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

### Monospace Font Choice
- **Preferred**: `'Space Mono'` (Elastic brand-aligned), with fallback to `'JetBrains Mono', monospace`
- resvg only uses locally installed fonts. If Space Mono isn't installed, JetBrains Mono is a solid fallback.
- Previous iterations used Source Code Pro / Courier New / Helvetica — `Space Mono` or `JetBrains Mono` give a more distinctive, branded look.

### Monospace Character Width Rule
**At `font-size: 12.5` with monospace fonts, each character is approximately 7.5px wide.**

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

### Code Block Line Spacing
- Default 22px line intervals feel too loose for code. **Use 18px intervals** for tighter, more reference-card-like density.
- This applies to the y-coordinate spacing between consecutive `<text>` elements in code blocks.

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
| Title text | `#1C1E23` | Headings (font-weight 900), bold text |
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


### Section Accent Colors
Each card section has a colored accent strip at the top of its header tab. Use a **different color for each card** from the Elastic brand palette to add visual variety. There is no semantic meaning to the color assignments — they are purely decorative highlights.

**Preferred accent palette** (from Elastic branding):
| Color | Hex |
|-------|-----|
| Yellow | `#FEC514` |
| Teal | `#48EFCF` |
| Coral | `#FF957D` |
| Pink | `#F04E98` |
| Blue | `#0B64DD` |
| Navy | `#153385` |

If more than 6 cards are needed, these additional colors can be used: `#101C3F`, `#343741`, `#36B37E`, `#E0558A`.

All tabs use the same structural pattern: a white rounded-rect tab with a thin (5px) colored strip across the top. Do **not** add extra decorative ribbons or dual-color effects unless the reference explicitly shows them.

### Layout Grid
- **Canvas**: 860px wide, height flexible (size to fit content — no fixed aspect ratio required). Typical range: 1100–1300px tall depending on number of sections.
- **Outer margin**: 36–44px
- **Card width**: 788px (= 860 - 2×36)
- **Card padding**: 24–26px internal
- **Card border**: `stroke="#8B95A5" stroke-width="2"` (dark, thick — not subtle)
- **Card shadow**: prominent `feDropShadow` with `stdDeviation="6"`, `dx="2" dy="4"`, `flood-opacity="0.18"`
- **Card corner radius**: 10px
- **Code block**: right-aligned in card, corner radius=8px. Width and left edge vary per section — **size each code block to fit its content**. Wider code (e.g. long strings) needs a wider box. Don't force all code blocks to identical dimensions.
- **Bullet text column**: x=52 (after 40px indent + 12px for bullet)
- **Bullet text max width**: ~340px (to leave room for code block)
- **Section gap**: ~45px between cards
- **Bottom padding in cards/code blocks**: Keep tight — ~20px below the last content element. Avoid dead space.

### Card Structure Pattern
```
┌─────────────────────────────────────────────┐
│ ┌──[ACCENT BAR]──────────────┐              │
│ │  SECTION HEADER LABEL      │              │
│ └────────────────────────────┘              │
│ Bold intro sentence. Regular continuation.  │
│                                             │
│ • Bullet point 1           ┌─────────────┐  │
│ • Bullet point 2           │ CODE BLOCK  │  │
│ • Bullet with `inline`     │ with syntax │  │
│ • Bullet point 4           │ highlighting│  │
│                            └─────────────┘  │
└─────────────────────────────────────────────┘
```

Keep padding tight — the original reference looks dense/compact. Avoid excessive whitespace between the intro sentence and first bullet, or between bullets.

### Removing Dead Space & Adjusting Canvas Height
Cards and code blocks should be sized to fit their content snugly (~20px padding below the last text element). When shrinking cards:

1. **Shrink from the bottom** — modify the bottom y-coordinates in card `<path>` elements and code block `<path>`/`<rect>` elements
2. **Shift subsequent sections up** using `transform="translate(0, -Npx)"` on section `<g>` groups, where N = cumulative pixels saved by previous sections
3. **Reduce canvas height** to match: update the root `<svg>` `height`, `viewBox`, background `<path>`, and any `<filter>` elements that reference the canvas dimensions

This approach is much simpler than recalculating every absolute y-coordinate within a section — the `translate` on the group moves everything uniformly.

### Header Tab
- Positioned at y=-15 relative to card top (overlapping the border)
- Height: 30px, rounded corners (rx=5)
- Accent color strip: 4px tall at the top of the tab
- Text: uppercase, letter-spacing 2.2, font-size 11.5, font-weight 700
- Use `·` (middle dot) as separator between title parts

### Inline Code Badges
- Background rect with `rx="4"`, fill `#E0E5ED`, stroke `#C5CCD8`
- Add ~8px horizontal padding, ~4px vertical padding around the text
- Monospace font at 13.5px

**Spacing is ad-hoc, not formulaic.** Since inline badges sit between proportional (Inter) text, you cannot calculate their x-position from the preceding text width — proportional fonts vary per character. Instead:
1. Render once with an estimated position
2. Visually check the gap between the preceding word and the badge
3. Adjust the badge rect + text x-coordinates until the gap looks natural (~4–6px)

This applies to all inline code in prose: `dynamic_templates`, `properties`, `emit()`, `Painless`, `Update mapping API`, etc.

### Background Decorations
- **Grid pattern**: 40px squares, very light (`#CBD2DC`, opacity 0.5, stroke-width 0.5)
- **Radiating lines**: bottom-right corner, emanating from corner point, opacity 0.12
- **Cluster watermark**: Use `assets/elastic-cluster-3d-lightonly.svg` — include the full SVG content (all paths, masks, shading) at **large scale (~0.8) and full opacity** (`opacity="1"`). The cluster's own colors (`#e6ebf2` fills, `#1c1e23` strokes, `#f5f7fa` panels) are already light/subtle, so no additional opacity reduction is needed. Position it **behind all cards** (immediately after the background rect/grid in SVG layer order), clipped with a `<clipPath>` to the card area (e.g. starting from y≈300). It should be large and bold, spanning most of the lower canvas and overflowing the right edge — see `references/mappings.svg` for the layering approach.

### Elastic Logo
- Place the full-color horizontal Elastic logo (`assets/logo-elastic-horizontal-color.svg`) in the **bottom-right footer area**, in line with the SOURCE text.
- Scale: `scale(0.16)` — renders at about 82×48px.
- Position: inside the footer `<g>` group, at approximately `translate(740, -2)` relative to the footer group origin.
- The logo SVG contains all brand colors (yellow, teal, pink, blue, green) and the "elastic" wordmark — include all paths directly.

---

## Common Pitfalls

### 1. Monospace text overlap
**Problem**: Placing monospace `<text>` elements at manually-calculated x-positions often leads to overlap or gaps.
**Solution**: Use `<tspan>` inside a single `<text>` element. Only use separate `<text>` for widely-separated columns (e.g. code vs. trailing comment).

### 2. Font not rendering
**Problem**: Text renders in a fallback serif font.
**Solution**: Ensure the font is installed on the system. resvg does NOT load web fonts. Use `font-family` fallback chains with `system-ui` and `-apple-system`.

**For monospace**: Use `'Space Mono', 'JetBrains Mono', monospace` — Space Mono may not be installed everywhere, so always include a fallback that IS installed.

### 3. `<defs>` placement
**Problem**: `<clipPath>` or other defs inside a `<g>` may not work in all renderers.
**Solution**: Place all `<defs>` at the top level of the SVG, or at least ensure IDs are globally unique. (resvg handles nested defs but it's safer to hoist them.)

### 4. Card shadow clipping
**Problem**: Drop shadow filter gets clipped.
**Solution**: When using `filterUnits="userSpaceOnUse"` (absolute coordinates), the filter region must cover the element **in its local coordinate space** (before any `transform`). If a group has `transform="translate(0,-95)"` but the card inside goes to y=1173, the filter `height` must be ≥1173 + shadow extent — even if the canvas is only 1120px tall. Shrinking filter dimensions to match the canvas will clip content that exists beyond the canvas height in local space.

Alternatively, use `filterUnits="objectBoundingBox"` with percentage-based regions (e.g. `x="-5%" width="110%"`) to avoid this entirely.

### 5. Letter-spacing widens header tabs
**Problem**: Section header text with `letter-spacing: 2.2` is wider than expected, overflowing the tab.
**Solution**: Estimate ~1.3× the normal text width when using letter-spacing values > 1. Test and measure.

### 6. Two-column grid layouts
**Problem**: Adapting the single-column card pattern from `references/mappings.svg` to a 2-column grid layout.
**Solution**: Use `<g transform="translate(x, y)">` for each card's position. For an 860px canvas:
- Left column: `translate(36, y)`
- Right column: `translate(440, y)`
- Card width: 384px (= (860 - 72 - 20) / 2, where 72 = margins, 20 = gap)
- Row gap: ~38–42px between card rows

All coordinates inside a card group are **local** (relative to the group origin), making it easy to copy/adjust cards without recalculating absolute positions.

### 7. Diagram areas inside cards
**Problem**: Reference images contain vector diagrams (coordinate plots, arrows) alongside text.
**Solution**: Use a `<rect>` with subtle fill (`#F8F9FC`) and border (`#D3DAE6`) as the diagram container. Size ~150×138px on the left side of the card. Draw axes with light strokes, vectors with colored lines + circles for points, and dashed lines for projections. Keep diagrams schematic — exact geometric accuracy isn't needed; visual clarity is.

### 8. Formula/math badges
**Problem**: Formulas with subscripts, special characters (Σ, √, ‖, ², ÷) need careful rendering.
**Solution**: Use Unicode characters directly in `<tspan>` elements: `Σ`, `√`, `²`, `÷`, `‖`, `·`. Subscripts like `ᵢ` (Unicode subscript i) render correctly in monospace fonts. Avoid trying to position subscripts manually with font-size changes — use Unicode subscript characters when available.

### 9. Card dead space — keep cards tight
**Problem**: Cards end up with large gaps between the last content (e.g. formula badge at y≈154) and the footer separator line (e.g. at y≈210).
**Solution**: Place the footer separator ~14–16px below the last content element. For example, if the formula badge bottom is at y=154, put the separator at y=168, footer text at y=188, and card height at ~198. **Always check for dead space** after initial layout — it's one of the most common issues.

### 10. Text sizing — match reference scale
**Problem**: Initial text sizes (13.5px body, 42px title) appear noticeably smaller than the reference images when rendered.
**Solution**: Use larger text sizes that match the reference proportions:
- Title: **48px** (not 42)
- Subtitle: **16.5px** (not 15)
- Card body text: **15.5px** (not 13.5)
- Card footer text: **12px** (not 10)
- Summary callout title: **24px** (not 21)
- Summary callout body: **14px** (not 12.5)

Always compare the rendered output side-by-side with the reference image to verify text scale.

### 11. Cluster watermark — use full asset, large and bold
**Problem**: Using a simplified silhouette path at low opacity produces a faint grey blob instead of the detailed 3D cluster.
**Solution**: Include the full `elastic-cluster-3d-lightonly.svg` content (all paths, masks, shading groups) at **large scale (0.8+) and opacity 1.0**. The asset's own colors are already subtle. Place it behind all cards using SVG layer order + `<clipPath>` clipping. Do NOT reduce opacity further — the natural colors are the right level of subtlety.

### 12. Plan layout to fit the canvas — not the other way around
**Problem**: Defaulting to single-column with many cards produces infographics far taller than the references (1000–1300px), losing the "at-a-glance" quality.
**Solution**: The references are the target — aim for a similar canvas height. Before writing SVG, look at the content and decide what layout achieves that. Single-column, 2-column, hybrid (mix of full-width and 2-column rows) are all valid. Let the content drive the choice: wide content (code blocks) may need full width; compact content (bullet lists) often fits half-width. When content is too wide for a half-width card, abbreviate — factor out common prefixes, split long lines across two rows, use shorter descriptions.

### 13. Every `<text>` element needs a unique y-position
**Problem**: When manually placing lines in code blocks, it's easy to accidentally assign the same y-coordinate to two lines, causing overlap.
**Solution**: Use consistent 18px intervals and double-check for duplicate y values. This is especially common with closing braces in nested JSON.

### 14. Inline `<tspan>` for mixed font styling
**Problem**: Bullets that mix proportional body text with monospace inline code need multiple font switches within a single line.
**Solution**: Use `<tspan>` elements inside a single `<text>` to switch `font-family` mid-line. Set monospace `<tspan>` to a slightly smaller `font-size` (12–13px vs 15.5px body) for visual balance. Apply `fill="#0B64DD"` to monospace spans to highlight them as code.

### 15. Whitespace in `<tspan>` is collapsed — use explicit x-positions for indentation
**Problem**: Using space characters inside `<tspan>` elements (e.g. `<tspan>    </tspan>` for indentation) doesn't work — SVG collapses multiple whitespace characters, so all code lines render flush-left regardless of intended indentation.
**Solution**: Use separate `<text>` elements with explicit `x` coordinates for each indentation level. Calculate x-offsets from the monospace character width:
- Base (0 indent): `x=354`
- 2-space indent: `x=354 + 2×6.6 = 367` (at font-size 11)
- 4-space indent: `x=354 + 4×6.6 = 380`
- 8-space indent: `x=354 + 8×6.6 = 407`

This is more reliable than `xml:space="preserve"` (which resvg may not fully support) and produces clean, predictable indentation.

### 16. Dark code blocks for JSON/config content
**Problem**: Light code blocks (white/grey backgrounds) don't visually distinguish code from surrounding card content strongly enough.
**Solution**: Use `fill="#1C1E23"` (near-black) on the code block `<rect>` with colored text for syntax highlighting. This creates a "dark editor" aesthetic that stands out well against white cards. Use the standard syntax colors on the dark background:
- Keys: `#0B64DD` (blue)
- Strings: `#36B37E` (green)
- Punctuation: `#5A6068` (muted grey)

### 17. Long code lines — wrap with increased indentation
**Problem**: JSON key-value pairs with long keys (e.g. `"CLAUDE_CODE_ENHANCED_TELEMETRY_BETA"`) and values don't fit on a single line in the code block.
**Solution**: Break the line after the `:` and render the value on the next line with double indentation (8 spaces). This preserves readability while fitting within the code block width:
```
"OTEL_EXPORTER_OTLP_ENDPOINT":     ← key line at 4-space indent
    "https://<elastic-endpoint>",   ← value line at 8-space indent
```

### 18. Hybrid layouts — full-width + 2-column rows
**Problem**: Some infographics have a mix of wide content (like JSON configs) and compact content (bullet lists, metric tables).
**Solution**: Use a hybrid layout: full-width cards for content that needs horizontal space (code blocks, tables), then 2-column rows for compact content. This keeps the canvas height within the 1000–1300px target while giving each card the width it needs. The full-width card uses the standard 788px width; the 2-column cards use 384px each.

---

## Design System — Pipeline & Architecture Diagrams

For large-format pipeline/flow diagrams (e.g. ingestion flows, search architectures), a different set of patterns applies compared to the compact cheat-sheet style above. These diagrams are designed for **video/streaming presentation** at 16:9 aspect ratio.

### Reference Examples
All pipeline references are in `references/` with matching PNG renders:
- **Search pipeline**: `references/202607-search-pipeline.svg` (.png) — multi-path search with converging kNN
- **Ingestion pipeline**: `references/202607-omnimodal-ingestion.svg` (.png) — video indexing flow with forking paths, unified encoder, ES output
- **Architecture overview**: `references/202607-omnimodal-architecture.svg` (.png) — system components diagram

### Canvas & Aspect Ratio
- **Canvas**: 4800×2700 (16:9 ratio) for YouTube/streaming-friendly dimensions
- **Background**: `#F0F3F8` full-canvas fill, same as cheat-sheet style
- **Grid overlay**: Use a `<pattern>` fill on the canvas border (`stroke="#5a6068" stroke-width="7.5"`) for subtle grid texture
- **Decorative watermark**: Elastic cluster illustration at low opacity (`0.1–0.25`) behind content, clipped to canvas area

### Font Size Hierarchy for Streaming Readability
Pipeline diagrams must be readable on video streams and presentation screens. Use much larger fonts than cheat-sheets:

| Element | Font | Size | Weight | Color | Notes |
|---------|------|------|--------|-------|-------|
| **Title** | Inter | 144px | 700 | `#1C1E23` | Negative letter-spacing (-3.4) for tight display type |
| **Subtitle** | Inter / Space Mono mix | 72px | 400–700 | `#5A6068` | Use Space Mono bold for technical terms inline |
| **Path/section headers** | Inter | 54px | 700 | Accent color | e.g. "TEXT PATH", "VOICE PIPELINE PATH" — use path's accent color |
| **Category labels** | Inter | 54px | 700 | `#5A6068` | e.g. "INPUT", "TRANSCRIBE", "EMBED" — with `letter-spacing="6"` |
| **Content names** | Space Mono | 54px | 700 | `#1C1E23` | e.g. "Whisper", "ffmpeg", "Text Query" |
| **Featured text** | Inter | 66–84px | 700 | `#1C1E23` | e.g. "Omnimodal encoder", "kNN Search" — hero elements |
| **Model names** | Space Mono | 51px | 700 | `#1C1E23` | e.g. "jina-embeddings / -v5-omni" |
| **Description text** | Inter | 48px | 400 | `#5A6068` | Supporting info: "One model embeds all modalities..." |
| **Section sub-headers** | Inter | 48px | 700 | `#5A6068` | e.g. "EMBEDS", "OUTPUT", "INPUTS" — with `letter-spacing="5"` |
| **Modality items** | Inter | 54px | 400 | `#1C1E23` | e.g. "Text", "Audio", "Video", "Image" |
| **Key callout text** | Space Mono | 51px | 700 | `#0B64DD` | e.g. "compatible vectors", "into one vector space" |
| **Table row labels** | Inter | 54px | 700 | `#1C1E23` | Bottom comparison table path names |
| **Table step counts** | Space Mono | 48px | 700 | Accent color | e.g. "1 step", "3 steps" — colored per path |
| **Table descriptions** | Inter | 45px | 400 | `#5A6068` | e.g. "embed text → search" |
| **Tech pills (small)** | Space Mono | 36px | 400 | `#1C1E23` | Tool names in comparison tables |
| **Footer/source** | Space Mono | 33px | 700 | `#98A2B3` | Bottom attribution |

**Key principle**: Structural labels (what the step IS) should be large and bold for at-a-glance scanning. Technical details (specific tool names, descriptions) can be smaller — they provide context without competing for attention.

### Card/Box Structure
Pipeline steps use **white rounded-rect cards** with colored borders and drop shadows:

```
┌─────────────────────────┐
│  CATEGORY LABEL          │  ← Inter 54px bold, #5A6068, letter-spacing 6
│  Content Name            │  ← Space Mono 54px bold, #1C1E23
│                          │
│  (optional description)  │  ← Inter 48px, #5A6068
└─────────────────────────┘
```

**Card styling**:
- `fill="#ffffff"` white background
- `stroke-width="7.5"` colored border — each card uses a **different accent color** from the palette
- `rx` for rounded corners (matching the card size — larger cards get larger radii)
- Drop shadow via `<filter>` with `feGaussianBlur stdDeviation="18"` — prominent shadow for depth
- **No header tab** (unlike cheat-sheet cards) — the colored border IS the accent

**Accent color assignments** (one per logical group):
| Color | Hex | Usage Example |
|-------|-----|---------------|
| Blue | `#0B64DD` | Text input path |
| Pink | `#F04E98` | Voice pipeline path |
| Green | `#9ADC30` | Direct audio path |
| Orange | `#FF957D` | Processing steps (Whisper, LLM) |
| Yellow | `#FEC514` | Encoder (spanning box) |
| Teal | `#48EFCF` | Elasticsearch/output (spanning box) |
| Dark | `#1C1E23` | Final output |
| Muted | `#8B95A5` | Neutral/utility boxes (ffmpeg, comparison table) |

### Spanning Boxes
When a component serves multiple paths (e.g. an omnimodal encoder or kNN search), use a **tall spanning box** that visually bridges all paths:

- Taller `stroke-width="9"` border (thicker than regular cards)
- Contains multiple sub-sections separated by `#D3DAE6` divider lines
- Internal structure: category label → model name → description → divider → sub-section → divider → output section
- All paths' arrows converge into/emerge from this single box

### Dashed-Border Grouping Regions
Use dashed-stroke rounded rects to group related steps into logical phases:

```svg
<path fill="none" stroke="#8B95A5" stroke-width="6.85"
      stroke-dasharray="27.4 13.7" d="M ... Z"/>
```

- **Outer group** (e.g. "FOR EACH SCENE"): `stroke="#8B95A5"` (gray), `stroke-width ~7`, larger dash pattern
- **Sub-groups** (e.g. "EMBED TRANSCRIPT"): Path's accent color, `stroke-width ~3.4`, smaller dash pattern
- Label the region with a bold Inter text element positioned at the top-left of the dashed border

### Arrows & Flow Lines
Connecting arrows between cards use simple straight lines:

```svg
<path fill="#000000" stroke="#5A6068" stroke-width="7.5"
      d="M 684 630 L 1944 630"/>
```

- **Color**: `#5A6068` (muted gray) — uniform across all arrows
- **Stroke width**: `7.5` for main flow lines
- **No arrowheads** in the final designs — the flow direction is implied by left-to-right reading order and the visual hierarchy
- **Dashed arrows** for secondary/internal flows: `stroke-dasharray="26 16"` with same gray color

### Gradient & Color Indicator Dots
Use small gradient-filled rounded rects as modality indicators:

```svg
<linearGradient id="gradient1">
  <stop offset="0" stop-color="#02bcb7"/>  <!-- teal for audio/video -->
  <stop offset="1" stop-color="#f04e98"/>  <!-- pink for text -->
</linearGradient>
<path fill="url(#gradient1)" d="M ... Z" rx="9"/>  <!-- 18×36 colored dot -->
```

These provide subtle visual cues for which modalities a component handles.

### Modality Pills
For encoder/model boxes that handle multiple modalities, show capability with colored pills:

| Modality | Background | Text Color | Label Font |
|----------|-----------|------------|------------|
| video | `#02bcb7` | white | Inter 38px bold |
| audio | `#02bcb7` | white | Inter 38px bold |
| image | `#FEC514` | `#D4A017` | Inter 38px bold |
| text | `#F04E98` | white | Inter 38px bold |

Distribute pills evenly across the encoder box bottom area with consistent spacing.

### Bottom Comparison Table
Include a summary comparison table at the bottom of pipeline diagrams:

- White rounded-rect container with muted border (`stroke="#8B95A5" stroke-width="6"`)
- Horizontal divider lines (`stroke="#D3DAE6" stroke-width="3"`) between rows
- **Column alignment** (use consistent x-positions across all rows):
  - Path name: ~x=300
  - Step count: ~x=860
  - Description: ~x=1220
  - Tech pills: ~x=2370+
- **Key insight row** at the bottom with bold label + explanatory text

### Branding Badge
Top-right corner badge with colored border:

```svg
<path fill="#F0F3F8" stroke="#FEC514" stroke-width="8"
      stroke-linecap="round" stroke-linejoin="round"
      d="M ... Z" rx="40"/>  <!-- rounded rect -->
```

Contains logo or wordmark, with a vertical divider line inside.

### Layout Principles for Pipeline Diagrams

1. **Left-to-right flow**: Input → Processing → Encoding → Storage/Output
2. **Parallel paths stack vertically**: Multiple input paths arranged top-to-bottom with consistent vertical spacing (~534px between path centers)
3. **Convergence points**: Use spanning boxes where paths merge
4. **Divergence points**: Show forking with dashed-border regions containing sub-paths
5. **Generous spacing**: Cards need breathing room — minimum ~60px gaps between elements
6. **Title block**: Top-left, with title (144px) and subtitle (72px) establishing context before the diagram
7. **Comparison table**: Bottom section summarizing paths/options — always include for multi-path diagrams
8. **Keep technical detail subordinate**: Category labels ("TRANSCRIBE") and structural labels ("FOR EACH SCENE") should dominate; tool names ("Whisper") and descriptions are supporting detail

---

## File Structure
```
designer/
├── AGENT.md              ← This file (design learnings & rules)
├── PROMPT_TEMPLATE.md    ← Template prompt for creating new infographics
├── render.js             ← SVG → PNG rendering script
├── references/
│   ├── mappings.svg      ← Cheat-sheet example: single-column, 3-card (Elasticsearch mappings)
│   ├── mappings.png
│   ├── vec-sims.svg      ← Cheat-sheet example: 2-column grid, 5 metric cards (vector similarity)
│   ├── vec-sims.png
│   ├── 202607-search-pipeline.svg      ← Pipeline example: multi-path search (16:9, 4800×2700)
│   ├── 202607-search-pipeline.png
│   ├── 202607-omnimodal-ingestion.svg  ← Pipeline example: video ingestion with forking paths
│   ├── 202607-omnimodal-ingestion.png
│   ├── 202607-omnimodal-architecture.svg ← Pipeline example: system architecture overview
│   └── 202607-omnimodal-architecture.png
├── assets/
│   ├── elastic-cluster-3d-lightonly.svg  ← 3D cluster decoration (light bg variant, use this one)
│   ├── elastic-3d-cluster.svg           ← Full cluster (both variants)
│   └── logo-elastic-horizontal-color.svg ← Elastic horizontal logo (full color)
├── old-examples/
│   ├── mappings.jpeg     ← Original reference for mappings.svg (single-column, 3-card)
│   └── vec-sims.jpeg     ← Original reference for vec-sims.svg (2-column grid, 5 metric cards + summary)
└── tasks/
    └── 26-06-omni-search/ ← Pipeline diagram task (original working files)

## Iterative Workflow
1. Write/edit your SVG (e.g. `output.svg`)
2. Run `node render.js output.svg output.png`
3. Review the PNG — check for text overlap, alignment, missing fonts
4. Adjust and repeat

Typical issues per iteration:
- **Iter 1**: Layout structure, rough positioning → discover font fallback issues, text overlap
- **Iter 2**: Fix monospace spacing by switching to `<tspan>` → discover inline code badge misalignment
- **Iter 3**: Fine-tune positions, verify final output
