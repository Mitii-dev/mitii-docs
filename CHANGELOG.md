# Changelog

## [2.9.67] - 2026-09-27

### Added
- Git working tree pane: unified AI job runner for commit message, changelog, release notes, PR summary, and code review generation, with a single active-job state and a Stop button (new `IconStop`) to abort in-flight generation.
- Right-click context menu on working tree files for running AI jobs against a selected set of paths.
- "More" overflow menu in the working tree pane toolbar for secondary actions.
- `gitStash` engine API (`git stash push` with pathspec, optional `--include-untracked`, and optional stash message) with path and message sanitization.
- `POST /v1/git/stash` engine server endpoint (auth-protected) and `gitStashFiles` renderer API client.
- `changelogMerge` utility (`mergeChangelogSection`, `unwrapRecipeAnswer`) to merge generated Keep a Changelog sections into an existing `CHANGELOG.md`, plus unit tests (`changelogMerge.spec.ts`).
- Upsert behavior for generated markdown: saves to an existing workspace file or creates it (including parent path) when missing.

### Changed
- Working tree pane now merges untracked files into the "Changes" group (separate "Untracked" group removed) and sorts the combined list by path.
- Replaced separate `genBusy`/`reviewBusy` states with a single `activeJob` state and `AbortController`-based cancellation across all AI jobs.
- Recipe prompts now accept an optional note that is prepended when not already present in the compiled prompt.

### Fixed
- Stash message input is validated via `assertSafeGitArg` to prevent shell/argument injection through the stash label.
