# Mitii SDK

Host-neutral programmatic API over `@mitii/v8`. Apps and tests use this package instead of importing V8 internals directly.

## Install

```bash
npm install @mitii/sdk
```

Requires **Node.js 20+**. Depends on `@mitii/v8`. License: **AGPL-3.0-or-later**.

> **Note:** Legacy npm `@mitii/sdk@2.7.x` is a different API surface. For local development, consume from the workspace (`pnpm --filter @mitii/sdk`).

## Quick start

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

## Public surface

| API | What it does |
|---|---|
| `createMitiiClient(options)` | Compose default V8 facades; inject `LlmPort`s (secrets stay on the port) |
| `client.start(input)` | Validate intake-facing input → Agent Engine run handle |
| `run.events` | Async iterable of V8 `RunEvent` |
| `run.result` | Terminal `AgentRunResult` |
| `run.cancel()` | Cancel in-flight model/tool work |
| `client.resume(input)` | Resume after `clarification_required` / `approval_required` |
| `client.publishRepositoryState(input)` | Optional; calls V8 Repository State facade |

> Filesystem checkpoints, skills catalogs, search, and indexing live in **`@mitii/host`** (or your own port implementations). The SDK stays host-neutral.

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

**Forbidden edges:** `host → apps`, `sdk → host`, `v8 → host`.

## LlmPort injection

The SDK never calls a provider directly. You inject `LlmPort` implementations:

| Port | Use case |
|---|---|
| `AnthropicLlmPort` | Claude models |
| `GeminiLlmPort` | Gemini models |
| `OpenAiCompatibleLlmPort` | OpenAI, DeepSeek, Ollama, LM Studio, any `/v1/chat/completions` proxy |
| `EchoLlmPort` | Local smoke tests (no network) |

Secrets (API keys, base URLs) stay on the port — the SDK and V8 never see them.

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
