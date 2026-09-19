# MCP Attach

MCP Attach controls how `@mcp:` mentions in user messages are parsed, validated, and attached to the run context. It sits between Request Intake and the engine.

## Behavior by mode

| Mode | MCP visibility |
|---|---|
| `agent` | MCP tools available if granted by Decision Policy |
| `ask` / `plan` | MCP still hidden by grant rules; mentions are stripped from the user message before the engine runs |

## Layout

```
constants.ts              MAX_REQUIRED_MCP_SERVERS
parseRequiredMcpMentions.ts   @mcp: parse + merge
```

## What it does

- **Parses** `@mcp:` mentions from the user message
- **Validates** against `MAX_REQUIRED_MCP_SERVERS` (prevents unbounded server lists)
- **Merges** required servers into the run context
- **Strips** mentions in `ask` / `plan` modes (MCP tools are not available in those modes)

## Ownership boundaries

**Owns:** mention parsing, server validation, context attachment.

**Does not own:** MCP server lifecycle (→ `@mitii/mcp`), tool execution (→ Tool Runtime).

## Related

- [MCP](/integrations/mcp) — how Mitii connects to external MCP servers
- [MCP Web Server](/integrations/mcp-web) — how other agents call Mitii
- [Tool Runtime](/understanding/execution/tool-runtime) — where MCP tools are executed
