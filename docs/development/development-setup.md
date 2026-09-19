# Development Setup

This page covers everything you need to clone, build, and run Mitii locally for development. It assumes you are working on the [Mitii VS Code extension](https://github.com/Mitii-dev/Mitii) or its underlying packages.

Contributions are welcome — see [CONTRIBUTING.md](https://github.com/Mitii-dev/Mitii/blob/main/CONTRIBUTING.md) for contribution guidelines.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| VS Code | 1.124+ | Cursor also works (see [native rebuild](#native-modules)) |
| Node.js | 20+ | |
| pnpm | 10.13+ | Used as the workspace package manager |
| git | any recent version | |

### Optional dependencies

These are not required for basic development but enable additional features:

| Dependency | Enables |
|------------|---------|
| A local [Ollama](https://ollama.com) or other OpenAI-compatible endpoint | Manual testing against local models |
| `@xenova/transformers` | Vector search (semantic code retrieval) |
| `web-tree-sitter` + `tree-sitter-wasms` | Symbol extraction from source files |

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Mitii-dev/Mitii.git
cd Mitii
pnpm install
```

`pnpm install` also runs the workspace `prepare` script, which installs git hooks. The pre-commit hook automatically stages version bumps via `scripts/bump-version.mjs`.

### 2. Build

```bash
pnpm run build:all
```

This compiles all packages and rebuilds the `better-sqlite3` native module for the Electron ABI used by VS Code / Cursor. The rebuilt binary is staged into `apps/vscode/dist/native`.

::: tip
`pnpm run setup` performs install + Node rebuild + build + Electron rebuild in one step. Use `pnpm run setup:cursor` if you are targeting Cursor's Electron ABI instead.
:::

### 3. Launch the extension

1. Open the repo root in VS Code or Cursor.
2. Press **F5** — this launches the [Extension Development Host](https://code.visualstudio.com/docs/extensions/developing-extensions#_running-and-debugging-extensions) (a separate VS Code window that loads `apps/vscode` via `.vscode/launch.json`).
3. In that window, open any project folder you want to test against.
4. Click the **Mitii** icon in the activity bar to open the agent panel.

To verify the extension loads without a full Extension Host window, run:

```bash
pnpm run f5:verify
```

### 4. Day-to-day development loop

After making changes to the extension or its packages:

```bash
pnpm --filter @mitii/vscode build
```

Then **reload** the Extension Development Host window (`Ctrl+Shift+P` → *Developer: Reload Window*). This picks up the rebuilt extension code.

## Project Structure

Mitii is a pnpm monorepo with a layered architecture:

```
Mitii/
├── packages/v8/                  # @mitii/v8 — host-neutral agent runtime (17 modules)
├── packages/sdk/                 # @mitii/sdk — public API surface over V8
├── packages/host/                # @mitii/host — shared host kit (indexing, SQLite, ports)
├── apps/vscode/                  # VS Code extension (webview UI, settings, MCP server)
├── apps/cli/                     # Headless CLI (@mitii/cli)
├── tests/                        # Architecture tests, consumer tests, solid benchmark
├── docs/
├── scripts/
├── pnpm-workspace.yaml
└── package.json                  # Private workspace orchestrator (no published package)
```

### Dependency direction

```
apps/vscode, apps/cli
       ↓
   @mitii/host
       ↓
   @mitii/sdk
       ↓
   @mitii/v8
```

Hosts (the VS Code extension, the CLI) interact with the agent exclusively through `@mitii/sdk`. Do not import from `@mitii/v8`'s `actions/` or `internal/` directories directly — those are implementation details that may change without notice.

## Common Scripts

| Command | What it does |
|---------|-------------|
| `pnpm test` | Runs architecture tests + selected Vitest suites (auto-heals SQLite ABI if needed) |
| `pnpm run test:v8` | Runs tests for the `@mitii/v8` package only |
| `pnpm run test:watch` | Vitest in watch mode (re-runs on file changes) |
| `pnpm run typecheck` | TypeScript typecheck across v8, sdk, cli, and vscode |
| `pnpm run build` | Builds all packages (no native rebuild) |
| `pnpm run build:all` | Full F5-ready build: packages + Electron native module |
| `pnpm run package` | Produces a distributable `.vsix` → `mitii-ai-agent-<version>.vsix` |
| `pnpm run benchmark` | Runs the solid benchmark suite |
| `pnpm run benchmark:validate` | Validates benchmark fixtures |
| `pnpm run audit:dependencies` | Audits dependencies for known issues |
| `pnpm run audit:dead-code` | Detects unreachable / unused code |
| `pnpm run check:circular-deps` | Checks for circular imports between packages |

## Native Modules

VS Code and Cursor each ship their own Electron runtime, which uses a different Node ABI than your system Node. Because `better-sqlite3` is a native addon, it must be compiled against the correct ABI or it will fail to load at runtime.

| Scenario | Command |
|----------|---------|
| Full F5-ready build (most common) | `pnpm run build:all` |
| Rebuild for VS Code extension host only | `pnpm run rebuild:native` |
| Rebuild for Cursor extension host | `MITII_EDITOR=cursor pnpm run rebuild:native` |
| Rebuild for local Node (vitest, CLI) | `pnpm run rebuild:node` |
| Both: stage Electron binary + restore Node ABI | `pnpm run rebuild:all` |

**How it works:** `rebuild:native` compiles `better_sqlite3.node` for the target Electron ABI, copies it into `apps/vscode/dist/native`, then restores the system Node ABI in `node_modules` so local tooling (vitest, CLI) continues to work.

::: warning
If you see a SQLite loading error on extension startup (e.g. `NODE_MODULE_VERSION` mismatch), run `pnpm run rebuild:native` (or the Cursor variant) and reload the Extension Host.
:::

## Branding

Display name constants are defined in `apps/vscode/src/shared/brand.ts`. If you change them, keep the following in sync:

- `mitii-docs/brand.ts`
- `mitii-website/brand.ts`

## Related Repositories

| Repo | URL | Purpose |
|------|-----|---------|
| Docs | [github.com/codewithshinde/mitii-docs](https://github.com/codewithshinde/mitii-docs) | This documentation site (docs.mitii.dev) |
| Website | [github.com/codewithshinde/mitii-website](https://github.com/codewithshinde/mitii-website) | Marketing site (mitii.dev) |

## Community

- [GitHub repository](https://github.com/Mitii-dev/Mitii)
- [Discord server](https://discord.gg/sa8rubf6HH)
- [Issue tracker](https://github.com/Mitii-dev/Mitii/issues)
