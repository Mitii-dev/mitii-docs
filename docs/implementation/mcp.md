# MCP integrations

Mitii speaks the [Model Context Protocol](https://modelcontextprotocol.io/) so you can plug in external tools — file access, memory graphs, custom APIs — without writing any code. MCP is an **app-level** feature: the VS Code extension and CLI own the server lifecycle, while the V8 engine enforces every tool call through the same Decision Policy gate as built-in tools.

## Turning MCP on

MCP is **off by default**. Enable it in **Settings → Integrations**:

| Setting | What it does |
|---------|-------------|
| `mitii.mcp.enabled` | Master switch. When off, no MCP servers start. |
| `mitii.mcp.servers` | Your installed server list. Enable, configure, or delete each one here. |

You can also install servers from the **built-in catalog** — picking one copies its config into your workspace list so you can tweak it.

## Built-in catalog servers

These ship with Mitii and are one click to install:

| Server | What it gives you |
|--------|-------------------|
| `filesystem` | Scoped read/write access to a folder you choose |
| `memory` | A knowledge-graph store the agent can query |
| `sequential-thinking` | Structured step-by-step reasoning traces |

## Transport types

Each server connects over one of three transports:

| Type | When to use | Required fields |
|------|-------------|-----------------|
| `stdio` | Local process (e.g. `npx`) | `command`, `args` |
| `sse` | Remote Server-Sent Events endpoint | `url`, optional `headers` |
| `streamable-http` | MCP Streamable HTTP (newer spec) | `url`, optional `headers` |

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

## Where configs are read (merge order)

Mitii merges these sources top-to-bottom; later entries override earlier ones with the same server name:

1. Built-in catalog (if you installed from it)
2. VS Code setting `mitii.mcp.servers`
3. Workspace `.mitii/mcp.json`
4. Workspace `.mcp.json` (shared with other MCP clients)

## How MCP tools run

- Tools are exposed to the model as `mcp__{server}__{tool}` (name capped at 128 chars).
- Every call passes through **Decision Policy** → **Tool Runtime**, the same enforcement path as built-in tools. The runtime validates the grant, checks path scope, command rules, and output limits, then executes through host ports.
- In **Act mode**, you can exclude specific MCP tools from being offered to the model ("Act mode MCP exclusions").
- Concurrent server startup is capped by `mitii.mcp.maxConcurrentStartup` (default **4**).
- Runtime status (ready / error / disabled) is shown in **Settings → Integrations** for diagnostics.

## Authentication

For remote servers:

- Pass a bearer token in `headers.Authorization`, **or**
- Set `oauth.accessToken` in the server config (static token provider).

Interactive OAuth browser flow is not yet exposed in the UI — use pre-issued tokens.

## Disabling MCP

Turn off everything:

```json
{ "mitii.mcp.enabled": false }
```

Or remove a single server from **Settings → Integrations → Installed servers**.

## Troubleshooting

| Issue | What to check |
|-------|---------------|
| Server won't start | Is `npx` (or the binary) on PATH? Read the error in Integrations status. |
| Tools not showing | Confirm the server is **ready** (not error/disabled) and check its tool count. |
| Remote 401 / 403 | Verify the bearer token in `headers.Authorization`. |
| Slow startup | Lower `maxConcurrentStartup` or disable servers you don't use. |
| Tool blocked in Act mode | Check the Act-mode MCP exclusion list in settings. |

## Where MCP lives in the codebase

| Layer | Responsibility |
|-------|----------------|
| `apps/vscode` / `apps/cli` | Server lifecycle, settings UI, config merge, status display |
| `@mitii/host` | Host ports the Tool Runtime uses to execute (filesystem, process, network) |
| `@mitii/v8` (Tool Runtime + Decision Policy) | Grant validation, enforcement, audit, output sanitisation |

This separation means MCP works identically in VS Code, the CLI, and any custom host built on `@mitii/sdk`.
