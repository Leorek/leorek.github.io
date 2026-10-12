import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ThreeElements, ThreeEvent } from '@react-three/fiber'
import {
  BoxGeometry,
  CanvasTexture,
  NearestFilter,
  SRGBColorSpace,
  type BufferGeometry,
  type ColorRepresentation,
  type Texture,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { goto } from '../lib/view-state'

// Painterly building blocks (RiME-ish): soft matte surfaces, no outlines.
// The look comes from the lighting — warm sun, lavender sky fill so shadows
// are coloured rather than grey — plus AO, bloom and haze in post.

export const INK = '#2a2440' // dark accent for canvas drawings
export const EMBER = '#ff7849'

// ---- geometry cache --------------------------------------------------------
const geoCache = new Map<string, BufferGeometry>()
/** Rounded box, cached by size. r = corner radius. */
export function rbox(w: number, h: number, d: number, r = 0.04, seg = 3) {
  const key = `rb:${w}:${h}:${d}:${r}:${seg}`
  let g = geoCache.get(key)
  if (!g) {
    g = r > 0 ? new RoundedBoxGeometry(w, h, d, seg, r) : new BoxGeometry(w, h, d)
    geoCache.set(key, g)
  }
  return g
}

// Hovering a hotspot makes everything inside it glow warmly (bloom picks it up).
const Hovered = createContext(false)

type PartProps = Omit<ThreeElements['mesh'], 'children'> & {
  color: ColorRepresentation
  map?: Texture | null
  emissive?: ColorRepresentation
  emissiveIntensity?: number
  roughness?: number
  shadows?: boolean
  children?: ReactNode
}

/** A soft, matte, painterly mesh — the building block of the studio. */
export function Part({
  color,
  map = null,
  emissive = '#000000',
  emissiveIntensity = 1,
  roughness = 0.9,
  shadows = true,
  children,
  ...props
}: PartProps) {
  const hover = useContext(Hovered)
  return (
    <mesh castShadow={shadows} receiveShadow={shadows} {...props}>
      {children}
      <meshStandardMaterial
        color={color}
        map={map}
        roughness={roughness}
        metalness={0}
        emissive={hover ? EMBER : emissive}
        emissiveIntensity={hover ? 0.32 : emissiveIntensity}
      />
    </mesh>
  )
}

/** Unlit mesh for screens / signs — self-lit, picked up by bloom. */
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
      <meshBasicMaterial map={map ?? null} color={color} />
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
      <Hovered.Provider value={hover}>{children}</Hovered.Provider>
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

export const FONT_DISPLAY = '"Fraunces", Georgia, serif'
export const FONT_SANS = '"Inter", system-ui, sans-serif'
export const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace'
