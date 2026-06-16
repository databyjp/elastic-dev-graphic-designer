# Infographic Creation Prompt Template

Use this template to instruct an agent to create a new Elastic-branded SVG infographic.

---

## Prompt

```
I need you to create an SVG infographic in the Elastic dev-advocacy style.

**Before you begin, read these files carefully:**
1. `AGENT.md` — contains all design rules, color palette, typography, spacing conventions, and common pitfalls for SVG creation and rendering with resvg.
2. `references/example.svg` — a completed example infographic. Study its structure (cards, tabs, code blocks, inline badges, background decoration) as a template.
3. `references/example.png` — the rendered output of the example, so you can see how it looks.
4. `assets/elastic-3d-cluster.svg` — the Elastic cluster logo to use as background decoration.

**Reference image to recreate:**
old-examples/vec-sims.jpeg

Analyse the reference image and recreate it as an SVG. Match the layout, content, and visual style. Key points:

- Follow the design system in AGENT.md (colors, fonts, spacing, borders, shadows)
- Use `references/example.svg` as your structural template — adapt the card/tab/code-block patterns from it
- Use `render.js` to render after each iteration: `node render.js output.svg output.png`
- Review each render visually — check for text overflow, badge spacing, dead space, shadow clipping
- Size code blocks to fit their content (they don't all need identical dimensions)
- Inline code badge spacing is ad-hoc — render, check, adjust
- Keep cards tight (no dead space at bottom)
- Size the canvas height to fit the content (no fixed aspect ratio)

**Important:** After completing the work, update `AGENT.md` with any new learnings you discover (new pitfalls, layout patterns, font quirks, etc.). These learnings help future agents.

Write the SVG to `output.svg` and render to `output.png`.
```

---

## Notes for adapting this template

- **Different layouts**: The example SVG uses a single-column, 3-card layout. Other infographics (e.g. `old-examples/vec-sims.jpeg`) use 2-column grids, diagram illustrations, formula badges, or summary callouts. The agent should adapt the card structure from `example.svg` to fit the new layout.
- **Diagrams/illustrations**: If the reference contains vector diagrams (e.g. coordinate plots, arrows), these need to be drawn as SVG paths. This is significantly more complex than text-only cards. Consider asking the user to complete those parts, as it may be relatively easy for the use to complete these parts.
- **Content extraction**: The agent needs to read and understand the reference image to extract all text content, code snippets, and structural hierarchy. Providing a text transcript alongside the image can help.
- **Iterative refinement**: Expect 3–5 render-review-adjust cycles. The first render will have spacing issues; this is normal.
