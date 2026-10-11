// -----------------------------------------------------------------------
// Language-neutral site data. Translatable copy lives in src/content/i18n.ts.
// Items marked TODO need Leo's real data (see docs/DESIGN.md §13).
// -----------------------------------------------------------------------

export const profile = {
  name: 'Leo',
  email: 'japc93k@gmail.com',
  resumeUrl: '', // optional: '/leo-cv.pdf'
}

export const socials = [
  { label: 'GitHub', href: 'https://github.com/leorek' },
  { label: 'LinkedIn', href: 'https://es.linkedin.com/in/juan-palavecino' },
]

export const stacks = {
  product: ['TypeScript', 'NestJS', 'Node.js', 'PostgreSQL', 'React', 'REST / GraphQL', 'Docker'],
  worlds: ['Unreal Engine 5', 'Godot', 'C++', 'GDScript', 'Blueprints', 'Three.js / WebGL', 'Shaders'],
}

// TODO(leo): 2–4 real projects. Projects with `draft: true` are not rendered.
export type Project = {
  title: string
  year: string
  kind: 'product' | 'world'
  blurb: { en: string; es: string }
  tech: string[]
  href?: string
  draft?: boolean
}

export const projects: Project[] = [
  {
    title: 'Flagship product work',
    year: '2025',
    kind: 'product',
    blurb: { en: 'TODO', es: 'TODO' },
    tech: ['TypeScript', 'NestJS', 'Postgres'],
    draft: true,
  },
]

// Pins on the cork board. Málaga is home base; yarn runs from it to every
// other pin. TODO(leo): add the places you've actually been, e.g.
//   { name: 'Dublin', lat: 53.35, lon: -6.26 },
export type Place = { name: string; lat: number; lon: number; home?: boolean }

export const places: Place[] = [{ name: 'Málaga', lat: 36.72, lon: -4.42, home: true }]
