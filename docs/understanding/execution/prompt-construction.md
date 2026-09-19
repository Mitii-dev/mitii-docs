# Prompt Construction

Prompt Construction assembles the provider-neutral `ModelRequest` that Model Gateway sends to the LLM. It takes the raw pieces of a turn — user message, conversation history, repository context, skills, memory, plan text, and tool definitions — and fits them into a single, budgeted prompt that respects the model's context window.

In the execution pipeline, Prompt Construction sits between the Agent Engine (which decides *what* to do) and Model Gateway (which handles *how* to talk to the provider). It is the last step before a request leaves the system.

## Core Concepts

### Token Budget

Every model has a fixed context window (e.g. 128k tokens). Prompt Construction divides that window into two regions:

- **Input budget** — everything the model reads (system prompt, conversation, repository context, tools, etc.).
- **Output reserve** — headroom left for the model's response.

The output reserve is calculated *before* input is allocated, so the model always has room to generate. If the assembled prompt exceeds the planned input budget, the output limit is reduced to fit the remaining window rather than truncating the prompt.

### Provenance and Trust

Every block injected into the prompt carries metadata identifying its origin (system, repository, skill, memory, plan, user, or tool) and its trust level. This lets downstream stages and the model itself distinguish, for example, untrusted repository content from trusted system instructions.

### Output Token Resolution

The final `maximumOutputTokens` value is not a static number. It is recomputed every turn:

```
outputTokens = floor((contextWindow - actualPromptTokens) * 0.95)
```

The result is then capped by any explicit host override of `maximumOutputTokens`. The planning reserve (and the legacy 5000-token default) are *not* generation ceilings — they only prevent input from consuming the entire window.

::: info Example
A 30k context window with a 12k assembled prompt resolves to `floor((30k − 12k) × 0.95)` = **17.1k** output tokens, not the 6k planning reserve. A turn with 10k of free context can write roughly 10k tokens.
:::

## How It Works

The public entry point is `PromptConstructionPipeline.construct`. A single call performs the following steps in order:

1. **Validate** the `PromptConstructionInput` (schema, version, limits).
2. **Reserve output tokens** from the context window before allocating input.
3. **Assemble messages** — system/developer, conversation history, user message, and tool results.
4. **Serialize repository context** into bounded prompt blocks (each block is size-capped).
5. **Inject instruction blocks** — selected skills, memory entries, and project rules.
6. **Append plan text** if an approved plan exists for this run.
7. **Attach tool definitions** (already filtered by Agent Engine grants).
8. **Resolve the final output limit** from the actual prompt size.
9. **Report** budget usage, provenance entries, any omissions or truncations, warnings, and reason codes.

If a section cannot fit within its budget, it is omitted or truncated and the reason is recorded in the result — the module never silently drops content.

## Types and Contracts

| Type | Purpose |
| --- | --- |
| `PromptConstructionInput` | Everything the pipeline needs: decision, user message, conversation, repository context, instructions, plan text, tools, model capabilities, and output reserve. |
| `PromptConstructionResult` | The assembled `ModelRequest` plus a budget report, provenance entries, omissions, warnings, and reason codes. |
| `PromptRepositoryContext` | A state token and the prompt-safe blocks derived from repository retrieval. |
| `PromptInstructions` | Project rules, skill blocks, and memory instruction blocks to inject. |
| `PromptBudgetReport` | Context window size, output reserve, per-section budgets, and whether the result is within limits. |
| `TokenEstimatorPort` | Abstraction for token counting; swappable for provider-specific estimators. |

## Module Structure

```text
prompt-construction/
  pipeline/                 PromptConstructionPipeline (public facade)
  actions/                  Budgeting, tool serialization, context serialization
  contracts/
    input/                  PromptConstructionInput
    output/                 PromptConstructionResult, budgets, provenance
    ports/                  TokenEstimatorPort
    errors/                 PromptConstructionErrors
  internal/                 Token estimator and injection boundary helpers
  tests/
```

## Ownership Boundaries

**Owns:** prompt assembly, token budget allocation, provenance tracking, omission reporting, and output headroom calculation.

**Does not own:** policy grants, repository retrieval, model HTTP transport, tool execution, or output verification. Those are handled by their respective modules upstream or downstream.

## Example

A developer asks the agent to add a loading state to a React login form:

> *"In `src/LoginForm.tsx`, when the user clicks the Sign in button, show a loading label and disable the button until the login request finishes. Keep the existing validation and error handling."*

The host attaches the workspace and target file, producing this input:

```json
{
  "prompt": "In src/LoginForm.tsx, when the user clicks the Sign in button, show a loading label and disable the button until the login request finishes. Keep the existing validation and error handling.",
  "workspaceId": "workspace-1",
  "stateToken": "state-abc",
  "targetFile": "src/LoginForm.tsx"
}
```

Prompt Construction returns a `PromptConstructionResult` shaped like this:

```json
{
  "schemaVersion": 1,
  "status": "complete",
  "request": {
    "model": "gpt-5-codex",
    "maximumOutputTokens": 12000,
    "toolChoice": "auto",
    "messages": [
      { "role": "system", "content": "You are Mitii Agent..." },
      { "role": "user", "content": "<user_request>...loading state...</user_request>" }
    ],
    "tools": [
      { "name": "read_file", "description": "Read a workspace file", "inputSchema": { "type": "object" } }
    ]
  },
  "budget": {
    "contextWindowTokens": 128000,
    "outputReservedTokens": 4096,
    "inputBudgetTokens": 123904,
    "withinLimits": true
  },
  "provenance": [
    {
      "blockId": "repo:src/LoginForm.tsx",
      "section": "repository",
      "source": "repository-context",
      "trust": "untrusted_repository_content"
    }
  ],
  "omissions": [],
  "warnings": [],
  "reasonCodes": ["output_reserved_first", "within_provider_limits"]
}
```

The `request` field is what Model Gateway forwards to the provider. The `budget`, `provenance`, `omissions`, and `reasonCodes` fields are operational metadata for the host and for debugging.

## Testing

```bash
pnpm exec vitest run packages/v8/src/modules/prompt-construction
```
