# Automation

## Overview

Mitii is a local-first coding agent. In interactive sessions, a human is always in the loop: approving edits, answering clarifications, deciding when to stop. **Automation is the other half of that story: it lets Mitii work without a human present.**

Concretely, automation is a set of capabilities that let you:

- **Trigger a Mitii run from outside the editor**: from a cron schedule, a GitHub webhook, a CI pipeline, or a simple shell script.
- **Constrain what that run may do**: via *autonomy presets* (`readonly`, `propose`, `apply`, `apply_and_pr`) so an unattended agent never exceeds the scope you intend.
- **Deliver results where you need them**: as a draft PR, a GitHub issue, a Slack/Discord/Telegram message, a webhook payload, or a CI check annotation.

The guiding principle: *the same agent, the same tools, the same safety model, just no human at the keyboard.*

## How it works

An automated run has three parts:

1. **A trigger**: something tells Mitii to start. This can be a time-based cron schedule ("every Sunday at 03:00, consolidate memory") or an event ("a push just landed", "CI just failed"). Triggers are defined as small YAML/markdown specs you drop into `.mitii/cron/` or wire up via GitHub webhooks.

2. **An agent**: a markdown file that describes *what to do* and *how to do it*. It names the skills to load, the steps to follow, and the safety boundaries. Mitii ships three ready-made agents:
   - **Post-commit Cover**: after a push, inspects the diff, writes missing tests, runs the suite, and opens a draft PR.
   - **PR Review**: reads an open PR's diff, produces a structured review (blockers / suggestions / nits), and posts it as a comment.
   - **Incident from Logs**: takes an error log, redacts secrets, classifies severity, and files a structured incident ticket.

   You can also write your own agent files for any scenario.

3. **A delivery adapter**: once the agent finishes, the result is routed to wherever you configured it: a GitHub PR, an issue, a chat channel, a webhook, or a CI check.

The CLI flag `--origin automation` marks the run as unattended. Internally, the V8 Decision Policy sees that flag and suppresses interactive clarifications. If the agent *needs* a human answer, it exits with code `4` instead of hanging.

## The SHIP loop

"Shipping" an automation scenario means proving the full loop works end-to-end on a real repository:

```
trigger fires → agent runs → tests pass / ticket filed → result delivered
```

Mitii ships two reference loops:

- **Post-commit → tests → draft PR**: push a commit that changes behavior without tests; the workflow writes the tests, verifies them, and opens a draft PR for a human to review.
- **CI failure → evidence → incident ticket**: a CI run fails; Mitii collects the logs, redacts secrets, computes a fingerprint, and opens (or updates) a deduplicated issue.

Both loops can run via GitHub Actions (recommended for CI) or via the local `mitii serve` daemon with webhook ingress.

## Smoke testing

Before you wire up a live model, you can validate the entire automation path (schedule creation, trigger queueing, agent dispatch, and delivery) using **smoke scripts**. These are bash scripts that use an echo provider (no real LLM call) to confirm the plumbing works. They live under `docs/automation/smoke/` and are the fastest way to catch configuration errors.

## Where to go next

- [Design & Testing](/automation/DESIGN_AND_TESTING): how to design new agents, skills, and smoke tests
- [Shipping](/automation/SHIP): step-by-step E2E loops for post-commit and CI-failure scenarios
- [Cron & Events](/automation/cron): schedule and event trigger specs
- [Smoke Scripts](/automation/smoke): no-model validation scripts
- [Examples](/automation/examples): ready-to-use CI workflows and hook configs
- [Post-commit Cover](/automation/agents/post-commit-cover) · [PR Review](/automation/agents/pr-review) · [Incident from Logs](/automation/agents/incident-from-logs)
