# Repository State

Repository State is the publication authority for workspace state. It takes the output of workspace indexing and publishes it as an immutable, referenceable snapshot — a **state token** — that downstream stages (Repository Context, verification, active-run retention) can rely on without re-reading the filesystem.

In short: it answers *"what is the current indexed state of this workspace, and how do I refer to it stably?"*

## Where This Fits

Repository State sits between indexing and context assembly in the [Repository Understanding](/understanding/repository-understanding/context-indexing) pipeline:

```text
Workspace Indexing → **Repository State** → Repository Context → Prompt Construction
```

It consumes the candidate descriptors produced by Workspace Indexing and publishes them as immutable state references. It does not build indexes, retrieve context, or call models.

## Core Concepts

| Concept | What it is |
|---------|------------|
| **State token** | A deterministic identifier (`{ workspaceId, stateToken }`) that uniquely references a published snapshot of a workspace's indexed state. |
| **Descriptor** | An immutable record describing what was indexed: snapshot id, roots, readiness, scan completeness, and artifact revisions. |
| **Readiness** | The health of a published state: `ready` (complete), `degraded` (partial or filtered), or `unavailable` (failed or cancelled). |
| **Pinning** | A mechanism that marks a state as in-use by an active run, preventing cleanup from removing its artifacts. |

## Responsibilities

- Publishes candidate repository descriptors as immutable state references.
- Converts workspace-indexing output into publish candidates.
- Derives readiness, cleanup allowance, and deterministic state tokens.
- Reads descriptors by `RepositoryStateReference`.
- Pins and unpins state for active runs.
- Tracks the latest descriptor for a workspace.

## Key Types

| Type | Purpose |
|------|---------|
| `RepositoryStateReference` | A `{ workspaceId, stateToken }` pair used to look up a published state. |
| `RepositoryStateDescriptor` | The immutable snapshot record: snapshot id, roots, readiness, reasons, generated time, scan completeness, and cleanup permission. |
| `RepositoryRootState` | Per-root artifact revisions (project catalog, code/text/vector/graph/map) and capability status. |
| `PublishRepositoryStateInput` | The input to publish: workspace id, snapshot id, roots, scan completeness, reasons, and optional generated time. |
| `PublishRepositoryStateResult` | The outcome: `published`, `failed`, or `cancelled`. |
| `RepositoryStateStorePort` | The persistence contract for publish, read, pin, unpin, and latest operations. |

## Publish → Read → Pin Lifecycle

A typical flow:

1. **Workspace Indexing** completes a scan and produces a candidate descriptor.
2. **Repository State** validates the candidate, derives a deterministic state token, and publishes it as an immutable descriptor.
3. **Repository Context** (or another consumer) resolves the `RepositoryStateReference` to get the snapshot and its artifacts.
4. If an active run depends on that state, it **pins** the reference so cleanup does not remove the underlying artifacts.
5. When the run completes, the reference is **unpinned** and the state becomes eligible for cleanup.

## Technical Details

- Published descriptors are **immutable** — once published, they are never mutated.
- Readiness is derived from scan completeness: partial, filtered, truncated, or cancelled scans publish as `degraded` or `unavailable`.
- `REPOSITORY_INDEX_FORMAT` changes require hosts to rebuild persisted indexes.
- Source analysis injects tree-sitter tags queries through `TreeSitterRuntimePort`; bump `graphBuilderVersion` when those queries change call-graph facts.
- Workspace Indexing produces candidates; Repository State is the sole publication authority.

## Ownership Boundaries

**Owns:** state references, descriptors, publication, retention, readiness, and artifact revision contracts.

**Does not own:** prompt construction, retrieval ranking, model calls, tool execution, or verification commands.

## Directory Structure

```text
repository-state/
  pipeline/                 RepositoryStatePipeline — orchestrates publish/read/pin
    ws-indexing-pipeline/   Converts workspace-indexing output into publish candidates
  contracts/
    input/                  Publish, read, pin, unpin input types
    output/                 RepositoryStateReference, descriptor, and result types
    ports/                  RepositoryStateStorePort, TreeSitterRuntimePort
    artifacts/              Snapshot, graph, map, and index artifact types
    language/               Language profiles
  internal/                 Workspace scan, source analysis, chunking, and index logic
  adapters/                 In-memory store and filesystem/index runtime helpers
  tests/
```

## Example

A host publishes a workspace state and later reads it back by reference:

```json
// Publish input
{
  "workspaceId": "workspace-1",
  "snapshotId": "snapshot-2026-08-14T12-00-00Z",
  "roots": [{ "rootId": "root", "projectCatalogRevision": "catalog-1", "codeIndexRevision": "code-1", "textIndexRevision": "text-1", "graphRevision": "graph-1", "mapRevision": "map-1" }],
  "scanCompleteness": "complete",
  "reasons": []
}
```

```json
// Publish result
{
  "status": "published",
  "reference": { "workspaceId": "workspace-1", "stateToken": "state-abc" },
  "descriptor": {
    "schemaVersion": 1,
    "workspaceId": "workspace-1",
    "stateToken": "state-abc",
    "snapshotId": "snapshot-2026-08-14T12-00-00Z",
    "readiness": "ready",
    "scanCompleteness": "complete",
    "cleanupAllowed": true,
    "roots": [{ "rootId": "root", "projectCatalogRevision": "catalog-1", "codeIndexRevision": "code-1", "textIndexRevision": "text-1", "graphRevision": "graph-1", "mapRevision": "map-1", "capabilities": [{ "capability": "text_index", "status": "ready" }] }],
    "reasons": [],
    "generatedAt": "2026-08-14T12:00:00.000Z"
  }
}
```

The `reference` field is what downstream stages use to look up this state. The `descriptor` is the full immutable record.

## Tests

```bash
pnpm exec vitest run packages/v8/src/modules/repository-state
```
