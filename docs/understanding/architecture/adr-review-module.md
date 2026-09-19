# ADR: Review Module

**Status:** Accepted

## Context

Mitii needed a structured code review capability. An Apache-2.0 reference implementation existed that performed deterministic review target selection and structured finding production. Rather than building from scratch, we adapted the reference under Mitii's own contracts.

## Decision

- Reimplement the review logic under `@mitii/v8` module contracts (ports, no globals).
- Keep the deterministic selection path (no LLM in target selection).
- Produce structured findings: severity, category, file, line, description.
- Read-only: the review module never mutates files.

## Consequences

- **Positive:** Structured, reproducible reviews; no LLM cost in the selection path.
- **Positive:** Read-only by design — safe to run in any autonomy preset.
- **Negative:** The reference implementation's heuristics are now Mitii's to maintain.
- **Neutral:** The module is optional — runs that don't need review skip it entirely.

## Related

- [Review module](/understanding/agent-intelligence/review) — how it works
- [PR Review Agent](/automation/agents/pr-review) — automation agent that uses review
- [Safety](/understanding/agent-intelligence/safety) — how review findings interact with safety gates
