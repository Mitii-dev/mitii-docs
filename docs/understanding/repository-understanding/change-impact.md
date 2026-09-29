# Change Impact

Change Impact answers one question: **if this file or symbol changes, what else in the repository might break?**

It does this by walking the repository graph — the index of files, symbols, and their relationships that Mitii builds during [context indexing](/understanding/repository-understanding/context-indexing) — starting from a single point of interest and following the edges that connect it to the rest of the codebase.

The result is a structured list of affected files, symbols, and packages. Policy, planning, and verification stages use that list to decide what to check before and after a change, instead of guessing.

## Core Concepts

| Concept | Meaning |
|---------|---------|
| **Seed** | The starting point of the analysis: a file, a symbol, or a caret position (file + line + column). |
| **Direction** | Which way to walk the graph. `dependents` finds what *uses* the seed ("who breaks if this changes?"). `dependencies` finds what the seed *uses* ("what does this rely on?"). |
| **Edge types** | The kinds of relationships to follow, such as `imports`, `calls`, or `references`. Restricting edge types narrows the analysis to the relationships that matter. |
| **Hop limit** | Maximum distance from the seed. A hop limit of 1 returns only direct relationships; higher limits follow chains (e.g. A imports B, B imports C). |
| **Node limit** | Maximum number of affected nodes returned. Protects against very large graphs. |
| **Truncation** | A flag in the result that is set to `true` when a hop or node limit stopped the traversal early. |

## What This Module Does

- Validates the change-impact input (schema, version, limits) before doing any work.
- Resolves the seed against the `RepoGraph`.
- Traverses dependency or dependent edges, respecting the configured edge types and limits.
- Summarizes affected nodes, files, and packages.
- Reports truncation, unresolved seeds, stale graph signals, and warnings as structured data rather than errors.

## Module Structure

```text
change-impact/
  pipeline/                 ChangeImpactPipeline
  contracts/
    input/                  ChangeImpactInput, ChangeImpactSeed
    output/                 ChangeImpactResult
    errors/                 ChangeImpactError
  internal/                 Graph traversal and scoring helpers
  tests/
```

The public entry point is `ChangeImpactPipeline.analyze`.

## Input and Output Contracts

### `ChangeImpactInput`

The request. Key fields:

- **seed** — the file, symbol, or caret position to analyze (`ChangeImpactSeed`).
- **direction** — `dependencies` or `dependents`.
- **edge types** — which graph relationships to follow.
- **hop/node limits** — traversal bounds.
- **package flag** — whether to include package-level impact in the result.
- **repo graph** — the graph to traverse.
- **code-index token** — optional, ties the result to a specific index revision.

### `ChangeImpactResult`

The response. Key fields:

- **status** — overall outcome of the analysis.
- **seed / resolvedSeeds** — the requested seed and the graph nodes it resolved to.
- **affected** — individual affected nodes, each with its hop distance, the edge type that led to it, a relevance score, and evidence.
- **affectedFiles** — file-level summaries (`ChangeImpactAffectedFile`) used by planning and verification choices.
- **packagesAffected** — packages touched by the change, when the package flag is set.
- **truncated** — `true` if hop or node limits cut the traversal short.
- **warnings / reasonCodes** — structured signals for degraded or partial results (e.g. unresolved seed, stale graph).
- **graph revision / code-index token** — which index the result was computed against.

## Example Flow

A user asks the agent to modify a React component:

```text
I am in a React app. In src/LoginForm.tsx, when the user clicks the "Sign in" button, show a loading label and disable the button until the login request finishes. Keep the existing validation and error handling. Add or update a focused test if there is already a LoginForm test nearby.
```

The host attaches the workspace context and the target file:

```json
{
  "prompt": "I am in a React app. In src/LoginForm.tsx, when the user clicks the \"Sign in\" button, show a loading label and disable the button until the login request finishes. Keep the existing validation and error handling. Add or update a focused test if there is already a LoginForm test nearby.",
  "workspaceId": "workspace-1",
  "stateToken": "state-abc",
  "targetFile": "src/LoginForm.tsx"
}
```

The module then:

1. Validates the input (schema, version, limits).
2. Extracts the target: `src/LoginForm.tsx`.
3. Resolves it to a graph node and walks the `dependents` edges.
4. Applies any budget, path, or state constraints.
5. Returns a structured result — recording warnings and reason codes instead of throwing when something is unresolved or stale.

The next pipeline stage consumes that result directly, without reinterpreting the raw prompt.

### Realistic Output

The result below is representative: ids, scores, and timings are illustrative, but the shape matches what downstream stages receive.

```json
{
  "schemaVersion": 1,
  "status": "complete",
  "direction": "dependents",
  "seed": { "kind": "file", "relativePath": "src/LoginForm.tsx" },
  "resolvedSeeds": [{ "nodeId": "file:src/LoginForm.tsx", "kind": "file", "relativePath": "src/LoginForm.tsx" }],
  "affected": [
    { "nodeId": "file:src/LoginForm.test.tsx", "kind": "file", "relativePath": "src/LoginForm.test.tsx", "hop": 1, "viaEdgeType": "imports", "score": 0.86, "evidence": ["test imports LoginForm"] }
  ],
  "affectedFiles": [{ "relativePath": "src/LoginForm.test.tsx", "hop": 1, "score": 0.86, "affectedNodeIds": ["file:src/LoginForm.test.tsx"], "reason": "dependent test imports changed component" }],
  "packagesAffected": [],
  "truncated": false,
  "warnings": [],
  "reasonCodes": ["impact_resolved"]
}
```

Reading this result: the analysis started from `src/LoginForm.tsx` and found one direct dependent — the test file that imports it. The `evidence` field explains *why* it was flagged, and `reasonCodes` confirms the analysis completed successfully. If the traversal had hit a limit, `truncated` would be `true` and the affected list would be partial.

## Ownership Boundaries

Change Impact owns graph-based impact analysis only. It does **not** own:

- Graph construction or repository indexing
- Route authority
- Verification execution
- Tool mutation

## Tests

```bash
pnpm exec vitest run packages/v8/src/modules/change-impact
```

## Related Pages

- [Context Indexing](/understanding/repository-understanding/context-indexing) — how the repository graph is built
- [Code Navigation](/understanding/repository-understanding/code-navigation) — resolving definitions and references
- [Verification](/understanding/execution/verification) — how impact results inform post-change checks
