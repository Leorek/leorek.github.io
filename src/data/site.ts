// -----------------------------------------------------------------------
// Single source of truth for site content. Edit here — the UI reads from it.
// Items marked TODO need Leo's real data (see the questions in chat).
// -----------------------------------------------------------------------

export const profile = {
  name: 'Leo',
  role: 'Product Engineer',
  // one-liner under the name in the hero
  tagline: 'I build products with TypeScript — and worlds with game engines.',
  // TODO: replace with your own 2–3 sentences, in your voice
  about: [
    'I’m a software engineer turned product engineer. By day I work close to the product — TypeScript, NestJS and Postgres — shipping things people actually use, and caring about the seams where engineering meets the experience.',
    'By night I’m in Unreal Engine 5 and Godot, prototyping the kind of interactive worlds I grew up loving. The same instinct drives both: make something that feels good to move through.',
    'Off the screen you’ll find me chasing rollercoasters and theme parks, deep in a videogame, or with celtic and electronic music on far too loud.',
  ],
  location: 'Málaga, Spain',
  email: 'japc93k@gmail.com',
  resumeUrl: '', // optional: '/leo-cv.pdf'
}

export const socials = [
  { label: 'GitHub', handle: 'leorek', href: 'https://github.com/leorek' },
  { label: 'LinkedIn', handle: 'in/juan-palavecino', href: 'https://es.linkedin.com/in/juan-palavecino' },
]

// Two halves of the same person — drives the Skills section
export const stacks = [
  {
    key: 'product',
    title: 'Product & Backend',
    note: 'The stuff that ships',
    items: ['TypeScript', 'NestJS', 'Node.js', 'PostgreSQL', 'React', 'REST / GraphQL', 'Docker'],
  },
  {
    key: 'worlds',
    title: 'Worlds & Real-time',
    note: 'The stuff that wows',
    items: ['Unreal Engine 5', 'Godot', 'C++', 'GDScript', 'Blueprints', 'Three.js / WebGL', 'Shaders'],
  },
] as const

// TODO: replace with 2–4 REAL projects. `kind` controls the accent label.
export type Project = {
  title: string
  year: string
  kind: 'product' | 'world'
  blurb: string
  tech: string[]
  href?: string
}

export const projects: Project[] = [
  {
    title: 'TODO — Flagship product work',
    year: '2025',
    kind: 'product',
    blurb:
      'A real product you shipped. One or two sentences: what it does, your role, the hard part you solved. Concrete, not buzzwords.',
    tech: ['TypeScript', 'NestJS', 'Postgres'],
    href: '',
  },
  {
    title: 'TODO — Backend / platform piece',
    year: '2024',
    kind: 'product',
    blurb: 'Another piece of professional work. Link it if it’s public; otherwise a screenshot/description works.',
    tech: ['Node.js', 'Postgres', 'Docker'],
    href: '',
  },
  {
    title: 'TODO — Game / 3D experiment',
    year: '2025',
    kind: 'world',
    blurb: 'A UE5 or Godot prototype. What were you exploring? itch.io link or a short clip would be perfect.',
    tech: ['Unreal Engine 5', 'C++'],
    href: '',
  },
  {
    title: 'TODO — Second world / jam',
    year: '2024',
    kind: 'world',
    blurb: 'A game jam entry, a mechanic prototype, a shader study — anything that shows the maker side.',
    tech: ['Godot', 'GDScript'],
    href: '',
  },
]

// The human side — drives the Interests marquee/section
export const interests = [
  { label: 'Rollercoasters', note: 'airtime hunter' },
  { label: 'Theme parks', note: 'queue-line nerd' },
  { label: 'Videogames', note: 'always one more run' },
  { label: 'Celtic music', note: 'fiddles & bodhráns' },
  { label: 'Electronic', note: 'late-night BPMs' },
  { label: 'Travelling', note: 'collecting places' },
]
