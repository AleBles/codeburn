<h1 align="center">BurnRate</h1>

<p align="center">CLI for monitoring AI token spend and costs.</p>

<p align="center">
  <a href="https://github.com/alebles/burnrate"><img src="https://img.shields.io/badge/runtime-Bun-black?logo=bun" alt="Bun" /></a>
  <a href="https://github.com/alebles/burnrate/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="license" /></a>
</p>

By task type, tool, model, MCP server, and project. Reads session data directly from disk for **Claude Code**, **Codex** (OpenAI), **Cursor**, **cursor-agent**, **Gemini CLI**, **Kiro**, **OpenCode**, **Pi**, **OMP**, and **GitHub Copilot**. Interactive TUI dashboard with gradient charts, responsive panels, and keyboard navigation. CSV/JSON export. Pricing from LiteLLM (auto-cached).

BurnRate is a focused fork of [agentseal/codeburn](https://github.com/getagentseal/codeburn) — only the spend-monitoring core, no menubar app, no waste-finder, no model comparison. Bun-native runtime; no Node required.

## Install

### Via Bun (npm registry)

```bash
bun install -g burnrate
```

Or run without installing:

```bash
bunx burnrate
```

### Single-file binary (no runtime required)

Grab the prebuilt binary for your platform from [Releases](https://github.com/alebles/burnrate/releases):

| Platform | Asset |
| --- | --- |
| macOS (arm64) | `burnrate-darwin-arm64` |
| macOS (x64) | `burnrate-darwin-x64` |
| Linux (x64) | `burnrate-linux-x64` |
| Linux (arm64) | `burnrate-linux-arm64` |
| Windows (x64) | `burnrate-windows-x64.exe` |

```bash
chmod +x burnrate-darwin-arm64
mv burnrate-darwin-arm64 ~/.local/bin/burnrate
```

### Requirements

- **Bun ≥ 1.1** if running from source / npm. **No runtime needed** for the prebuilt binaries.
- Session data from any of: Claude Code (`~/.claude/projects/`), Codex (`~/.codex/sessions/`), Cursor, Gemini CLI (`~/.gemini/tmp/`), Kiro, OpenCode, Pi (`~/.pi/agent/sessions/`), OMP (`~/.omp/agent/sessions/`), or GitHub Copilot (`~/.copilot/session-state/`).

## Usage

```bash
burnrate                        # interactive dashboard (default: 7 days)
burnrate today                  # today's usage
burnrate month                  # this month's usage
burnrate report -p 30days       # rolling 30-day window
burnrate report -p all          # last 6 months
burnrate report --from 2026-04-01 --to 2026-04-10  # exact date range
burnrate report --format json   # full dashboard data as JSON
burnrate report --refresh 60    # auto-refresh every 60s (default: 30s)
burnrate status                 # compact one-liner (today + month)
burnrate status --format json
burnrate export                 # CSV with today, 7 days, 30 days
burnrate export -f json         # JSON export
```

Arrow keys switch between Today / 7 Days / 30 Days / Month / All Time. Press `q` to quit, `1`–`5` as shortcuts, `p` to cycle providers when more than one is detected. The dashboard auto-refreshes every 30 seconds by default (`--refresh 0` to disable).

### JSON output

`report`, `today`, `month`, and `status` all support `--format json`:

```bash
burnrate report --format json | jq '.projects'
burnrate status --format json | jq '.month.cost'
```

The `report` JSON includes overview totals (cost, calls, sessions, cache hit %), daily breakdown, projects (with `avgCostPerSession`), models with token counts, activities with one-shot rates, core tools, MCP servers, and shell commands. `status` is a compact two-period payload (today + month) for shell prompts and dashboards.

### Plan tracking

Track usage against a subscription plan to see API-equivalent overage:

```bash
burnrate plan set claude-max
burnrate plan set custom --monthly-usd 100 --provider claude --reset-day 15
burnrate plan show
burnrate plan reset
```

When a plan is set, the dashboard and JSON output include a `plan` block with budget, spent, percent used, status (`under` / `near` / `over`), projected month-end, and days until reset.

### Filtering

```bash
burnrate report --provider claude
burnrate report --project myapp --project shared-lib   # repeatable
burnrate report --exclude internal                     # repeatable
```

### Currency

```bash
burnrate currency EUR
burnrate currency             # show current currency
burnrate currency --reset     # back to USD
```

Exchange rates are cached for 24h.

### Model aliases

Map a provider's model name to a canonical pricing key (useful for self-hosted or aliased deployments):

```bash
burnrate model-alias my-internal-claude claude-opus-4-6
burnrate model-alias --list
burnrate model-alias --remove my-internal-claude
```

## Development

Bun runs TypeScript directly — there's no build step for development or the npm package.

```bash
bun install
bun src/cli.ts        # run the CLI from source
bun test              # run the test suite
bun run build:binary  # produce a standalone binary (used by the release workflow)
```

## Configuration

| Path / variable | Purpose |
| --- | --- |
| `~/.config/burnrate/config.json` | Persisted currency, plan, and model aliases |
| `~/.cache/burnrate/` | LiteLLM pricing, exchange rates, Cursor results cache |
| `BURNRATE_VERBOSE=1` | Print warnings to stderr on read failures and skipped files |

## License

MIT — see [LICENSE](LICENSE). Forked from [agentseal/codeburn](https://github.com/getagentseal/codeburn) (also MIT).
