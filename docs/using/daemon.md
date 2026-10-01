# Daemon

The Mitii daemon (`@mitii/daemon`) runs schedules, event triggers, and cron jobs without a human in the loop.

## Install & run

```bash
npm install -g @mitii/daemon
mitii-daemon --cwd /path/to/repo
# equivalent:
mitii serve --cwd /path/to/repo
```

## What it does

- **Schedules**: cron expressions, event triggers (push, CI failure), and one-shot jobs
- **Autonomy presets**: `readonly`, `apply`, `apply_and_pr` control what the agent may do unattended
- **Queue**: SQLite-backed job queue (`@mitii/automation`)
- **Executor**: runs agent turns via `@mitii/host`

## Operational guarantees

| Property | Detail |
|---|---|
| Idempotent triggers | Deduplication windows prevent duplicate runs |
| Cooldown | Per-schedule cooldown prevents rapid re-fires |
| Max parallel | Configurable concurrency cap per schedule |

## Related

- [Automation overview](/automation/)(design principles, testing strategy)
- [Design & Testing](/automation/DESIGN_AND_TESTING)(how to add new unattended scenarios)
- [Shipping](/automation/SHIP)(E2E shipping loops)
- [ACP Bridge](/using/acp)(stdio protocol alternative)
