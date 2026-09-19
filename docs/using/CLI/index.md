# CLI

The `@mitii/cli` documentation has been split into focused pages under the **CLI** sidebar group.

| Page | Content |
|---|---|
| [Overview](./overview) | What the CLI is, install, quick start |
| [Setup & Providers](./setup) | First run, `mitii setup`, config file, verification |
| [Commands & Options](./commands) | Full subcommand reference with flags |
| [Recipes](./commands#recipes) | Writing recipes, parameterized `RecipeSpec` documents |
| [Connect (Channel Bridges)](./commands#mitii-connect) | Telegram, Discord, Slack adapters, shared flags, in-chat commands |
| [GitHub / `gh`](./commands#do-you-need-github-gh) | Using `gh` with agent mode, PRs, issues |
| [Providers](./providers) | Supported providers and API key management |
| [Skills](./skills) | Skill system and CLI usage |
| [Development](./development) | Build, test, and run locally |

> **Tip:** Start with [Overview](./overview) if you're new to the CLI.

## Getting started

The standard flow is: install the CLI, connect a model provider, then run a command.

```bash
npm install -g @mitii/cli   # or try it once with: npx @mitii/cli --help
mitii setup                  # choose a provider and write .mitii/config.json
export ANTHROPIC_API_KEY=…   # or GEMINI_ / OPENAI_ / MITII_API_KEY
mitii session                # start an interactive conversation
```

Requirements and packaging notes:

- **Node.js 20+** is required.
- Native dependency `better-sqlite3` is installed automatically; LanceDB is optional and only needed for vector search.
- Licensed under **AGPL-3.0-or-later**.
- The current build is published from the Mitii monorepo on `v*` release tags. The older `@mitii/cli@2.7.x` on npm is a different, legacy binary stack — prefer versions published from this tree.

## Connect a model

Mitii needs a model provider to generate answers. `mitii setup` walks you through the choice and writes it to a config file:

- `.mitii/config.json` for the current project, or
- `~/.mitii/config.json` when you pass `--global`.

API keys are kept in environment variables, not in the config file. Supported key variables are `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, and `MITII_API_KEY`.

```bash
mitii setup                                  # interactive
mitii setup --provider anthropic --yes       # non-interactive
mitii setup --provider ollama --yes          # local Ollama, no key needed
mitii setup --show                           # print current config (secrets are never shown)
```

### Providers

| Provider | API key | Example model |
|---|---|---|
| Anthropic (Claude) | `ANTHROPIC_API_KEY` | `claude-sonnet-4-5` |
| Gemini | `GEMINI_API_KEY` | `gemini-2.5-flash` |
| OpenAI | `OPENAI_API_KEY` | `gpt-4o` |
| DeepSeek | `MITII_API_KEY` | `deepseek-chat` |
| Ollama / LM Studio (local) | *(none)* | `qwen3-coder:30b` |

Local providers (Ollama, LM Studio) run on your machine and require no key. For self-hosted or gateway setups, use the `openai-compatible` provider and point `--base-url` at any `/v1/chat/completions` endpoint.

You can override any setting with environment variables: `MITII_PROVIDER`, `MITII_MODEL`, `MITII_BASE_URL`, `MITII_API_KEY`.

::: info
Cursor Cloud Agents is a separate agent API, not an LLM endpoint. If you have a custom gateway, route it through the `openai-compatible` provider instead.
:::

### Setup options

| Option | Meaning |
|---|---|
| `--provider <id>` | Provider to use (`ollama`, `anthropic`, `gemini`, `openai`, `deepseek`, …) |
| `--model <id>` | Model id |
| `--base-url <url>` | OpenAI-compatible base URL |
| `--global` | Write `~/.mitii/config.json` instead of the project `.mitii/` |
| `--test` | Probe the provider after writing the config |
| `--yes` / `-y` | Non-interactive (requires `--provider`) |
| `--show` | Print the current config (no secrets) |

```bash
# Local Ollama — no key needed
mitii setup --provider ollama --yes

# Claude, then set the key in the shell
mitii setup --provider anthropic --model claude-sonnet-4-5 --yes
export ANTHROPIC_API_KEY=…

# Custom OpenAI-compatible gateway, verified after saving
mitii setup --provider openai-compatible --base-url http://localhost:1234/v1 --model local-model --yes --test
```

## Commands

| Command | Behavior |
|---|---|
| `setup` | Interactive or flag-driven model/provider setup |
| `ask <prompt>` | Run a single prompt with streaming; supports cancel, clarify, and approve |
| `session` | Interactive prompt loop with the MITII banner |
| `index` | Build a full workspace index and publish repository state |
| `status` | Show the latest persisted repository state (`--json` for machine-readable output) |
| `export-session <task>` | Run a prompt and write a secret-free JSON export (`--out <file>`) |
| `version` / `help` | Print version or usage (`-v` / `--version`, `-h` / `--help`) |

### Modes

Mitii operates in one of three modes, which control how far it is allowed to go:

| Mode | Behavior |
|---|---|
| `ask` *(default)* | Q&A and explanation; does not edit files |
| `plan` | Read-only; proposes a plan without making edits |
| `agent` | Makes edits and verifies them, requesting approval before acting |

Set a mode per command with `--mode <mode>`, or set a default with `defaultMode` in the config.

### Common options

| Option | Meaning |
|---|---|
| `-h`, `--help` | Show usage |
| `-v`, `--version` | Print package version |
| `--cwd <path>` | Workspace root (default: `process.cwd()`) |
| `--json` | Machine-readable JSON on stdout |
| `--echo` | Force the `EchoLlmPort` even when API keys are set |
| `--clarify <text>` | Non-interactive clarification resume |
| `--approve` / `--deny` | Non-interactive approval resume |
| `--out <file>` | Session export path (`export-session`) |
| `--mode <mode>` | `ask` \| `plan` \| `agent` |

Unknown options are an error rather than silently ignored. `SIGINT` (Ctrl+C) cancels the active run via `run.cancel()`.

## Smoke test without a model

The `--echo` flag forces the `EchoLlmPort`, which repeats your prompt back instead of calling a provider. This verifies the CLI wiring without needing a key or a live model:

```bash
mitii ask "What is recursion?" --echo
```

## Typical workflow

A common end-to-end flow:

```bash
mitii index                                                        # index the workspace
mitii ask "What is recursion?" --echo                               # smoke test
mitii status --json                                                # inspect persisted state
mitii session                                                      # interactive conversation
mitii export-session "Summarize this repo" --out session.json --echo # save a record
```

`index` gives the agent the project context it needs; `status` reports the last persisted state; `session` is the interactive loop; and `export-session` captures a run as a clean, secret-free JSON file.

## Development

To build and run the CLI from the source repository:

```bash
pnpm --filter @mitii/cli build
node apps/cli/bin/mitii.js --help
```

Quality checks and smoke tests:

```bash
pnpm --filter @mitii/cli typecheck
pnpm --filter @mitii/cli test

node apps/cli/bin/mitii.js ask "ping" --echo --json
node apps/cli/bin/mitii.js setup --show
```

## Learn more

- Repo: [Mitii-dev/Mitii](https://github.com/Mitii-dev/Mitii)
- SDK: [`@mitii/sdk`](https://github.com/Mitii-dev/Mitii/tree/main/packages/sdk)
- Host kit: [`@mitii/host`](https://github.com/Mitii-dev/Mitii/tree/main/packages/host)
