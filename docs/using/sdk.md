# Mitii SDK

`@mitii/sdk` is the programmatic API for building on top of the Mitii agent engine. It gives your application a clean, host-neutral way to start an agent run, stream its events, and resume it — without importing the low-level `@mitii/v8` internals directly.

Use it when you want to embed Mitii in your own tool, test the agent, or drive it from a custom UI. The CLI and the VS Code extension are both built on this same package, so anything you can do with the SDK is what those apps do under the hood.

## Install

```bash
npm install @mitii/sdk
```

Requires **Node.js 20+**. Depends on `@mitii/v8`. License: **AGPL-3.0-or-later**.

::: info
Legacy npm `@mitii/sdk@2.7.x` is a different API surface. For local development, consume from the workspace (`pnpm --filter @mitii/sdk`).
:::

## How it fits together

Mitii is split into three packages with a strict dependency direction. Understanding this split is the key to using the SDK:

```text
apps/cli | apps/vscode | your app
        ↓
  @mitii/host     ← filesystem, indexing, checkpoints, memory, skills
        ↓
  @mitii/sdk      ← host-neutral API (this package)
        ↓
  @mitii/v8       ← agent engine, decision policy, tool runtime
```

- **`@mitii/v8`** — the agent engine: the decision pipeline, tool runtime, and repository state. It is host-neutral and provider-agnostic.
- **`@mitii/sdk`** — this package. A thin, stable API over V8 that apps and tests import. It stays host-neutral: it does not touch the filesystem, call a model provider, or own secrets.
- **`@mitii/host`** — the runtime services the agent needs from a real environment: filesystem checkpoints, skills catalogs, search, and indexing. You can use the provided host kit or supply your own port implementations.

**Forbidden edges:** `host → apps`, `sdk → host`, `v8 → host`. The SDK never reaches upward into an app or downward into a host.

### LlmPort injection

The SDK never calls a model provider directly. Instead, you inject `LlmPort` implementations that carry the provider connection and its secrets:

| Port | Use case |
|---|---|
| `AnthropicLlmPort` | Claude models |
| `GeminiLlmPort` | Gemini models |
| `OpenAiCompatibleLlmPort` | OpenAI, DeepSeek, Ollama, LM Studio, any `/v1/chat/completions` proxy |
| `EchoLlmPort` | Local smoke tests (no network) |

Because secrets (API keys, base URLs) live on the port, the SDK and V8 never see them. `EchoLlmPort` is a no-network stub for local smoke tests only — use a real provider port for actual runs.

## Quick start

The example below uses `EchoLlmPort` so it runs without any API key or network access. To run against a real model, swap in a provider port — for example:

```ts
import { createMitiiClient, AnthropicLlmPort } from '@mitii/sdk';

const llm = new AnthropicLlmPort({ apiKey: process.env.ANTHROPIC_API_KEY });
```

```ts
import { createMitiiClient, EchoLlmPort } from '@mitii/sdk';
import type { LlmPort } from '@mitii/v8';

// Hosts inject real provider ports (AnthropicLlmPort, GeminiLlmPort,
// OpenAiCompatibleLlmPort). Echo is for local smoke only.
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

## How a run works

A run is the unit of work you drive through the SDK. Its lifecycle has four parts:

1. **Start** — `client.start(input)` validates your input and returns a run handle. The engine begins working immediately.
2. **Stream** — `run.events` is an async iterable of `RunEvent`s emitted while the run is in flight. `model_delta` events carry streamed model output; other events report tool activity and state changes. Iterate it to render progress in your UI.
3. **Finish** — `run.result` resolves to the terminal `AgentRunResult`. Its `status` is one of `completed`, `failed`, `cancelled`, or `suspended`.
4. **Resume or cancel** — if the run ends `suspended`, it is waiting on you (typically for a clarification or an approval); call `client.resume(input)` to continue it. At any point before it finishes, `run.cancel()` aborts in-flight model and tool work.

> Filesystem checkpoints, skills catalogs, search, and indexing live in **`@mitii/host`** (or your own port implementations). The SDK stays host-neutral.

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
