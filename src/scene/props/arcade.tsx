import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PointLight } from 'three'
import { palette } from '../../lib/time-of-day'
import { view } from '../../lib/view-state'
import { canvasTexture, FONT_MONO, FONT_SANS, Glow, Hotspot, Part, rbox } from '../paint'

export const ARCADE = { x: -3.95, z: -2.95, rot: Math.PI / 4 }

// classic 11×8 invader, 1 = pixel
const INVADER = [
  '00100000100',
  '00010001000',
  '00111111100',
  '01101110110',
  '11111111111',
  '10111111101',
  '10100000101',
  '00011011000',
]
const SHIP = ['0001000', '0011100', '1111111', '1111111']

function sprite(ctx: CanvasRenderingContext2D, rows: string[], x: number, y: number, color: string) {
  ctx.fillStyle = color
  rows.forEach((r, j) => {
    for (let i = 0; i < r.length; i++) if (r[i] === '1') ctx.fillRect(x + i, y + j, 1, 1)
  })
}

function useAttractScreen() {
  return useMemo(() => {
    const W = 224
    const H = 180
    const stars = Array.from({ length: 40 }, (_, i) => [(i * 73) % W, (i * 37) % H, 1 + (i % 3)])
    let t = 0
    const draw = (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = '#0b0820'
      ctx.fillRect(0, 0, W, H)
      stars.forEach(([x, y, s]) => {
        ctx.fillStyle = s === 3 ? '#ffffff' : '#6b63a8'
        ctx.fillRect(x, (y + t * 12 * s) % H, 1, 1)
      })
      const phase = t % 12
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      if (phase < 4.5) {
        // title card
        ctx.font = `700 40px ${FONT_SANS}`
        ctx.fillStyle = '#ff7849'
        ctx.fillText('LEO', W / 2 + 3, 72)
        ctx.fillStyle = '#ffd166'
        ctx.fillText('LEO', W / 2, 69)
        ctx.font = `700 13px ${FONT_MONO}`
        ctx.fillStyle = '#3ad0b5'
        ctx.fillText('UE5 × GODOT', W / 2, 96)
        if (Math.floor(t * 2) % 2 === 0) {
          ctx.fillStyle = '#ffffff'
          ctx.fillText('PRESS START', W / 2, 138)
        }
      } else {
        // demo play
        const g = phase - 4.5
        const sway = Math.sin(g * 1.2) * 18
        const colors = ['#ff6b9d', '#ffd166', '#3ad0b5']
        for (let r = 0; r < 3; r++)
          for (let c = 0; c < 6; c++) {
            if ((r * 6 + c) % 7 === Math.floor(g * 1.5) % 7 && g > 2) continue // "shot down"
            sprite(ctx, INVADER, 46 + c * 22 + sway, 26 + r * 16 + Math.floor(g), colors[r])
          }
        const sx = W / 2 + Math.sin(g * 2.1) * 50
        sprite(ctx, SHIP, Math.round(sx) - 3, H - 16, '#ffffff')
        ctx.fillStyle = '#ff7849'
        const by = H - 20 - ((g * 160) % 120)
        ctx.fillRect(Math.round(sx), by, 1, 4)
        ctx.font = `700 11px ${FONT_MONO}`
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'left'
        ctx.fillText(`1UP ${String(Math.floor(g * 130)).padStart(5, '0')}`, 6, 14)
        ctx.textAlign = 'right'
        ctx.fillText('HI 99999', W - 6, 14)
      }
      // scanlines
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      for (let y = 0; y < H; y += 2) ctx.fillRect(0, y, W, 1)
    }
    const { tex, ctx } = canvasTexture(W, H, draw, { pixelated: true })
    let acc = 0
    const update = (dt: number) => {
      t += dt
      acc += dt
      if (acc < 1 / 15) return
      acc = 0
      draw(ctx)
      tex.needsUpdate = true
    }
    return { tex, update }
  }, [])
}

function useMarquee() {
  return useMemo(
    () =>
      canvasTexture(256, 64, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, w, 0)
        g.addColorStop(0, '#ff7849')
        g.addColorStop(0.5, '#ff4f8b')
        g.addColorStop(1, '#7b5cff')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
        ctx.font = `700 36px ${FONT_SANS}`
        ctx.textAlign = 'center'
        ctx.fillStyle = '#1d1a2b'
        ctx.fillText('LEO·CADE', w / 2 + 2, 46)
        ctx.fillStyle = '#fff6e9'
        ctx.fillText('LEO·CADE', w / 2, 44)
      }).tex,
    [],
  )
}

export default function Arcade() {
  const screen = useAttractScreen()
  const marquee = useMarquee()
  const glow = useRef<PointLight>(null!)

  useFrame((_, dt) => {
    if (!view.reduced) screen.update(dt)
    glow.current.intensity = 0.4 + palette.lamp * 3.2
  })

  const BODY = '#5b3f9e'
  return (
    <Hotspot id="worlds">
      <group position={[ARCADE.x, 0, ARCADE.z]} rotation-y={ARCADE.rot}>
        {/* lower cabinet */}
        <Part color={BODY} position={[0, 0.55, 0]} geometry={rbox(1.0, 1.1, 0.86, 0.04)} />
        {/* control panel */}
        <Part color="#2d2640" position={[0, 1.17, 0.3]} rotation-x={-0.28} geometry={rbox(1.06, 0.12, 0.46, 0.03)} />
        <Part color="#2d2640" position={[-0.22, 1.27, 0.36]}>
          <cylinderGeometry args={[0.018, 0.018, 0.16, 8]} />
        </Part>
        <Part color="#ff4f5e" position={[-0.22, 1.36, 0.36]}>
          <sphereGeometry args={[0.055, 14, 10]} />
        </Part>
        {['#3ad0b5', '#ffd166', '#ff4f8b'].map((c, i) => (
          <Part key={c} color={c} position={[0.05 + i * 0.13, 1.24 + i * 0.008, 0.33 - i * 0.03]} rotation-x={-0.28}>
            <cylinderGeometry args={[0.045, 0.045, 0.04, 14]} />
          </Part>
        ))}
        {/* upper cabinet + screen */}
        <Part color={BODY} position={[0, 1.83, -0.08]} geometry={rbox(1.0, 1.25, 0.7, 0.04)} />
        <Part color="#151226" position={[0, 1.83, 0.27]} rotation-x={-0.1} geometry={rbox(0.86, 0.74, 0.03, 0.02)} />
        <Glow map={screen.tex} position={[0, 1.83, 0.29]} rotation-x={-0.1}>
          <planeGeometry args={[0.78, 0.64]} />
        </Glow>
        {/* marquee */}
        <Part color={BODY} position={[0, 2.62, -0.02]} geometry={rbox(1.06, 0.36, 0.78, 0.04)} />
        <Glow map={marquee} position={[0, 2.62, 0.375]}>
          <planeGeometry args={[0.96, 0.27]} />
        </Glow>
        {/* coin door */}
        <Part color="#2d2640" position={[0, 0.55, 0.435]} geometry={rbox(0.36, 0.42, 0.03, 0.015)} />
        {[-0.08, 0.08].map((x) => (
          <Glow key={x} color="#ff4f5e" position={[x, 0.62, 0.452]}>
            <planeGeometry args={[0.05, 0.09]} />
          </Glow>
        ))}
        <pointLight ref={glow} position={[0, 1.8, 0.9]} color="#8f6bff" distance={4.5} decay={1.6} />
      </group>
    </Hotspot>
  )
}
