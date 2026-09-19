# Request Understanding

Request Understanding is the first stage of Mitii's agent pipeline. It takes a user's raw request and turns it into structured **task evidence** — a machine-readable description of what the user appears to want, how broad the task is, and what downstream stages should consider.

It is an analysis step, not an authorization step: it tells [Decision Policy](/understanding/agent-intelligence/decision-policy) and [Planning](/understanding/agent-intelligence/planning) what the request looks like, but it does not grant any authority to act on it.

## Where It Fits

A typical request flows through the pipeline like this:

```text
User message
  → Request Understanding   (this module: intent + task evidence)
  → Decision Policy         (route selection, grants, escalation)
  → Planning / Execution    (plan artifact, tool calls, verification)
```

Downstream stages consume the structured result of this module rather than reinterpreting the raw user text, which keeps intent interpretation consistent across the pipeline.

## What This Module Does

- Extracts the primary user message from the request envelope.
- Classifies task and interaction intent (for example: *implementation* vs. *question*, *execute* vs. *clarify*).
- Resolves a **Super Intent** result with confidence scores and a clarification signal.
- Runs the **Task Analyzer** to derive scope, complexity, risk, clarity, targets, constraints, and requested outcomes.
- Recommends whether repository discovery, planning, verification, or clarification may be needed.

All recommendations are advisory — Decision Policy makes the final routing and grant decisions.

## Core Concepts

| Concept | What it is |
| --- | --- |
| `UserRequestEnvelope` | The normalized input structure the host produces from a user message. It carries the message text, referenced artifacts (files, symbols), workspace identity, session context, and schema version. |
| Super Intent | The resolved intent classification: what kind of task the user wants (`primaryTaskIntent`) and how they want the agent to interact (`interactionIntent`), plus confidence and clarification signals. |
| Task Analyzer | The component that scores the request along dimensions (scope, complexity, risk, clarity) and extracts concrete targets and constraints. It works on dimensions, not hard-coded task templates. |
| Task evidence | The combined output — intent plus task analysis — that downstream stages rely on. |

## Input and Output Contracts

- **Input** — `RequestUnderstandingPipelineInput`, which is the `UserRequestEnvelope` itself.
- **Output** — `RequestUnderstandingResult`, shaped as `{ intent, taskAnalysis }`:
  - `intent`: Super Intent result with status, classification, scores, confidence margin, clarification recommendation, and diagnostics.
  - `taskAnalysis`: scope, complexity, risk, clarity, targets, constraints, requested outcomes, recommendations, estimated file impact, signals, and confidence.

The public entry point is `RequestUnderstandingPipeline.understand`.

## How It Works

- **Deterministic first.** Rule classifiers provide baseline intent signals without any model call, so the module always produces a usable result.
- **Optional LLM enrichment.** An LLM classifier can refine the intent result when available, but the pipeline does not depend on it.
- **Dimension-based analysis.** Task analysis scores the request along general dimensions rather than matching it against fixed task templates, so it generalizes to unfamiliar requests.
- **Advisory output.** Recommendations (discovery, planning, verification, clarification) inform Decision Policy; they never grant permissions or trigger execution.
- **Degradation is visible.** Budget, path, state, or provider constraints are applied before output is produced, and any degraded behavior is recorded as warnings or reason codes rather than silently dropped.

## Ownership Boundaries

**Owns:** intent classification and task evidence.

**Does not own:** repository retrieval, prompt construction, tool grants, tool execution, or verification. Those belong to neighboring modules, and this module does not cross into them.

## Module Structure

```text
request-understanding/
  pipeline/                 RequestUnderstandingPipeline (public facade)
  contracts/
    input/                  RequestUnderstandingPipelineInput
    output/                 RequestUnderstandingResult
  intent/                   Intent router, rule/LLM classifiers, resolution
  task-analyzer/            Dimension extraction and task analysis contracts
  tests/                    Pipeline, intent, and target extraction tests
```

## Example Flow

The following example uses a realistic coding-agent request. The ids and scores are representative, but the shape matches what this module actually receives and returns.

### The Request

```text
I am in a React app. In src/LoginForm.tsx, when the user clicks the "Sign in" button, show a loading label and disable the button until the login request finishes. Keep the existing validation and error handling. Add or update a focused test if there is already a LoginForm test nearby.
```

### Input: `UserRequestEnvelope`

The host normalizes the message and attaches workspace and artifact context:

```json
{
  "schemaVersion": 1,
  "requestId": "req-1",
  "sessionId": "session-1",
  "mode": "agent",
  "origin": "user",
  "message": "I am in a React app. In src/LoginForm.tsx, when the user clicks the \"Sign in\" button, show a loading label and disable the button until the login request finishes. Keep the existing validation and error handling. Add or update a focused test if there is already a LoginForm test nearby.",
  "referencedArtifacts": [
    { "kind": "file", "name": "LoginForm.tsx", "path": "src/LoginForm.tsx" }
  ],
  "workspace": { "workspaceId": "workspace-1" },
  "createdAt": "2026-08-14T12:00:00.000Z"
}
```

### What the Module Extracts

1. **Target** — `src/LoginForm.tsx`, taken from the explicit reference in the message and `referencedArtifacts`.
2. **Constraint** — existing validation and error handling must stay intact.
3. **Requested outcomes** — disable the button while the login request is pending; show a loading label.
4. **Intent** — an implementation task the user wants executed, with high confidence and no clarification needed.

### Output: `RequestUnderstandingResult`

```json
{
  "intent": {
    "status": "accepted",
    "classification": {
      "primaryTaskIntent": "implementation",
      "interactionIntent": "execute"
    },
    "confidenceMargin": 0.42,
    "recommendsClarification": false
  },
  "taskAnalysis": {
    "scope": "single_location",
    "complexity": "simple",
    "risk": "low",
    "clarity": "clear",
    "targets": [{ "kind": "file", "value": "src/LoginForm.tsx", "explicit": true }],
    "requestedOutcomes": ["disable button while login request is pending", "show loading label"],
    "recommendsRepositoryDiscovery": true,
    "recommendsPlanning": false,
    "recommendsVerification": true,
    "confidence": 0.86
  }
}
```

Reading the result: the task is a single-file, low-risk implementation with a clear target, so the module recommends repository discovery (to ground the change in the actual code) and verification (to confirm the behavior), but not a full planning pass. Decision Policy then decides the route and grants based on this evidence.

## Tests

```bash
pnpm exec vitest run packages/v8/src/modules/request-understanding
```

Covers the pipeline, intent classification, and target extraction.
