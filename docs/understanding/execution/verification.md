# Verification

Verification is the module that confirms a change actually works. After the agent makes edits, Verification maps the changed files to their projects, discovers the relevant checks (tests, type checks, builds), executes them, and reports whether the change has sufficient evidence to be considered complete.

It does not run arbitrary commands. Checks are discovered from project descriptors and trusted manifests (e.g. `package.json` scripts), so the agent can only execute what the project has explicitly declared.

## How It Works

The pipeline follows a fixed sequence:

1. **Validate input** – Confirm the pinned repository state and changed-file list are consistent.
2. **Map to projects** – Use Repository State to determine which projects are affected.
3. **Discover checks** – Read trusted manifests through `VerificationManifestReaderPort` and collect applicable commands.
4. **Select proportional checks** – A localized change runs fewer checks than a cross-project one. `test` checks (including `desktop:test` / WDIO) run only when `minimumEvidence` includes `tests`.
5. **Execute** – Run selected checks through `VerificationToolExecutorPort`.
6. **Normalize diagnostics** – Compare results against optional baseline diagnostics so the output focuses on newly introduced issues.
7. **Inspect the diff** – Report changed paths and flag stale-state risk.
8. **Return result** – Produce a `VerificationResult` with status, evidence, and reason codes.

The pipeline also builds a durable `VerificationRecord` (before / after / comparison) stored outside the model transcript. A deterministic user summary is derived from that record; an optional engine LLM narrative may wrap it but must not replace the counts.

## Key Concepts

| Term | Meaning |
|------|---------|
| **Pinned state** | A snapshot token (`stateToken`) that identifies the exact repository state the change was made against. Verification validates that the state has not drifted. |
| **Port** | An interface (e.g. `VerificationToolExecutorPort`) that decouples Verification from the concrete host implementation. Hosts provide the actual command runner, manifest reader, or record store. |
| **Trusted manifest** | A project file such as `package.json` whose scripts are considered safe to execute. Verification only runs commands declared here. |
| **Baseline diagnostics** | Diagnostics captured before the change. Comparing against them lets the result highlight only newly introduced issues. |
| **VerificationRecord** | A durable artifact (statuses: `captured_before`, `compared`, `passed`, `incomplete`, `cancelled`) that survives across turns. A later "fix the remaining errors" turn reloads it via `loadLatest(workspaceId)` instead of scraping chat history. |

## Module Structure

```text
verification/
  pipeline/                 VerificationPipeline – the public facade
  actions/                  Check discovery, execution, diagnostics, record building
  adapters/                 Manifest readers and verification-record stores
  contracts/
    input/                  VerificationInput
    output/                 VerificationResult, RepoBuildState, VerificationRecord
    ports/                  Tool, manifest, and record-store port interfaces
    errors/                 VerificationErrors
  internal/                 Shared helpers
  tests/                    Unit and integration tests
```

## Types and Contracts

- **`VerificationInput`** – workspace root, pinned state, changed files, projects, verification requirement, grant, change scope, optional baseline diagnostics, and state readiness.
- **`VerificationResult`** – status, state token, affected project ids, checks, diagnostics, diff inspection, warnings, reason codes, and duration.
- **`VerificationCheckResult`** – evidence for a single check: kind, project id, label, argv, source, outcome, exit code, duration, and summary.
- **`VerificationDiagnostic`** – a single diagnostic: path, severity, message, range, source/code/check id.
- **`RepoBuildState` / `RepoBuildStateComparison`** – before/after snapshots and the new / remaining / cleared delta.
- **`VerificationRecord`** – durable retry handle. Statuses: `captured_before`, `compared`, `passed`, `incomplete`, `cancelled`.
- **`VerificationManifestReaderPort`** – contract for reading trusted manifests.
- **`VerificationToolExecutorPort`** – contract for executing commands/checks.
- **`VerificationRecordStorePort`** – save / load / loadLatest. Hosts persist records under `.mitii/verification/`.

## Technical Details

- The public entry point is `VerificationPipeline.verify`.
- `buildRecord` / `persistRecord` / `loadLatestRecord` own the durable artifact. They are not prompt construction.
- Node discovery warnings include `projectId`. A workspace-root "no scripts" warning is suppressed when a descendant package already produced checks.
- Unavailable repository state blocks verification unless policy allows unavailable evidence.
- The Agent Engine decides when to persist, whether to keep edits, and when to ask the model for a short narrative.

## Ownership Boundaries

**Owns:** verification planning, check execution, diagnostics, result evidence, and the durable verification record.

**Does not own:** mutation, general tool authorization, repository indexing, prompt construction, or route policy.

## Running Tests

```bash
pnpm exec vitest run packages/v8/src/modules/verification
```

## Example Flow

The following example traces a realistic request through the pipeline. IDs, timings, and summaries are representative; the shape matches the actual data structures.

### Prompt

```text
I am in a React app. In src/LoginForm.tsx, when the user clicks the "Sign in" button, show a loading label and disable the button until the login request finishes. Keep the existing validation and error handling. Add or update a focused test if there is already a LoginForm test nearby.
```

### Input

```json
{
  "schemaVersion": 1,
  "workspaceRoot": "/repo",
  "pinnedState": { "workspaceId": "workspace-1", "stateToken": "state-abc" },
  "changedFiles": ["src/LoginForm.tsx", "src/LoginForm.test.tsx"],
  "projects": [
    {
      "projectId": "web",
      "rootId": "root",
      "name": "web",
      "kind": "node",
      "manifestPath": "package.json"
    }
  ],
  "verification": {
    "required": true,
    "minimumEvidence": ["tests_or_diagnostics"],
    "allowUnavailable": false
  },
  "grant": "decision.toolGrant",
  "changeScope": "localized",
  "stateReadiness": "ready"
}
```

### Step-by-Step

1. The user sends the prompt from an editor or chat host.
2. The Agent Engine records that mutation tools changed `src/LoginForm.tsx` and `src/LoginForm.test.tsx`.
3. Decision Policy has already required verification for this write route.
4. Verification validates the pinned state and changed-file list.
5. Verification maps both files to the `web` project via Repository State.
6. Verification reads the `package.json` manifest through `VerificationManifestReaderPort`.
7. Verification discovers a focused test command (`pnpm test src/LoginForm.test.tsx`).
8. Because the change scope is localized, only the focused test is selected.
9. Verification executes the check through `VerificationToolExecutorPort`.
10. Diagnostics are normalized; no new issues are found.
11. The diff is inspected – no stale-state risk.
12. A `VerificationResult` is returned.
13. The Agent Engine uses the result to decide whether the run can complete.

### Output

```json
{
  "schemaVersion": 1,
  "status": "passed",
  "stateToken": "state-abc",
  "affectedProjectIds": ["web"],
  "checks": [
    {
      "checkId": "web:test-loginform",
      "kind": "test",
      "projectId": "web",
      "label": "LoginForm focused test",
      "argv": ["pnpm", "test", "src/LoginForm.test.tsx"],
      "evidenceSource": "package.json",
      "outcome": "passed",
      "exitCode": 0,
      "durationMs": 1842,
      "summary": "LoginForm pending-state test passed.",
      "toolCallId": "verify-1"
    }
  ],
  "diagnostics": [],
  "diff": {
    "reviewed": true,
    "staleStateRisk": false,
    "summary": "Changed LoginForm pending button state and updated focused test.",
    "changedPaths": ["src/LoginForm.tsx", "src/LoginForm.test.tsx"]
  },
  "warnings": [],
  "reasonCodes": ["verification_passed"],
  "durationMs": 1910
}
```
