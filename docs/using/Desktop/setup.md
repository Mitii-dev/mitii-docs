# Setup

This page takes you from a clean machine to a running Mitii Desktop window.

## What you need

| Requirement | Details |
|---|---|
| **Node.js** | 20+ (22 recommended) |
| **Package manager** | pnpm |
| **A model** | Ollama (local) or a cloud provider (Anthropic, OpenAI, Gemini, etc.) |

## Install

There is no standalone installer yet. You build the app from the monorepo:

```bash
git clone https://github.com/Mitii-dev/Mitii
cd Mitii

pnpm install
pnpm --filter @mitii/sdk --filter @mitii/host --filter @mitii/mcp build
pnpm --filter @mitii/desktop build
```

## Launch

```bash
pnpm --filter @mitii/desktop dev
```

This opens the Electron window. The main process spawns a local engine on a loopback port; the UI talks to it over HTTP. You do not manage the engine lifecycle manually.

## Connect a model

1. In the app, open **Settings > Provider**.
2. Pick a preset (Ollama, Anthropic, OpenAI, Gemini, etc.).
3. Paste your API key (or point to a local Ollama URL).
4. Click **Test connection**, then **Save**.

Alternatively, run `mitii setup` in a terminal once. Desktop reads the same `.mitii/config.json` the CLI writes, so the configuration carries over automatically.

## Useful scripts

| Script | What it does |
|---|---|
| `pnpm --filter @mitii/desktop dev` | Launch the full desktop app |
| `pnpm --filter @mitii/desktop start` | Same as `dev` (production build) |
| `pnpm --filter @mitii/desktop engine:echo` | Run the engine only (no window), with a fake model for smoke tests |
| `pnpm --filter @mitii/desktop test` | Run contract and integration tests |

## Troubleshooting

### Electron failed to install correctly

```bash
rm -rf node_modules/electron
pnpm install
node node_modules/electron/cli.js --version
```

### No window appears

If the environment variable `ELECTRON_RUN_AS_NODE` is set, Electron will not create a window. The `dev` and `start` scripts clear it automatically. If you launch Electron manually, unset the variable first:

```bash
# macOS / Linux
env -u ELECTRON_RUN_AS_NODE npx electron .

# Windows (PowerShell)
$env:ELECTRON_RUN_AS_NODE=""; npx electron .
```

### Engine does not respond

Check that the loopback port is free. The engine binds to `127.0.0.1` only. If another process is using the port, kill it or restart the app.

## Next steps

- [Desktop Overview](./overview): what you can do in the app
- [Engine Protocol](./protocol): the internal HTTP API (for developers)
- [Development Setup](../../development/development-setup): full monorepo build guide
