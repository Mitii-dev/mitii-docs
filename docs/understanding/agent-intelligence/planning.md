# Planning

Planning is the module that produces a structured, actionable plan for the agent to follow. When the engine decides a visible plan is warranted (based on user mode, policy, or task complexity), it invokes Planning to turn task evidence into a `PlanArtifact` — a document with phases, steps, context references, risks, alternatives, and verification guidance.

Planning does **not** execute steps, approve plans, or own the task list. It produces the plan artifact and serializes it for downstream consumers (the engine, the host UI, or prompt injection).

## Core Concepts

### Planning Depth vs. Exploration Depth

Two orthogonal settings control planning behavior:

| Setting | Controls |
| --- | --- |
| `planningDepth` | Whether a visible plan is produced at all (`none`, `visible`, etc.) |
| `explorationDepth` | How much read-only discovery the engine performs before planning (`quick`, `auto`, `deep`) |

A request can have `planningDepth: visible` with `explorationDepth: quick` (plan directly from the ask) or `explorationDepth: deep` (run a discovery pass first, then plan from the evidence).

### Strategies

Planning resolves one of four strategies via a deterministic rule table — no LLM call is involved in strategy selection:

| Strategy | Meaning |
| --- | --- |
| `clarify` | The ask is too ambiguous to plan; the agent should ask the user for clarification. |
| `plan_from_ask` | Plan directly from the user's request and any known path hints. No discovery pass. |
| `follow_evidence` | A repair intent is present with in-scope build diagnostics. Plan around the diagnostics. No discovery pass. |
| `discover_and_plan` | The scope is wide or complex. The engine runs a bounded read-only discovery loop first; Planning then drafts from the resulting `DiscoveryBrief`. |

A host- or test-supplied `strategyOverride` always wins (sanitized before use).

### Discovery Brief

When the strategy is `discover_and_plan`, the engine runs a read-only discovery pass (reading files, listing directories, inspecting manifests) and compiles the observations into a `DiscoveryBrief`. This is a host-neutral snapshot of what was found: files read, change surfaces, constraints, verification hints, open questions, and a confidence level. Planning uses this brief to draft a grounded plan rather than guessing.

## How the Pipeline Works

The public entry point is `PlanningPipeline.plan(input)`. Internally the pipeline follows a fixed sequence:

1. **Validate** — Check the `PlanningInput` shape. If `planningDepth` is `none`, return `blocked` immediately.
2. **Resolve strategy** — The engine calls `resolvePlanStrategyRules` *before* invoking Planning (see Strategy Resolution below). The resolved strategy is passed in as `strategyOverride`.
3. **Compile discovery** (if applicable) — If a `DiscoveryBrief` is present, compile it into change surfaces and evidence scoping.
4. **Draft** — Produce a structured plan. For `discover_and_plan`, one optional model call refines the draft; for all other strategies, drafting is fully deterministic.
5. **Validate sections** — Ensure required phases (Change, Verify) are present. Strip any stray Discover/Inspect/Explore phase if a `DiscoveryBrief` already exists.
6. **Compact** — Trim the plan to fit the token budget.
7. **Serialize** — Produce the `PlanningResult` with the plan, strategy decision, reason codes, and budget usage.

### Strategy Resolution

The engine (not Planning) calls `resolvePlanStrategyRules` to pick a strategy. The rule table is evaluated in order; the first match wins:

| # | Condition | Strategy |
| --- | --- | --- |
| 1 | Clarity is `unclear` or `ambiguous` | `clarify` |
| 2 | Repair intent + in-scope diagnostics present | `follow_evidence` |
| 3 | Repair intent + broad "fix all" / package-wide verification ask | `follow_evidence` |
| 4 | `explorationDepth` is `quick` | `plan_from_ask` |
| 5 | Auto (not deep) + `knownPathHints` or explicit file targets | `plan_from_ask` |
| 6 | Deep/Auto + wide scope or complexity (or `recommendsPlanning`) | `discover_and_plan` |
| 7 | (fallback) | `plan_from_ask` |

Notes:
- **Repair detection** uses a shared predicate (`isRepairIntentTaxonomy` from decision-policy), not keyword matching. The same predicate gates preflight capture and step wording, so all three stay in sync.
- **Engine contract override**: For cold Plan-mode asks (no prior conversation), the engine may force `discover_and_plan` via `applyPlanModeDiscoveryContract` unless exploration is `quick` or strategy is already `follow_evidence`. Follow-up asks with `plan_from_ask` are preserved.
- **No second classifier**: Planning never re-resolves strategy. It receives the decision and acts on it.

### Model Call (discover_and_plan only)

The only LLM call in the entire planning pipeline is a one-shot draft for `discover_and_plan`. It turns the already-gathered `DiscoveryBrief` into Change + Verify step wording. Key constraints:

- Runs at most once per plan.
- Scoped to Change + Verify steps only — it cannot alter approval requirements, plan dimensions, gates, or tool grants.
- Skipped when the brief is thin (`confidence: low` or no change surfaces).
- Falls back to the deterministic discovery skeleton if the call fails or returns nothing usable.
- Target refs are filtered against the scoped repo map, discovery evidence, in-scope diagnostics, and explicit targets.
- Planning works fully without an LLM; the model call is an enhancement, not a requirement.

## Types and Contracts

| Type | Purpose |
| --- | --- |
| `PlanningInput` | The full request: query, mode, route, planning/exploration depth, task evidence, scoped repo map, build evidence, optional `DiscoveryBrief`, skills, process hints, reviewed context, prior plan, strategy override, and token budget. |
| `PlanningTaskEvidence` | Structured understanding of the ask: primary/secondary intent, scope, complexity, risk, clarity, targets, constraints, outcomes, recommendations, and change-impact hints. |
| `DiscoveryBrief` | Host-neutral discovery evidence: files read, targets, change surfaces, constraints, verification hints, open questions, confidence. Does not carry mutable task status. |
| `PlanStrategyDecision` | The resolved strategy plus `skipDiscover` and `useBuildEvidence` flags. |
| `DiscoveredPlanDraft` | The model call's output for `discover_and_plan`: objective, open questions, and Change + Verify step wording. Applied onto the deterministic skeleton. |
| `PlanArtifact` | The final structured plan: dimensions, phases, steps, risks, alternatives, and verification guidance. |
| `PlanningResult` | The pipeline's return: status, optional plan, optional strategy, warnings, reason codes, used/total budget, and duration. |

## Technical Details

- **Public facade**: `PlanningPipeline.plan` (async), `PlanningPipeline.resolveStrategy` (test/host helper), and `compileDiscovery`.
- **Impact reports**: For `follow_evidence` and `discover_and_plan`, the engine supplies hop-1 `mustRead`/`affected` paths that are compiled onto Change steps as `impactReports`. The model draft does not invent these paths.
- **Serialization**: `serializePlanForPrompt` emits a strategy-aware execution contract. For `discover_and_plan` it explicitly states that discovery already ran and the agent should start at the first Change step. The engine persists `planStrategy` on the run result and plan-approval checkpoint so resume does not fall back to "start at Discover."
- **Host contract**: Hosts SHOULD persist `planStrategy` with a pending plan and pass it back as `approvedPlanStrategy`. `inferPlanStrategyFromArtifact` is the conservative fallback when that decision is missing.
- **Skill hints**: Optional and must not become hard-coded plan switches.
- **Prior plans**: `priorPlan` supports validation or revision of an existing plan.
- **Text output**: `formatPlanAsAnswer`, `serializePlanForPrompt`, and `serializePlanText` produce safe text from structured plans.
- **Genericness**: Strategy, drafting, and diagnostic scoping use intent taxonomy, explicit targets, and a scoped repo map. They do not hard-code a language, package manager, workspace layout, or host.

## Public Exports

- `PlanningPipeline`
- `planningInputSchema`, `planningResultSchema`, `planArtifactSchema`, `planStrategyDecisionSchema`, `discoveryBriefSchema`, `explorationDepthSchema`
- `resolvePlanStrategyRules`, `isRepairIntent`
- `compileDiscoveryBrief`, `inferPlanStrategyFromArtifact`, `serializePlanForPrompt`, `serializePlanText`, `formatPlanAsAnswer`
- `PlanningError` and planning reason/error codes

## Failure Modes

| Condition | Result |
| --- | --- |
| `planningDepth: none` | Returns `blocked` with reason `plan_depth_none`. |
| Invalid input shape | Throws `PlanningError` (`invalid_input`). |
| Missing required plan sections | Returns `blocked` with `plan_blocked_invalid`. |
| `discover_and_plan` model call fails | Keeps the deterministic discovery skeleton (`plan_discovery_draft_failed_fallback`). |
| Out-of-scope diagnostics | Ignored (`plan_build_evidence_out_of_scope`). |
| Low-confidence discovery | Keeps open questions; does not invent file-scoped tasks (`plan_discovery_insufficient`). |

## Ownership Boundaries

**Owns**: Structured plan creation, strategy rule evaluation, serialization, and formatting.

**Does not own**: Plan approval UI, tool execution, route authority, task-list persistence, or verification execution. Hosts own pending-plan storage and must carry `planStrategy` with the artifact. The engine owns orchestration — when to invoke Planning, whether to run discovery first, and how to persist the strategy decision.

## Tests

```bash
pnpm exec vitest run packages/v8/src/modules/planning
```

Related engine coverage (async planning, task-list alignment, discovery, repair-queue):

```bash
pnpm exec vitest run packages/v8/src/engine/agent-engine/tests/AgentEngineTaskList.spec.ts packages/v8/src/engine/agent-engine/tests/AgentEnginePipeline.spec.ts packages/v8/src/engine/agent-engine/tests/AgentEngineDiscovery.spec.ts packages/v8/src/engine/agent-engine/tests/AgentEngineRepairQueue.spec.ts
```

## Example Flow

A realistic request: `@packages/mui-builder fix all the ts errors`

The engine captures a preflight build snapshot, resolves the strategy, and invokes Planning. Because the ask has a repair intent with in-scope diagnostics, the strategy resolves to `follow_evidence` — no discovery pass runs.

### Input (PlanningInput)

```json
{
  "schemaVersion": 1,
  "query": "@packages/mui-builder fix all the ts errors",
  "mode": "plan",
  "route": "plan",
  "planningDepth": "visible",
  "explorationDepth": "auto",
  "evidence": {
    "primaryIntent": "bugfix",
    "scope": "package",
    "complexity": "moderate",
    "risk": "low",
    "clarity": "clear",
    "targets": [{ "kind": "folder", "value": "packages/mui-builder", "explicit": true }],
    "requestedOutcomes": ["Fix all TypeScript errors"],
    "recommendsPlanning": true,
    "recommendsVerification": true,
    "changeImpact": ["code"]
  },
  "scopedRepoMap": {
    "entries": [{ "path": "packages/mui-builder/src/Button.tsx", "kind": "file" }]
  },
  "buildEvidence": {
    "phase": "before",
    "summary": "1 error(s); failed checks: typecheck",
    "failedChecks": ["typecheck"],
    "diagnostics": [
      {
        "path": "packages/mui-builder/src/Button.tsx",
        "severity": "error",
        "message": "Type 'number' is not assignable to type 'string'.",
        "startLine": 42,
        "code": "TS2322"
      }
    ]
  }
}
```

### Output (PlanningResult)

```json
{
  "schemaVersion": 1,
  "status": "validated",
  "plan": {
    "schemaVersion": 1,
    "objective": "Fix all TypeScript errors",
    "phases": [
      {
        "id": "phase-change",
        "name": "Change",
        "steps": [
          {
            "id": "step-fix-diagnostic-1",
            "intent": "Fix TS2322 in packages/mui-builder/src/Button.tsx",
            "targetRefs": ["packages/mui-builder/src/Button.tsx"]
          }
        ]
      },
      { "id": "phase-verify", "name": "Verify", "steps": [{ "id": "step-verify", "intent": "Re-run typecheck" }] }
    ]
  },
  "strategy": {
    "schemaVersion": 1,
    "strategy": "follow_evidence",
    "rationale": "In-scope preflight diagnostics match a repair ask.",
    "skipDiscover": true,
    "useBuildEvidence": true
  },
  "reasonCodes": ["plan_drafted", "plan_strategy_follow_evidence", "plan_strategy_rules", "plan_diagnostics_considered"],
  "usedTokens": 420,
  "budgetTokens": 1600
}
```

The plan is scoped to the single in-scope diagnostic. The strategy decision is included so the engine, resume checkpoint, and host all share the same execution contract.
