# Connect a Model

Mitii talks to any provider that implements the OpenAI chat completions API.

## Ollama (recommended for local)

1. [Install Ollama](https://ollama.com/)
2. Pull a coding model:

```bash
ollama pull qwen3-coder:30b
```

3. In Mitii settings:

```json
{
  "thunder.provider.type": "openai-compatible",
  "thunder.provider.baseUrl": "http://localhost:11434/v1",
  "thunder.provider.model": "qwen3-coder:30b"
}
```

## vLLM or other self-hosted endpoints

Set `thunder.provider.baseUrl` to your server URL (include `/v1` if your server expects it). Add an API key in the settings UI if required.

## Cloud providers

Any OpenAI-compatible API works — set the base URL, model name, and API key. Mitii does not send code to a central Mitii server; traffic goes only to the endpoint you configure.

## Echo provider (no LLM)

Set `thunder.provider.type` to `echo` to exercise the UI, approval flow, and tool loop without a running model.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Connection refused | Confirm Ollama/vLLM is running and the base URL is correct |
| Model not found | Check the exact model tag with `ollama list` |
| Slow responses | Use a smaller model or enable GPU acceleration for Ollama |

See [Configuration](/configuration) for the full settings reference.
