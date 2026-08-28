# Mitii CLI

Headless Mitii CLI over `@mitii/sdk` → `@mitii/v8` (with `@mitii/host` for indexing, checkpoints, memory, and skills).

## Install

```bash
npm install -g @mitii/cli
# or run without installing:
npx @mitii/cli --help
```

Requires **Node.js 20+**. Native dependency: `better-sqlite3` (optional LanceDB for vectors). License: **AGPL-3.0-or-later**.

> **Note:** Legacy npm `@mitii/cli@2.7.x` is a different binary stack — prefer versions published from the current monorepo.

For local development from the monorepo:

```bash
pnpm --filter @mitii/cli build
node apps/cli/bin/mitii.js --help
```

## First run

```bash
mitii --help                 # or: mitii -h
mitii setup                  # pick provider + write .mitii/config.json
export ANTHROPIC_API_KEY=…   # or GEMINI_ / OPENAI_ / MITII_API_KEY
mitii session                # dotted MITII banner + interactive loop
```

Smoke test without a live model:

```bash
mitii ask "What is recursion?" --echo
```

Check what is configured (never prints secrets):

```bash
mitii setup --show
mitii -v                     # or: mitii --version / mitii version
```

## Quick start

```bash
mitii ask "What is recursion?" --echo
mitii index
mitii status --json
mitii session
mitii export-session "Summarize this repo" --out session.json --echo
```

## Commands

| Command | Behavior |
|---|---|
| `setup` | Interactive (or flag-driven) model/provider setup |
| `ask <prompt>` | SDK ask with streaming, cancel, clarify/approve |
| `session` | Interactive prompt loop with MITII banner |
| `index` | Full workspace index + publish repository state |
| `status` | Show latest persisted repository state |
| `export-session` | Run ask and write secret-free JSON export |
| `version` / `help` | Version and usage (`-v` / `--version`, `-h` / `--help`) |

### Modes

| Mode | Behavior |
|---|---|
| `ask` | Q&A / explain (default) |
| `plan` | Read-only plan; no file edits |
| `agent` | Edit + verify with approvals |

Set with `--mode <mode>` or `defaultMode` in config.

## Setup options

| Option | What it does |
|---|---|
| `--show` | Print current config (no secrets) |
| `--provider <id>` | `ollama`, `anthropic`, `gemini`, `openai`, `deepseek`, … |
| `--model <id>` | Model id |
| `--base-url <url>` | OpenAI-compatible base URL |
| `--global` | Write `~/.mitii/config.json` instead of project `.mitii/` |
| `--test` | Probe the provider after writing |
| `--yes` / `-y` | Non-interactive (requires `--provider`) |

```bash
# Local Ollama
mitii setup --provider ollama --yes

# Claude, then set the key in the shell
mitii setup --provider anthropic --model claude-sonnet-4-5 --yes
export ANTHROPIC_API_KEY=…

# Custom OpenAI-compatible gateway
mitii setup --provider openai-compatible --base-url http://localhost:1234/v1 --model local-model --yes --test
```

## Connect a provider

Keys go in the environment. Provider and model go in `.mitii/config.json` or `~/.mitii/config.json` (prefer `mitii setup`).

| Provider | Env var | Config example |
|---|---|---|
| Anthropic (Claude) | `ANTHROPIC_API_KEY` | `{ "provider": "anthropic", "model": "claude-sonnet-4-5" }` |
| Gemini | `GEMINI_API_KEY` | `{ "provider": "gemini", "model": "gemini-2.5-flash" }` |
| OpenAI | `OPENAI_API_KEY` | `{ "provider": "openai", "model": "gpt-4o" }` |
| DeepSeek | `MITII_API_KEY` | `{ "provider": "openai-compatible", "providerPreset": "deepseek", "model": "deepseek-chat", "baseUrl": "https://api.deepseek.com/v1" }` |
| Ollama / LM Studio | *(none)* | `{ "provider": "openai-compatible", "baseUrl": "http://localhost:11434/v1", "model": "qwen3-coder:30b" }` |

Overrides: `MITII_PROVIDER`, `MITII_MODEL`, `MITII_BASE_URL`, `MITII_API_KEY`.

> Local Ollama / LM Studio do not need a key. Anthropic and Gemini do.
> Cursor Cloud Agents are a separate agent API, not an LLM endpoint. Point `openai-compatible` at any `/v1/chat/completions` proxy if you need a custom gateway.

## Session UI

`mitii session` prints a dotted **MITII** banner, then workspace / provider / mode, and the `mitii>` prompt. If you are still on the echo provider, the banner reminds you to run `mitii setup`.

## Development (monorepo)

```bash
pnpm --filter @mitii/cli typecheck
pnpm --filter @mitii/cli test
pnpm --filter @mitii/cli build
node apps/cli/bin/mitii.js ask "ping" --echo --json
node apps/cli/bin/mitii.js setup --show
```

## Links

- Repo: [Mitii-dev/Mitii](https://github.com/Mitii-dev/Mitii)
- SDK: [`@mitii/sdk`](https://github.com/Mitii-dev/Mitii/tree/main/packages/sdk)
- Host kit: [`@mitii/host`](https://github.com/Mitii-dev/Mitii/tree/main/packages/host)
