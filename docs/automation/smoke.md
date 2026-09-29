# Smoke Scripts

Smoke scripts validate the CLI automation path end-to-end without a real model. They live under `docs/automation/smoke/` in the source repo.

## Example 1 — Post-commit cover

```bash
#!/usr/bin/env bash
# Smoke Example 1 — post-commit cover path (schedule + optional echo serve tick).
# With --echo: uses ask/readonly so the echo provider can complete without edits.
# Without --echo: only validates schedule create + trigger queueing.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

ECHO=0
for arg in "$@"; do
  if [ "$arg" = "--echo" ]; then ECHO=1; fi
done

DB="$(mktemp "${TMPDIR:-/tmp}/mitii-e2e1.XXXXXX").db"
WORKDIR="$(mktemp -d "${TMPDIR:-/tmp}/mitii-e2e1-ws.XXXXXX")"
export MITII_AUTOMATION_DB="$DB"
trap 'rm -f "$DB"; rm -rf "$WORKDIR"' EXIT

mkdir -p "$WORKDIR/src"
printf 'export function add(a: number, b: number) { return a + b; }\n' > "$WORKDIR/src/add.ts"
printf '# smoke workspace\n' > "$WORKDIR/README.md"

echo "==> building CLI + host"
pnpm --filter @mitii/host build >/dev/null
pnpm --filter @mitii/cli build >/dev/null

BIN=(node "$ROOT/apps/cli/bin/mitii.js")

if [ "$ECHO" = "1" ]; then
  MODE=ask
  AUTONOMY=readonly
  PROMPT="Read README.md and reply with one sentence confirming the workspace is ready."
else
  MODE=agent
  AUTONOMY=apply_and_pr
  PROMPT="Inspect latest commit; write missing tests; if green open draft PR."
fi

echo "==> schedule create (mode=$MODE autonomy=$AUTONOMY)"
"${BIN[@]}" schedule create "e2e-post-commit" \
  --cron "0 0 1 1 *" \
  --prompt "$PROMPT" \
  --workspace "$WORKDIR" \
  --mode "$MODE" \
  --autonomy "$AUTONOMY" \
  --json > /tmp/mitii-e2e1-spec.json

SPEC_ID="$(node -e "const j=require('/tmp/mitii-e2e1-spec.json'); console.log(j.specId)")"
echo "spec=$SPEC_ID"
```

## Example 2 — CI failure triage

```bash
#!/usr/bin/env bash
# Smoke Example 2 — CI failure event trigger path.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

DB="$(mktemp "${TMPDIR:-/tmp}/mitii-e2e2.XXXXXX").db"
export MITII_AUTOMATION_DB="$DB"
trap 'rm -f "$DB"' EXIT

pnpm --filter @mitii/host build >/dev/null
pnpm --filter @mitii/cli build >/dev/null

BIN=(node "$ROOT/apps/cli/bin/mitii.js")

echo "==> event trigger create"
"${BIN[@]}" schedule create "e2e-ci-failure" \
  --event "github.workflow_run.completed" \
  --filter "conclusion=failure" \
  --prompt "Triage the CI failure and produce a structured incident ticket." \
  --mode ask \
  --autonomy readonly \
  --json > /tmp/mitii-e2e2-spec.json

echo "OK"
```

## How to run

```bash
# From the repo root:
bash docs/automation/smoke/example1-post-commit.sh --echo
bash docs/automation/smoke/example2-ci-failure.sh
```

## What they validate

| Script | Validates |
|---|---|
| `example1-post-commit.sh` | Schedule create → trigger queue → (optional) echo serve tick |
| `example2-ci-failure.sh` | Event trigger create with filter + dedup window |

## Related

- [Design & Testing](/automation/DESIGN_AND_TESTING) — full testing strategy
- [Cron & Events](/automation/cron) — trigger definitions
- [Daemon](/using/daemon) — the process that executes these
