# Mitii Docs

Documentation for **[Mitii AI Agent](https://github.com/codewithshinde/thunder-ai-agent)** — deployed at [docs.mitii.dev](https://docs.mitii.dev).

This is a **standalone repository**. The VS Code extension lives in [thunder-ai-agent](https://github.com/codewithshinde/thunder-ai-agent). The marketing site lives in [mitii-website](https://github.com/codewithshinde/mitii-website).

## Setup as its own repo

```bash
# If this folder is still inside thunder-ai-agent, move it out first:
# mv mitii-docs ../mitii-docs && cd ../mitii-docs

git init
git add .
git commit -m "Initial Mitii docs site"
git remote add origin https://github.com/codewithshinde/mitii-docs.git
git push -u origin main
```

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output → docs/.vitepress/dist
npm run preview
```

## Branding

Edit `brand.ts` at the repo root. Keep in sync with:

- `mitii-website/brand.ts`
- `thunder-ai-agent/src/shared/brand.ts` (extension)

## Deploy

Build output: `docs/.vitepress/dist`

Point **docs.mitii.dev** at this static output (Cloudflare Pages, Netlify, Vercel, GitHub Pages).

## Theme

Monochrome black & white. Dark mode is the default (`appearance: 'dark'` in VitePress config). Styles live in `docs/.vitepress/theme/custom.css`.
