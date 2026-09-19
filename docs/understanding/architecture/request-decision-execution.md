# Request → Decision → Execution

Every user request flows through a three-phase pipeline: **understand**, **decide**, **execute**. This is the core loop the [agent runtime](/understanding/architecture/agent-runtime) runs for each turn of a conversation.

## 1. Understand

The agent parses the user's intent and gathers repository context—file map, diagnostics, git status, and the repository graph—to build a working model of the current state. This context is what the decision phase uses to choose a route and what the execution phase uses to ground tool calls.

See [Repository Understanding](/understanding/repository-understanding/context-indexing) for how context is collected and indexed.

## 2. Decide

The [decision policy](/understanding/agent-intelligence/decision-policy) evaluates the request against the gathered context and selects a **route**—the category of work the agent will perform:

| Route | When | Example |
|-------|------|---------|
| `answer` | The question can be answered from existing context | "What does this function do?" |
| `explore` | More discovery is needed before acting | "Where is the auth logic?" |
| `execute` | A concrete change is required | "Add input validation to the signup endpoint" |

For `explore` and `execute` routes, the [planner](/understanding/agent-intelligence/planning) breaks the task into ordered steps, assigns tools, and sets a verification strategy. The decision policy also compiles a **tool grant**—the set of permissions, path scopes, and limits that constrain what the agent may do during execution.

See [Decision Policy](/understanding/agent-intelligence/decision-policy) for the full contract.

## 3. Execute

The [tool runtime](/understanding/execution/tool-runtime) dispatches tool calls in parallel where safe, serialises mutations, and checkpoints after each batch so that every write is recoverable. The [model gateway](/understanding/execution/model-gateway) manages token budgets and retries for LLM calls.

See [Tool Runtime](/understanding/execution/tool-runtime) and [Model Gateway](/understanding/execution/model-gateway) for details.

## Feedback Loop

After execution, the agent runs verification (typecheck, lint, tests) and feeds results back into the decision loop. If verification fails, the agent revises its plan and retries—up to a bounded number of iterations set by the decision policy.

See [Verification](/understanding/execution/verification) for details.
