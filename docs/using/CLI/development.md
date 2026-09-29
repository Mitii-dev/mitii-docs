# Development

Build, run, and test `@mitii/cli` locally from the monorepo.

## Prerequisites

- **Node.js 20+** (22+ for Discord/Slack bridge development)
- **pnpm** (monorepo package manager)
- Native build toolchain for `better-sqlite3` (Python 3, C/C++ compiler)

## Build

```bash
pnpm install
pnpm --filter @mitii/cli build
```

## Run

```bash
node apps/cli/bin/mitii.js --help
```

Or link it globally for convenience:

```bash
pnpm --filter @mitii/cli link
mitii --help
```

Smoke test:

```bash
node apps/cli/bin/mitii.js ask "ping" --echo --json
node apps/cli/bin/mitii.js setup --show
```

## Test

```bash
pnpm --filter @mitii/cli test
```

## Typecheck

```bash
pnpm --filter @mitii/cli exec tsc --noEmit
```

## Publishing

Releases are published from the monorepo on `v*` git tags:

```bash
git tag v3.0.0
git push origin v3.0.0
```

The CI pipeline builds, tests, and publishes `@mitii/cli` to npm.

> **Legacy note:** npm `@mitii/cli@2.7.x` is a different binary stack. Always prefer versions published from this tree.

## Phase 0 CI automation

`--origin` / `--autonomy` / `--agent` / `mitii run --auto` work today, plus optional `.mitii/safety.json` (tighten-only) and `MITII_SANDBOX=1` (OS process sandbox, fail-closed). See [SAFETY_PHASES.md](../../modules_explanation/docs/SAFETY_PHASES.md).

`--prompt-file` plus the example workflows under `docs/examples/workflows/mitii-*.yml`. See [automation README](../../modules_explanation/docs/automation/README.md).

## Project layout

```
apps/cli/
├── bin/
│   └── mitii.js          # entry point
├── src/
│   ├── commands/         # one file per subcommand
│   ├── sdk/              # @mitii/sdk bindings
│   └── index.ts          # CLI parser (commander)
├── package.json
└── tsconfig.json
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `better-sqlite3` build fails | Install Python 3 + build tools; or `npm rebuild better-sqlite3` |
| `mitii: command not found` | Run `pnpm --filter @mitii/cli link` or use `node apps/cli/bin/mitii.js` |
| WebSocket errors (Discord/Slack) | Upgrade to Node 22+ |
| Stale build | `rm -rf apps/cli/dist && pnpm --filter @mitii/cli build` |

## Out of scope

- Daemon and board UIs are not part of this CLI yet (Phase 1+).
- Channel bridges are Telegram, Discord, and Slack via `mitii connect`.
- GitHub work uses the repo + `tools/gh`, not a `connect` adapter (see [Commands & Options](./commands#mitii-connect--channel-bridges)).

## Links

- Repo: [Mitii-dev/Mitii](https://github.com/Mitii-dev/Mitii)
- SDK: [`@mitii/sdk`](https://github.com/Mitii-dev/Mitii/tree/main/packages/sdk)
- Host kit: [`@mitii/host`](https://github.com/Mitii-dev/Mitii/tree/main/packages/host)

## Next steps

- [Overview](./overview) — what the CLI is and how to install it
- [Setup & Providers](./setup) — configure a provider
- [Commands & Options](./commands) — full command reference
