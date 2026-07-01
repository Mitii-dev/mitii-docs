# LLM providers

Mitii supports eight provider types. Configure in the sidebar **Settings → Model** or VS Code settings under `thunder.provider.*`.

## Provider matrix

| Type | Best for | API key | Default base URL |
|------|----------|---------|------------------|
| `openai-compatible` | Ollama, LM Studio, vLLM | Optional | `http://localhost:11434/v1` |
| `openai` | OpenAI GPT models | Required | `https://api.openai.com/v1` |
| `anthropic` | Claude | Required | `https://api.anthropic.com` |
| `gemini` | Google Gemini | Required | `https://generativelanguage.googleapis.com` |
| `deepseek` | DeepSeek Chat | Required | `https://api.deepseek.com/v1` |
| `cursor` | Cursor API | Required | `https://api.cursor.com/v1` |
| `codex` | OpenAI Codex | Required | `https://api.openai.com/v1` |
| `echo` | UI testing | None | N/A |

## Settings

| Setting | Description |
|---------|-------------|
| `thunder.provider.type` | Provider type (see table) |
| `thunder.provider.baseUrl` | API base URL |
| `thunder.provider.model` | Model name in chat requests |
| `thunder.provider.contextWindow` | Hard cap for prompt trimming (tokens) |
| API key | Stored in VS Code SecretStorage via settings UI |

Use **Test connection** in settings before saving cloud providers.

## Local: Ollama

```bash
ollama pull qwen3-coder:30b
ollama serve
```

```json
{
  "thunder.provider.type": "openai-compatible",
  "thunder.provider.baseUrl": "http://localhost:11434/v1",
  "thunder.provider.model": "qwen3-coder:30b",
  "thunder.provider.contextWindow": 32768
}
```

## Cloud: Anthropic

```json
{
  "thunder.provider.type": "anthropic",
  "thunder.provider.model": "claude-sonnet-4-20250514",
  "thunder.provider.contextWindow": 200000
}
```

Add API key in settings. Mitii uses the native Messages API with streaming and tool calling.

## Cloud: Gemini

```json
{
  "thunder.provider.type": "gemini",
  "thunder.provider.model": "gemini-2.0-flash",
  "thunder.provider.contextWindow": 1000000
}
```

## Plan vs Act model split

```json
{
  "thunder.provider.type": "openai-compatible",
  "thunder.provider.model": "qwen3-coder:30b",
  "thunder.agent.planModel": "qwen3.5:4b",
  "thunder.agent.actModel": "qwen3-coder:30b"
}
```

## Research subagent model

Faster model for read-only `spawn_research_agent` workers:

```json
{
  "thunder.agent.researchAgentModel": "qwen3.5:4b",
  "thunder.agent.researchAgentBaseUrl": ""
}
```

Empty `researchAgentBaseUrl` uses the main provider URL.

## Echo provider

Set `thunder.provider.type` to `echo` to test UI, approvals, indexing, and tool routing without network calls.

## Privacy note

Mitii does not operate a central inference server. Chat requests go **only** to the endpoint you configure. Session logs and indexes stay in `.mitii/` on your machine.

See [Connect a Model](/getting-started/connect-model) for troubleshooting.
