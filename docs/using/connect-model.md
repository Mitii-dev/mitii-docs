# Connect a Model

Configure which LLM Mitii talks to. The same setup works across the VS Code extension, the CLI, and any custom host built on `@mitii/sdk`.

Config lives in `.mitii/config.json` (project) or `~/.mitii/config.json` (global). API keys stay in environment variables or VS Code SecretStorage — never in the config file.

## Quick setup

### VS Code

1. **Settings → Provider** in the Mitii sidebar.
2. Pick a **preset** — auto-fills base URL and model.
3. Add your API key (local providers like Ollama don't need one).
4. **Test connection** → **Save**.

### CLI

```bash
mitii setup                          # interactive
mitii setup --provider ollama --yes  # non-interactive (CI)
mitii setup --show                   # verify (no secrets printed)
```

Or skip setup and use an env var directly:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
mitii session
```

Supported env vars: `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `MITII_API_KEY`.

## Presets

| Preset | Best for | API key | Default base URL |
|--------|----------|---------|------------------|
| Ollama | Local, free | None | `http://localhost:11434/v1` |
| OpenAI-compatible | vLLM, LM Studio, Together, Groq, Azure | Optional | — |
| OpenAI | GPT models | Required | `https://api.openai.com/v1` |
| Anthropic | Claude | Required | `https://api.anthropic.com` |
| Gemini | Google Gemini | Required | `https://generativelanguage.googleapis.com` |
| DeepSeek | DeepSeek Chat | Required | `https://api.deepseek.com/v1` |
| Cursor | Cursor API | Required | `https://api.cursor.com/v1` |
| Codex | OpenAI Codex | Required | `https://api.openai.com/v1` |
| Echo | UI testing (no LLM) | None | N/A |

After selecting a preset you can override any field (base URL, model, context window) manually.

## Provider notes

### Ollama (local, no API key)

Recommended for local development.

1. [Install Ollama](https://ollama.com/) and start the server (`ollama serve`).
2. Pull a coding model: `ollama pull qwen3-coder:30b`
3. Select the **Ollama** preset in **Settings → Provider**.
4. **Test connection** → **Save**.

### Anthropic (Claude)

Default model: `claude-sonnet-4-20250514`, context window: 200 000 tokens. Uses the native Messages API.

### Google Gemini

Default model: `gemini-2.0-flash`.

### OpenAI / DeepSeek / Cursor / Codex

Select the matching preset — base URL and model fill in automatically.

### Self-hosted / OpenAI-compatible

For vLLM, LM Studio, Azure OpenAI, Together, Groq, or any chat-completions API, use the **OpenAI-compatible** preset:

```json
{
  "mitii.provider.preset": "openai-compatible",
  "mitii.provider.baseUrl": "https://your-endpoint/v1",
  "mitii.provider.model": "your-model"
}
```

Include `/v1` in the base URL if your server requires it.

## Advanced

### Token limits

| Setting | What it does |
|---------|-------------|
| `mitii.provider.contextWindow` | Hard cap for prompt trimming. `0` = preset default. |
| `mitii.provider.maximumOutputTokens` | Max tokens per response. `0` = ~20% of context window (min 10 240). |

The settings UI shows a **derived budget** preview that updates live. Click **Reset budgets to defaults** to clear custom `mitii.tokenBudget.*` overrides.

### Plan vs Act models

Use different models for planning (fast, cheap) and execution (stronger):

```json
{
  "mitii.provider.model": "qwen3-coder:30b",
  "mitii.agent.planModel": "qwen3.5:4b",
  "mitii.agent.actModel": "qwen3-coder:30b"
}
```

Configure in **Settings → Agent**.

### Profiles

Switch between multiple provider configurations via the sidebar profile switcher. Stored in `.mitii/profiles.json`.

### Echo provider

Set the preset to **Echo** to exercise the UI, approval flow, and tool routing without any network calls.

CLI: `mitii ask "What is recursion?" --echo`

## SDK

Building a custom host? Inject a provider port directly:

```ts
import { createMitiiClient, AnthropicLlmPort } from '@mitii/sdk';

const client = createMitiiClient({
  understandingLlm: new AnthropicLlmPort({ apiKey: process.env.ANTHROPIC_API_KEY }),
  runLlm: new AnthropicLlmPort({ apiKey: process.env.ANTHROPIC_API_KEY }),
  workspaceRoot: process.cwd(),
});
```

Available ports: `AnthropicLlmPort`, `GeminiLlmPort`, `OpenAiCompatibleLlmPort`, `EchoLlmPort`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Connection refused | Start Ollama (`ollama serve`) or check the base URL |
| Model not found | Run `ollama list` and use the exact model tag |
| Auth error (Anthropic/Gemini) | Verify the API key in settings or the corresponding env var |
| Slow responses | Use a smaller model or run Ollama on a GPU |
| Context trimmed | Increase `mitii.provider.contextWindow` |
| CLI: no provider configured | Run `mitii setup` or set `ANTHROPIC_API_KEY` / `MITII_API_KEY` |
| CLI: wrong model | Run `mitii setup --show`, then re-run `mitii setup` |

[Full provider reference →](/integrations/providers) · [Configuration →](/using/configuration)
