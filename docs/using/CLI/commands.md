# Commands & Options

Complete reference for every `@mitii/cli` subcommand.

## Command table

| Command | Description |
|---|---|
| `setup` | Interactive (or flag-driven) model/provider setup |
| `ask <prompt>` | SDK ask with streaming, cancel, clarify/approve |
| `commit-message` | Draft commit message (auto-attaches `git-commit-message` skill) |
| `pr-summary` | Draft PR body (auto-attaches `git-pr-summary` skill) |
| `changelog` | Draft Keep a Changelog entry (auto-attaches `release-changelog` skill) |
| `run --auto "<task>"` | Unattended CI run (agent + apply autonomy; no prompts) |
| `session` | Interactive prompt loop with MITII banner |
| `index` | Full workspace index + publish repository state |
| `review` | Deterministic review prep / SARIF output |
| `status` | Show latest persisted repository state |
| `export-session` | Run ask and write secret-free JSON export |
| `connect` | Bridge Mitii into Telegram, Discord, or Slack |
| `schedule` | CRUD / trigger / history for automation schedules |
| `serve` | Long-lived automation daemon (+ optional webhook ingress) |
| `events` | List / inspect automation events |

## `mitii ask`

```bash
mitii ask "What is recursion?" --echo
```

| Flag | Description |
|---|---|
| `--echo` | Print the deterministic prep / SARIF payload (no LLM call) |
| `--mode ask` | Read-only ask mode (no tool execution) |
| `--skill <name>` | Attach a named skill (e.g. `code-review-and-quality`) |

Example — LLM findings with a skill:

```bash
mitii ask "Review the working-tree changes" --mode ask --skill code-review-and-quality --echo
```

## `mitii session`

Interactive prompt loop. Shows the dotted MITII banner on start.

```bash
mitii session
```

Type prompts, get streaming responses. `Ctrl+C` to cancel the current turn; `Ctrl+D` or `/exit` to leave.

## `mitii run`

Unattended CI-style run. No interactive prompts.

```bash
mitii run --auto "run tests and fix failures" --echo
```

## `mitii review`

Deterministic review preparation and SARIF output. No LLM required.

```bash
mitii review --preview
mitii review --from main --to HEAD --format sarif --output review.sarif
mitii review --commit abc1234
```

| Flag | Description |
|---|---|
| `--preview` | Show what would be reviewed (no output file) |
| `--from <ref>` | Base ref (default: `main`) |
| `--to <ref>` | Head ref (default: `HEAD`) |
| `--commit <sha>` | Review a single commit |
| `--format <fmt>` | `sarif` (default) or `json` |
| `--output <path>` | Write output to file |

> For **LLM-powered** findings, use `mitii ask … --skill code-review-and-quality` or the VS Code **Review** mode.

## `mitii index`

Builds the full workspace index and publishes repository state.

```bash
mitii index
```

## `mitii status`

Shows the latest persisted repository state.

```bash
mitii status
mitii status --json
```

## `mitii export-session`

Runs an ask and writes a secret-free JSON export.

```bash
mitii export-session "Summarize this repo" --out session.json --echo
```

## `mitii commit-message` / `pr-summary` / `changelog`

These gather git status/diff/log and **force-attach** the matching bundled skill:

```bash
mitii commit-message
mitii pr-summary
mitii changelog
# equivalent:
mitii ask --recipe commit-message
```

An optional note after the command becomes a user hint on the prompt.

## Recipes

### Writing recipes

The three built-in writing recipes (`commit-message`, `pr-summary`, `changelog`) auto-attach their skills and gather git context automatically. You can also invoke them via the generic `ask --recipe` flag.

### Parameterized recipes

Shareable `RecipeSpec` documents (`schemaVersion: 1`) live under `.mitii/recipes/<id>.json`. They compile to prompt / mode / skills / autonomy only — **never** widen `ToolGrant`.

```bash
mitii recipe run after-commit --param task="write tests and open a PR"
mitii recipe run commit-message --preview   # compile only
mitii recipe run .mitii/recipes/smoke.json --param word=hi --echo
```

Built-in writing recipe ids (`commit-message`, `pr-summary`, `changelog`) also work as `recipe run` targets.

## `mitii connect`

Bridge Mitii into a chat channel (Telegram, Discord, Slack). See [Setup & Providers](./setup) for Node 22+ requirement.

### Basic usage

```bash
mitii connect                         # list installed adapters
mitii connect <channel> --help        # channel-specific options
mitii connect --stop                  # stop all running connectors for this cwd
mitii connect <channel> --stop        # stop one channel
```

### Available adapters

| Channel | Command | Transport |
|---|---|---|
| Telegram | `mitii connect telegram` | Bot API long-poll |
| Discord | `mitii connect discord` | Bot gateway (WebSocket) |
| Slack | `mitii connect slack` | Socket Mode (WebSocket) |

### Shared flags (all channels)

| Flag | Meaning |
|---|---|
| `--cwd <path>` | Workspace root (default: current directory) |
| `--mode ask\|plan\|agent` | Same modes as CLI (`ask` default – safest for chat) |
| `--echo` | Force Echo LLM (local smoke, no API key) |
| `--approve` | Auto-approve mutation/plan gates (**default** for connectors) |
| `--deny` | Do not auto-approve; suspended turns stop instead |
| `--allowed-user-id <id>` | Allowlist platform user id (repeatable). **Recommended** |
| `--stop` | Stop a running connector for this channel/cwd |
| `-h`, `--help` | Channel help |

### In-chat commands (all channels)

| Command | Effect |
|---|---|
| `/help` | Short connector help + mode/cwd |
| `/new` | Clear this thread's Mitii conversation carry |
| `/whereami` | Print channel / user ids, cwd, mode |

Ordinary text becomes one Mitii turn; the reply is posted back to the same chat/thread. History is kept **per thread** under `.mitii/connectors/<channel>/`.

### Do you need GitHub (`gh`)?

**No – not as a `connect` adapter.** Connectors are chat surfaces (Telegram, Discord, Slack). GitHub is different:

| Need | Use |
|---|---|
| Chat with Mitii from phone / Discord / Slack | `mitii connect telegram\|discord\|slack` |
| PRs, issues, `gh` / `git` in a repo | Run Mitii **in the repo** (`--cwd`) with `--mode agent`; install [`gh`](https://cli.github.com/) on that machine if you want PR tooling |
| Bot that replies on PR / issue comments | Not a `connect` channel – use agent mode + `gh`, or a future issue-bot adapter |

### Security checklist

- Prefer `--mode ask` unless you intentionally want edits.
- Always set `--allowed-user-id` for personal bots.
- Keep bot tokens in environment variables, not in shell history.
- Run `mitii connect --stop` when you are done.

### Prerequisites (any channel)

1. Configure a real model (not echo), unless you are smoke-testing with `--echo`:

   ```bash
   mitii setup --provider anthropic --yes
   export ANTHROPIC_API_KEY=...
   ```

2. Prefer indexing the workspace once (ask/connect will auto-index if needed):

   ```bash
   mitii index --cwd /path/to/repo
   ```

3. Run `connect` with that workspace as `--cwd` so tools and project rules apply to the right tree.

### Telegram – step by step

#### 1. Create a bot

1. Open Telegram and chat with [@BotFather](https://t.me/BotFather).
2. Send `/newbot`, follow the prompts, copy the **bot token** (`123456:ABC...`).
3. Optional: `/setprivacy` → **Disable** if the bot should see all group messages (DMs work either way).

```bash
export TELEGRAM_BOT_TOKEN='123456:ABC...'
```

#### 2. Start the bridge

```bash
cd /path/to/repo
mitii connect telegram --token "$TELEGRAM_BOT_TOKEN"
# or omit --token when TELEGRAM_BOT_TOKEN is set

mitii connect telegram \
  --mode ask \
  --allowed-user-id 123456789
```

Telegram-only flags: `--token` / `-t`, `--bot-username` / `-u`.

#### 3. Allowlist your user id

1. Start once, send `/whereami` in chat, note `userId=...`.
2. Restart with `--allowed-user-id <that id>`.

#### 4. Stop

```bash
Ctrl-C
# or
mitii connect telegram --stop
```

### Discord – step by step

#### 1. Create a Discord application + bot

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**.
2. Open **Bot** → **Add Bot** → **Reset Token** → copy the bot token.
3. Under **Privileged Gateway Intents**, enable **Message Content Intent** (required to read message text).
4. Open **OAuth2 → URL Generator**:
   - Scopes: `bot`
   - Bot permissions: at least **Send Messages**, **Read Message History**, **View Channels**
5. Open the generated URL, invite the bot to your server.

```bash
export DISCORD_BOT_TOKEN='...'
```

#### 2. Start the bridge

```bash
cd /path/to/repo
mitii connect discord --token "$DISCORD_BOT_TOKEN"

mitii connect discord \
  --mode ask \
  --allowed-user-id 987654321012345678
```

Discord-only flags: `--token` / `-t` (or `DISCORD_BOT_TOKEN`).

Behavior:

- **DMs** – every message is handled (subject to allowlist).
- **Guild channels** – the bot only replies when **@mentioned**.

#### 3. Allowlist your Discord user id

1. Enable Discord Developer Mode (Settings → Advanced → Developer Mode).
2. Right-click your avatar → **Copy User ID**, or send `/whereami` to the bot.
3. Restart with `--allowed-user-id <id>`.

#### 4. Stop

```bash
Ctrl-C
# or
mitii connect discord --stop
```

### Slack – step by step

Slack uses **Socket Mode** (no public webhook URL).

#### 1. Create a Slack app

1. Open [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From scratch**.
2. **Socket Mode** → enable → create an **App-Level Token** with scope `connections:write` → copy `xapp-...`.
3. **OAuth & Permissions** → Bot Token Scopes, add at least:
   - `chat:write`
   - `channels:history`
   - `groups:history`
   - `im:history`
   - `mpim:history`
   - `app_mentions:read` (optional, useful in channels)
4. **Event Subscriptions** → enable → subscribe the bot to:
   - `message.im`
   - `message.channels` (and/or `message.groups` as needed)
5. **Install App** to your workspace → copy the **Bot User OAuth Token** `xoxb-...`.
6. Invite the bot to the channel: `/invite @YourBot`.

```bash
export SLACK_BOT_TOKEN='xoxb-...'
export SLACK_APP_TOKEN='xapp-...'
```

#### 2. Start the bridge

```bash
cd /path/to/repo
mitii connect slack \
  --bot-token "$SLACK_BOT_TOKEN" \
  --app-token "$SLACK_APP_TOKEN"

mitii connect slack \
  --mode ask \
  --allowed-user-id U012ABCDEF
```

Slack-only flags: `--bot-token`, `--app-token` (or the env vars above).

#### 3. Allowlist your Slack user id

1. Start once and send `/whereami` in a DM or channel with the bot.
2. Note `userId=U...` and restart with `--allowed-user-id U...`.

#### 4. Stop

```bash
Ctrl-C
# or
mitii connect slack --stop
```

### State on disk

Under the workspace:

```text
.mitii/connectors/telegram/<botUsername>.json
.mitii/connectors/telegram/<botUsername>.threads.json
.mitii/connectors/discord/default.json
.mitii/connectors/discord/default.threads.json
.mitii/connectors/slack/default.json
.mitii/connectors/slack/default.threads.json
```

Safe to delete `*.threads.json` to reset history. Tokens are **not** written to these files.

### How a turn works

1. The channel delivers an inbound message.
2. Allowlist / slash commands are handled locally.
3. Mitii runs `createCliClient` + `driveRun` (same engine as `mitii ask`).
4. `result.answer` is posted back (chunked if long).
5. Conversation carry is saved for the next message in that thread.

### Troubleshooting (connect)

| Symptom | What to try |
|---|---|
| Missing token errors | Set the channel env var or pass the matching `--token` / `--bot-token` / `--app-token` |
| `already running pid=...` | `mitii connect <channel> --stop` then start again |
| Echo / stub answers | Configure provider + API key; drop `--echo` |
| Unauthorized… | Your user id is not on `--allowed-user-id` |
| Telegram ignores group messages | BotFather → `/setprivacy` → Disable, or @mention the bot |
| Discord ignores guild messages | Enable **Message Content Intent**; @mention the bot |
| Slack not receiving events | Socket Mode on; app installed; bot invited; event subscriptions saved |
| `requires Node.js with global WebSocket` | Use Node **22+** (Discord/Slack bridges use the built-in WebSocket) |
| No repo context / weak tools | `mitii index --cwd ...` then restart connect with that `--cwd` |

### Modes

| Mode | Behavior |
|---|---|
| `ask` | Q&A / explain (default) |
| `plan` | Read-only plan; no file edits |
| `agent` | Edit + verify with approvals |

Set with `--mode <mode>` or `defaultMode` in config.

## `mitii schedule` / `serve` / `events`

Automation primitives:

```bash
mitii schedule list
mitii schedule create --cron "0 9 * * 1" --prompt "Weekly status"
mitii serve --port 3333
mitii events --last 10
```

## Common options (all commands)

| Option | Meaning |
|---|---|
| `-h`, `--help` | Show usage |
| `-v`, `--version` | Print package version |
| `--cwd <path>` | Workspace root (default: `process.cwd()`) |
| `--json` | Machine-readable JSON on stdout |
| `--stream-json` | NDJSON: one `{ type: "event", event }` line per RunEvent, then `{ type: "result", result }` |
| `--echo` | Force `EchoLlmPort` even when API keys are set |
| `--clarify <text>` | Non-interactive clarification resume |
| `--approve` / `--deny` | Non-interactive approval resume |
| `--out <file>` | Session export path (`export-session`) |
| `--mode <mode>` | `ask` \| `plan` \| `agent` |
| `--origin <o>` | `user` \| `automation` \| `api` (unattended policy) |
| `--autonomy <a>` | `readonly` \| `propose` \| `apply` \| `apply_and_pr` |
| `--agent <id\|path>` | Load `.mitii/agents/<id>.md` or a markdown path |
| `--prompt-file <path>` | Prompt from file (`-` = stdin) |
| `--loop-policy-json <json>` | Lab: one-off threshold overrides for this run |
| `--no-loop-policy` | Ignore config `loopPolicy` for this run |

Unknown options error out (they are not silently ignored).

`SIGINT` cancels the active run via `run.cancel()`.

### Loop / stall policy (lab)

By default the CLI uses **window-band standards** from the model context window (`compact` < 50k, `standard` < 100k, `wide` >= 100k). Permanent ship values live in `@mitii/v8` → `policy/loopPolicyBands.ts`.

Optional lab overrides (same merge as VS Code Developer → Custom loop policy):

```json
{
  "provider": "ollama",
  "model": "qwen3-coder:30b",
  "loopPolicy": {
    "enabled": true,
    "thresholds": {
      "maxReadOnlyToolTurnsBeforeMutationNudge": 14,
      "maxRejectedMutationRecoveries": 5
    }
  }
}
```

```bash
# One-off override (merged on top of config when enabled)
mitii ask "Fix types" --mode agent \
  --loop-policy-json '{"maxRejectedMutationRecoveries":5}'

# Force shipped bands only for this run
mitii ask "Fix types" --mode agent --no-loop-policy
```

Leave `loopPolicy` unset (or `"enabled": false`) for deploy / normal use.

## Next steps

- [Setup & Providers](./setup) — configure your provider
- [Providers](./providers) — supported providers and API key management
- [Skills](./skills) — use skills with `ask` and other commands
- [Development](./development) — build the CLI locally
