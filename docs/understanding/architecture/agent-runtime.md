# Agent Engine

Agent Engine is the run orchestrator for Mitii's V8 agent runtime. Once a host (editor, CLI, or SDK) decides to run a request as an agent, Agent Engine takes over the full lifecycle: starting the run, streaming events, coordinating the model/tool loop, managing checkpoints for suspend and resume, updating the task list, and producing the final result.

It does **not** decide *whether* to run or *what authority* the agent has. That is the job of **Decision Policy**, which classifies the request, selects a route (answer, explore, execute), and issues a **grant** (the set of tools and paths the agent may touch). Agent Engine applies that decision for the remainder of the run.

## Responsibilities

- Validate `AgentEngineStartInput` and `AgentEngineResumeInput`.
- Create an `AgentRunHandle` with `runId`, `events`, `result`, and `cancel()`.
- Call intake, understanding, decision policy, repository context, planning, skills, memory, prompt construction, model gateway, tool runtime, task list, and verification.
- Persist checkpoints for resumable approval/clarification/plan gates.
- Avoid replaying completed tool calls after resume.
- Enforce model/tool loop budgets.
- Emit structured `RunEvent`s that hosts can render without exposing secrets.

## Structure

```text
agent-engine/
  pipeline/                 Public facade plus cohesive run stages
    AgentEnginePipeline     start()/resume() orchestration
    runtime                 deps, events, window policy, run handle
    executeStart            intake → pin → understand → decide → prompt
    executeResume           clarification / plan / tool-approval continuation
    modelToolLoop           model turns, compaction, recovery
    executeTool             one authorized tool call + grant refresh
    pinAndDiscovery         repository pin, preflight snapshot, discovery pass
    verification            gate, repair queue, persist, user summary
  contracts/
    input/                  AgentEngineStartInput, AgentEngineResumeInput
    output/                 AgentRunHandle, AgentRunResult, RunEvent
    ports/                  AgentEngineDependencies
    errors/                 AgentEngineError
  actions/                  Mapping, prompt slices, output recovery, gates, evidence
  adapters/                 In-memory/file checkpoint stores, composition helpers
  internal/                 Checkpoints, event bus, budgets, task-list runtime
  tests/                    Unit and wired engine tests
```

## Key Types

| Type | Purpose |
|------|---------|
| `AgentEngineStartInput` | The full request payload: prompt, workspace root, repository-state summary, conversation, instructions, approved plan, task list, tool definitions, budget, model options, approval mode, dirty paths, and `explorationDepth`. |
| `AgentEngineResumeInput` | A run id plus exactly one continuation: an approval, a clarification answer, or a plan decision. |
| `AgentRunHandle` | Opaque handle for an active run. Exposes `events` (stream), `result` (promise), and `cancel()`. |
| `AgentRunResult` | Final output: status, route, planning depth, answer, optional plan/strategy/task list, suspension info, pinned state, reason codes, warnings, usage stats, duration, and optional error. |
| `AgentEngineDependencies` | Injected ports and pipelines the orchestrator calls (model gateway, tool runtime, memory, etc.). |
| `AgentRunCheckpoint` | Persisted run state that `resume()` loads to continue without replay. |

**`explorationDepth`** (`auto` | `quick` | `deep`) controls how aggressively the agent reads and searches before drafting a plan. It is orthogonal to Decision Policy's `planningDepth`, which determines *whether* a visible plan is produced at all.

## Grant & Authority

- Tool calls are passed to Tool Runtime with the exact grant from Decision Policy.
- The engine may **narrow** authority after discovery but never expands it. `grant_narrowed` is emitted only when the grant actually changed.
- After out-of-scope reads or compiler errors, the engine may **widen** the grant and record `grant_expanded`.

## Exploration & Deduplication

- `usage` reports `fileReadCalls` vs `uniqueFilePathsTouched`. Repeated re-reads of the same files emit `exploration_reread_heavy` mid-loop; after one nudge the spin stops with `exploration_stall_broken`. Stall detection uses paths read in the current loop (reset after a successful mutation) so verification repair can re-read known error files without aborting.
- Identical read-only tool + args reuse the prior result (`tool_result_deduped`). Mutations invalidate that content cache.

## Context Compaction

- Auto/hard compaction reinjects mid-run observations as well as pre-run memory. All size limits (observation count, observation size, reinjection size, dropped-turn summary size, compacted tool-result size, compacted tool-argument size, live tool-result content size) are read from `WindowPolicy.compaction`.
- The model-loop prefix is preserved until the hard compaction ceiling so local KV caches and provider prompt caches can hit across turns.
- Tool-result history compaction preserves schema-shaped read/search arguments and replaces older tool results with path/range/finding stubs instead of slicing raw JSON or dropping tool rows from the summary.

## Recovery & Error Handling

- **Output truncation**: the loop can ask the model to continue safely within remaining budgets. On the execute+write path, truncation recovers as a **tool-call** nudge (not essay continuation). Direct-answer truncation still continues the text.
- **XML/tag-shaped tool leaks**: when providers emit tool requests as text instead of structured deltas, the loop recovers a conservative subset of read/discovery tool calls from tag attributes and continues through normal Tool Runtime enforcement.
- **Unfulfilled execute**: turns with mutation intent that produce text but no `apply_patch` are nudged once (`unfulfilled_execute_recovered`, `maxUnfulfilledExecuteRecoveries: 1`) to call `apply_patch` in a bounded batch grouped by error class. A second text-only turn completes with `unfulfilled_execute_exhausted`.
- **`apply_patch` failures** use distinct reason codes: `old_text_not_found`, `old_text_ambiguous`, `patch_target_missing`, `patch_hash_mismatch`, `identical_old_and_new`, `patch_syntax_invalid`. Retryable codes attach current file content so the model can copy exact `oldText` without a separate re-read. `patch_conflict` remains as a legacy umbrella. Optional `replaceAll` replaces every exact occurrence; the default remains unique match.
- **Compiler/tsc output** is grouped by error code and asks for a class-wide batch, not one diagnostic at a time.
- **`budget_exhausted`** after mutations still captures `repo_build_state` phase `after` so remaining error counts are visible.

## Events & Observability

- `context_ready` may include `retrievalSources` (`sourceId`, `status`, `candidateCount`) from hybrid retrieval reports.
- `model_turn` events include turn index, optional token counts, `finishReason`, and `truncated`.
- Empty memory retrieval is `memory_empty` (store wired, no facts). Missing memory port or workspace id remains `memory_skipped`.
- Task-list updates are validated through the Task List module. Successful mutations complete every matching change item (by path), not just the active row once per turn.
- `composeReadOnlyAgentEngine` provides a read-only wiring helper for hosts that only need inspection.

### Start order

```text
intake
pin                          (whenever a workspace reference resolves — no longer waits on repositoryContextRequired)
Agent execute only: capture repoBuildStateBefore  (repair/mutation asks; synthesized read-only grant, no Decision Policy yet; never runs test/e2e scripts unless tests evidence is required)
understand                   (sees a capped preflight-diagnostic hint when errors exist — LLM classifier only, not the rule classifier)
decide
[clarification / unsupported-route short-circuits]
repository context           (if decision.repositoryContextRequired)
narrow
Plan mode only, repair-intent-gated: capture repoBuildStateBefore  (skipped if Agent mode already captured it)
skills / memory (optional)
planning:
  engine calls resolvePlanStrategyRules directly (no strategy LLM, no port method)
  discover_and_plan  -> bounded read-only discovery loop, then planning.plan({ discoveryBrief, strategyOverride })
  else               -> planning.plan({ strategyOverride }) immediately
prompt construction
model/tool loop               (per-turn max_tokens follows leftover context, capped by a real host override)
verification gate + repair queue (see below)
```

- Strategy is resolved by Engine, not Planning: `resolvePlanStrategyRules` (a pure function) runs before deciding whether to invoke discovery, then `applyPlanModeDiscoveryContract` upgrades cold Plan-mode asks (and shaped-discovery profile matches) to `discover_and_plan` unless exploration is `quick` or strategy is `follow_evidence`. Follow-up Plan asks that already resolved to `plan_from_ask` are left unchanged. Only `discover_and_plan` triggers Engine's bounded read-only discovery loop (max two model turns, file/search budget, no mutation tools) — it emits `discovery_started` / `discovery_progress` / `discovery_completed`, shows a temporary discovery task list, then calls Planning with `DiscoveryBrief` and `skipDiscover: true`. Discovery is seeded with preferred paths from explicit targets, retrieved context paths, and prior-turn path hints (deterministic pre-read before the model loop). Planning either runs its own one-shot Change+Verify draft call or falls back to the deterministic discovery skeleton. The discovery list is replaced by the plan-derived execution checklist. There is exactly one understanding LLM call and, for `discover_and_plan`, at most one additional plan-drafting call — never a second strategy classifier.
- The resulting `planStrategy` is stored on the run result and plan-approval checkpoint. Hosts that carry an approved plan SHOULD also carry `approvedPlanStrategy`; otherwise the engine infers a conservative strategy from the artifact.

### Verification gate (repair while errors drop)

After a mutation, `finishAfterLoop` runs Verification, compares before/after when a snapshot exists, and **does not roll back**.

- **Passed**: commit mutations and complete as today.
- **Repairable failure** (`verification_failed`): persist the record, inject a compact remaining-error prompt (not the full dump), and run another model/tool loop. Window effort caps repairs (`run.maxVerificationRepairs`; medium is 8). The first mutate loop reserves that slice of `maxModelCalls` (`verification_repair_budget_reserved`) so a productive exploration pass cannot spend the whole ceiling before repairs start. Quick exploration stays at one repair. Stop after `maxStalledVerificationRepairs` non-improving verifies. Lint/format-only leftovers after typecheck and diagnostics are green complete as `implemented_unverified` instead of opening another repair loop. `verification_repair_attempted` / `verification_repair_succeeded` mark that path.
- **Still failing, or not repairable** (blocked / cancelled / infra-missing / stalled): keep the edits, write a short user summary, commit a memory pointer, and complete with `verification_incomplete` / `verification_kept_changes`.
- **Cancel / interrupt**: persist whatever before/after snapshot exists so the next turn can reload it.
- **Retry**: a later user ask matching “fix the remaining verification errors” loads `loadLatest(workspaceId)` instead of scraping chat history.

Records live in `.mitii/verification/` (host store). They are not prompt-construction input.

## Ownership Boundaries

Owns run orchestration, events, checkpoint lifecycle, suspend/resume, loop control, and verification handoff.

Does not own intent classification, route authority, grant enforcement internals, provider-specific HTTP, repository indexing, filesystem semantics, or host UI.

## Tests

```bash
pnpm exec vitest run packages/v8/src/engine/agent-engine
```

## Example Flow

This example uses a realistic coding-agent request and shows the kind of structure this module receives and returns. The output is representative: ids, timings, and scores are examples, but the shape matches how this module is meant to be understood.

### Real Prompt

```text
I am in a React app. In src/LoginForm.tsx, when the user clicks the "Sign in" button, show a loading label and disable the button until the login request finishes. Keep the existing validation and error handling. Add or update a focused test if there is already a LoginForm test nearby.
```

### Real Input Structure

AgentEngineStartInput -> events -> AgentRunResult:

```json
{
  "prompt": "I am in a React app. In src/LoginForm.tsx, when the user clicks the \"Sign in\" button, show a loading label and disable the button until the login request finishes. Keep the existing validation and error handling. Add or update a focused test if there is already a LoginForm test nearby.",
  "workspaceId": "workspace-1",
  "stateToken": "state-abc",
  "targetFile": "src/LoginForm.tsx"
}
```

### Step-By-Step Flow

1. A user sends the real prompt shown above from an editor or chat host.
2. The host attaches workspace id `workspace-1` and the explicit target file `src/LoginForm.tsx`.
3. The module receives the real structure shown in the input block.
4. The module validates schema/version/limits before doing any work.
5. The module extracts the important target: `src/LoginForm.tsx`.
6. The module keeps the user constraint: existing validation and error handling must stay intact.
7. The module performs only its own responsibility and does not cross into neighboring modules.
8. Any budget, path, state, or provider constraint is applied before output is produced.
9. The module records warnings/reason codes instead of hiding degraded behavior.
10. The module returns the realistic output shape shown below.
11. The next pipeline stage consumes that output without reinterpreting raw user text.

### Realistic Output

Agent Engine run returns a result like this:

```json
{
  "status": "completed",
  "route": "execute",
  "answer": "Implemented the loading state and verified the LoginForm test.",
  "taskList": {
    "schemaVersion": 1,
    "source": "agent",
    "items": [
      { "id": "inspect-login", "title": "Inspect src/LoginForm.tsx", "status": "done" },
      { "id": "add-loading", "title": "Add pending button state", "status": "done" },
      { "id": "verify-login", "title": "Verify LoginForm behavior", "status": "done" }
    ]
  },
  "usage": { "modelCalls": 2, "toolCalls": 5, "loopIterations": 2, "fileReadCalls": 3, "uniqueFilePathsTouched": 2 }
}
```
