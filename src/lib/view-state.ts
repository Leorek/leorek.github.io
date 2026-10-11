import type Lenis from 'lenis'
import { STATIONS, stationIndex } from './stations'

// Mutable, render-free shared state. The 3D scene samples this in useFrame;
// DOM listeners write to it. Keeping it out of React avoids per-frame renders.
export const view = {
  pointer: { x: 0, y: 0 }, // normalized -1..1
  /** continuous station index: 2.5 = halfway between station 2 and 3 */
  progress: 0,
  station: 0,
  reduced:
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  /** performance.now() of the last "launch the coaster" press */
  coasterLaunch: -1e9,
}

export function launchCoaster() {
  view.coasterLaunch = performance.now()
}

const stationListeners = new Set<() => void>()
export function subscribeStation(cb: () => void) {
  stationListeners.add(cb)
  return () => stationListeners.delete(cb)
}

let tops: number[] = []

function measure() {
  tops = STATIONS.map((s) => {
    const el = document.getElementById(s.id)
    return el ? el.getBoundingClientRect().top + window.scrollY : 0
  })
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function update() {
  const y = window.scrollY
  let i = 0
  while (i < tops.length - 2 && y >= tops[i + 1]) i++
  const span = tops[i + 1] - tops[i] || 1
  const f = Math.min(1, Math.max(0, (y - tops[i]) / span))
  // hold on each station while its panel is centred, travel in between
  view.progress = Math.min(STATIONS.length - 1, i + smoothstep(0.12, 0.88, f))

  const station = Math.round(view.progress)
  if (station !== view.station) {
    view.station = station
    stationListeners.forEach((l) => l())
  }
}

let bound = false
export function bindViewListeners() {
  if (bound) return
  bound = true

  window.addEventListener(
    'pointermove',
    (e) => {
      view.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      view.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    },
    { passive: true },
  )
  window.addEventListener('scroll', update, { passive: true })

  const remeasure = () => {
    measure()
    update()
  }
  new ResizeObserver(remeasure).observe(document.body)
  window.addEventListener('resize', remeasure)
  document.fonts?.ready.then(remeasure)
  remeasure()
}

export function getLenis() {
  return (window as unknown as { __lenis?: Lenis }).__lenis
}

/** Scroll to a station's section (used by the nav and by clicks on 3D objects). */
export function goto(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = getLenis()
  if (lenis) {
    const distance = Math.abs(stationIndex(id) - view.station)
    lenis.scrollTo(el, { duration: Math.min(2.6, 0.9 + distance * 0.32) })
  } else {
    el.scrollIntoView({ behavior: view.reduced ? 'auto' : 'smooth' })
  }
}
