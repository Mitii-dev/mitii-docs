# Examples

Ready-to-use configuration examples for Mitii automation, hooks, and CI workflows.

## CI Workflows

### Mitii Agent (basic)

```yaml
# .github/workflows/mitii-agent.yml
name: Mitii Agent
on: [push]
jobs:
  mitii:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm install -g @mitii/cli
      - run: mitii run --mode agent --autonomy apply_and_pr
```

### Post-commit Cover

```yaml
# .github/workflows/mitii-post-commit-cover.yml
name: Post-commit Cover
on: [push]
jobs:
  cover:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm install -g @mitii/cli
      - run: mitii run --mode agent --autonomy apply_and_pr
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### CI Failure Triage

```yaml
# .github/workflows/mitii-ci-failure-triage.yml
name: CI Failure Triage
on:
  workflow_run:
    types: [completed]
    workflows: ["*"]
    statuses: [failure]
jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm install -g @mitii/cli
      - run: mitii run --mode ask --autonomy readonly
```

### PR Review

```yaml
# .github/workflows/mitii-pr-review.yml
name: PR Review
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm install -g @mitii/cli
      - run: mitii run --mode ask --autonomy readonly
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Hooks

### Deny git push

```json
{
  "name": "deny-git-push",
  "description": "Block the agent from pushing to protected branches",
  "pattern": "git push",
  "action": "deny",
  "reason": "Use create_pull_request instead of pushing directly"
}
```

## Recipes

### After commit

```json
{
  "name": "after-commit",
  "trigger": "post-commit",
  "steps": [
    { "tool": "run_tests", "args": { "scope": "changed" } },
    { "tool": "write_missing_tests", "args": { "scope": "changed" } },
    { "tool": "create_pull_request", "args": { "draft": true } }
  ]
}
```

## Related

- [Automation overview](/automation/) — design principles
- [Cron & Events](/automation/cron) — trigger definitions
- [Smoke scripts](/automation/smoke) — how to test these paths
- [Shipping](/automation/SHIP) — E2E shipping loops
