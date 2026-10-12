// The studio's clock. Everything visual that depends on the time of day —
// sky, sea, sun/moon, lights, lamp, UI theme — derives from one number:
// `world.hour` (0..24, fractional). By default it follows real Málaga time;
// the lamp / sun-moon toggle fast-forwards it to day or night.
//
// Deliberately free of three.js so the DOM (theme, body gradient) can use it
// before the 3D chunk has loaded. Colors are sRGB triples in 0..1.

export type RGB = [number, number, number]

type Keyframe = {
  skyTop: RGB
  skyHorizon: RGB
  skyGround: RGB
  key: RGB // sun or moon light
  keyIntensity: number
  hemiSky: RGB
  hemiGround: RGB
  hemiIntensity: number
  fill: number // front fill light so the toon "lit band" reads from the camera
  lamp: number // 0..1 desk lamp + screen glow lights
  stars: number
  sea: RGB
  seaDeep: RGB
  clouds: RGB
}

const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

// Painterly, RiME-like palettes: warm light, pastel skies, and a lavender
// sky fill (hemiSky) so anything out of the sun reads coloured, not grey.
const NIGHT: Keyframe = {
  skyTop: hex('#0e1638'),
  skyHorizon: hex('#3b4a86'),
  skyGround: hex('#1a2348'),
  key: hex('#aebcff'),
  keyIntensity: 0.9,
  hemiSky: hex('#5562b8'),
  hemiGround: hex('#3a2f52'),
  hemiIntensity: 0.9,
  fill: 0.25,
  lamp: 1,
  stars: 1,
  sea: hex('#2c5590'),
  seaDeep: hex('#101e48'),
  clouds: hex('#4a5790'),
}
const DAWN: Keyframe = {
  skyTop: hex('#7e95dc'),
  skyHorizon: hex('#ffcdb5'),
  skyGround: hex('#8f86a8'),
  key: hex('#ffc8a2'),
  keyIntensity: 2.4,
  hemiSky: hex('#b7a8e8'),
  hemiGround: hex('#e6b49a'),
  hemiIntensity: 1.1,
  fill: 0.35,
  lamp: 0.2,
  stars: 0.1,
  sea: hex('#7fb6d6'),
  seaDeep: hex('#3a63a0'),
  clouds: hex('#ffe0d2'),
}
const DAY: Keyframe = {
  skyTop: hex('#3b8fe8'),
  skyHorizon: hex('#cfe7f6'),
  skyGround: hex('#b9cfe0'),
  key: hex('#fff1d8'),
  keyIntensity: 3.4,
  hemiSky: hex('#9fb3ff'),
  hemiGround: hex('#f2cfa5'),
  hemiIntensity: 1.25,
  fill: 0.35,
  lamp: 0,
  stars: 0,
  sea: hex('#46cfc4'),
  seaDeep: hex('#1b7fb4'),
  clouds: hex('#ffffff'),
}
const SUNSET: Keyframe = {
  skyTop: hex('#5a56b2'),
  skyHorizon: hex('#ffb06a'),
  skyGround: hex('#a8708a'),
  key: hex('#ffaa63'),
  keyIntensity: 3.0,
  hemiSky: hex('#b490e6'),
  hemiGround: hex('#f0a07c'),
  hemiIntensity: 1.05,
  fill: 0.3,
  lamp: 0.6,
  stars: 0.04,
  sea: hex('#e6a18a'),
  seaDeep: hex('#4a4c9c'),
  clouds: hex('#ffc9a6'),
}
const DUSK: Keyframe = {
  skyTop: hex('#262a6a'),
  skyHorizon: hex('#c97f9f'),
  skyGround: hex('#3d3260'),
  key: hex('#c4a6ff'),
  keyIntensity: 1.3,
  hemiSky: hex('#7a6cc6'),
  hemiGround: hex('#5a3f66'),
  hemiIntensity: 0.95,
  fill: 0.28,
  lamp: 1,
  stars: 0.5,
  sea: hex('#6a5aa6'),
  seaDeep: hex('#1c1f55'),
  clouds: hex('#8f6fa6'),
}

const KEYS: [number, Keyframe][] = [
  [0, NIGHT],
  [5.5, NIGHT],
  [7, DAWN],
  [9, DAY],
  [17.5, DAY],
  [19.6, SUNSET],
  [21, DUSK],
  [22.5, NIGHT],
  [24, NIGHT],
]

export type Palette = Keyframe & {
  bodyDir: [number, number, number] // unit vector toward sun or moon
  isSun: boolean
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerpRGB = (out: RGB, a: RGB, b: RGB, t: number) => {
  out[0] = lerp(a[0], b[0], t)
  out[1] = lerp(a[1], b[1], t)
  out[2] = lerp(a[2], b[2], t)
}

export const palette: Palette = {
  ...structuredClone(DAY),
  bodyDir: [0, 0.7, -0.7],
  isSun: true,
}

const SUNRISE = 7
const SUNSET_H = 20.5

function sample(hour: number) {
  let i = 0
  while (i < KEYS.length - 2 && hour >= KEYS[i + 1][0]) i++
  const [h0, a] = KEYS[i]
  const [h1, b] = KEYS[i + 1]
  const raw = (hour - h0) / (h1 - h0)
  const t = raw * raw * (3 - 2 * raw)
  for (const k of Object.keys(a) as (keyof Keyframe)[]) {
    const va = a[k]
    const vb = b[k]
    if (typeof va === 'number') (palette[k] as number) = lerp(va, vb as number, t)
    else lerpRGB(palette[k] as RGB, va, vb as RGB, t)
  }

  // Málaga's seafront faces south: the sun/moon arcs left (east) → right (west)
  // over the sea, behind the studio's back wall (-z).
  const isSun = hour >= SUNRISE && hour < SUNSET_H
  const span = isSun ? SUNSET_H - SUNRISE : 24 - (SUNSET_H - SUNRISE)
  const since = isSun ? hour - SUNRISE : (hour - SUNSET_H + 24) % 24
  const p = since / span
  // (art-directed: sunset lands next to the lighthouse, the late-evening
  //  moon sits in the middle of the window)
  const az = isSun ? lerp(-0.7, 0.45, p) : lerp(-0.3, 0.9, p)
  const el = Math.sin(Math.PI * p) * (isSun ? 0.95 : 0.45) + 0.08
  palette.bodyDir[0] = Math.sin(az) * Math.cos(el)
  palette.bodyDir[1] = Math.sin(el)
  palette.bodyDir[2] = -Math.cos(az) * Math.cos(el)
  palette.isSun = isSun
}

// ---- clock ---------------------------------------------------------------

export function malagaHour(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date)
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 12)
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return h + m / 60
}

type Mode = 'auto' | 'day' | 'night'

export const world = {
  hour: 12,
  mode: 'auto' as Mode,
  target: null as number | null,
  isDark: false,
}

const reduced =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ?t=19.5 pins the clock (handy for screenshots and sharing a sunset)
const pinned = (() => {
  const v = new URLSearchParams(location.search).get('t')
  const n = v === null ? NaN : Number(v)
  return Number.isFinite(n) ? ((n % 24) + 24) % 24 : null
})()

const listeners = new Set<() => void>()
export function subscribeTime(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** Fast-forward to day or night. Time always runs forward, so going to
 *  night passes through sunset and going to day passes through dawn. */
export function toggleDayNight() {
  world.mode = world.isDark ? 'day' : 'night'
  const target = world.mode === 'day' ? 12.5 : 23
  if (reduced) {
    world.hour = target
    world.target = null
  } else {
    world.target = target
  }
  listeners.forEach((l) => l())
}

let started = false
let autoBase = 12
let autoSince = 0
let lastCss = -1

export function startClock() {
  if (started) return
  started = true
  autoBase = pinned ?? malagaHour()
  autoSince = performance.now()
  world.hour = autoBase

  let prev = performance.now()
  const tick = (now: number) => {
    // real elapsed time (not frame-capped) so the ~2.5 s transition holds at low fps
    const dt = Math.min(0.5, (now - prev) / 1000)
    prev = now

    if (world.target !== null) {
      // ~2.5 s for any jump, whatever the distance
      const delta = (world.target - world.hour + 24) % 24
      const step = Math.max(dt * 5, delta * dt * 1.6)
      if (delta <= step) {
        world.hour = world.target
        world.target = null
      } else {
        world.hour = (world.hour + step) % 24
      }
    } else if (world.mode === 'auto' && pinned === null) {
      world.hour = (autoBase + (now - autoSince) / 3_600_000) % 24
    }

    sample(world.hour)
    syncDom(now)
    requestAnimationFrame(tick)
  }
  sample(world.hour)
  syncDom(0, true)
  requestAnimationFrame(tick)
}

function css(c: RGB) {
  return `rgb(${Math.round(c[0] * 255)} ${Math.round(c[1] * 255)} ${Math.round(c[2] * 255)})`
}

function syncDom(now: number, force = false) {
  const dark = palette.lamp > 0.5
  if (dark !== world.isDark || force) {
    world.isDark = dark
    document.documentElement.dataset.tod = dark ? 'night' : 'day'
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', dark ? '#0e1638' : '#f4e6c8')
    listeners.forEach((l) => l())
  }
  // body gradient = fallback / pre-load sky; no need to update every frame
  if (force || now - lastCss > 200) {
    lastCss = now
    const root = document.documentElement.style
    root.setProperty('--sky-top', css(palette.skyTop))
    root.setProperty('--sky-horizon', css(palette.skyHorizon))
    root.setProperty('--sky-ground', css(palette.skyGround))
  }
}

export function formatHour(h: number) {
  const hh = Math.floor(h) % 24
  const mm = Math.floor((h % 1) * 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}
