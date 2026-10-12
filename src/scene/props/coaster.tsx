import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  CatmullRomCurve3,
  DoubleSide,
  Group,
  InstancedMesh,
  MathUtils,
  Matrix4,
  Object3D,
  Quaternion,
  TubeGeometry,
  Vector3,
} from 'three'
import { goto, launchCoaster, view } from '../../lib/view-state'
import { canvasTexture, FONT_DISPLAY, Hotspot, INK, Part, rbox } from '../paint'

// A tabletop coaster model. The train runs on a simple energy model: chain
// lift at constant speed, then speed = f(height below the crest), brakes in
// the station. "Launch" (from the HTML panel) boosts it for a few seconds.

export const COASTER = { x: 3.3, z: 1.6, top: 0.85 }
/** world position of the lead car — Leo watches it */
export const coasterLead = new Vector3()

const POINTS: [number, number, number][] = [
  [-0.7, 0.22, 0.68], // station
  [0.1, 0.22, 0.68],
  [0.7, 0.28, 0.62],
  [0.98, 0.42, 0.25], // lift starts
  [0.98, 0.85, -0.2],
  [0.88, 1.25, -0.55], // lift top
  [0.52, 1.32, -0.7], // crest
  [0.1, 0.55, -0.72], // drop
  [-0.22, 0.2, -0.68],
  [-0.6, 0.78, -0.6], // camelback
  [-0.95, 0.35, -0.35],
  [-1.03, 0.3, 0.15],
  [-0.95, 0.24, 0.5],
]
const LIFT = [3, 5] // control-point range of the chain lift
const STATION = [0, 1]
const SAMPLES = 400
const GAUGE = 0.085
const CAR_GAP = 0.17 // arc length between cars

type Frame = { p: Vector3; t: Vector3; r: Vector3; n: Vector3 }

function buildTrack() {
  const curve = new CatmullRomCurve3(
    POINTS.map((p) => new Vector3(...p)),
    true,
    'centripetal',
  )
  const length = curve.getLength()
  const up = new Vector3(0, 1, 0)
  const frames: Frame[] = []
  for (let i = 0; i < SAMPLES; i++) {
    const s = i / SAMPLES
    const p = curve.getPointAt(s)
    const t = curve.getTangentAt(s)
    // bank into turns: heading change around this point
    const ta = curve.getTangentAt((s - 0.01 + 1) % 1)
    const tb = curve.getTangentAt((s + 0.01) % 1)
    const turn = Math.atan2(tb.x, tb.z) - Math.atan2(ta.x, ta.z)
    const wrapped = Math.atan2(Math.sin(turn), Math.cos(turn))
    const bank = MathUtils.clamp(-wrapped * 3, -0.6, 0.6)
    const r = new Vector3().crossVectors(t, up).normalize()
    const n = new Vector3().crossVectors(r, t).normalize()
    const q = new Quaternion().setFromAxisAngle(t, bank)
    r.applyQuaternion(q)
    n.applyQuaternion(q)
    frames.push({ p, t, r, n })
  }
  // arc positions of the lift / station control points
  const nearest = (idx: number) => {
    const target = new Vector3(...POINTS[idx])
    let best = 0
    frames.forEach((f, i) => {
      if (f.p.distanceToSquared(target) < frames[best].p.distanceToSquared(target)) best = i
    })
    return best / SAMPLES
  }
  const lift = [nearest(LIFT[0]), nearest(LIFT[1])]
  const station = [nearest(STATION[0]), nearest(STATION[1])]
  const crest = Math.max(...frames.map((f) => f.p.y))
  return { curve, length, frames, lift, station, crest }
}

type Track = ReturnType<typeof buildTrack>

function railTube(track: Track, offset: (f: Frame) => Vector3, radius: number) {
  const pts = track.frames.filter((_, i) => i % 2 === 0).map(offset)
  return new TubeGeometry(new CatmullRomCurve3(pts, true), SAMPLES, radius, 6, true)
}

const between = (s: number, [a, b]: number[]) => (a <= b ? s >= a && s <= b : s >= a || s <= b)

function frameAt(track: Track, s: number) {
  const i = Math.floor((((s % 1) + 1) % 1) * SAMPLES) % SAMPLES
  return track.frames[i]
}

function Ties({ track }: { track: Track }) {
  const ref = useRef<InstancedMesh>(null!)
  const every = 6
  const count = Math.floor(SAMPLES / every)
  useLayoutEffect(() => {
    const m = new Matrix4()
    for (let k = 0; k < count; k++) {
      const f = track.frames[k * every]
      m.makeBasis(f.r, f.n, f.t).setPosition(f.p.clone().addScaledVector(f.n, -0.012))
      ref.current.setMatrixAt(k, m)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [track, count])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow>
      <boxGeometry args={[GAUGE + 0.04, 0.014, 0.022]} />
      <meshStandardMaterial color="#3b3550" roughness={0.9} />
    </instancedMesh>
  )
}

function Supports({ track }: { track: Track }) {
  const ref = useRef<InstancedMesh>(null!)
  const picks = useMemo(
    () => track.frames.filter((f, i) => i % 16 === 8 && f.p.y > 0.16),
    [track],
  )
  useLayoutEffect(() => {
    const o = new Object3D()
    picks.forEach((f, k) => {
      const h = f.p.y - 0.05
      o.position.set(f.p.x, h / 2, f.p.z)
      o.scale.set(1, h, 1)
      o.updateMatrix()
      ref.current.setMatrixAt(k, o.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [picks])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, picks.length]} castShadow>
      <cylinderGeometry args={[0.014, 0.018, 1, 6]} />
      <meshStandardMaterial color="#f4efe6" roughness={0.9} />
    </instancedMesh>
  )
}

function Car({ color, rider }: { color: string; rider: string }) {
  return (
    <group>
      <Part color={color} position={[0, 0.035, 0]} geometry={rbox(0.11, 0.06, 0.14, 0.02)} />
      <Part color={rider} position={[0, 0.1, -0.01]}>
        <sphereGeometry args={[0.03, 10, 8]} />
      </Part>
      <group name="arms" position={[0, 0.07, -0.01]}>
        {[-1, 1].map((s) => (
          <Part key={s} color={rider} position={[s * 0.035, 0.03, 0]} rotation-z={s * 0.3}>
            <capsuleGeometry args={[0.008, 0.05, 2, 6]} />
          </Part>
        ))}
      </group>
    </group>
  )
}

function useSign() {
  return useMemo(
    () =>
      canvasTexture(256, 64, (ctx, w, h) => {
        ctx.fillStyle = '#fff6e9'
        ctx.fillRect(0, 0, w, h)
        ctx.font = `800 40px ${FONT_DISPLAY}`
        ctx.textAlign = 'center'
        ctx.fillStyle = '#ff7849'
        ctx.fillText('LEOLAND', w / 2 + 2, 48)
        ctx.fillStyle = INK
        ctx.fillText('LEOLAND', w / 2, 46)
      }).tex,
    [],
  )
}

export default function Coaster() {
  const track = useMemo(buildTrack, [])
  const rails = useMemo(
    () => ({
      left: railTube(track, (f) => f.p.clone().addScaledVector(f.r, -GAUGE / 2), 0.011),
      right: railTube(track, (f) => f.p.clone().addScaledVector(f.r, GAUGE / 2), 0.011),
      spine: railTube(track, (f) => f.p.clone().addScaledVector(f.n, -0.045), 0.02),
    }),
    [track],
  )
  const sign = useSign()
  const train = useRef<Group>(null!)
  const state = useRef({ s: 0.05, v: 0.4 })
  const m = useMemo(() => new Matrix4(), [])

  useFrame((_, dt) => {
    const st = state.current
    const boosted = performance.now() - view.coasterLaunch < 4500
    const lead = frameAt(track, st.s)
    let target: number
    if (between(st.s, track.lift)) target = boosted ? 1.1 : 0.38
    else {
      target = Math.sqrt(0.38 ** 2 + 2 * 2.6 * Math.max(0, track.crest - lead.p.y))
      if (boosted) target *= 1.7
      if (between(st.s, track.station) && !boosted) target = Math.min(target, 0.45)
    }
    st.v = MathUtils.damp(st.v, target, 6, dt)
    if (!view.reduced) st.s = (st.s + (st.v * Math.min(dt, 0.05)) / track.length) % 1

    train.current.children.forEach((car, i) => {
      const f = frameAt(track, st.s - (i * CAR_GAP) / track.length)
      m.makeBasis(f.r, f.n, f.t).setPosition(f.p)
      car.matrix.copy(m)
      // hands up on the fast bits
      const arms = car.getObjectByName('arms')
      if (arms) arms.rotation.x = MathUtils.damp(arms.rotation.x, st.v > 1.4 ? -0.2 : 1.3, 5, dt)
    })
    coasterLead.set(lead.p.x + COASTER.x, lead.p.y + COASTER.top, lead.p.z + COASTER.z)
  })

  const colors = ['#ff7849', '#2a9d8f', '#ffd166']
  const riders = ['#f2c9a8', '#8a5a3c', '#f5d7b5']
  return (
    <Hotspot id="parks" onActivate={() => (view.station === 4 ? launchCoaster() : goto('parks'))}>
      <group position={[COASTER.x, 0, COASTER.z]}>
        {/* table */}
        <Part color="#8a5536" position={[0, COASTER.top - 0.04, 0]} geometry={rbox(2.7, 0.08, 2.1, 0.03)} />
        <Part color="#6cc070" position={[0, COASTER.top + 0.005, 0]} geometry={rbox(2.56, 0.02, 1.96, 0.01)} />
        {[
          [-1.25, -0.95],
          [1.25, -0.95],
          [-1.25, 0.95],
          [1.25, 0.95],
        ].map(([x, z]) => (
          <Part key={`${x}${z}`} color="#6b4228" position={[x, (COASTER.top - 0.08) / 2, z]}>
            <cylinderGeometry args={[0.045, 0.035, COASTER.top - 0.08, 8]} />
          </Part>
        ))}

        <group position={[0, COASTER.top + 0.015, 0]}>
          <Part color="#ff7849" geometry={rails.left} />
          <Part color="#ff7849" geometry={rails.right} />
          <Part color="#e2603f" geometry={rails.spine} />
          <Ties track={track} />
          <Supports track={track} />

          <group ref={train}>
            {colors.map((c, i) => (
              <group key={c} matrixAutoUpdate={false}>
                <Car color={c} rider={riders[i]} />
              </group>
            ))}
          </group>

          {/* station + entrance sign */}
          <group position={[-0.3, 0, 0.84]}>
            <Part color="#e9e2d0" position={[0, 0.09, 0]} geometry={rbox(0.95, 0.18, 0.2, 0.02)} />
            {[-0.42, 0.42].map((x) => (
              <Part key={x} color="#3b3550" position={[x, 0.32, 0.05]}>
                <cylinderGeometry args={[0.012, 0.012, 0.32, 6]} />
              </Part>
            ))}
            <Part color="#ff7849" position={[0, 0.5, -0.02]} geometry={rbox(1.0, 0.04, 0.42, 0.015)} />
          </group>
          <group position={[-1.05, 0, 0.9]} rotation-y={0.6}>
            {[-0.2, 0.2].map((x) => (
              <Part key={x} color="#3b3550" position={[x, 0.2, 0]}>
                <cylinderGeometry args={[0.014, 0.014, 0.4, 6]} />
              </Part>
            ))}
            <mesh position={[0, 0.42, 0]}>
              <planeGeometry args={[0.5, 0.125]} />
              <meshStandardMaterial map={sign} roughness={0.9} side={DoubleSide} />
            </mesh>
          </group>

          {/* scenery inside the loop */}
          <Part color="#5ab0e6" position={[0.05, 0.005, 0.05]} scale={[0.38, 1, 0.24]}>
            <cylinderGeometry args={[1, 1, 0.012, 24]} />
          </Part>
          {[
            [0.45, -0.2, 0.28],
            [-0.45, 0.15, 0.22],
            [0.35, 0.35, 0.18],
            [-0.3, -0.3, 0.25],
          ].map(([x, z, h]) => (
            <group key={`${x}${z}`} position={[x, 0, z]}>
              <Part color="#6b4228" position={[0, 0.04, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.08, 6]} />
              </Part>
              <Part color="#3f9b52" position={[0, 0.08 + h / 2, 0]}>
                <coneGeometry args={[h * 0.42, h, 8]} />
              </Part>
            </group>
          ))}
        </group>
      </group>
    </Hotspot>
  )
}
