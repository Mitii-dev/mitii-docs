# MCP Web Server

`@mitii/mcp-web` is a **stdio MCP server** that exposes Mitii's search and fetch capabilities to *other* agents. It lives under `packages/mcp/web/` (same MCP folder as the client).

| Package | Direction |
|---|---|
| `@mitii/mcp` (`packages/mcp`) | Mitii **calls** external MCP servers (client) |
| `@mitii/mcp-web` (`packages/mcp/web`) | Other agents **call** Mitii (server) |

## Tools

| Tool | Behavior |
|---|---|
| `web_search` | Brave / SearXNG / Tavily via env |
| `fetch_url` | Content resolvers with URL safety |
| `memory_search` | Opt-in read-only shareable facts (set `MITII_MCP_WEB_MEMORY=1`) |

## Run

```bash
pnpm --filter @mitii/mcp-web build
node packages/mcp/web/bin/mitii-mcp-web.js
```

## Dependencies

Depends on `@mitii/search-kit` only (not v8 / sdk / host). This keeps the server lightweight and portable.

## Layout

```
packages/mcp/web/
├── src/
│   ├── tools.ts
│   ├── memory/          # memory_search (MITII_MCP_WEB_MEMORY=1)
│   ├── server.ts
│   └── index.ts
└── bin/mitii-mcp-web.js
```

## Related

- [MCP (client)](/integrations/mcp) — how Mitii calls external MCP servers
- [Search Kit](/integrations/search-kit) — the retrieval engine behind this server
