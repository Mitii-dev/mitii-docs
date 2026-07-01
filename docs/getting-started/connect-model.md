# Connect a Model

Mitii supports eight provider types. Pick the path that fits your workflow.

## Ollama (recommended local)

1. [Install Ollama](https://ollama.com/)
2. Pull a coding model:

```bash
ollama pull qwen3-coder:30b
```

3. In Mitii **Settings → Model**:

| Field | Value |
|-------|-------|
| Provider type | OpenAI-compatible |
| Base URL | `http://localhost:11434/v1` |
| Model | `qwen3-coder:30b` |

4. Click **Test connection** → Save

## vLLM / LM Studio / self-hosted

Set provider type to **OpenAI-compatible**. Point base URL at your server (include `/v1` if required). Add API key if needed.

## Anthropic (Claude)

| Field | Value |
|-------|-------|
| Provider type | Anthropic |
| Model | `claude-sonnet-4-20250514` |
| Context window | `200000` |

Add API key in settings. Mitii uses the native Messages API.

## Google Gemini

| Field | Value |
|-------|-------|
| Provider type | Gemini |
| Model | `gemini-2.0-flash` |

Add API key in settings.

## OpenAI / DeepSeek / Cursor / Codex

Select the matching provider type in settings. Defaults fill base URL and model name. Add API key and test connection.

## Cloud OpenAI-compatible

Works with Azure OpenAI, Together, Groq, or any chat-completions API:

```json
{
  "thunder.provider.type": "openai-compatible",
  "thunder.provider.baseUrl": "https://your-endpoint/v1",
  "thunder.provider.model": "your-model"
}
```

## Plan vs Act models

Use a fast model for planning and a strong model for implementation:

```json
{
  "thunder.provider.model": "qwen3-coder:30b",
  "thunder.agent.planModel": "qwen3.5:4b",
  "thunder.agent.actModel": "qwen3-coder:30b"
}
```

Configure in **Settings → Agent**.

## Echo provider (no LLM)

Set provider type to **Echo** to test UI, approvals, indexing, and tool routing without network calls.

## Privacy

Mitii does not send code to a Mitii server. Traffic goes only to the endpoint you configure. Indexes and logs stay in `.mitii/` on your machine.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Connection refused | Start Ollama (`ollama serve`) or check base URL |
| Model not found | `ollama list` — use exact model tag |
| Anthropic/Gemini auth error | Verify API key in settings |
| Slow responses | Smaller model or GPU for Ollama |
| Context trimmed | Increase `thunder.provider.contextWindow` |

[Full provider reference →](/implementation/providers) · [Configuration →](/configuration)
