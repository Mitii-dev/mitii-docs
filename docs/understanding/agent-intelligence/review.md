# Review

The Review module performs structured, read-only code review of diffs, commits, or full workspaces. It was adapted from an Apache-2.0 reference implementation and reimplemented under Mitii contracts (see `docs/architecture/ADR-review-module.md` in the source repo).

## What it does

- **Validates review input** — workspace / range / commit / scan scope
- **Deterministically selects review targets** — no LLM in the selection path
- **Produces structured findings** — severity, category, file, line, description
- **Read-only** — never mutates files; findings are advisory

## Modes

| Mode | Scope |
|---|---|
| `workspace` | Review the entire workspace diff |
| `range` | Review a specific commit range |
| `commit` | Review a single commit |
| `scan` | Review a set of files without a diff |

## Ownership boundaries

**Owns:** review target selection, finding structure, severity classification.

**Does not own:** policy grants, file mutation, execution.

## Related

- [Safety](/understanding/agent-intelligence/safety) — how review findings interact with safety gates
- [Verification](/understanding/execution/verification) — post-execution verification
- [PR Review Agent](/automation/agents/pr-review) — automation agent that uses review
