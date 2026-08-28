# Features

Mitii is a **local-first, approval-gated, auditable** coding-agent runtime. It indexes your entire workspace, plans before it acts, and keeps every operation under your control — without sending code to a vendor server.

---

## Deep Workspace Indexing

Mitii builds a multi-layer index of your repository before any agent interaction:

| Layer | What it provides |
|-------|-----------------|
| **FTS5** | Fast full-text keyword search across all indexed files |
| **Tree-sitter** | Symbol extraction (functions, classes, imports) across 100+ languages |
| **Repo map** | PageRank over import/export edges — surfaces structurally important files |
| **Vectors** | On-device MiniLM embeddings (384-d, L2-normalized) for semantic similarity search |
| **Git + LSP** | Uncommitted diffs and live diagnostics injected into context |
| **Project rules** | Auto-loads `AGENTS.md`, `.cursor/rules`, `.clinerules`, `.mitii/rules` |

A **hybrid retriever** merges all sources, a **reranker** trims noise, and a **context budget** fits the result into your model window. The **context debugger** in the sidebar shows exactly what was included, truncated, or dropped.

All indexing and embedding runs **on your machine** — no API calls, no network round-trips.

---

## Agent Workflow (Plan / Act)

Mitii separates **thinking** from **doing** with explicit modes:

| Mode | Writes | Shell | Purpose |
|------|--------|-------|---------|
| **Ask** | Blocked | Read-only | Q&A, exploration, explanation |
| **Plan** | Blocked | Read-only | Structured plans, audits, impact analysis |
| **Agent** | With approval | With approval | Implementation with per-step gates |
| **Review** | Blocked | Read-only | Code review and quality checks |

### Agent tools

| Tool | Purpose |
|------|---------|
| `ask_question` | Clarify ambiguous requests before acting |
| `propose_plan_mutation` | Propose changes to the current plan mid-run |
| `propose_file_scope` | Declare candidate file paths before reading or editing (default Act contract) |
| `mark_step_complete` | Signal step completion for progress tracking |

---

## Safety & Control

Two cooperating layers gate every risky operation:

| Layer | Role |
|-------|------|
| **Decision Policy** | Decides *what* is allowed: execution route, planning depth, tool grant, verification requirements, prompt-injection scan |
| **Tool Runtime** | Enforces the grant: validates tool name, effect, path scope, command rules, network hosts, output limits, mutation batch limits |

### ToolGrant dimensions

| Dimension | Controls |
|-----------|----------|
| `maximumWorkspaceEffect` | Read-only → write → execute |
| `allowedTools` | Which tools the model may request |
| `pathScopes` | Filesystem paths the agent may touch |
| `commandRules` | Shell command allow/deny patterns |
| `networkHosts` | Per-endpoint network access |
| `limits` | Output size, batch size, timeout |
| `mutationBudget` | Max file mutations per run |
| `approvalMode` | `when_required` or `always` |

### Additional safety features

- **Prompt-injection defense** — Decision Policy scans for injection signals and clamps the ToolGrant before Tool Runtime sees the call
- **Verification requirements** — agent must produce evidence (test output, typecheck, lint) before claiming success
- **Mutation rollback** — Tool Runtime can revert a batch of file changes on failure
- **Audit trail** — every tool call, approval, and rejection is logged (SQLite + JSONL)
- **MCP Act-mode exclusions** — MCP tools are excluded from Agent mode by default

---

## Code Intelligence

| Capability | Description |
|------------|-------------|
| **Code Navigation** | Resolve definitions, references, and hover info via injected `CodeNavigationPort` |
| **Change Impact** | Walk the repository graph from a file/symbol/caret seed to estimate blast radius (affected files, packages, truncation signals) |
| **Repo Graph** | Dependency and dependent edges across files, symbols, and packages |

---

## Memory & Context

- **Hybrid retrieval** — FTS5 keyword + vector semantic search merged and reranked
- **Access-based retention** — frequently accessed memories are retained longer
- **Privacy redaction** — hash reinforcement + Jaccard supersede to prevent sensitive data leakage
- **Checkpoints** — filesystem snapshots for safe rollback of agent changes
- **Session logs** — JSONL audit trail of every tool call and approval

---

## Skills System

Mitii ships **12 bundled skills** that shape agent behavior:

| Skill | Focus |
|-------|-------|
| `safety-always` | Safety guardrails on every run |
| `ask-concise` | Concise, direct answers |
| `bugfix-localize` | Localize bugs before fixing |
| `planning-default` | Structured planning before action |
| `planning-and-task-breakdown` | Decompose specs into atomic tasks |
| `code-review-and-quality` | Review and quality checks |
| `debugging-and-error-recovery` | Systematic debugging |
| `git-workflow-and-versioning` | Atomic commits, clear history |
| `incremental-implementation` | Small, verifiable changes |
| `security-and-hardening` | OWASP-class risk hardening |
| `spec-driven-development` | Spec-first implementation |
| `test-driven-development` | TDD workflow |

Custom skills can be dropped into `.mitii/skills/` to override or extend bundled behavior.

---

## Provider Support

Mitii is **LLM-agnostic** via the `LlmPort` injection pattern:

| Provider | Notes |
|----------|-------|
| Anthropic (Claude) | `ANTHROPIC_API_KEY` |
| Google (Gemini) | `GEMINI_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| DeepSeek | OpenAI-compatible endpoint |
| Ollama / LM Studio | Local, no key required |
| Any OpenAI-compatible | Custom base URL |

- **Token budget** — context window drives derived budgets for input/output
- **Profiles** — `.mitii/profiles.json` for per-project provider/model presets
- **Secrets stay on the port** — the SDK and V8 never see API keys

---

## MCP (Model Context Protocol)

- **Off by default** (`mitii.mcp.enabled`)
- **Built-in catalog** — install MCP servers from Settings → Integrations
- **Act-mode exclusions** — MCP tools are excluded from Agent mode for safety
- Same approval policy as built-in tools when enabled

---

## Multi-Surface

The same agent core powers three surfaces:

| Surface | Package | Use case |
|---------|---------|----------|
| **VS Code Extension** | `apps/vscode` | IDE-integrated agent with sidebar UI, context debugger, approval queue |
| **CLI** | `@mitii/cli` | Headless terminal agent for CI, scripts, and remote workflows |
| **SDK** | `@mitii/sdk` | Host-neutral programmatic API for embedding Mitii in custom apps |

All three share the same `@mitii/v8` engine, `@mitii/host` kit, and safety model.

---

## Architecture

```text
Validated Input → Cohesive Pipeline → Validated Result
```

| Package | Responsibility |
|---------|---------------|
| `@mitii/v8` | Agent engine, decision policy, tool runtime, code navigation, change impact |
| `@mitii/sdk` | Public host-neutral API (createMitiiClient, run lifecycle, LlmPort injection) |
| `@mitii/host` | Shared host kit: indexing, bundled embedding, checkpoints, memory, skills catalog |
| `@mitii/cli` | Headless CLI over SDK |
| `apps/vscode` | VS Code extension (F5 target, Marketplace: `mitii.mitii-ai-agent`) |

**Forbidden edges:** `host → apps`, `sdk → host`, `v8 → host`.
