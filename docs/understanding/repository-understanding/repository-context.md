# Repository Context

Repository Context is the stage that turns a user's request into the specific code the agent needs in its prompt. Given a pinned snapshot of the repository and a natural-language query, it resolves the snapshot, retrieves candidate files and symbols, selects a bounded and diverse set, and assembles sanitized, token-budgeted context blocks.

In other words: it answers the question *"which parts of this codebase should the model see for this task?"* and produces a clean, safe result that downstream stages can consume directly.

## Where This Fits

Repository Context is one stage in the [Repository Understanding](/understanding/repository-understanding/context-indexing) pipeline:

```text
Indexing → Repository State → **Repository Context** → Prompt Construction → Model Call
```

It consumes the indexes and state tokens produced by earlier stages. It does not build indexes, publish state, allocate prompt sections, or call models — it only orchestrates the four context stages described below.

## The Four-Stage Pipeline

Each stage has a single responsibility and a well-defined contract (a *port*), which makes the stages independently testable and replaceable.

| Stage | Responsibility | Port |
|-------|---------------|------|
| **Resolve** | Turns a `RepositoryStateReference` (a `{ workspaceId, stateToken }` pair) into a concrete snapshot and its artifacts (file map, graph, indexes). | `RepositoryContextStateResolverPort` |
| **Retrieve** | Pulls candidate files and symbols from the repository's intelligence sources: repo map, repo graph, full-text index, and vector index. | `RepositoryContextRetrieverPort` |
| **Select** | Scores candidates and picks a relevant, diverse set that fits the caller's token and item budgets. | `RepositoryContextSelectorPort` |
| **Assemble** | Loads the selected content, redacts secrets, sanitizes text, truncates to fit the token budget, and records provenance. | `RepositoryContextAssemblerPort` |

The pipeline validates the input schema, version, and limits before any stage runs. If a stage degrades (for example, a source is unavailable), the result carries a `partial` status with warnings and reason codes rather than silently hiding the gap.

## Module Structure

```text
repository-context/
  pipeline/
    context-pipeline/       RepositoryContextPipeline – orchestrates the four stages
  contracts/                Public input, result, and dependency types
  internal/
    hybrid-retrieval/       Multi-source retrieval and fusion
    context-selection/      Candidate scoring and budgeted selection
    context-assembly/       Content loading and prompt-safe block assembly
  adapters/                 Concrete port implementations
  tests/
```

## Input and Output

### `RepositoryContextPipelineInput`

The request object passed to the pipeline:

| Field | Description |
|-------|-------------|
| `state` | A `RepositoryStateReference` (`{ workspaceId, stateToken }`) pinning the snapshot to use. |
| `query` | The natural-language task description. |
| `mode` | Execution mode (e.g. `agent`). |
| `filePaths` | Explicit target files, if the caller knows them. |
| `breadth` | How broadly to search (`focused`, `broad`, …). |
| `selectionBudget` | Token and item limits for the assembled context. |
| `references` | Optional cross-references to include. |
| `abortSignal` | Optional signal to cancel in-flight work. |

### `RepositoryContextPipelineResult`

The response object returned by the pipeline:

| Field | Description |
|-------|-------------|
| `schemaVersion` | Version of the result schema. |
| `stateToken` | The state token the result was built from. |
| `workspaceSnapshotId` | The resolved snapshot identifier. |
| `query` | The (possibly normalized) query. |
| `mode` | Echoed execution mode. |
| `status` | `complete`, `partial`, `empty`, `cancelled`, or `failed`. |
| `retrieval` | Per-source candidate results and scores. |
| `selection` | The selected items and their selection keys. |
| `assembly` | The final prompt-safe blocks. |
| `warnings` | Non-fatal issues encountered during the run. |
| `statistics` | Counts and token usage for observability. |

## Behavioral Details

- **State references only.** Public callers pass a `RepositoryStateReference`; they never supply independent artifact revisions. The pipeline resolves everything from the pinned snapshot.
- **Folder-scoped backfill.** When a `folderPrefix` filter is set, hybrid retrieval backfills repo-map files in that folder so a weak query cannot collapse the candidate set below `MINIMUM_FOLDER_SCOPED_RESULTS` (12) in-folder candidates.
- **Per-source reporting.** `context_ready.retrievalSources` (surfaced via the engine) exposes per-source `sourceId`, `status`, and `candidateCount` from the hybrid `sourceReports`, making it easy to see which sources contributed and which did not.
- **Selection balancing.** The selector weighs relevance score, explicit references, diversity across files and symbols, and the caller's budgets.
- **Assembly safety.** The assembler applies content-source loading, secret redaction, text sanitization, and token-budget truncation before blocks are returned.

## Ownership Boundaries

**Owns:** repository-context orchestration and the four context-stage contracts.

**Does not own:** repository indexing, immutable state publication, prompt section allocation, model calls, or tool execution.

## Running Tests

```bash
pnpm exec vitest run packages/v8/src/modules/repository-context
```

## Example Flow

The following example walks through a realistic coding-agent request and shows the shape of the input and output. The ids, timings, and scores are representative, but the structure matches what the module actually produces.

### The Request

```text
I am in a React app. In src/LoginForm.tsx, when the user clicks the "Sign in" button, show a loading label and disable the button until the login request finishes. Keep the existing validation and error handling. Add or update a focused test if there is already a LoginForm test nearby.
```

### The Input

The host attaches the workspace id and the explicit target file, then calls the pipeline:

```json
{
  "state": { "workspaceId": "workspace-1", "stateToken": "state-abc" },
  "query": "I am in a React app. In src/LoginForm.tsx, when the user clicks the \"Sign in\" button, show a loading label and disable the button until the login request finishes. Keep the existing validation and error handling. Add or update a focused test if there is already a LoginForm test nearby.",
  "mode": "agent",
  "filePaths": ["src/LoginForm.tsx"],
  "breadth": "focused",
  "selectionBudget": { "maximumTokens": 6000, "maximumItems": 8 }
}
```

### What Happens Next

1. The pipeline validates the schema, version, and limits before doing any work.
2. **Resolve** turns the state reference into a concrete snapshot and its artifacts.
3. **Retrieve** pulls candidates from the repo map, graph, text index, and vector index. The explicit `filePaths` entry (`src/LoginForm.tsx`) is a strong signal.
4. **Select** scores the candidates and picks a relevant, diverse set within the 6 000-token / 8-item budget.
5. **Assemble** loads the selected files, redacts any secrets, sanitizes the text, and truncates if needed.
6. The pipeline records warnings and reason codes instead of hiding degraded behavior.
7. It returns the result shown below, which the next pipeline stage (prompt construction) consumes without reinterpreting the raw user text.

### The Output

```json
{
  "schemaVersion": 1,
  "stateToken": "state-abc",
  "workspaceSnapshotId": "snapshot-1",
  "query": "Add a loading state to the login button in src/LoginForm.tsx.",
  "mode": "agent",
  "status": "complete",
  "retrieval": {
    "status": "complete",
    "candidates": [{ "key": "file:src/LoginForm.tsx", "score": 0.98 }]
  },
  "selection": {
    "status": "complete",
    "items": [{ "selectionKey": "file:src/LoginForm.tsx", "relativePath": "src/LoginForm.tsx" }]
  },
  "assembly": {
    "status": "complete",
    "blocks": [{ "id": "repo:src/LoginForm.tsx", "relativePath": "src/LoginForm.tsx", "truncated": false }]
  },
  "warnings": [],
  "statistics": {
    "retrievedCandidates": 6,
    "selectedItems": 2,
    "assembledBlocks": 2,
    "droppedBlocks": 0,
    "usedTokens": 1880
  }
}
```
