# Daemon

The Mitii daemon (`@mitii/daemon`) is a long-lived automation process that runs schedules, event triggers, and cron jobs without a human in the loop.

## Run

```bash
mitii-daemon --cwd /path/to/repo
# equivalent:
mitii serve --cwd /path/to/repo
```

## What it does

- **Queue** — backed by `@mitii/automation` (SQLite-backed job queue)
- **Executor** — uses `@mitii/host` (SDK executor) to run agent turns
- **Schedules** — cron expressions, event triggers (push, CI failure), and one-shot jobs
- **Autonomy presets** — `readonly`, `apply`, `apply_and_pr` control what the agent may do unattended

## Key properties

| Property | Detail |
|---|---|
| Does not import `apps/cli` | Standalone process; CLI is a thin wrapper |
| Idempotent triggers | Deduplication windows prevent duplicate runs |
| Cooldown | Per-schedule cooldown prevents rapid re-fires |
| Max parallel | Configurable concurrency cap per schedule |

## Related

- [Automation overview](/automation/) — design principles, testing strategy
- [Design & Testing](/automation/DESIGN_AND_TESTING) — how to add new unattended scenarios
- [Shipping](/automation/SHIP) — E2E shipping loops
- [ACP Bridge](/using/acp) — stdio protocol alternative
