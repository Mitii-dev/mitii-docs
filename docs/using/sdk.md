# Mitii SDK

`@mitii/sdk` is the programmatic API for the Mitii agent engine. It gives your application a host-neutral way to start a run, stream events, and resume, without importing `@mitii/v8` internals. The CLI and VS Code extension are both built on this package.

## Install

```bash
npm install @mitii/sdk
```

Requires **Node.js 20+**. Depends on `@mitii/v8`. License: **AGPL-3.0-or-later**.

::: info
Legacy npm `@mitii/sdk@2.7.x` is a different API surface. For local development, consume from the workspace (`pnpm --filter @mitii/sdk`).
:::

## Architecture

```text
apps/cli | apps/vscode | your app
        ↓
  @mitii/host     ← filesystem, indexing, checkpoints, memory, skills
        ↓
  @mitii/sdk      ← host-neutral API (this package)
        ↓
  @mitii/v8       ← agent engine, decision policy, tool runtime
```

- **`@mitii/v8`**: agent engine: decision pipeline, tool runtime, repository state
- **`@mitii/sdk`**: thin, stable API over V8; no filesystem, no provider calls, no secrets
- **`@mitii/host`**: runtime services (checkpoints, skills, search, indexing); use the provided kit or supply your own ports

### LlmPort injection

The SDK never calls a provider directly. You inject an `LlmPort` that carries the connection and its secrets:

| Port | Use case |
|---|---|
| `AnthropicLlmPort` | Claude models |
| `GeminiLlmPort` | Gemini models |
| `OpenAiCompatibleLlmPort` | OpenAI, DeepSeek, Ollama, LM Studio, any `/v1/chat/completions` proxy |
| `EchoLlmPort` | Local smoke tests (no network) |

## Quick start

The example uses `EchoLlmPort` (no API key, no network). Swap in a real port for production:

```ts
import { createMitiiClient, AnthropicLlmPort } from '@mitii/sdk';

const llm = new AnthropicLlmPort({ apiKey: process.env.ANTHROPIC_API_KEY });
```

```ts
import { createMitiiClient, EchoLlmPort } from '@mitii/sdk';
import type { LlmPort } from '@mitii/v8';

const understandingLlm: LlmPort = new EchoLlmPort();
const runLlm = new EchoLlmPort();

const client = createMitiiClient({
  understandingLlm,
  runLlm,
  workspaceRoot: process.cwd(),
  defaultMode: 'ask',
});

const run = client.start({
  prompt: 'What is recursion?',
  mode: 'ask',
});

for await (const event of run.events) {
  if (event.type === 'model_delta' && event.preview) {
    process.stdout.write(event.preview);
  }
}

const result = await run.result;
// result.status: completed | failed | cancelled | suspended
```

## Run lifecycle

1. **Start**: `client.start(input)` returns a run handle; the engine begins immediately
2. **Stream**: iterate `run.events` (async iterable of `RunEvent`s) to render progress
3. **Finish**: `run.result` resolves to `AgentRunResult` (`completed` | `failed` | `cancelled` | `suspended`)
4. **Resume / cancel**: `client.resume(input)` continues a suspended run; `run.cancel()` aborts in-flight work

## API reference

| API | What it does |
|---|---|
| `createMitiiClient(options)` | Compose default V8 facades; inject `LlmPort`s (secrets stay on the port) |
| `client.start(input)` | Validate intake-facing input → Agent Engine run handle |
| `run.events` | Async iterable of V8 `RunEvent` |
| `run.result` | Terminal `AgentRunResult` |
| `run.cancel()` | Cancel in-flight model/tool work |
| `client.resume(input)` | Resume after `clarification_required` / `approval_required` |
| `client.publishRepositoryState(input)` | Optional; calls V8 Repository State facade |

## Development (monorepo)

```bash
pnpm --filter @mitii/sdk typecheck
pnpm --filter @mitii/sdk test
pnpm --filter @mitii/sdk build
```

## Links

- Repo: [Mitii-dev/Mitii](https://github.com/Mitii-dev/Mitii)
- Runtime: [`@mitii/v8`](https://github.com/Mitii-dev/Mitii/tree/main/packages/v8)
- Host kit: [`@mitii/host`](https://github.com/Mitii-dev/Mitii/tree/main/packages/host)
