// All translatable copy, EN + ES. Keep both languages in lockstep —
// the `Copy` type is derived from `en`, so a missing ES key won't compile.

const en = {
  meta: {
    title: 'Leo — Product Engineer',
  },
  ui: {
    skip: 'Skip to content',
    menu: 'Menu',
    close: 'Close',
    toDay: 'Switch to day',
    toNight: 'Switch to night',
    langSwitch: 'Leer en español',
    clock: 'Málaga',
    hint: 'Tip: click anything in the room',
  },
  nav: {
    hello: 'Hi',
    work: 'Work',
    worlds: 'Worlds',
    music: 'Music',
    parks: 'Parks',
    travel: 'Travel',
    contact: 'Contact',
  },
  hello: {
    status: 'Available for product engineering work',
    title: 'Hi, I’m Leo.',
    role: 'Product Engineer · Málaga',
    lead: 'I build products with TypeScript by day — and worlds with game engines by night.',
    tour: 'Take the tour',
    talk: 'Let’s talk',
  },
  work: {
    tag: 'By day',
    title: 'Products people actually use.',
    body: 'I’m a software engineer turned product engineer. I work close to the product — TypeScript, NestJS and Postgres — shipping things people use, and caring about the seams where engineering meets the experience.',
    stack: 'Product & backend',
    soon: 'Case studies are on their way. Ask me about them in the meantime.',
  },
  worlds: {
    tag: 'By night',
    title: 'Worlds that feel good to move through.',
    body: 'After hours I’m in Unreal Engine 5 and Godot, prototyping the kind of interactive worlds I grew up loving. Same instinct as the day job: make something that feels good to move through.',
    stack: 'Worlds & real-time',
    soon: 'Prototypes and clips coming to this cabinet soon.',
  },
  music: {
    tag: '128 BPM',
    title: 'Celtic fiddles, electronic kicks.',
    body: 'Usually far too loud, often at the same time. Fiddles and bodhráns for focus; late-night BPMs for shipping.',
    sideA: 'Side A — Celtic',
    sideANote: 'fiddles & bodhráns',
    sideB: 'Side B — Electronic',
    sideBNote: 'late-night BPMs',
  },
  parks: {
    tag: 'Airtime hunter',
    title: 'Rollercoasters & theme parks.',
    body: 'A great coaster is a hard engineering problem disguised as pure fun — which is exactly how I like my work. I chase airtime, launches and a well-themed queue line.',
    launch: 'Launch the coaster!',
  },
  travel: {
    tag: 'Collecting places',
    title: 'Pins on the board.',
    body: 'Every trip leaves a pin — and usually an idea for a level.',
    home: 'Home base',
    homeValue: 'Málaga, Spain',
  },
  contact: {
    tag: 'Say hi',
    title: 'Got something worth building?',
    body: 'Based in Málaga, with sea views, working with teams anywhere. Drop me a line.',
    footer: 'Built with three.js, hand-written shaders & too much coffee',
  },
}

export type Copy = typeof en
export type Lang = 'en' | 'es'

const es: Copy = {
  meta: {
    title: 'Leo — Product Engineer',
  },
  ui: {
    skip: 'Saltar al contenido',
    menu: 'Menú',
    close: 'Cerrar',
    toDay: 'Cambiar a día',
    toNight: 'Cambiar a noche',
    langSwitch: 'Read in English',
    clock: 'Málaga',
    hint: 'Pista: haz click en cualquier objeto',
  },
  nav: {
    hello: 'Hola',
    work: 'Trabajo',
    worlds: 'Mundos',
    music: 'Música',
    parks: 'Parques',
    travel: 'Viajes',
    contact: 'Contacto',
  },
  hello: {
    status: 'Disponible para trabajo de product engineering',
    title: 'Hola, soy Leo.',
    role: 'Product Engineer · Málaga',
    lead: 'De día construyo productos con TypeScript; de noche, mundos con motores de videojuegos.',
    tour: 'Haz el recorrido',
    talk: 'Hablemos',
  },
  work: {
    tag: 'De día',
    title: 'Productos que la gente usa de verdad.',
    body: 'Soy ingeniero de software reconvertido en product engineer. Trabajo pegado al producto —TypeScript, NestJS y Postgres— lanzando cosas que la gente usa y cuidando las costuras entre la ingeniería y la experiencia.',
    stack: 'Producto y backend',
    soon: 'Los casos de estudio están en camino. Mientras tanto, pregúntame por ellos.',
  },
  worlds: {
    tag: 'De noche',
    title: 'Mundos que da gusto recorrer.',
    body: 'Fuera de horas estoy en Unreal Engine 5 y Godot, prototipando el tipo de mundos interactivos con los que crecí. El mismo instinto que en el trabajo: crear algo que se sienta bien al recorrerlo.',
    stack: 'Mundos y tiempo real',
    soon: 'Pronto, prototipos y vídeos en esta recreativa.',
  },
  music: {
    tag: '128 BPM',
    title: 'Violines celtas, bombos electrónicos.',
    body: 'Casi siempre demasiado alto, a menudo a la vez. Violines y bodhráns para concentrarme; BPMs de madrugada para lanzar.',
    sideA: 'Cara A — Celta',
    sideANote: 'violines y bodhráns',
    sideB: 'Cara B — Electrónica',
    sideBNote: 'BPMs de madrugada',
  },
  parks: {
    tag: 'Cazador de airtime',
    title: 'Montañas rusas y parques temáticos.',
    body: 'Una gran montaña rusa es un problema de ingeniería difícil disfrazado de pura diversión, que es justo como me gusta mi trabajo. Persigo el airtime, los lanzamientos y una cola bien tematizada.',
    launch: '¡Lanza la montaña rusa!',
  },
  travel: {
    tag: 'Coleccionando lugares',
    title: 'Chinchetas en el corcho.',
    body: 'Cada viaje deja una chincheta y, casi siempre, una idea para un nivel.',
    home: 'Campo base',
    homeValue: 'Málaga, España',
  },
  contact: {
    tag: 'Saluda',
    title: '¿Tienes algo que merezca la pena construir?',
    body: 'Desde Málaga, con vistas al mar, trabajando con equipos de cualquier sitio. Escríbeme.',
    footer: 'Hecho con three.js, shaders escritos a mano y demasiado café',
  },
}

export const copy: Record<Lang, Copy> = { en, es }
