# MCP Integrations

[Model Context Protocol](https://modelcontextprotocol.io/) (MCP) is an open standard for exposing tools to AI models. Mitii acts as an MCP **client**: it connects to external MCP servers and makes their tools available to the agent alongside its built-in capabilities. This lets you add file access, knowledge-graph queries, custom APIs, or any other tool without writing integration code.

MCP is an **app-level** feature. The VS Code extension and CLI manage the server lifecycle (start, stop, status), while the agent runtime enforces every tool call through the same [Decision Policy](/understanding/agent-intelligence/decision-policy) gate that governs built-in tools.

## Getting Started

MCP is **off by default**. To enable it:

1. Open **Settings → Integrations** in VS Code (or the equivalent CLI settings).
2. Toggle `mitii.mcp.enabled` to `true`.
3. Install a server from the built-in catalog, or add your own via config (see below).

Once a server is running, its tools appear in the agent's tool list and are available in the next conversation.

### Settings reference

| Setting | Purpose |
|---------|---------|
| `mitii.mcp.enabled` | Master switch. When off, no MCP servers start. |
| `mitii.mcp.servers` | Your installed server list. Enable, configure, or remove each one here. |
| `mitii.mcp.maxConcurrentStartup` | Maximum servers started in parallel (default **4**). |

## Built-in catalog

Mitii ships with three pre-configured servers you can install with one click from **Settings → Integrations**. Installing a catalog server copies its config into your workspace list so you can adjust it:

| Server | What it provides |
|--------|-----------------|
| `filesystem` | Scoped read/write access to a folder you choose |
| `memory` | A knowledge-graph store the agent can query |
| `sequential-thinking` | Structured step-by-step reasoning traces |

## Configuring servers

You can define servers in a JSON config file. Each server entry specifies a **transport** (how Mitii talks to it) and the connection details for that transport.

### Transports

| Type | Use when | Required fields |
|------|----------|-----------------|
| `stdio` | The server runs as a local process (e.g. via `npx`) | `command`, `args` |
| `sse` | The server is a remote Server-Sent Events endpoint | `url`, optional `headers` |
| `streamable-http` | The server implements the newer MCP Streamable HTTP spec | `url`, optional `headers` |

### Examples

**Local process (stdio)** — runs a filesystem server scoped to the current directory:

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

**Remote SSE endpoint** — connects to a hosted MCP server with a bearer token:

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

**Streamable HTTP** — same shape as SSE, but for servers implementing the newer spec:

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

### Config file locations and merge order

Mitii reads server configs from multiple sources and merges them top-to-bottom. When two sources define a server with the same name, the later entry wins:

1. Built-in catalog (if installed from the UI)
2. VS Code setting `mitii.mcp.servers`
3. Workspace `.mitii/mcp.json`
4. Workspace `.mcp.json` (shared with other MCP clients, e.g. Cursor, Windsurf)

This means you can keep a shared `.mcp.json` at the repo root for team-wide servers, and override or extend it per-project in `.mitii/mcp.json`.

## How MCP tools are enforced

MCP tools are not a separate trust boundary. They go through the same enforcement pipeline as built-in tools:

- **Naming.** Each tool is exposed to the model as `mcp__{server}__{tool}` (name capped at 128 characters). For example, a tool called `search` on a server called `my-tools` appears as `mcp__my-tools__search`.
- **Decision Policy.** Before execution, the [Decision Policy](/understanding/agent-intelligence/decision-policy) evaluates the call against your configured grants, path scopes, command rules, and output limits. If the policy denies the call, it is blocked and logged.
- **Tool Runtime.** Approved calls are executed through the [Tool Runtime](/understanding/execution/tool-runtime), which handles sandboxing, output sanitisation, and audit logging.
- **Act mode exclusions.** In [Act mode](/understanding/agent-intelligence/plan-act), you can exclude specific MCP tools from being offered to the model. This is useful when a server exposes tools you want available in Plan mode but not during autonomous execution.

### Runtime status

Server status (ready / error / disabled) is visible in **Settings → Integrations**. Use this to diagnose startup failures or confirm a server is connected before starting a conversation.

## Authentication

For remote servers (SSE or Streamable HTTP), authenticate using one of:

- A bearer token in `headers.Authorization` (shown in the examples above), **or**
- A static token via `oauth.accessToken` in the server config.

Interactive OAuth browser flows are not yet exposed in the UI. Use pre-issued tokens for now.

## Disabling MCP

To disable all MCP servers at once, set `mitii.mcp.enabled` to `false` in settings. To remove a single server, delete it from **Settings → Integrations → Installed servers**.

## Troubleshooting

| Issue | What to check |
|-------|---------------|
| Server won't start | Is the binary (e.g. `npx`) on your PATH? Read the error message in the Integrations status panel. |
| Tools not showing | Confirm the server status is **ready** (not error or disabled) and that its tool count is greater than zero. |
| Remote 401 / 403 | Verify the bearer token in `headers.Authorization` is valid and not expired. |
| Slow startup | Lower `mitii.mcp.maxConcurrentStartup`, or disable servers you don't use. |
| Tool blocked in Act mode | Check the Act-mode MCP exclusion list in settings. |

## Architecture

MCP support is split across the same layers as the rest of Mitii:

| Layer | Responsibility |
|-------|----------------|
| `apps/vscode` / `apps/cli` | Server lifecycle, settings UI, config merge, status display |
| `@mitii/host` | Host ports the Tool Runtime uses to execute (filesystem, process, network) |
| `@mitii/v8` (Tool Runtime + Decision Policy) | Grant validation, enforcement, audit, output sanitisation |

Because enforcement lives in the runtime rather than the app shell, MCP tools behave identically in VS Code, the CLI, and any custom host built on `@mitii/sdk`.
