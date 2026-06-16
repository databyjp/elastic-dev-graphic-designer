# Infographic Creation Prompt Template

Use this template to instruct an agent to create a new Elastic-branded SVG infographic.

---

## Prompt

```
I need you to create an SVG infographic in the Elastic dev-advocacy style.

**Before you begin, read these files carefully:**
1. `AGENT.md` — contains all design rules, color palette, typography, spacing conventions, and common pitfalls for SVG creation and rendering with resvg.
2. `references/mappings.svg` — a completed single-column example infographic. Study its structure (cards, tabs, code blocks, inline badges, background decoration) as a template.
3. `references/mappings.png` — the rendered output, so you can see how it looks.
4. `references/vec-sims.svg` — a completed 2-column grid example with diagrams, formula badges, and a summary callout.
5. `references/vec-sims.png` — the rendered output of the 2-column example.
6. `assets/elastic-cluster-3d-lightonly.svg` — the Elastic cluster decoration for the background.
7. `assets/logo-elastic-horizontal-color.svg` — the Elastic logo (place in bottom-right footer).

**Topic:** [DESCRIBE THE TOPIC HERE]

**Content / key points to include:**
[LIST THE KEY CONTENT, CODE SNIPPETS, STEPS, ETC.]

**Reference image (if available):**
[PATH TO REFERENCE IMAGE, OR "None — design from scratch based on content above"]

**Layout preference:**
[e.g. "single-column like mappings.svg", "2-column grid like vec-sims.svg", or "your best judgment"]

---

Analyse the content and create an SVG infographic. Key instructions:

- Follow the design system in AGENT.md (colors, fonts, spacing, borders, shadows)
- Use the reference SVGs as your structural template — adapt the card/tab/code-block patterns
- Use a **different accent color** for each card tab from the Elastic palette: #FEC514, #48EFCF, #FF957D, #F04E98, #0B64DD, #153385
- Place the Elastic logo in the **bottom-right footer** area (scale 0.16, alongside the SOURCE line)
- Place the cluster watermark **behind cards at full opacity** using `assets/elastic-cluster-3d-lightonly.svg` at large scale (~0.8)
- Use `render.js` to render after each iteration: `node render.js output.svg output.png`
- Review each render visually — check for text overflow, badge spacing, dead space, shadow clipping
- Keep cards tight (no dead space at bottom — footer separator ~14px below last content)
- Use large, readable text sizes (title 48px, body 15.5px, card footer 12px — see AGENT.md)
- Size the canvas height to fit the content (860px wide, no fixed aspect ratio)

**Important:** After completing the work, update `AGENT.md` with any new learnings you discover (new pitfalls, layout patterns, font quirks, etc.).

Write the SVG to `output.svg` and render to `output.png`.
```

---

## Example: Monitor Claude Code with Elastic

Below is a filled-in example of the template for a specific infographic.

```
I need you to create an SVG infographic in the Elastic dev-advocacy style.

**Before you begin, read these files carefully:**
1. `AGENT.md` — contains all design rules, color palette, typography, spacing conventions, and common pitfalls for SVG creation and rendering with resvg.
2. `references/mappings.svg` — a completed single-column example infographic. Study its structure (cards, tabs, code blocks, inline badges, background decoration) as a template.
3. `references/mappings.png` — the rendered output, so you can see how it looks.
4. `references/vec-sims.svg` — a completed 2-column grid example with diagrams, formula badges, and a summary callout.
5. `references/vec-sims.png` — the rendered output of the 2-column example.
6. `assets/elastic-cluster-3d-lightonly.svg` — the Elastic cluster decoration for the background.
7. `assets/logo-elastic-horizontal-color.svg` — the Elastic logo (place in bottom-right footer).

**Topic:** How to monitor Claude Code usage with Elastic using OpenTelemetry

**Content / key points to include:**

The infographic should walk through setting up Claude Code's built-in OpenTelemetry instrumentation to send metrics, logs, and traces to an Elastic Cloud instance. It should cover:

**Card 1 — SETUP · ENABLE TELEMETRY**
Claude Code has built-in OpenTelemetry support. Enable it by adding environment variables to `~/.claude/settings.json`. No collector or sidecar needed — Claude Code exports directly via OTLP.

Code block — the settings.json config:
```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_TRACES_EXPORTER": "otlp",
    "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/protobuf",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "https://<your-elastic-endpoint>",
    "OTEL_EXPORTER_OTLP_HEADERS": "Authorization=ApiKey <your-api-key>",
    "OTEL_SERVICE_NAME": "claude-code"
  }
}
```

Key points:
- `CLAUDE_CODE_ENABLE_TELEMETRY=1` is required to activate any telemetry
- `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1` enables distributed traces (beta)
- Set all three exporters (metrics, logs, traces) to `otlp`
- Use `http/protobuf` protocol for Elastic Cloud ingest
- The endpoint is your Elastic Cloud OTLP ingest URL
- Auth via API key in the headers

**Card 2 — METRICS · WHAT YOU GET**
Claude Code exports these metrics automatically:

| Metric | Description |
|--------|-------------|
| `claude_code.cost.usage` | Cost per API request (USD) |
| `claude_code.token.usage` | Token count by type (input/output/cache) |
| `claude_code.session.count` | Sessions started |
| `claude_code.lines_of_code.count` | Lines added/removed |
| `claude_code.commit.count` | Git commits created |
| `claude_code.pull_request.count` | PRs created |
| `claude_code.active_time.total` | Active time in seconds |

All metrics include attributes: `session.id`, `user.id`, `model`, and optional `organization.id`.

**Card 3 — EVENTS · DETAILED ACTIVITY LOG**
With the logs exporter enabled, Claude Code sends structured events for every action:
- `user_prompt` — each prompt submitted (content redacted by default)
- `api_request` — every API call with model, cost, tokens, duration
- `tool_result` — tool executions with success/failure and timing
- `tool_decision` — permission accept/reject decisions
- `api_error` — failed API requests with status codes

Enable `OTEL_LOG_TOOL_DETAILS=1` to include Bash commands, MCP server/tool names, and file paths in events.

**Card 4 — TRACES · END-TO-END VISIBILITY (BETA)**
With tracing enabled, each user prompt becomes a trace:

```
claude_code.interaction
├── claude_code.llm_request
└── claude_code.tool
    ├── claude_code.tool.blocked_on_user
    └── claude_code.tool.execution
```

Traces link prompts → API calls → tool executions. Subagent spans nest under parent tools. Bash subprocesses inherit `TRACEPARENT` for distributed tracing.

**Card 5 or Summary — TUNE YOUR SETUP**
Quick-reference for optional settings:
- `OTEL_METRIC_EXPORT_INTERVAL=10000` — faster metrics (default 60s)
- `OTEL_LOG_USER_PROMPTS=1` — include prompt text in events
- `OTEL_LOG_TOOL_DETAILS=1` — include command details
- `OTEL_LOG_TOOL_CONTENT=1` — include tool input/output in traces
- `OTEL_RESOURCE_ATTRIBUTES="team=platform,dept=eng"` — add custom labels

**Footer source:** code.claude.com/docs/en/monitoring-usage

**Reference image:** None — design from scratch based on content above.

**Layout preference:** Single-column (like mappings.svg) — the code blocks and tables are wide, so full-width cards work best. Use 4–5 cards.

---

Analyse the content and create an SVG infographic. Key instructions:

- Follow the design system in AGENT.md (colors, fonts, spacing, borders, shadows)
- Use the reference SVGs as your structural template — adapt the card/tab/code-block patterns
- Use a **different accent color** for each card tab from the Elastic palette: #FEC514, #48EFCF, #FF957D, #F04E98, #0B64DD, #153385
- Place the Elastic logo in the **bottom-right footer** area (scale 0.16, alongside the SOURCE line)
- Place the cluster watermark **behind cards at full opacity** using `assets/elastic-cluster-3d-lightonly.svg` at large scale (~0.8)
- Use `render.js` to render after each iteration: `node render.js output.svg output.png`
- Review each render visually — check for text overflow, badge spacing, dead space, shadow clipping
- Keep cards tight (no dead space at bottom — footer separator ~14px below last content)
- Use large, readable text sizes (title 48px, body 15.5px, card footer 12px — see AGENT.md)
- Size the canvas height to fit the content (860px wide, no fixed aspect ratio)

**Important:** After completing the work, update `AGENT.md` with any new learnings you discover (new pitfalls, layout patterns, font quirks, etc.).

Write the SVG to `output.svg` and render to `output.png`.
```

---

## Notes for adapting this template

- **Different layouts**: `references/mappings.svg` is single-column with 3 cards + code blocks. `references/vec-sims.svg` is a 2-column grid with 5 metric cards + summary callout. Choose the layout that fits your content width.
- **Code blocks**: Right-aligned in cards, sized to fit content. Wider code needs wider blocks — don't force identical dimensions.
- **Diagrams/illustrations**: Vector diagrams (coordinate plots, arrows, flow charts) must be drawn as SVG paths. This is significantly more complex than text-only cards. Consider simplifying or providing sketch references.
- **Content extraction**: When recreating from a reference image, the agent needs to extract all text. Providing a text transcript alongside the image helps significantly.
- **Iterative refinement**: Expect 3–5 render-review-adjust cycles. The first render will have spacing issues; this is normal.
- **Accent colors**: Use one distinct color per card from the palette: `#FEC514`, `#48EFCF`, `#FF957D`, `#F04E98`, `#0B64DD`, `#153385`. Additional colors if needed: `#101C3F`, `#343741`, `#36B37E`.
