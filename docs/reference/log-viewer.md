# Log Viewer

A standalone browser tool for inspecting Mitii session logs and running benchmarks. Lives under `tools/log-viewer/` — not part of the VS Code extension.

## Run

```bash
pnpm log-viewer
```

Opens `http://127.0.0.1:8797` by default.

### Jump to benchmark runner

```bash
pnpm log-viewer -- --benchmark
# or
node tools/log-viewer/server.mjs --benchmark --no-open
```

### Optional flags

```bash
pnpm log-viewer -- --root /path/to/repo
pnpm log-viewer -- --benchmark-root /path/to/tests/benchmark
pnpm log-viewer -- --port 8797
```

## Logs mode

- Enter a repo path or `.mitii/logs` path and click **Load**.
- Or click **Choose repo folder** and select a repo directory.
- Pick a `*-model-io.jsonl` file to see each model turn with formatted Input and Output.
- Pick a normal session `.jsonl` file to inspect the run timeline.

The viewer highlights bug signals:

- Provider errors
- Non-stop finish reasons
- Invalid tool-call JSON
- Truncated payloads
- Missing request/response pairs
- Failed runs, failed tools, failed verification events

## Benchmark mode

Open **Benchmark** in the top nav (or `/benchmark`).

| Action | Control |
|--------|---------|
| Live run console | Fullscreen modal (auto on start/refresh while running) |
| Activity feed | Left drawer — toggle **☰** / **L** |
| Collapse Runs / Inspector | Header chips **Runs** / **Inspector** |
| Re-run one case | **Re-run** on any results row |
| Provider / fixtures | **Provider**, **Reset fixtures** |

## Setup (first time)

```bash
cd tools/log-viewer && npm install
```

## Related

- [Configuration](/using/configuration) — log verbosity settings
- [Development Setup](/development/development-setup) — running tests from source
