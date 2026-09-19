# Skills

Skills are reusable, named instruction bundles that shape how Mitii behaves for a given task. The CLI lets you attach a skill to any `ask` call (or use the dedicated recipe commands that auto-attach one).

## What is a skill?

A skill is a structured prompt + tool-policy bundle stored in the workspace. Examples:

| Skill name | Purpose |
|---|---|
| `code-review-and-quality` | Read-only code review with severity-tagged findings |
| `git-commit-message` | Draft a conventional commit message from the staged diff |
| `git-pr-summary` | Draft a PR body (Summary + Test plan) |
| `release-changelog` | Draft a Keep a Changelog entry |

## Using a skill with `mitii ask`

```bash
mitii ask "Review the working-tree changes" --mode ask --skill code-review-and-quality
```

| Flag | Effect |
|---|---|
| `--skill <name>` | Attach the named skill to this ask |
| `--mode ask` | Read-only mode (no file writes, no tool execution) |
| `--echo` | Print the deterministic prep / SARIF payload without calling the LLM |

### Example: deterministic prep only (no LLM)

```bash
mitii ask "Review the working-tree changes" --mode ask --skill code-review-and-quality --echo
```

This prints the SARIF-ready payload that *would* be sent, letting you inspect the context window without spending tokens.

## Recipe commands (auto-attach a skill)

These commands are sugar over `mitii ask --skill …`:

```bash
mitii commit-message   # auto-attaches git-commit-message
mitii pr-summary       # auto-attaches git-pr-summary
mitii changelog        # auto-attaches release-changelog
```

## Listing available skills

Skills live in `.mitii/skills/` in your workspace. Each is a markdown file with YAML front-matter:

```
.mitii/skills/
├── code-review-and-quality.md
├── git-commit-message.md
├── git-pr-summary.md
└── release-changelog.md
```

You can also reference skills by path:

```bash
mitii ask "…" --skill .mitii/skills/my-custom-skill.md
```

## Next steps

- [Commands & Options](./commands) — full CLI reference
- [Setup & Providers](./setup) — configure your provider
- [Providers](./providers) — supported providers
