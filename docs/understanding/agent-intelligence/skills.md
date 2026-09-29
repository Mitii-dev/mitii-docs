# Skills

Skills is the mechanism that injects task-specific instruction playbooks into the model's prompt. When the agent is about to work on a task, the Skills module selects the most relevant playbooks from a catalog and returns them as prompt-ready instruction blocks. This lets the model follow project-specific conventions (e.g. "disable submit controls while async submit is pending") without the playbooks granting tools, scanning the repository, or overriding policy.

In the broader pipeline, Skills sits between **Request Understanding** (which produces task evidence) and **Prompt Construction** (which assembles the final model prompt). It consumes structured evidence, not raw user text.

## How It Works

The selection pipeline runs in this order:

1. **Load** — fetch skill metadata from the catalog (via `SkillsCatalogPort`).
2. **Match** — score each skill against the query, route, mode, and task evidence using keyword/similarity scoring.
3. **Resolve conflicts** — if multiple skills belong to the same conflict group, keep the highest-ranked one.
4. **Hydrate** — load the full playbook body for each selected skill.
5. **Budget** — pack skills into the token budget in rank order. If a full playbook exceeds the remaining budget, fall back to the compact L1 body before omitting the skill entirely.
6. **Return** — emit prompt-ready instruction blocks with provenance, plus any omissions, warnings, and reason codes.

The public entry point is `SkillsPipeline.select`.

## Key Concepts

| Term | Meaning |
|------|---------|
| **Skill catalog** | A collection of skill definitions (metadata + body) that the host provides. In production this is typically a file-based or API-backed catalog; `InMemorySkillsCatalog` is available for tests and simple hosts. |
| **Skill descriptor** | A single skill's metadata (id, title, tags, conflict group, compact body) plus its full playbook body. |
| **Instruction block** | The prompt-ready output: the skill's instruction content, a priority score, and provenance (which skill it came from and its match score). |
| **Task evidence** | Structured signals from Request Understanding: primary/secondary intents, scope, complexity, risk, recommended tags, target paths, languages, and project kinds. Skills uses this to score relevance but never scans files itself. |
| **Token budget** | A dedicated slice of the prompt window reserved for skill instructions. Packing is rank-preserving: a higher-ranked skill is never dropped so a smaller later skill can take its slot. |
| **Compact (L1) body** | A shorter version of a skill's playbook stored in the catalog. Used as a fallback when the full body would exceed the remaining budget, so the skill is still represented rather than omitted. |

## Module Structure

```text
skills/
  pipeline/                 SkillsPipeline — public facade
  actions/                  Matching, conflict resolution, budget packing
  adapters/                 InMemorySkillsCatalog — test/simple-host catalog
  contracts/
    input/                  SkillsSelectInput
    output/                 SkillDescriptor, SkillsSelectResult
    ports/                  SkillsCatalogPort, SkillSimilarityPort
    errors/                 SkillsErrors
  tests/
```

## Types and Contracts

### Input

`SkillsSelectInput` carries everything the pipeline needs to make a selection:

- **query** — the user's request text.
- **mode / route** — the agent's current operating mode and decision route (e.g. `execute`, `explore`).
- **taskEvidence** — the `SkillTaskEvidence` struct (see Key Concepts).
- **budgetTokens** — the token budget for skill instructions.
- **maxSkills** — upper bound on how many skills to return.

### Output

`SkillsSelectResult` is what the next pipeline stage (Prompt Construction) consumes:

- **status** — `selected`, `empty`, or `error`.
- **instructions** — array of `SkillInstructionBlock` (content, priority, provenance).
- **omissions** — skills that were ranked but could not fit in the budget.
- **usedTokens / budgetTokens** — actual vs. allocated token usage.
- **warnings / reasonCodes** — machine-readable signals for degraded or partial results.
- **durationMs** — elapsed time for observability.

## Behavioral Guarantees

These are the invariants that other modules can rely on:

- **No side effects.** Skills reads the catalog and returns instruction blocks. It does not execute scripts, grant tools, or modify repository state.
- **Rank-preserving budget.** A higher-ranked skill is never dropped solely so a smaller later skill can take its slot. When the full playbook exceeds the remaining budget, the compact L1 body is injected (and may be truncated) before the skill is omitted.
- **Metadata mode still hydrates.** Hosts that list skills in `metadata` mode still receive full playbooks through `loadBody`. The compact fallback is what keeps oversized playbooks from evicting the skill the ranker selected.
- **Evidence is consumed, not produced.** Agent Engine maps `bugfix` / `diagnose` understanding into recommended skill tags (`localize`, `fix`, plus any tags already on `taskHints`). Skills does not own that mapping; it only reads `SkillTaskEvidence`.
- **Repository paths and languages** in the evidence gate or boost scoring but never trigger file access.

## Ownership Boundaries

| Owns | Does not own |
|------|-------------|
| Skill selection and scoring | Skill execution |
| Conflict resolution | Policy grants |
| Token budget packing | Prompt section budgeting (outside the skill slice) |
| Omission reporting | Repository retrieval |
| Instruction block output | Model calls |

## Running Tests

```bash
pnpm exec vitest run packages/v8/src/modules/skills
```

## Example

The following shows a realistic request and the corresponding input/output shapes. Values (ids, scores, timings) are illustrative; the structure matches the actual contracts.

### Prompt

```text
I am in a React app. In src/LoginForm.tsx, when the user clicks the "Sign in" button,
show a loading label and disable the button until the login request finishes.
Keep the existing validation and error handling. Add or update a focused test
if there is already a LoginForm test nearby.
```

### Input (SkillsSelectInput)

```json
{
  "query": "I am in a React app. In src/LoginForm.tsx, when the user clicks the \"Sign in\" button, show a loading label and disable the button until the login request finishes. Keep the existing validation and error handling.",
  "mode": "execute",
  "route": "execute",
  "taskEvidence": {
    "primaryIntent": "add-loading-state",
    "tags": ["react", "form", "async"],
    "paths": ["src/LoginForm.tsx"],
    "languages": ["typescript"],
    "projectKind": "react-app"
  },
  "budgetTokens": 1200,
  "maxSkills": 3
}
```

### Output (SkillsSelectResult)

```json
{
  "schemaVersion": 1,
  "status": "selected",
  "instructions": [
    {
      "id": "react-form-state",
      "title": "React form pending state",
      "content": "Prefer existing component patterns. Disable submit controls while async submit is pending. Keep validation paths intact.",
      "priority": 80,
      "provenance": { "skillId": "react-form-state", "source": "skills", "score": 0.91 }
    }
  ],
  "omissions": [],
  "usedTokens": 72,
  "budgetTokens": 1200,
  "warnings": [],
  "reasonCodes": ["skills_selected"],
  "durationMs": 8
}
```

The next pipeline stage (Prompt Construction) inserts the `instructions` array into the model prompt. It does not re-interpret the raw user text; it works entirely from the structured result above.
