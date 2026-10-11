import { createContext, useContext, useState, type ReactNode } from 'react'
import { useThree, type ThreeElements, type ThreeEvent } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import {
  BoxGeometry,
  CanvasTexture,
  DataTexture,
  NearestFilter,
  RedFormat,
  SRGBColorSpace,
  type BufferGeometry,
  type ColorRepresentation,
  type Texture,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { goto } from '../lib/view-state'

export const INK = '#1d1a2b'
export const EMBER = '#ff7849'

// 3-band cel shading: shadow / mid / lit, hard steps (nearest filtering).
export const GRADIENT = (() => {
  const t = new DataTexture(new Uint8Array([90, 175, 255]), 3, 1, RedFormat)
  t.minFilter = NearestFilter
  t.magFilter = NearestFilter
  t.generateMipmaps = false
  t.needsUpdate = true
  return t
})()

// ---- geometry cache --------------------------------------------------------
const geoCache = new Map<string, BufferGeometry>()
/** Rounded box, cached by size. r = corner radius. */
export function rbox(w: number, h: number, d: number, r = 0.04, seg = 2) {
  const key = `rb:${w}:${h}:${d}:${r}:${seg}`
  let g = geoCache.get(key)
  if (!g) {
    g = r > 0 ? new RoundedBoxGeometry(w, h, d, seg, r) : new BoxGeometry(w, h, d)
    geoCache.set(key, g)
  }
  return g
}

// ---- outlines --------------------------------------------------------------
// Hovering a hotspot turns every outline inside it ember.
const OutlineColor = createContext<string>(INK)

/** Outline width in device pixels, roughly constant on screen. */
function useOutlineWidth() {
  const dpr = useThree((s) => s.viewport.dpr)
  return 2.3 * dpr
}

type PartProps = Omit<ThreeElements['mesh'], 'children'> & {
  color: ColorRepresentation
  /** false = no outline; number = width multiplier */
  outline?: boolean | number
  map?: Texture | null
  emissive?: ColorRepresentation
  emissiveIntensity?: number
  shadows?: boolean
  children?: ReactNode
}

/** A cel-shaded, ink-outlined mesh — the building block of the studio. */
export function Part({
  color,
  outline = true,
  map = null,
  emissive = '#000000',
  emissiveIntensity = 1,
  shadows = true,
  children,
  ...props
}: PartProps) {
  const ink = useContext(OutlineColor)
  const width = useOutlineWidth()
  return (
    <mesh castShadow={shadows} receiveShadow={shadows} {...props}>
      {children}
      <meshToonMaterial
        color={color}
        gradientMap={GRADIENT}
        map={map}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
      {outline !== false && (
        <Outlines thickness={width * (typeof outline === 'number' ? outline : 1)} color={ink} />
      )}
    </mesh>
  )
}

/** Unlit mesh for screens / signs — always full brightness, no outline. */
export function Glow({
  map,
  color = '#ffffff',
  children,
  ...props
}: Omit<ThreeElements['mesh'], 'children'> & {
  map?: Texture | null
  color?: ColorRepresentation
  children?: ReactNode
}) {
  return (
    <mesh {...props}>
      {children}
      <meshBasicMaterial map={map ?? null} color={color} toneMapped={false} />
    </mesh>
  )
}

// ---- hotspots --------------------------------------------------------------
// The canvas listens to document.body (so it reacts even behind the HTML).
// Pointer events that land on real UI (panels, nav) must not reach the scene.
const onUi = (e: ThreeEvent<PointerEvent | MouseEvent>) =>
  !!(e.nativeEvent.target as Element | null)?.closest?.('[data-ui]')

export function Hotspot({
  id,
  onActivate,
  children,
}: {
  id: string
  onActivate?: () => void
  children: ReactNode
}) {
  const [hover, setHover] = useState(false)
  const set = (v: boolean) => {
    setHover(v)
    document.body.style.cursor = v ? 'pointer' : ''
  }
  return (
    <group
      name={`hotspot:${id}`}
      onPointerOver={(e) => {
        e.stopPropagation()
        if (!onUi(e)) set(true)
      }}
      onPointerMove={(e) => {
        e.stopPropagation()
        const ui = onUi(e)
        if (ui === hover) set(!ui)
      }}
      onPointerOut={() => set(false)}
      onClick={(e) => {
        if (onUi(e)) return
        e.stopPropagation()
        if (onActivate) onActivate()
        else goto(id)
      }}
    >
      <OutlineColor.Provider value={hover ? EMBER : INK}>{children}</OutlineColor.Provider>
    </group>
  )
}

// ---- canvas textures -------------------------------------------------------
export function canvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  { pixelated = false } = {},
) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  draw(ctx, w, h)
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  if (pixelated) {
    tex.magFilter = NearestFilter
    tex.minFilter = NearestFilter
    tex.generateMipmaps = false
  } else {
    tex.anisotropy = 4
  }
  // redraw once web fonts are in, so canvas text uses them
  document.fonts?.ready.then(() => {
    draw(ctx, w, h)
    tex.needsUpdate = true
  })
  return { tex, ctx, canvas: c }
}

export const FONT_DISPLAY = '"Bricolage Grotesque", system-ui, sans-serif'
export const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace'
