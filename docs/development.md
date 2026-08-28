# Development

Contributions welcome — see [CONTRIBUTING.md](https://github.com/Mitii-dev/Mitii/blob/main/CONTRIBUTING.md) on GitHub.

## Prerequisites

| Tool | Version |
|------|---------|
| VS Code | 1.124+ (Cursor works with the native rebuild below) |
| Node.js | 20+ |
| pnpm | 10.13+ |
| git | any recent version |

Optional for full feature coverage:

- A local Ollama or other OpenAI-compatible endpoint for manual testing
- `@xenova/transformers` (optional dependency) for vector search
- `web-tree-sitter` + `tree-sitter-wasms` for symbol extraction

## Setup

```bash
git clone https://github.com/Mitii-dev/Mitii.git
cd Mitii
pnpm install
pnpm run build:all   # packages + Electron better-sqlite3 staged into apps/vscode/dist/native
```

Or use the one-shot setup scripts:

```bash
pnpm run setup          # install + Node rebuild + build + Electron rebuild
pnpm run setup:cursor   # same, but targets Cursor's Electron ABI
```

Git hooks are installed automatically via `pnpm install` → `prepare` → `scripts/install-git-hooks.mjs`. The pre-commit hook stages version bumps from `scripts/bump-version.mjs`.

### Launch the extension

1. Open the repo root in VS Code / Cursor
2. Press **F5** (loads `apps/vscode` via `.vscode/launch.json`)
3. In the Extension Development Host, open a project folder
4. Click the Mitii icon in the activity bar

Automated F5 gate (no Extension Host): `pnpm run f5:verify`

### Watch mode (day-to-day dev)

```bash
pnpm --filter @mitii/vscode build
```

Rebuild the extension package after host changes. Reload the Extension Development Host after rebuilds.

## Scripts

| Command | Purpose |
|---------|------|
| `pnpm test` | Architecture + selected Vitest suites (auto-heals SQLite ABI) |
| `pnpm run test:v8` | `@mitii/v8` package tests |
| `pnpm run test:watch` | Vitest watch mode |
| `pnpm run typecheck` | TypeScript typecheck across v8 + sdk + cli + vscode |
| `pnpm run build` | Build all packages |
| `pnpm run build:all` | Full F5-ready build (packages + Electron native) |
| `pnpm run package` | Build `.vsix` → `mitii-ai-agent-<version>.vsix` |
| `pnpm run benchmark` | Run the solid benchmark suite |
| `pnpm run benchmark:validate` | Validate benchmark fixtures |
| `pnpm run audit:dependencies` | Dependency audit |
| `pnpm run audit:dead-code` | Dead-code audit |
| `pnpm run check:circular-deps` | Circular dependency check |

## Project layout

```
Mitii/
├── packages/v8/                  # @mitii/v8 — host-neutral runtime (17 modules)
├── packages/sdk/                 # @mitii/sdk — public API over V8
├── packages/host/                # @mitii/host — shared host kit (indexing, SQLite, ports)
├── apps/vscode/                  # VS Code extension (webview, settings, MCP)
├── apps/cli/                     # Headless CLI (@mitii/cli)
├── tests/                        # Architecture, consumer, solid benchmark
├── docs/
├── scripts/
├── pnpm-workspace.yaml
└── package.json                  # Private workspace orchestrator
```

**Dependency direction:** `apps → @mitii/host → @mitii/sdk → @mitii/v8`. Hosts use `@mitii/sdk` only — do not import V8 `actions/` or `internal/` directly.

## Native module note

VS Code and Cursor ship their own Electron runtime. `better-sqlite3` must be rebuilt for the correct ABI:

| Scenario | Command |
|----------|---------|
| Full F5-ready build | `pnpm run build:all` |
| VS Code extension host | `pnpm run rebuild:native` |
| Cursor extension host | `MITII_EDITOR=cursor pnpm run rebuild:native` |
| Local vitest / CLI only | `pnpm run rebuild:node` |
| Both (Electron staged + Node restored) | `pnpm run rebuild:all` |

`rebuild:native` stages `better_sqlite3.node` into `apps/vscode/dist/native`, then restores the system Node ABI in `node_modules`. If SQLite throws on startup, this is almost always the fix.

## Branding

Display name constants live in `apps/vscode/src/shared/brand.ts`. Keep in sync with `mitii-docs/brand.ts` and `mitii-website/brand.ts`.

## Related repositories

| Repo | URL |
|------|-----|
| Docs | [github.com/codewithshinde/mitii-docs](https://github.com/codewithshinde/mitii-docs) → docs.mitii.dev |
| Website | [github.com/codewithshinde/mitii-website](https://github.com/codewithshinde/mitii-website) → mitii.dev |

## Community

- [GitHub](https://github.com/Mitii-dev/Mitii)
- [Discord](https://discord.gg/sa8rubf6HH)
- [Issues](https://github.com/Mitii-dev/Mitii/issues)
