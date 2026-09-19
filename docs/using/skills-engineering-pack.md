# Engineering Skills Pack

Mitii bundles a starter set of **14 engineering skills** under `packages/sdk/skills/`. They are adapted from [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) into Mitii's `SKILL.md` format.

These are **bundled defaults**. Edit them in place, replace any skill by overwriting its folder, or override per workspace without touching the pack.

## Included skills

| Skill | Conflict group | Primary intents |
|---|---|---|
| `spec-driven-development` | define | feature, scaffold, migrate, question |
| `planning-and-task-breakdown` | planning | feature, bugfix, … (plan-heavy) |
| `incremental-implementation` | build | feature, refactor, migrate, scaffold |
| `test-driven-development` | verify | test, bugfix, feature, refactor |
| `debugging-and-error-recovery` | debug | bugfix, diagnose, trace |
| `code-review-and-quality` | review | review, audit, refactor |
| `fix-review-findings` | build | bugfix, refactor (recipe: Fix / Fix all) |
| `security-and-hardening` | review | security, audit, feature |
| `git-workflow-and-versioning` | ship | feature, bugfix, refactor, docs, migrate |
| `git-commit-message` | ship-commit | docs, feature, bugfix, refactor (recipe) |
| `git-pr-summary` | ship-pr | docs, feature, bugfix, refactor, review (recipe) |
| `release-changelog` | ship-changelog | docs, feature, bugfix, migrate (recipe) |
| `cicd-agent` | verify | test, bugfix, feature, config (CI/PR automation) |
| `incident-triage` | debug | bugfix, diagnose, trace (logs → ticket) |

> Mitii injects **at most a few** skills per turn (metadata mode). Long playbooks stay on disk; only frontmatter + `# Planning` enter the prompt.

## Edit a skill

1. Open `packages/sdk/skills/<skill-id>/SKILL.md`
2. Change Mitii fields (`intents`, `routes`, `priority`, `when`, `instruction`) or the `# Planning` block
3. Edit `# Playbook` for the full workflow text
4. Set `enabled: false` to keep the file but skip loading

## Replace one skill

Overwrite the bundled file:

```
packages/sdk/skills/<skill-id>/SKILL.md
```

Or drop a same-`name` file in your workspace (wins over bundled):

```
<workspace>/.mitii/skills/<skill-id>/SKILL.md
```

## Replace the whole pack

Point your workspace at a different skills directory via configuration.

## Related

- [Skills](/using/skills) — skill format and how skills are loaded
- [Skills (understanding)](/understanding/agent-intelligence/skills) — internal skill pipeline
