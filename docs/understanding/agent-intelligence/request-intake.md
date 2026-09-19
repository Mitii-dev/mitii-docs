# Request Intake

Request Intake is the first module in the V8 pipeline. It receives the raw user request and normalizes it into a structured `RequestEnvelope` before any understanding or planning begins.

## What it does

- **Validates** — requires meaningful content through a message or referenced artifacts
- **Normalizes** — mode (`ask` / `plan` / `agent`), origin, workspace scope, referenced artifacts, and correlation metadata
- **Assigns identity** — request IDs and timestamps through injected ports (no global clock)
- **Strips MCP mentions** — in `ask` / `plan` modes, `@mcp:` mentions are removed before the engine runs (see [MCP Attach](/understanding/execution/mcp-attach))

## Ownership boundaries

**Owns:** request validation, normalization, ID assignment, mode/origin resolution.

**Does not own:** understanding (→ [Request Understanding](/understanding/agent-intelligence/request-understanding)), planning, execution, policy grants.

## Pipeline position

```
User input → Request Intake → Request Understanding → Planning → Execution
```

## Related

- [Request Understanding](/understanding/agent-intelligence/request-understanding) — next stage in the pipeline
- [System Architecture](/understanding/architecture/system-architecture) — full module map
- [Run Lifecycle](/understanding/architecture/run-lifecycle) — how a run flows through modules
