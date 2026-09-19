# VS Code Extension — Development

## Develop from source

```bash
git clone https://github.com/mitii-dev/mitii
cd mitii
pnpm install
pnpm build
# Load the extension: VS Code → Extensions → … → "Install from VSIX…"
```

## Platform notes

- **Windows** – uses `node.exe` from PATH; no shell wrapper needed.
- **Linux / macOS** – requires `node` on PATH. If using nvm/fnm, ensure the shell profile is sourced before launching VS Code.
- **Remote (SSH / Dev Container)** – the extension runs on the remote host; install Node.js there.
