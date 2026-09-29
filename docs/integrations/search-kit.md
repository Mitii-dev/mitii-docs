# Search Kit

`@mitii/search-kit` is a host-neutral **web retrieval kit** for Mitii: pluggable search providers, URL fetchers, and content resolvers — without pulling in the agent runtime.

## Architecture

```
apps/cli | apps/vscode | (future MCP)
        |
        v
@mitii/host --------+--> @mitii/search-kit
        |                |
        v                v
@mitii/sdk          @mitii/mcp-web
```

Search-kit is the shared retrieval layer used by the host, the SDK, and the MCP web server.

## What it provides

| Capability | Detail |
|---|---|
| Search providers | Brave, SearXNG, Tavily (via env config) |
| URL fetch | Content resolvers with URL safety checks |
| Provider abstraction | Pluggable — swap providers without touching callers |
| No agent runtime | Does not import v8 / sdk / host |

## Related

- [MCP Web Server](/integrations/mcp-web) — exposes search-kit to other agents
- [MCP](/integrations/mcp) — how Mitii calls external MCP servers
