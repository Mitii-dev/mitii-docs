# Memory

Memory gives the agent continuity across sessions. It stores durable facts about your project, your preferences, and past decisions, then retrieves the most relevant ones at the start of each turn so the model doesn't start from zero.

In the request pipeline, Memory sits between the host (which owns the store) and [Prompt Construction](/understanding/execution/prompt-construction). It exposes two operations — `retrieve` and `commit` — and returns **instruction blocks** that Prompt Construction injects into the model's context for that turn.

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Fact** | A single structured piece of knowledge (a preference, a bug note, an architecture decision) stored with metadata. |
| **Scope** | The boundary a fact applies to: `user`, `workspace`, or `project`. Retrieval only returns facts matching the current scope. |
| **Instruction block** | The unit Memory returns to Prompt Construction. Each block carries content, priority, and provenance so the model can weigh it against other context. |
| **Privacy level** | `private` facts are never shared outside the owning user; `shareable` facts can appear in workspace- or project-scoped retrieval. |
| **Supersede** | When a newer fact replaces an older one (detected via Jaccard similarity > 0.7), the older fact is marked `isLatest: false` and excluded from future retrieval. |

### Fact types

Facts are classified so retrieval can weight them appropriately:

- `preference` – user or team conventions (e.g. "use the shared Button component")
- `pattern` – recurring code patterns in the project
- `architecture` – structural decisions and constraints
- `bug` – known issues and their fixes
- `workflow` – how tasks are typically done in this project
- `fact` – general knowledge that doesn't fit the above

## How Retrieval Works

When a turn begins, the memory pipeline runs the following steps:

1. **Fetch candidates** – pull all facts matching the current scope from the injected store.
2. **Filter** – remove expired facts, superseded versions (`isLatest: false`), and facts whose privacy level doesn't permit the current requester.
3. **Rank** – score survivors using BM25 (keyword relevance) fused with file-target hits and, when an embedding port is provided, a vector similarity score. The three signals are combined via Reciprocal Rank Fusion (RRF).
4. **Retention adjustment** – frequently retrieved facts retain their rank; cold facts gradually lose prominence. There is no hard deletion window.
5. **Budget** – apply the token budget and max-fact limit. If a file-based workspace profile exists, it may be appended.
6. **Return** – emit prompt-ready instruction blocks with provenance, omissions, and any warnings.

## How Commit Works

When a new fact is stored, it passes through three safeguards before being written:

1. **Privacy redaction** – secret patterns (API keys, tokens, connection strings) are stripped from the content.
2. **Hash reinforcement** – a content hash is attached. If an identical fact was committed within the last 5 minutes, the commit is rejected as a duplicate.
3. **Supersede detection** – the new fact is compared against existing facts using Jaccard similarity. If similarity exceeds 0.7, the older fact is marked superseded and the new one becomes the latest version.

## Module Structure

```text
memory/
  pipeline/                 MemoryPipeline – orchestrates retrieve and commit
  actions/                  Filtering, BM25/file ranking, budgeting, commit preparation
  internal/                 Stemmer, synonyms, tokenizer, BM25 index, RRF fusion
  observe/                  buildSyntheticMemoryDraft (host capture helper)
  adapters/                 InMemoryMemoryStore, HashMemoryEmbedding
  contracts/
    input/                  MemoryRetrieveInput, MemoryCommitInput
    output/                 MemoryFact, MemoryRetrieveResult, MemoryCommitResult
    ports/                  MemoryStorePort, MemoryIdGeneratorPort, MemoryEmbeddingPort
    errors/                 MemoryErrors
  tests/
```

## Types and Contracts

### Inputs

- **`MemoryRetrieveInput`** – query text, scope, requester user id, token budget, max facts, optional file targets and concepts, optional timestamp.
- **`MemoryCommitInput`** – content, scope, tags, fact type, concepts, associated files, importance, privacy level, source, expiry, optional timestamp.

### Outputs

- **`MemoryFact`** – the stored record: structured content (type, concepts, files, version, provenance) plus metadata.
- **`MemoryRetrieveResult`** – instruction blocks, omissions list, token usage, warnings, reason codes, and duration.
- **`MemoryCommitResult`** – commit status, optional memory id, expiry, warnings, reason codes, and duration.

### Ports (host-injected)

- **`MemoryStorePort`** – the persistence backend. `InMemoryMemoryStore` is provided for tests and simple hosts; production hosts supply their own implementation.
- **`MemoryIdGeneratorPort`** – generates unique fact identifiers.
- **`MemoryEmbeddingPort`** – optional vector embedding provider. No model runtime lives inside this module; the host injects the implementation.

## Ownership Boundaries

**Owns:** memory fact contracts, retrieval, privacy redaction, expiry, scoring, budgeting, and commit preparation.

**Does not own:** automatic memory policy, prompt section allocation, repository retrieval, or tool grants. The CLI and VS Code hosts pass `memoryEmbedding` into the engine and call `observeRunToolEvent` after mutating or failed tools.

## Running Tests

```bash
pnpm exec vitest run packages/v8/src/modules/memory
```

## Example: Retrieval in Context

The following example shows a realistic request and the shape of the data this module receives and returns. IDs, timings, and scores are illustrative; the structure matches the actual contracts.

### User prompt

```text
I am in a React app. In src/LoginForm.tsx, when the user clicks the "Sign in" button,
show a loading label and disable the button until the login request finishes.
Keep the existing validation and error handling. Add or update a focused test
if there is already a LoginForm test nearby.
```

### Retrieve input

The host attaches the workspace id and the target file extracted from the prompt:

```json
{
  "prompt": "I am in a React app. In src/LoginForm.tsx, when the user clicks the \"Sign in\" button, show a loading label and disable the button until the login request finishes. Keep the existing validation and error handling. Add or update a focused test if there is already a LoginForm test nearby.",
  "workspaceId": "workspace-1",
  "stateToken": "state-abc",
  "targetFile": "src/LoginForm.tsx"
}
```

### Retrieve output

The pipeline returns instruction blocks that Prompt Construction will inject into the model's context:

```json
{
  "schemaVersion": 1,
  "status": "retrieved",
  "instructions": [
    {
      "id": "mem-42",
      "title": "Workspace UI preference",
      "content": "Use the shared Button component for form actions when one already exists.",
      "priority": 90,
      "provenance": {
        "memoryId": "mem-42",
        "source": "memory",
        "scopeKind": "workspace",
        "score": 0.84,
        "privacy": "shareable",
        "createdAt": "2026-08-01T10:00:00.000Z"
      }
    }
  ],
  "omissions": [],
  "usedTokens": 38,
  "budgetTokens": 600,
  "warnings": [],
  "reasonCodes": ["memory_retrieved"],
  "durationMs": 5
}
```

The `instructions` array is what Prompt Construction consumes directly. Each block's `priority` tells the model how strongly to weigh the fact, and `provenance` records where it came from so the host can audit or debug retrieval decisions.
