# Providers

`@mitii/cli` supports multiple model providers. You configure one via `mitii setup` or environment variables.

## Supported providers

| Provider | Env var | Example model |
|---|---|---|
| **Anthropic** | `ANTHROPIC_API_KEY` | `claude-sonnet-4-20250514` |
| **Google Gemini** | `GEMINI_API_KEY` | `gemini-2.0-flash` |
| **OpenAI** | `OPENAI_API_KEY` | `gpt-4o` |
| **Mitii API** | `MITII_API_KEY` | (managed) |
| **Ollama / local** | `OPENAI_API_KEY` + `--base-url` | `llama3` |

## Setting up a provider

### Interactive

```bash
mitii setup
```

You'll be prompted for provider, API key, and model. The result is written to `.mitii/config.json`.

### Flag-driven

```bash
mitii setup --provider anthropic --model claude-sonnet-4-20250514
mitii setup --provider openai --model gpt-4o
mitii setup --provider gemini --model gemini-2.0-flash
mitii setup --provider mitii
```

### Environment variables

```bash
export ANTHROPIC_API_KEY=sk-ant-...
# or
export GEMINI_API_KEY=AIza...
# or
export OPENAI_API_KEY=sk-...
# or
export MITII_API_KEY=mit-...
```

Environment variables **override** the config file.

## Config file

Location: `<project-root>/.mitii/config.json`

```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "apiKey": "sk-ant-…"
}
```

## Verify

```bash
mitii setup --show
```

Prints provider, model, and a key fingerprint (first 8 chars + `…`). **Never prints the full secret.**

## Local / self-hosted

Point at any OpenAI-compatible endpoint (Ollama, vLLM, LiteLLM, etc.):

```bash
mitii setup --provider openai --base-url http://localhost:11434/v1 --model llama3
```

## Note: "adapters" vs. providers

The word **adapter** in the CLI docs refers to **channel bridges** (Telegram, Discord, Slack) used by `mitii connect` — not to model providers. See [Commands & Options → Connect](./commands#mitii-connect) for the full adapter reference.

## Next steps

- [Setup & Providers](./setup) — full first-run walkthrough
- [Commands & Options](./commands) — all CLI flags, including recipes, connect, and adapters
- [Skills](./skills) — attach skills to provider calls
