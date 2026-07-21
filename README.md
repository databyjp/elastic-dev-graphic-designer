# Designer

Create Elastic-branded 16:9 SVG graphics for video with a coding agent.

## Quick start

1. Open this repository in your coding-agent environment.
2. Give the agent a task brief in `tasks/` (or describe the graphic you need).
3. Ask it to create the SVG and rendered PNG.

The agent should follow [`AGENTS.md`](AGENTS.md), which defines the required design system and workflow.

## Agent workflow

Ask the agent to:

1. Read `AGENTS.md` and the relevant task brief.
2. Review `references/` for visual direction.
3. Copy `templates/video-graphics-template-landscape1.svg`; do not start an SVG from scratch.
4. Save the result to `output/YYYY-MM-DD-<task-slug>-<shorthash>.svg`.
5. Render and review it:

   ```sh
   node render.js output/<file>.svg output/<file>.png
   ```

6. Iterate until the PNG is readable at video size and matches the established style.

## Repository guide

- `AGENTS.md` — mandatory visual, layout, and output rules
- `tasks/` — task briefs and source requirements
- `templates/` — approved starting SVG template
- `references/` — examples to study before designing
- `assets/` — Elastic logo and graphic assets
- `output/` — generated SVGs and PNGs (ignored by Git)
- `render.js` — SVG-to-PNG renderer; do not modify it

## Example prompt

```text
Read AGENTS.md and tasks/my-graphic.md. Create the requested 2400×1350 SVG
from templates/video-graphics-template-landscape1.svg, save it using the
required output filename convention, render a PNG with render.js, and iterate
after reviewing the result.
```
