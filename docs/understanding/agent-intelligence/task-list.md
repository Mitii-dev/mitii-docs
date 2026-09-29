# Task List

The Task List module manages the live progress checklist that appears during an agent [run](/understanding/architecture/run-lifecycle). It is the single source of truth for "what is the agent doing right now, and what is left?" — the checklist you see in the host UI while the agent works.

The module handles three responsibilities:

1. **Applying updates** — validating and applying `replace`, `patch`, and `clear` operations to the checklist.
2. **Deriving from plans** — converting a [PlanArtifact](/understanding/agent-intelligence/planning) into a compact, file-scoped execution checklist.
3. **Serialization** — parsing and emitting markdown checkbox lists so hosts and prompts can render or consume the checklist.

It does **not** decide whether a run needs a checklist, plan the work, execute steps, or persist state. Those belong to the engine, [Planning](/understanding/agent-intelligence/planning), and the host respectively.

## Core Concepts

### Operations

All mutations go through one of three operations:

| Operation | Behavior |
|-----------|----------|
| `replace` | Swap the entire checklist with a new set of items. The new list must be non-empty. |
| `patch` | Update specific items by id (change status, title, or detail). All referenced ids must already exist. |
| `clear` | Remove all items, resetting the checklist. |

### Discovery vs. Execution Lists

A `TaskList` carries a `purpose` field that distinguishes two kinds of checklists:

- **Discovery** (`purpose: "discovery"`) — a temporary, lightweight checklist shown while the engine is still investigating the request. It is replaced once the final plan arrives. Do not persist a discovery list as the approved execution checklist.
- **Execution** (`purpose: "execution"`) — the concrete, file-scoped checklist derived from a `PlanArtifact`. This is what the user sees as the agent works through the plan.

The `source` field records who created the list: `plan`, `agent`, `user`, or `discovery`.

### Item Statuses

Each `TaskItem` has one of five statuses:

| Status | Meaning |
|--------|---------|
| `pending` | Not yet started. |
| `active` | Currently in progress. At most one item may be `active` at any time. |
| `done` | Completed successfully. |
| `skipped` | Intentionally not performed. |
| `blocked` | Cannot proceed due to a dependency or constraint. |

### Invariants

The module enforces these rules on every apply:

- Maximum **8 items** per list (configurable).
- All item ids must be **unique** within the list.
- At most **one** item may have status `active`.
- `replace` with an empty item array is **rejected**.
- `patch` operations must reference **existing** ids.

## Types

| Type | Purpose |
|------|---------|
| `TaskListApplyInput` | The request to mutate the checklist: current list, source, and operation. |
| `TaskListOperation` | Discriminant: `replace`, `patch`, or `clear`. |
| `TaskList` | The checklist itself: schema version, source, optional purpose, optional title, and items. |
| `TaskItem` | A single row: id, title, status, optional detail, optional plan `sourceRef`. |
| `TaskItemStatus` | One of `pending`, `active`, `done`, `skipped`, `blocked`. |
| `TaskListApplyResult` | The response: `applied` or `rejected` status, the resulting list (if applied), warnings, and reason codes. |
| `TaskListErrors` | Typed error codes for validation failures. |

## Module Structure

```text
task-list/
  pipeline/                 TaskListPipeline — orchestrates the apply flow
  actions/                  Apply, derive, serialize, parse implementations
  contracts/
    input/                  TaskListApplyInput
    output/                 TaskList, TaskListApplyResult
    errors/                 TaskListErrors
  tests/
```

## Behavioral Notes

- **Derivation preference** — When converting a `PlanArtifact` into a checklist, the module prefers concrete file-scoped implementation and verification steps over process-only discovery rows. The resulting list is stamped with `purpose: "execution"`.
- **Auto-advance** — The Agent Engine may advance a concrete item to `done` after a successful built-in mutation (e.g., a file edit). The Task List module itself only applies validated changes; it does not infer progress from tool results.
- **Prompt safety** — The module provides guidance strings that are safe to inject into prompts without leaking internal state.

## Example

A user asks the agent to add a loading state to a React login form. After the engine plans the work, it derives a checklist from the plan:

```json
{
  "schemaVersion": 1,
  "status": "applied",
  "taskList": {
    "schemaVersion": 1,
    "source": "agent",
    "purpose": "execution",
    "title": "Add loading state to LoginForm",
    "items": [
      { "id": "inspect-login", "title": "Inspect src/LoginForm.tsx", "status": "active" },
      { "id": "add-loading", "title": "Add pending button state", "status": "pending" },
      { "id": "verify-login", "title": "Verify LoginForm behavior", "status": "pending" }
    ]
  },
  "warnings": [],
  "reasonCodes": ["task_list_replaced"]
}
```

As the agent works, it patches individual items:

```json
{
  "operation": "patch",
  "items": [
    { "id": "inspect-login", "status": "done" },
    { "id": "add-loading", "status": "active" }
  ]
}
```

The host renders the updated checklist, and the user sees progress without needing to read raw tool output.

## Ownership Boundaries

| Owned by Task List | Not owned by Task List |
|--------------------|------------------------|
| Checklist invariants (count, ids, active limit) | Planning or step decomposition |
| Apply / derive / serialize / parse logic | Execution or tool dispatch |
| Markdown checkbox serialization | Verification or test running |
| Prompt-safe guidance strings | Host persistence or UI rendering |
| Progress helpers | Deciding whether a run needs a checklist |

## Tests

```bash
pnpm exec vitest run packages/v8/src/modules/task-list
```
