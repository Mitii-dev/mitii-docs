# ACP Bridge

Mitii ships an **ACP-lite** bridge (`@mitii/acp`) that exposes the agent over a stdio JSON-lines protocol. It is **not** the full Agent Client Protocol — it is a minimal, stable surface for embedding Mitii in external tools.

Decision Policy remains the authority; V8 does not import ACP.

## Run

```bash
pnpm --filter @mitii/acp build
mitii-acp
# or
node apps/acp/bin/mitii-acp.js
```

### Smoke path (no model)

```bash
mitii-acp --echo
```

## Modes

| Flag | Behavior |
|---|---|
| `--echo` | Local understanding stub + `EchoLlmPort` (smoke / CI) |
| *(default)* | `createHostLlmPorts` like CLI; loads `.mitii/config.json` when present; wires `ToolRuntimePipeline` + MCP via `@mitii/mcp` |

## Protocol (v1)

One JSON object per line on stdin / stdout.

| Direction | Shape |
|---|---|
| → | `{ "op": "ping", "id"?: string }` |
| ← | `{ "op": "pong", "id"?: string }` |
| → | `{ "op": "prompt", "id", "prompt", "mode"?: "ask"\|"plan"\|"agent" }` |
| ← | `{ "op": "event", "id", "event" }` (per RunEvent) |
| ← | `{ "op": "result", "id", "result" }` |

On startup the bridge emits:

```json
{ "op": "ready", "protocol": "mitii-acp-lite", "version": 1, "mode": "echo" | "host" }
```

## Architecture

```
apps/acp → @mitii/sdk / @mitii/host / @mitii/mcp → @mitii/v8
```

Does not import `apps/cli`.

## Related

- [Daemon](/using/daemon) — long-lived automation process
- [MCP](/integrations/mcp) — external tool servers
- [SDK](/using/sdk) — programmatic API
