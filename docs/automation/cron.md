# Cron & Event Triggers

Mitii's daemon supports two kinds of unattended triggers: **cron schedules** (time-based) and **event triggers** (push, CI failure, etc.).

## Cron schedules

### Memory Consolidate (weekly)

```yaml
name: memory-consolidate
cron: "0 3 * * 0"        # Sunday 03:00 UTC
timezone: UTC
mode: ask
autonomyPreset: readonly
enabled: false            # enable when ready
```

Runs `MemoryPipeline.consolidate` to merge, deduplicate, and prune stale memories. Uses a [memory lease](/understanding/agent-intelligence/memory-leases) to prevent concurrent mutation.

### Morning Health (weekdays)

```yaml
name: morning-health
cron: "0 9 * * MON-FRI"  # Weekdays 09:00
timezone: America/Chicago
mode: ask
autonomyPreset: readonly
enabled: true
```

Summarizes repository health: recent commits, open issues, test status, and any pending memory approvals.

## Event triggers

### Post-commit Cover (push)

```yaml
name: post-commit-cover-event
title: Post-commit cover (push)
trigger: event
event: github.push
dedupeWindowSeconds: 600
cooldownSeconds: 120
maxParallel: 1
mode: agent
autonomyPreset: apply_and_pr
enabled: true
```

On push: inspect commits, write missing tests, run suite, open draft PR. See [Post-commit Cover](/automation/agents/post-commit-cover).

### CI Failure Triage

```yaml
name: ci-failure-triage
title: CI Failure Triage
trigger: event
event: github.workflow_run.completed
filter.conclusion: failure
dedupeWindowSeconds: 3600
cooldownSeconds: 300
mode: ask
autonomyPreset: readonly
enabled: true
```

On CI failure: triage the failure, produce a structured incident ticket. See [Incident from Logs](/automation/agents/incident-from-logs).

## Key properties

| Property | Purpose |
|---|---|
| `dedupeWindowSeconds` | Prevents duplicate runs within the window |
| `cooldownSeconds` | Minimum gap between runs of the same trigger |
| `maxParallel` | Concurrency cap per trigger |
| `autonomyPreset` | Controls what the agent may do unattended |

## Related

- [Daemon](/using/daemon) — the process that runs these triggers
- [Automation overview](/automation/) — design principles
- [Smoke scripts](/automation/smoke) — how to test these paths
