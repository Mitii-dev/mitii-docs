# MCP integrations

Mitii implements the [Model Context Protocol](https://modelcontextprotocol.io/) so you can extend the agent with external tools.

## Built-in servers

Preloaded when `thunder.mcp.enabled` and `thunder.mcp.preloadBuiltin` are true:

| Server | Package | Purpose |
|--------|---------|---------|
| `filesystem` | `@modelcontextprotocol/server-filesystem` | Scoped file access |
| `memory` | `@modelcontextprotocol/server-memory` | Knowledge graph memory |
| `sequential-thinking` | `@modelcontextprotocol/server-sequential-thinking` | Structured reasoning |

Toggle individual servers in **Settings → Integrations**.

## Transport types

| Type | Use case | Required fields |
|------|----------|-----------------|
| `stdio` | Local `npx` servers | `command`, `args` |
| `sse` | Remote SSE endpoint | `url`, optional `headers` |
| `streamable-http` | MCP Streamable HTTP | `url`, optional `headers` |

### Stdio example (`.mitii/mcp.json`)

```json
{
  "mcpServers": {
    "my-tools": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  }
}
```

### Remote SSE example

```json
{
  "mcpServers": {
    "remote-api": {
      "type": "sse",
      "url": "https://mcp.example.com/sse",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

### Streamable HTTP example

```json
{
  "mcpServers": {
    "cloud-mcp": {
      "type": "streamable-http",
      "url": "https://mcp.example.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

## Configuration sources (merged)

1. Built-in servers (if preload enabled)
2. VS Code `thunder.mcp.servers`
3. Workspace `.mitii/mcp.json`
4. Workspace `.mcp.json`

Workspace entries override settings with the same server name.

## Runtime behavior

- Tools exposed as `mcp__{server}__{tool}` (max 128 chars)
- Concurrent startup limit: `thunder.mcp.maxConcurrentStartup` (default 4)
- MCP tools pass through **ToolPolicyEngine** — same approvals as built-in tools
- Status shown in **Settings → Integrations** (connected, tool count, errors)

## OAuth / authentication

For remote servers:

- Pass bearer token in `headers.Authorization`
- Or set `oauth.accessToken` in server config (static token provider)

Interactive OAuth browser flow is not yet exposed in the UI — use pre-issued tokens.

## Disabling MCP

```json
{
  "thunder.mcp.enabled": false
}
```

Or disable built-in preload only:

```json
{
  "thunder.mcp.preloadBuiltin": false
}
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Server won't start | Check `npx` is on PATH; read error in Integrations status |
| Missing tools | Confirm server connected; check `toolCount` in status |
| Remote 401 | Verify bearer token in headers |
| Slow startup | Lower `maxConcurrentStartup` or disable unused servers |
