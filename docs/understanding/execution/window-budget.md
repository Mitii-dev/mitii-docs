# Window Budget

Window Budget is the module that converts a model's advertised context window into a single, proportional token allocation for every part of the agent runtime. Instead of each subsystem (prompt construction, repository retrieval, planning, skills, mutation batching, compaction, run caps) hard-coding its own token limits, they all read from one derived `WindowPolicy` object.

This means a 30k-token local model and a 200k-token cloud model get proportionally different budgets for the same features — no configuration changes required.

## Core Concepts

| Term | Meaning |
|---|---|
| **Context window (`W`)** | The total number of tokens the model can accept in a single request (input + output). Advertised by the provider. |
| **Output reserve (`O`)** | Tokens reserved for the model's response. Derived from `W` unless the host overrides it. |
| **Tool-schema cost (`T`)** | Tokens consumed by the JSON tool definitions sent with every request. Treated as a fixed cost. |
| **Usable input (`U`)** | The remaining tokens available for prompt content: `W − O − T`. All section budgets are shares of `U`. |
| **Effort** | A working-set overlay (`low` / `medium` / `high`) that adjusts caps for mutation batches, run limits, and compaction ceilings. Default is `medium`. |
| **`WindowPolicy`** | The validated output object that every runtime consumer reads. Contains all derived budgets. |
| **Compaction** | The process of summarizing or dropping older tool results and conversation turns when the context window fills up. |

## How tokens are distributed

The derivation follows a fixed pipeline:

```text
W  = contextWindowTokens
O  = host override, or clamp(W × outputRatio, outputMin, min(outputMax, W × outputWindowCapRatio))
T  = measured tool schemas, or min(fallbackTokens, W × fallbackWindowRatio)
     then T is capped so W − O − T stays at least minimumUsableInputTokens when possible
U  = W − O − T                  // usable input
loop = U × loopSafetyRatio
```

Tool JSON is treated as a **fixed cost** — it does not scale with the remaining budget. The shares below are of `U`, not of `W`:

| Slice | Share of `U` | Cap |
|---|---|---|
| Repository context | `repositoryShare` | `repositoryTokensCap` |
| Conversation / loop history | `conversationShare` | none |
| Plan text | `planShare` | `planTokensCap` |
| Skills | `skillsShare` | `skillsTokensCap` |
| System + rules | remainder | none |

### Worked examples

With the default policy (`outputRatio=0.20`, `outputMinTokens=10240`, `outputWindowCapRatio=0.35`, tool fallback 8k / 20% of `W`):

| Window | Output | Tools | Usable | Repo | Plan | Skills |
|---|---|---|---|---|---|---|
| 30k | 10,240 | 6,000 | ~13.8k | ~3.9k | ~0.8k | ~0.6k |
| 100k | 20,000 | 8,000 | ~72k | ~20k | ~4.3k | ~2.9k |
| 200k | 32,768 | 8,000 | ~159k | ~45k | ~9.5k | ~6.4k |

Notice how the output reserve hits its minimum floor at 30k (10,240 tokens) while the 200k window gets a proportionally larger reserve (32,768). Tool-schema cost stays flat because it is a fixed cost, not a share.

## Mutation batch sizing

Mutation batch size (how many files a single `apply_patch` call can touch) follows the **context window**, then the effort overlay caps it so a 200k model does not keep producing 25-file patches:

```text
windowFiles             = (W × outputRatio) / filesPerOutputTokens
maxUniqueFilesPerCall   = clamp(windowFiles, minFiles, min(maxFilesCap, effort.maxUniqueFilesPerCall))
maxPatchesPerCall       = clamp(files × 2, files, maxPatchesPerCallCap)
maxPatchPayloadCharacters = O × charsPerOutputToken × patchPayloadOutputRatio
preferredBatchSize      = maxUniqueFilesPerCall
```

With medium effort (the default):

| Window | Max files per call |
|---|---|
| 30k | 7 |
| 48k | 8 |
| 200k | 8 (not 25) |

High effort raises the 200k cap to 12; low effort lowers it to 4.

## Planning and skills

Planning affordances follow **usable input** (`U`), scaled with the window so a 30k local model can still produce a visible plan:

```text
visiblePlanThreshold      = min(visiblePlanMinUsableTokens, W × visiblePlanMinUsableRatio)
changeImpactThreshold     = min(changeImpactMinUsableTokens, W × changeImpactMinUsableRatio)
visiblePlanAffordable     = U >= visiblePlanThreshold
changeImpactAffordable    = U >= changeImpactThreshold
maxSkills                 = clamp(maxSkillsBase + U / maxSkillsPerUsable, base, cap)
maxDiagnosticSteps        = clamp(base + U / perUsable, base, max)
maxModelCalls             = effort overlay (medium: 64)
```

The `visiblePlanAffordable` and `changeImpactAffordable` flags let the runtime decide whether to show a visible plan or run a change-impact analysis without exceeding the window. On a very small window these features are gracefully disabled rather than causing overflow.

Effort also sets compaction ceilings (`autoMaxTokens` / `hardMaxTokens`) and `run.maxVerificationRepairs` (medium: 8). A host `runBudget.unlimited` setting is still clamped to these window-effort loop caps.

The Decision Policy module then merges profile mutation budgets with these window caps using `min()` (and ORs `requireBatchedExecution`).

## Compaction budgets

Compaction budgets also follow `U`, so a 300k window retains more useful tool-history memory than a 30k window before rereading. Tool-history sizing is derived from ratios and clamped by developer-tunable min/max fields:

```text
keepRecentToolResults      = clamp(U × keepRecentToolResultsRatio, min, max)
compactedToolResultChars   = clamp(U × compactedToolResultCharsRatio, min, max)
compactedToolArgumentChars = clamp(U × compactedToolArgumentCharsRatio, min, max)
toolResultContentChars     = clamp(U × toolResultContentCharsRatio, min, max)
droppedTurnSummaryChars    = clamp(U × droppedTurnSummaryCharsRatio, min, max)
establishedFactChars       = clamp(U × establishedFactCharsRatio, min, max)
maxEstablishedFacts        = clamp(U × establishedFactCountRatio, min, max)
establishedFactReinject    = clamp(U × establishedFactReinjectCharsRatio, min, max)
memoryReinjectChars        = clamp(U × memoryReinjectCharsRatio, min, max)
```

The Agent Engine consumes these derived values directly. It does not reintroduce separate fixed caps for tool-result serialization, dropped tool summaries, or mid-run observation reinjection.

## Pipeline stages

1. Validate input schema.
2. Merge host policy overrides onto defaults.
3. Derive or accept output reserve.
4. Charge tool-schema tokens as a fixed cost.
5. Split remaining usable input by shares.
6. Derive mutation, planning, skills, run, and verification numbers from `O` / `U`.
7. Validate the output contract.

## API reference

### Input

`WindowBudgetInput`:

| Field | Description |
|---|---|
| `schemaVersion` | Must be `1`. |
| `contextWindowTokens` | The advertised provider context window in tokens. |
| `maximumOutputTokens` | Omit or `0` to derive from the window; a positive value is a host override. |
| `toolSchemaTokens` | Omit or `0` to use the fallback; a positive value is a measured tool-JSON cost. |
| `policy` | Optional overrides for every ratio and clamp (developer settings). |
| `effort` | Optional working-set overlay (`low` / `medium` / `high`); omit to use `medium`. |

### Output

`WindowPolicy`:

| Field | Description |
|---|---|
| `effort` | The resolved effort level (`low` / `medium` / `high`). |
| `maximumOutputTokens` | The resolved output reserve. |
| `toolSchemaTokens` | The resolved tool-schema cost. |
| `usableInputTokens` | `W − O − T`. |
| `loopInputBudgetTokens` | `U × loopSafetyRatio`. |
| `sections` | Token budgets for repository, conversation, plan, skills, and system. |
| `compaction` | Warn/auto/hard ratios, absolute ceilings, tool-history retention, and reinjection budgets. |
| `mutation` | Files per call and patch payload size (scaled from output). |
| `planning` | Diagnostic step cap and whether a visible plan / change-impact gate is affordable. |
| `run` | Model/tool call caps and `maxVerificationRepairs` from the effort overlay. |
| `skills` | Skill body budget and max selected skills. |
| `maxVerificationChecks` | Verification check cap. |
| `resolvedPolicy` | The full policy after defaults + overrides. |
| `reasonCodes` | How output and tool cost were chosen. |

### Public exports

- `deriveWindowPolicy`
- `mergeWindowBudgetPolicy`
- `DEFAULT_WINDOW_BUDGET_POLICY` / `WINDOW_BUDGET_POLICY`
- `WINDOW_BUDGET_EFFORTS` / `DEFAULT_WINDOW_BUDGET_EFFORT` / `WINDOW_BUDGET_EFFORT_OVERLAY` / `resolveWindowBudgetEffort`
- `windowBudgetInputSchema`, `windowBudgetPolicySchema`, `windowPolicySchema`
- Inferred types and `WindowBudgetError`

## Configuration

The primary user-facing knob is the advertised context window. Built-in defaults already scale every derived budget from that window, so hosts should not require users to edit individual ratios.

### VS Code host

The VS Code host maps Developer → **Token budget** onto `policy` overrides:

- **Simple sliders** cover files per mutation, output reserve, module shares, and verification checks.
- **Advanced** exposes the core ratios and clamps.
- Each field is also available as a `mitii.tokenBudget.*` setting.
- When the toggle is off, defaults apply and scale with the context window.
- Moving a Simple slider turns custom budget on and pins that value so later window changes do not overwrite it.
- Reset clears those overrides.

### Output token override

`mitii.provider.maximumOutputTokens = 0` means "derive `O` from the window." A positive value is a host override and still cannot exceed `W − 1`. The historical default `5000` is treated as unset (`output_legacy_default_ignored`) so mutation batches are not truncated.

`O` is the planning reserve — it ensures input content does not fill the entire window. Per-turn `max_tokens` is leftover context, owned by Prompt Construction / Agent Engine, unless the host overrode output.

## Design principles

- **No provider, model, language, or host names.** The module is generic.
- **Every numeric behavior is a named policy field.** No magic numbers.
- **Hosts tune via `policy` overrides; they do not fork the algorithm.**

## Failure modes

- `invalid_input`: schema/version/limit failure. No partial policy is returned.

## Non-responsibilities

- Does not construct prompts, retrieve files, grant tools, or run the model loop.
- Does not own provider capability discovery (Model Gateway advertises `W`).
- Does not persist settings (the host maps developer options onto `policy`).

## How tokens are distributed

```text
W  = contextWindowTokens
O  = host override, or clamp(W × outputRatio, outputMin, min(outputMax, W × outputWindowCapRatio))
T  = measured tool schemas, or min(fallbackTokens, W × fallbackWindowRatio)
     then T is capped so W − O − T stays at least minimumUsableInputTokens when possible
U  = W − O − T                  // usable input
loop = U × loopSafetyRatio
```

Tool JSON is treated as a **fixed cost**. Shares below are of `U`, not of `W`:

| Slice | Share of U | Cap |
|---|---|---|
| Repository context | `repositoryShare` | `repositoryTokensCap` |
| Conversation / loop history | `conversationShare` | none |
| Plan text | `planShare` | `planTokensCap` |
| Skills | `skillsShare` | `skillsTokensCap` |
| System + rules | remainder | none |

Worked defaults (`outputRatio=0.20`, `outputMinTokens=10240`,
`outputWindowCapRatio=0.35`, tool fallback 8k / 20% of W):

| Window | Output | Tools | Usable | Repo | Plan | Skills |
|---|---|---|---|---|---|---|
| 30k | 10,240 | 6,000 | ~13.8k | ~3.9k | ~0.8k | ~0.6k |
| 100k | 20,000 | 8,000 | ~72k | ~20k | ~4.3k | ~2.9k |
| 200k | 32,768 | 8,000 | ~159k | ~45k | ~9.5k | ~6.4k |

Mutation batch size follows the **context window**, then the effort overlay
caps it so a 200k model does not keep 25-file patches:

```text
windowFiles            = (W × outputRatio) / filesPerOutputTokens
maxUniqueFilesPerCall  = clamp(windowFiles, minFiles, min(maxFilesCap, effort.maxUniqueFilesPerCall))
maxPatchesPerCall      = clamp(files × 2, files, maxPatchesPerCallCap)
maxPatchPayloadCharacters = O × charsPerOutputToken × patchPayloadOutputRatio
preferredBatchSize     = maxUniqueFilesPerCall
```

Medium effort (the default): 30k → 7 files, 48k → 8 files, 200k → 8 files
(not 25). High effort raises the 200k cap to 12; low effort lowers it to 4.

Planning affordances follow **usable input**, scaled with the window so a 30k local cap still plans:

```text
visiblePlanThreshold      = min(visiblePlanMinUsableTokens, W × visiblePlanMinUsableRatio)
changeImpactThreshold     = min(changeImpactMinUsableTokens, W × changeImpactMinUsableRatio)
visiblePlanAffordable     = U >= visiblePlanThreshold
changeImpactAffordable    = U >= changeImpactThreshold
maxSkills                 = clamp(maxSkillsBase + U / maxSkillsPerUsable, base, cap)
maxDiagnosticSteps        = clamp(base + U / perUsable, base, max)
maxModelCalls             = effort overlay (medium: 64)
```

Effort also sets compaction ceilings (`autoMaxTokens` / `hardMaxTokens`) and
`run.maxVerificationRepairs` (medium: 8). Host `runBudget.unlimited` is still
clamped to these window-effort loop caps.

Decision Policy then merges profile mutation budgets with these window caps using `min()` (and ORs `requireBatchedExecution`).

Compaction budgets also follow `U` so a 300k window retains more useful
tool-history memory than a 30k window before rereading. Tool-history sizing is
derived from ratios and clamped by developer-tunable min/max fields:

```text
keepRecentToolResults      = clamp(U × keepRecentToolResultsRatio, min, max)
compactedToolResultChars   = clamp(U × compactedToolResultCharsRatio, min, max)
compactedToolArgumentChars = clamp(U × compactedToolArgumentCharsRatio, min, max)
toolResultContentChars     = clamp(U × toolResultContentCharsRatio, min, max)
droppedTurnSummaryChars    = clamp(U × droppedTurnSummaryCharsRatio, min, max)
establishedFactChars       = clamp(U × establishedFactCharsRatio, min, max)
maxEstablishedFacts        = clamp(U × establishedFactCountRatio, min, max)
establishedFactReinject    = clamp(U × establishedFactReinjectCharsRatio, min, max)
memoryReinjectChars        = clamp(U × memoryReinjectCharsRatio, min, max)
```

Agent Engine consumes these derived values directly. It does not reintroduce
separate fixed caps for tool-result serialization, dropped tool summaries, or
mid-run observation reinjection.

## Pipeline stages

1. Validate input schema.
2. Merge host policy overrides onto defaults.
3. Derive or accept output reserve.
4. Charge tool-schema tokens as a fixed cost.
5. Split remaining usable input by shares.
6. Derive mutation, planning, skills, run, and verification numbers from `O` / `U`.
7. Validate the output contract.

## Dependencies and ports

None. Pure function of the input contract. No LLM, filesystem, or host APIs.

## Public exports

- `deriveWindowPolicy`
- `mergeWindowBudgetPolicy`
- `DEFAULT_WINDOW_BUDGET_POLICY` / `WINDOW_BUDGET_POLICY`
- `WINDOW_BUDGET_EFFORTS` / `DEFAULT_WINDOW_BUDGET_EFFORT` / `WINDOW_BUDGET_EFFORT_OVERLAY` / `resolveWindowBudgetEffort`
- `windowBudgetInputSchema`, `windowBudgetPolicySchema`, `windowPolicySchema`
- inferred types and `WindowBudgetError`

## Failure modes

- `invalid_input`: schema/version/limit failure. No partial policy is returned.

## Genericness strategy

- No provider, model, language, or host names.
- Every numeric behavior is a named policy field.
- Hosts tune via `policy` overrides; they do not fork the algorithm.

## Developer settings

The customer knob is the advertised context window. Built-in defaults already scale every derived budget from that window. Hosts should not require users to edit ratios.

The VS Code host maps Developer → **Token budget** onto `policy` overrides. Simple sliders cover files per mutation, output reserve, module shares, and verification checks. Advanced keeps the core ratios and clamps. Each field is also a `mitii.tokenBudget.*` setting. When the toggle is off, V8 defaults apply and scale with the context window. Moving a Simple slider turns custom budget on and pins that value so later window changes do not overwrite it. Reset clears those overrides.

`mitii.provider.maximumOutputTokens = 0` means “derive O from the window”. A positive value is a host override and still cannot exceed `W − 1`. The historical default `5000` is treated as unset (`output_legacy_default_ignored`) so mutation batches are not truncated. `O` is the planning reserve (input must not fill the window). Per-turn `max_tokens` is leftover context, owned by Prompt Construction / Agent Engine, unless the host overrode output.

## Explicit non-responsibilities

- Does not construct prompts, retrieve files, grant tools, or run the model loop.
- Does not own provider capability discovery (Model Gateway advertises `W`).
- Does not persist settings (the host maps developer options onto `policy`).
