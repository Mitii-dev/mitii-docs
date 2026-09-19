# VS Code Extension — Troubleshooting

## Common issues

- **"No provider configured"** — open Settings → Provider, choose a provider, and save. For cloud providers, also run **Mitii: Set Provider API Key**.
- **Panel not appearing** — ensure the extension is enabled for your workspace (`Cmd+Shift+P` → `Extensions: Show Enabled Extensions`).
- **Slow first response** — the initial run builds the repository index; subsequent runs are faster.
- **Autocomplete not showing** — verify `mitii.autocomplete.enabled` is true and the FIM endpoint is reachable. Check **View → Output → Mitii** for errors.

## Learn more

- [CLI](/using/CLI/) — the terminal interface to the same engine
- [Skills format](/understanding/agent-intelligence/skills) — authoring format and matcher fields
- [Providers](/integrations/providers) — full provider reference
- [MCP](/integrations/mcp) — MCP server configuration
- Website: [mitii.dev](https://mitii.dev)
- Docs: [docs.mitii.dev](https://docs.mitii.dev)
- Issues: [GitHub](https://github.com/mitii-dev/mitii/issues)
