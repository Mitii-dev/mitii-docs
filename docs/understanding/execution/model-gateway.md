# Model Gateway

Model Gateway is the provider-neutral LLM boundary in Mitii. It sits between the rest of the system and the model providers, so upstream code talks to one `LlmPort` contract while provider adapters handle the details of OpenAI-compatible APIs, Anthropic, Gemini, or a deterministic echo model.

In practice:

- **Upstream** — the Agent Engine (the orchestration loop that plans and executes agent turns) and Prompt Construction (the stage that assembles the final prompt from system instructions, context, and user input) never need to know which provider is configured.
- **Downstream** — each adapter translates the shared request/event types into its provider's wire format and back.
- Provider responses and failures are normalized into a single event and error vocabulary, so downstream stages can rely on one shape.

## Module Structure

```text
model-gateway/
  contracts/                ModelRequest, ModelEvent, ModelCapabilities, LlmPort
  adapters/                 Echo, OpenAI-compatible, Anthropic, Gemini
  internal/                 HTTP and SSE helpers
  ModelCapabilityResolver.ts
  constants.ts
  tests/
```

## Core Types

| Type | Purpose |
| --- | --- |
| `ModelRequest` | A single completion request: messages, model options, maximum output tokens, stream flag, tools, tool choice, reasoning, and response format. |
| `ModelMessage` | One message in the conversation: system/user/assistant/tool content, with optional tool calls or image attachments. |
| `ModelToolDefinition` | A tool the model may call: name, description, and input schema. |
| `ModelEvent` | A normalized stream event: content deltas, reasoning deltas, tool-call deltas, usage, completed, failed, or cancelled. |
| `ModelCapabilities` | The feature contract for a provider/model pair (context window, tool support, streaming, reasoning, vision, structured output). |
| `LlmPort` | The provider interface used by Agent Engine. |






## Provider Adapters

Each adapter implements `LlmPort` for a specific provider family:

- **`EchoLlmPort`** — deterministic and useful for tests; it does not call an external API.
- **`OpenAiCompatibleLlmPort`** — maps requests to any OpenAI-compatible API (for example Ollama, vLLM, or DeepSeek endpoints).
- **`AnthropicLlmPort`** — adapts to the Anthropic Messages API.
- **`GeminiLlmPort`** — adapts to the Gemini API.

### Prompt Caching

Both `OpenAiCompatibleLlmPort` and `AnthropicLlmPort` default `capabilities.supportsPromptCaching` to `true`, and hosts can opt out per adapter instance by setting `capabilities.supportsPromptCaching: false`.

- **OpenAI-compatible**: when the runtime reports cache statistics, `prompt_cache_hit_tokens` / `prompt_cache_miss_tokens` are recorded. This covers runtimes such as Ollama, vLLM, and DeepSeek that expose OpenAI-compatible cache accounting.
- **Anthropic**: native prompt caching is GA on the stable `2023-06-01` version header (no beta flag needed). The adapter adds `cache_control: {type: "ephemeral"}` breakpoints to the system prompt, the last tool definition, and the last content block of the last message. Because Anthropic matches the longest previously-cached prefix, re-marking the tail every turn keeps a growing agentic conversation's stable history cached across turns without tracking what changed.

### Capability Resolution

`ModelCapabilityResolver` fills in capability defaults and validates output/context constraints, so consumers get a consistent `ModelCapabilities` view regardless of which adapter is in use.

### Tool Calls and Errors

- Tool calls stream as `tool_call_delta` events. They are not executed here — the Agent Engine executes them later through the Tool Runtime (the module that resolves and runs tool invocations).
- Provider errors are normalized into `ModelError` and include retryability and an optional retry delay, so callers can decide whether to retry without parsing provider-specific error payloads.

## Ownership Boundaries

Owns model contracts, provider adapters, capability normalization, and event normalization.

Does not own prompt construction, authorization, tool execution, repository context, or run orchestration policy.

## Tests

```bash
pnpm exec vitest run packages/v8/src/modules/model-gateway
```

## Example Flow

The following example shows a realistic coding-agent request and the normalized event stream Model Gateway returns. IDs, token counts, and timings are illustrative, but the shapes match the actual contract.

### Prompt

```text
I am in a React app. In src/LoginForm.tsx, when the user clicks the "Sign in" button, show a loading label and disable the button until the login request finishes. Keep the existing validation and error handling. Add or update a focused test if there is already a LoginForm test nearby.
```

### Request

The Agent Engine sends a `ModelRequest` to the configured `LlmPort` adapter:

```json
{
  "prompt": "I am in a React app. In src/LoginForm.tsx, when the user clicks the \"Sign in\" button, show a loading label and disable the button until the login request finishes. Keep the existing validation and error handling. Add or update a focused test if there is already a LoginForm test nearby.",
  "workspaceId": "workspace-1",
  "stateToken": "state-abc",
  "targetFile": "src/LoginForm.tsx"
}
```

### Normalized Event Stream

The adapter returns an `AsyncIterable<ModelEvent>`. The Agent Engine consumes the stream and acts on each event:

```json
[
  { "type": "content_delta", "content": "I will inspect LoginForm first." },
  { "type": "tool_call_delta", "toolCalls": [{ "index": 0, "id": "call-read-login", "name": "read_file", "arguments": "{\"path\":\"src/LoginForm.tsx\"}" }] },
  { "type": "usage", "usage": { "inputTokens": 8120, "outputTokens": 140 } },
  { "type": "completed", "finishReason": "tool_calls", "usage": { "totalTokens": 8260 } }
]
```

The `content_delta` event carries the model's visible text. The `tool_call_delta` event carries a tool invocation that the Agent Engine will execute through the Tool Runtime. The `usage` and `completed` events close out the turn with token accounting and the finish reason.
