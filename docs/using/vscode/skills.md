# VS Code Extension — Skills

Skills are reusable, named instruction bundles that shape how Mitii behaves for a given task. In the VS Code extension you attach them per message in chat.

## Attaching skills in chat

- Type `/` in the chat input to browse available skills, or use `@skill:<id>` syntax.
- Up to **3 skills** can be attached per message.
- Workspace skills live in `.mitii/skills/` and are loaded when `mitii.skills.workspace.enabled` is true (default on).
- Force-attach playbooks guarantee the skill is included in the prompt for that turn.

## Writing recipes (auto-attach)

Recipes are pre-configured skill attachments that auto-fire on specific commands:

| Command | Force-attached skill |
|---|---|
| **Mitii: Generate Commit Message** | `git-commit-message` |
| **Mitii: Generate PR Summary** | `git-pr-summary` |
| **Mitii: Generate Changelog** | `release-changelog` |
| **Mitii: Prepare Release Notes** | `release-changelog` |

These entry points gather git status/diff/log and set `requiredSkillIds` so the skill is guaranteed. Authoring format and matcher fields: [docs/SKILLS_FORMAT.md](/understanding/agent-intelligence/skills).

The CLI also accepts `mitii ask` with a recipe name (commit message, summary, changelog) — same skills, same output.
