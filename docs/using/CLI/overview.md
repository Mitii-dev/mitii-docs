# CLI Overview

`@mitii/cli` is the headless command-line interface for Mitii. It sits on top of `@mitii/sdk` → `@mitii/v8`, with `@mitii/host` providing indexing, checkpoints, memory, and skills.

## Install

```bash
npm install -g @mitii/cli
# or run without installing:
npx @mitii/cli --help
```

### Requirements

| Requirement | Details |
|---|---|
| **Node.js** | 20+ (Discord/Slack bridges need **Node 22+** for built-in WebSocket) |
| **Native dependency** | `better-sqlite3` (bundled) |
| **Optional** | LanceDB (vector search) |
| **License** | AGPL-3.0-or-later |

> **Note:** Legacy npm `@mitii/cli@2.7.x` is a different binary stack. Prefer versions published from this monorepo on `v*` release tags.

### Local development build

```bash
pnpm --filter @mitii/cli build
node apps/cli/bin/mitii.js --help
```

## Quick start

```bash
mitii --help                              # see all commands
mitii setup                               # pick a provider, write .mitii/config.json
export ANTHROPIC_API_KEY=sk-ant-...       # or GEMINI_ / OPENAI_ / MITII_API_KEY
mitii session                             # interactive loop with dotted MITII banner
```

Smoke-test without a live model:

```bash
mitii ask "What is recursion?" --echo
mitii review --preview
mitii review --from main --to HEAD --format sarif --output review.sarif
mitii ask "Review the working-tree changes" --mode ask --skill code-review-and-quality --echo
```

Check what is configured (never prints secrets):

```bash
mitii setup --show
mitii -v                     # or: mitii --version / mitii version
```

## What you can do

| Task | Command |
|---|---|
| Ask a question (streaming) | `mitii ask "…"` |
| Interactive session | `mitii session` |
| Unattended CI run | `mitii run --auto "…"` |
| Draft commit message | `mitii commit-message` |
| Draft PR body | `mitii pr-summary` |
| Draft changelog entry | `mitii changelog` |
| Index the workspace | `mitii index` |
| Deterministic review / SARIF | `mitii review` |
| Show repo state | `mitii status --json` |
| Export a session | `mitii export-session "…" --out session.json` |
| Bridge to Telegram / Discord / Slack | `mitii connect` |
| List available channel adapters | `mitii connect` (no args) |
| Run a parameterized recipe | `mitii recipe run <id> --param key=value` |
| GitHub PRs / issues via `gh` | `mitii run --auto "…" --mode agent` (with `gh` installed) |
| Automation schedules | `mitii schedule` |
| Long-lived daemon | `mitii serve` |
| Ingest / list automation events | `mitii events` |
| Web search (SearXNG) | Configure `searxngBaseUrl` or `SEARXNG_BASE_URL` |

## Next steps

- [Setup & Providers](./setup) — configure a model provider and verify your config
- [Commands & Options](./commands) — full reference for every subcommand and flag
- [Providers](./providers) — supported providers and API key management
- [Skills](./skills) — use the skill system from the CLI
- [Development](./development) — build, test, and run the CLI locally
