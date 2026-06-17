# leorek.github.io

Personal site — a moonlit night-ocean hero (custom three.js Gerstner-wave shader)
over a single-page portfolio. Built to deploy as static files to GitHub Pages.

## Stack

- **Vite + React + TypeScript**
- **react-three-fiber + drei + three** — the 3D ocean scene
- **GSAP + Lenis** — smooth scroll, magnetic UI
- **Tailwind CSS v4**

## Develop

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # -> dist/
```

## Edit content

All copy/links/projects live in [`src/data/site.ts`](src/data/site.ts).
Items marked `TODO` need real data.

## Deploy

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds and
publishes `dist/` to GitHub Pages. (Enable Pages → Source: GitHub Actions, once.)
