# Code Navigation

Code Navigation answers the questions behind `goto_definition` and `find_references`: **where is this symbol defined, and where is it used?**

It resolves source navigation requests — definitions, references, and hover information — by querying the repository graph that Mitii builds during [context indexing](/understanding/repository-understanding/context-indexing). The result is a bounded, structured list of file locations (and optionally hover content) that downstream stages can act on directly.

Code Navigation is read-only: it never mutates workspace files. When policy grants it, it can be exposed to the model as a tool through [Tool Runtime](/understanding/execution/tool-runtime).

## Core Concepts

| Concept | Meaning |
|---------|---------|
| **Operation** | The kind of navigation requested: `definition` (where a symbol is declared), `references` (where it is used), or `hover` (documentation/content at a position). |
| **Query** | The starting point: a file path plus line/column, an optional symbol name, and a flag for whether to include the declaration itself. |
| **Location** | A single resolved hit: file, line range, symbol name/kind, and a short preview. |
| **Provider** | Where the answer came from — `repo_graph` when the index resolved it, or a fallback when it could not. |
| **Port** | The `CodeNavigationPort` host adapter that actually performs the lookup. The module depends on this abstraction rather than a concrete implementation. |

## What This Module Does

- Validates the navigation input (schema, version, limits) before doing any work.
- Delegates the lookup to an injected `CodeNavigationPort`.
- Resolves definition/reference locations or hover content.
- Caps the number of returned locations.
- Returns a fallback or unavailable result when no navigation port is configured, rather than failing.

## Module Structure

```text
code-navigation/
  pipeline/                 CodeNavigationPipeline
  adapters/                 Graph and fallback adapters
  contracts/
    input/                  CodeNavigationInput
    output/                 CodeNavigationResult
    ports/                  CodeNavigationPort
    errors/                 CodeNavigationError
  tests/
```

The public entry point is `CodeNavigationPipeline.navigate`.

## Input and Output Contracts

### `CodeNavigationInput`

The request. Key fields:

- **schema version** — the contract revision the input conforms to.
- **operation** — `definition`, `references`, or `hover`.
- **query** — the `CodeNavigationQuery` describing the starting point.
- **maximum locations** — the cap on how many locations may be returned.

### `CodeNavigationQuery`

The starting point of the lookup:

- **root id** — which workspace root the path is relative to.
- **relative path** — the file to navigate from.
- **line / column** — the caret position within that file.
- **symbol name** — optional, to disambiguate which symbol at the position is intended.
- **declaration flag** — whether to include the declaration itself in the results.

### `CodeNavigationResult`

The response. Key fields:

- **status** — overall outcome (e.g. `resolved`, or an unavailable/fallback state).
- **operation** — the operation that was requested.
- **provider** — where the answer came from (`repo_graph` or a fallback).
- **locations** — the resolved `CodeNavigationLocation` entries, capped to the requested maximum.
- **hover** — optional `CodeNavigationHover` content when the operation is `hover`.
- **warnings / reasonCodes** — structured signals for degraded or partial results instead of throwing.

### Supporting types

- `CodeNavigationLocation` — a single hit: file, line range, symbol name/kind, and preview text.
- `CodeNavigationHover` — hover contents plus an optional language tag.
- `CodeNavigationPort` — the host adapter interface for definition/reference/hover lookups.
- `CodeNavigationError` — typed errors for navigation failures.

## Adapters

The module resolves lookups through one of two adapters, both implementing the same `CodeNavigationPort` contract:

- **`GraphCodeNavigationAdapter`** — resolves navigation using the repository graph built during context indexing. This is the primary, full-fidelity path.
- **`FallbackCodeNavigationAdapter`** — provides degraded behavior when graph data is unavailable, so the module still returns a well-formed (if limited) result.

## Ownership Boundaries

Owns the navigation query/result contracts and adapter normalization.

Does **not** own repository indexing, graph building, tool authorization, model prompting, or mutation — those belong to their respective modules.

## Tests

```bash
pnpm exec vitest run packages/v8/src/modules/code-navigation
```

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
3. Resolves the requested operation against the `CodeNavigationPort`.
4. Applies any budget, path, state, or provider constraints.
5. Caps the returned locations and records warnings and reason codes instead of throwing when something is unresolved or degraded.

The next pipeline stage consumes that result directly, without reinterpreting the raw prompt.

### Realistic Output

The result below is representative: ids, scores, and timings are illustrative, but the shape matches what downstream stages receive.

```json
{
  "schemaVersion": 1,
  "status": "resolved",
  "operation": "references",
  "provider": "repo_graph",
  "locations": [
    { "rootId": "root", "relativePath": "src/LoginForm.tsx", "startLine": 14, "endLine": 38, "symbolName": "LoginForm", "symbolKind": "function", "preview": "export function LoginForm() {" },
    { "rootId": "root", "relativePath": "src/LoginForm.test.tsx", "startLine": 8, "symbolName": "LoginForm", "preview": "render(<LoginForm />);" }
  ],
  "warnings": [],
  "reasonCodes": ["references_resolved", "repo_graph_fallback"]
}
```
