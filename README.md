# leorek.github.io

Personal site — **Leo's studio**: a toon-shaded 3D room on the Málaga seafront.
Scroll for a guided tour (desk → arcade → turntable → coaster model → travel
board → window), or click any object to jump to it. The room follows real
Málaga time (day, sunset, night); the desk lamp / sun-moon button
fast-forwards between day and night. English and Spanish.

Design document (in Spanish): [`docs/DESIGN.md`](docs/DESIGN.md).

## Stack

- **Vite 8 + React 19 + TypeScript**
- **react-three-fiber 9 + drei 10 + three r186** — the studio (toon materials,
  inverted-hull outlines, custom GLSL sky and Gerstner-wave sea)
- **Lenis** — smooth scroll; **Tailwind CSS v4** — UI

## Develop

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # -> dist/
```

Handy URL params: `?t=19.5` pins the clock (e.g. sunset), `#parks` deep-links
to a station.

## Edit content

- Copy (EN + ES): [`src/content/i18n.ts`](src/content/i18n.ts)
- Data (stack, projects, travel pins, links): [`src/data/site.ts`](src/data/site.ts) — items marked `TODO` need real data
- Camera pose per station: [`src/lib/stations.ts`](src/lib/stations.ts)
- Time-of-day palettes: [`src/lib/time-of-day.ts`](src/lib/time-of-day.ts)

## Deploy

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds and
publishes `dist/` to GitHub Pages. (Enable Pages → Source: GitHub Actions, once.)
