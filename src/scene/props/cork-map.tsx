import { useMemo } from 'react'
import { QuadraticBezierLine } from '@react-three/drei'
import { Vector3 } from 'three'
import { places } from '../../data/site'
import { isLand, WORLD } from '../../data/world-dots'
import { canvasTexture, FONT_DISPLAY, Hotspot, INK, Part, rbox } from '../paint'

// Travel board on the left wall: a dotted world map on paper, pinned to cork,
// with red yarn running from Málaga to every other pin.

export const BOARD = { x: -4.66, y: 2.85, z: 0.35, w: 2.7, h: 1.62 }
const PAPER = { w: 2.42, h: 1.24 }
// map area inside the paper (equirectangular, so aspect = 360 / lat span)
const MAP_W = 2.3
const MAP_H = MAP_W * ((WORLD.latTop - WORLD.latBottom) / 360)

/** lat/lon → board-local [z, y]. The board faces +x, so east is -z. */
function project(lat: number, lon: number): [number, number] {
  const u = (lon + 180) / 360
  const v = (WORLD.latTop - lat) / (WORLD.latTop - WORLD.latBottom)
  return [-(u - 0.5) * MAP_W, (0.5 - v) * MAP_H - 0.04]
}

function usePaper() {
  return useMemo(
    () =>
      canvasTexture(1024, 525, (ctx, w, h) => {
        ctx.fillStyle = '#fbf3e3'
        ctx.fillRect(0, 0, w, h)
        const mw = (MAP_W / PAPER.w) * w
        const mh = (MAP_H / PAPER.h) * h
        const ox = (w - mw) / 2
        const oy = (h - mh) / 2 + (0.04 / PAPER.h) * h
        const cw = mw / WORLD.cols
        const ch = mh / WORLD.rows
        for (let r = 0; r < WORLD.rows; r++)
          for (let c = 0; c < WORLD.cols; c++) {
            if (!isLand(c, r)) continue
            ctx.fillStyle = (r * 7 + c * 3) % 11 === 0 ? '#ff9a6b' : '#2f8f84'
            ctx.beginPath()
            ctx.arc(ox + (c + 0.5) * cw, oy + (r + 0.5) * ch, Math.min(cw, ch) * 0.36, 0, Math.PI * 2)
            ctx.fill()
          }
        ctx.fillStyle = INK
        ctx.font = `800 30px ${FONT_DISPLAY}`
        ctx.fillText('PLACES', 26, 42)
        ctx.font = `500 18px ${FONT_DISPLAY}`
        ctx.fillStyle = '#6b6580'
        ctx.fillText('from Málaga, with love', 140, 42)
      }).tex,
    [],
  )
}

function Pin({ at, color }: { at: [number, number]; color: string }) {
  return (
    <group position={[0.02, at[1], at[0]]}>
      <Part color="#c9ccd6" position={[0.03, 0, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.006, 0.006, 0.06, 6]} />
      </Part>
      <Part color={color} position={[0.075, 0, 0]}>
        <sphereGeometry args={[0.035, 12, 10]} />
      </Part>
    </group>
  )
}

export default function CorkMap() {
  const paper = usePaper()
  const pins = useMemo(() => places.map((p) => ({ ...p, at: project(p.lat, p.lon) })), [])
  const home = pins.find((p) => p.home)!
  return (
    <Hotspot id="travel">
      {/* board faces +x (into the room) */}
      <group position={[BOARD.x, BOARD.y, BOARD.z]}>
        <Part color="#8a5536" geometry={rbox(0.08, BOARD.h + 0.1, BOARD.w + 0.1, 0.02)} />
        <Part color="#c8955a" position={[0.03, 0, 0]}>
          <boxGeometry args={[0.04, BOARD.h - 0.04, BOARD.w - 0.04]} />
        </Part>
        <mesh position={[0.052, 0, 0]} rotation-y={Math.PI / 2} rotation-z={0.006}>
          <planeGeometry args={[PAPER.w, PAPER.h]} />
          <meshStandardMaterial roughness={0.9} map={paper} />
        </mesh>
        {/* yarn from home to every pin */}
        {pins
          .filter((p) => !p.home)
          .map((p) => {
            const a = new Vector3(0.1, home.at[1], home.at[0])
            const b = new Vector3(0.1, p.at[1], p.at[0])
            const mid = a.clone().lerp(b, 0.5)
            mid.x += 0.12
            mid.y += 0.06
            return (
              <QuadraticBezierLine key={p.name} start={a} end={b} mid={mid} color="#d62839" lineWidth={1.6} />
            )
          })}
        {pins.map((p) => (
          <Pin key={p.name} at={p.at} color={p.home ? '#ff7849' : '#d62839'} />
        ))}
        {/* polaroids + sticky notes */}
        <group position={[0.06, -0.45, 1.02]} rotation-x={0.12}>
          <Part color="#ffffff" geometry={rbox(0.01, 0.3, 0.26, 0.005)} />
          <Part color="#5ab0e6" position={[0.007, 0.03, 0]}>
            <boxGeometry args={[0.005, 0.2, 0.21]} />
          </Part>
        </group>
        <group position={[0.06, 0.5, -1.08]} rotation-x={-0.1}>
          <Part color="#ffd166" geometry={rbox(0.01, 0.22, 0.22, 0.005)} />
        </group>
      </group>
    </Hotspot>
  )
}
