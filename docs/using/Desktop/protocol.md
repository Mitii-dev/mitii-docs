# Engine Protocol

The desktop engine exposes a small HTTP API on a loopback port, protocol `mitii-desktop/v1`. The renderer (and any local tool) talks to it over this protocol.

## Routes

| Route | Behavior |
|---|---|
| `GET /health` | `{ ok, protocol, version, mode, workspaceRoot }` |
| `POST /v1/prompt` | Body `{ prompt, mode?, id? }` → NDJSON `ready` / `event` / `result` / `error` |
| `GET /v1/git/status` | Working tree snapshot (`staged` / `changes` / `untracked`) |
| `GET /v1/git/branches` | Local branch list + current |
| `POST /v1/git/stage` | Stage paths (argv-only) |
| `POST /v1/git/unstage` | Unstage paths (argv-only) |
| `POST /v1/git/discard` | Discard changes (argv-only) |
| `POST /v1/git/commit` | Commit (argv-only) |
| `POST /v1/git/checkout` | Checkout branch (argv-only) |

All git mutations are **safe argv-only**: the engine never executes shell strings.

## Auth

Optional `Authorization: Bearer <token>` when the engine was started with `--token`.

## Prompt streaming

`POST /v1/prompt` responds with NDJSON lines:

| Line | Meaning |
|---|---|
| `ready` | Run accepted; includes run id |
| `event` | Streaming agent events (tool calls, plan updates, …) |
| `result` | Final result payload |
| `error` | Terminal error |

## Notes

- The engine is spawned by Electron main; you do not manage its lifecycle from the UI.
- The same `@mitii/host` / `@mitii/sdk` ports power CLI, ACP, and desktop. Behavior (Decision Policy, tools, model routing) is identical across surfaces.
