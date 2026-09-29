# PR Review

A read-only, structured code review agent for pull request changes.

## Frontmatter

```yaml
name: pr-review
title: PR Code Review
description: Read-only structured review of pull request changes.
mode: ask
autonomy: readonly
```

## When to use

A PR is open and you want a structured Mitii review before a human reads it.

## Steps

1. Fetch the PR diff (workspace / range / commit scope).
2. Run the [Review module](/understanding/agent-intelligence/review) to produce structured findings.
3. Classify each finding: `critical` / `high` / `medium` / `low`.
4. Produce a review summary: **Blockers**, **Suggestions**, **Nits**.
5. Post the review as a PR comment (if a ticket/PR system is configured).

## Safety

- `readonly` autonomy — never mutates files, never pushes, never merges.
- Findings are advisory; a human makes the final call.

## Related

- [Post-commit Cover](/automation/agents/post-commit-cover) — writes tests after commit
- [Incident from Logs](/automation/agents/incident-from-logs) — triages error logs
- [Review module](/understanding/agent-intelligence/review) — the engine behind this agent
