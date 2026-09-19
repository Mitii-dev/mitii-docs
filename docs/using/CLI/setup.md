# Setup & Providers

This page walks you from zero to a working `@mitii/cli` configuration.

## First run

```bash
mitii --help                 # or: mitii -h
mitii setup                  # interactive: pick provider + write .mitii/config.json
```

`mitii setup` is interactive by default. It asks for:

1. **Provider** — Anthropic, Gemini, OpenAI, DeepSeek, Ollama, OpenAI-compatible, or Mitii API
2. **API key** — written to `.mitii/config.json` (never printed back)
3. **Model** (optional) — defaults to the provider's recommended model

You can also drive it with flags:

```bash
mitii setup --provider anthropic --model claude-sonnet-4-20250514
mitii setup --provider openai --model gpt-4o
mitii setup --provider deepseek --model deepseek-chat --base-url https://api.deepseek.com/v1
mitii setup --provider openai-compatible --base-url http://localhost:11434/v1 --model qwen3-coder:30b
```

### Setup flags

| Flag | Description |
|---|---|
| `--provider <id>` | `anthropic`, `gemini`, `openai`, `deepseek`, `ollama`, `openai-compatible` |
| `--model <id>` | Model id |
| `--base-url <url>` | OpenAI-compatible base URL |
| `--global` | Write `~/.mitii/config.json` instead of project config |
| `--yes` | Non-interactive (use defaults for missing values) |
| `--show` | Print active config (never prints full secrets) |

## API keys

Set the key for your chosen provider as an environment variable **or** let `mitii setup` store it in `.mitii/config.json`:

| Provider | Env var |
|---|---|
| Anthropic | `ANTHROPIC_API_KEY` |
| Google Gemini | `GEMINI_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| Mitii API | `MITII_API_KEY` |

```bash
export ANTHROPIC_API_KEY=sk-ant-...
# or
export GEMINI_API_KEY=AIza...
# or
export OPENAI_API_KEY=sk-...
# or
export MITII_API_KEY=mit-...
```

> Environment variables take precedence over the config file.

### Global env var overrides

| Variable | Purpose |
|---|---|
| `MITII_PROVIDER` | Override provider |
| `MITII_MODEL` | Override model |
| `MITII_BASE_URL` | Override base URL |
| `MITII_API_KEY` | Override API key |

## Verify your configuration

```bash
mitii setup --show
```

This prints the active provider, model, and key **fingerprint** (first 8 chars + `…`). It never prints the full secret.

Check the CLI version:

```bash
mitii -v
# or
mitii --version
# or
mitii version
```

## Config file location

Project config (tried first):

```
<project-root>/.mitii/config.json
```

Global config (used with `--global` or when project config is absent):

```
~/.mitii/config.json
```

Example:

```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "apiKey": "sk-ant-…"
}
```

OpenAI-compatible example:

```json
{
  "provider": "openai-compatible",
  "baseUrl": "http://localhost:11434/v1",
  "model": "qwen3-coder:30b"
}
```

Add `.mitii/` to your `.gitignore` if you do not want the config committed.

## Local / self-hosted models

If you run Ollama or another OpenAI-compatible gateway:

```bash
mitii setup --provider openai --base-url http://localhost:11434/v1 --model llama3
```

Local Ollama / LM Studio do not need a key. Anthropic and Gemini do.

## Web search (SearXNG)

Optional. When configured, the CLI injects a `SearchPort` so Decision Policy can grant `web_search` (and content-aware `fetch_url`) for live-web asks. Prefer free self-hosted **SearXNG**; Brave / Tavily are paid fallbacks.

### Configure SearXNG

**Option A — project or global config** (wins over env):

```json
{
  "provider": "echo",
  "searxngBaseUrl": "http://192.168.0.91:8888"
}
```

Global alternative: `~/.mitii/config.json` with the same `searxngBaseUrl` field. Project config is tried first.

**Option B — environment** (used when config has no `searxngBaseUrl`):

```bash
export SEARXNG_BASE_URL=http://192.168.0.91:8888
# or
export MITII_SEARXNG_URL=http://192.168.0.91:8888
```

## Next steps

- [Commands & Options](./commands) — every subcommand and flag
- [Providers](./providers) — detailed provider reference
- [Skills](./skills) — attach skills to CLI commands
