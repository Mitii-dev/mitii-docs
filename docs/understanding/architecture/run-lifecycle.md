# Run Lifecycle

A **run** is one complete agent session—from the first user message to the final response. The [agent runtime](/understanding/architecture/agent-runtime) drives each run through a fixed sequence of phases, with bounded retries when verification fails. Understanding this lifecycle helps you debug agent behaviour, extend the pipeline, and reason about where a given failure occurred.

## Phases

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Bootstrap  │───▶│   Plan      │───▶│   Execute   │───▶│  Verify     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ▲                                                        │
       └──────────────────  Revise (bounded retries)  ◀─────────┘
```

### Bootstrap

Prepare the working context for the run:

- Load the workspace file map, current diagnostics, and git status
- Inject the system prompt, active skills, and conversation memory
- Establish the **token budget** (the maximum context window available for this run) and the **approval mode** (whether tool calls require explicit user confirmation)

### Plan

Interpret the user's request and produce an actionable plan:

- Parse user intent and gather repository context (see [Request → Decision → Execution](/understanding/architecture/request-decision-execution))
- Select a **route**—`answer`, `explore`, or `execute`—based on the [decision policy](/understanding/agent-intelligence/decision-policy)
- Break the task into ordered steps with tool assignments
- Set the verification strategy (which checks must pass before the run is considered complete)

### Execute

Carry out the planned steps:

- Dispatch tool calls in parallel where safe; serialise mutations to avoid conflicts
- Create a **checkpoint** after each mutation batch (a batch of file writes performed as a unit)
- Stream progress updates to the user

### Verify

Confirm the outcome meets expectations:

- Run typecheck, lint, and tests as configured for the project
- Compare results against the expected outcomes defined in the plan
- If checks fail: feed diagnostics back into the plan and re-enter Execute (bounded by the retry limit)

## Checkpoints

Every mutation batch creates a **checkpoint** that records:

- Files changed
- Before/after content hashes
- The full tool call trace for that batch

Checkpoints enable **rollback** (revert to a prior state) and **audit** (inspect what changed and why). See [Memory & Checkpoints](/understanding/agent-intelligence/memory-checkpoints) for the storage model and retention policy.

## Error Recovery

| Failure | Recovery strategy |
|---------|-------------------|
| Tool timeout | Retry with exponential backoff (max 3 attempts) |
| Typecheck / lint error | Feed diagnostics back into the plan and re-enter Execute |
| Token budget exhausted | Summarise accumulated context and continue with a reduced window |
| User interruption | Save the current checkpoint and await the next instruction |

## Observability

Each phase emits structured logs that include the phase name, tool calls made, token usage, and any errors encountered. These logs are the primary source for debugging a run's behaviour. The `lastUpdated` timestamp and `editLink` in the docs footer reflect the current run's metadata.
