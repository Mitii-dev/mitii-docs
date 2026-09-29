# Post-commit Cover

An automation agent that writes missing tests after a commit, verifies the suite, and opens a draft PR.

## Frontmatter

```yaml
name: post-commit-cover
description: After a commit, write missing tests, verify the suite, and open a draft PR.
skills: cicd-agent
mode: agent
origin: automation
autonomyPreset: apply_and_pr
```

## When to use

A push or commit has landed and changed behavior lacks test coverage.

## Steps

1. Inspect the pushed/committed diff; identify changed behavior.
2. Write missing tests for the changed behavior (unit or integration as appropriate).
3. Run the focused test suite for the changed module.
4. If green, run the full repo suite.
5. If all green, open a **draft PR** via `create_pull_request` from branch `mitii/cover-<shortsha>`.
6. **Never push to main or master.**

## Safety

- `apply_and_pr` autonomy — may edit files and open a PR, but never pushes to protected branches.
- Draft PR only — a human must review and merge.
- Deduplication window (600 s) prevents duplicate runs on rapid pushes.

## Related

- [Incident from Logs](/automation/agents/incident-from-logs) — companion automation agent
- [PR Review](/automation/agents/pr-review) — read-only review agent
- [Shipping](/automation/SHIP) — E2E shipping loops
- [Cron & Events](/automation/cron) — trigger definitions
