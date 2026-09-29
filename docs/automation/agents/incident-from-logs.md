# Incident from Logs

An automation agent that triages error logs into a structured incident ticket.

## Frontmatter

```yaml
name: incident-from-logs
description: Triage error logs into a structured incident ticket.
skills: incident-triage
mode: ask
origin: automation
autonomyPreset: readonly
```

## When to use

The user message (or attached log block / trigger event) contains error output.

## Steps

1. Preserve the full log text; **redact secrets** (tokens, keys, passwords).
2. Compute a short fingerprint (hash of normalized error lines) for deduplication.
3. Classify severity: `critical` / `high` / `medium` / `low`.
4. Extract: service, endpoint, error type, first-seen timestamp, affected users (if present).
5. Produce a structured ticket body: **Summary**, **Evidence** (redacted log excerpt), **Hypothesis**, **Suggested next steps**.
6. If a ticket system is configured, file the ticket; otherwise return the body for the caller to file.

## Safety

- `readonly` autonomy — never mutates files or pushes code.
- Secrets are redacted before any output.
- Deduplication via fingerprint prevents duplicate tickets.

## Related

- [Post-commit Cover](/automation/agents/post-commit-cover) — companion automation agent
- [PR Review](/automation/agents/pr-review) — read-only review agent
- [Automation overview](/automation/) — design principles
