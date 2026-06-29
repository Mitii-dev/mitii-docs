# Development

Contributions welcome — see [CONTRIBUTING.md](https://github.com/codewithshinde/thunder-ai-agent/blob/main/CONTRIBUTING.md) on GitHub.

## Setup

```bash
git clone https://github.com/codewithshinde/thunder-ai-agent.git
cd thunder-ai-agent
npm install
npm run compile
```

Press **F5** to launch the Extension Development Host.

## Scripts

| Command | Purpose |
|---------|------|
| `npm run watch` | Extension + webview hot rebuild |
| `npm run test` | Vitest unit tests |
| `npm run lint` | TypeScript typecheck |
| `npm run package` | Build `.vsix` |
| `npm run rebuild:native` | Rebuild `better-sqlite3` for VS Code Electron |

## Project layout

```
src/
├── core/           # Agent, indexing, tools, safety, MCP
├── vscode/         # Extension entry, webview provider
├── webview-ui/     # React sidebar
└── shared/         # Brand constants
test/               # Vitest tests
```

## Related repositories

| Repo | URL |
|------|-----|
| Docs | [github.com/codewithshinde/mitii-docs](https://github.com/codewithshinde/mitii-docs) → docs.mitii.dev |
| Website | [github.com/codewithshinde/mitii-website](https://github.com/codewithshinde/mitii-website) → mitii.dev |

## Native module note

VS Code and Cursor ship their own Electron runtime:

```bash
npm run rebuild:native          # VS Code
THUNDER_EDITOR=cursor npm run rebuild:native   # Cursor
npm run rebuild:node            # for local vitest
```

## Branding

Display name constants live in `src/shared/brand.ts`. Keep in sync with `mitii-docs/brand.ts` and `mitii-website/brand.ts`.

## Community

- [GitHub](https://github.com/codewithshinde/thunder-ai-agent)
- [Discord](https://discord.gg/sa8rubf6HH)
- [Issues](https://github.com/codewithshinde/thunder-ai-agent/issues)
