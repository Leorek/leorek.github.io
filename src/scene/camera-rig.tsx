import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CatmullRomCurve3, MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { STATIONS } from '../lib/stations'
import { view } from '../lib/view-state'

// Scroll progress → camera. Positions ride a smooth spline through every
// station's pose (so transitions curve around the room instead of cutting
// through it); targets and FOV blend linearly. The framing is shifted with
// setViewOffset so the object sits beside the HTML panel, not under it.

const N = STATIONS.length - 1

function build(kind: 'cam' | 'mobile') {
  const poses = STATIONS.map((s) => s[kind])
  return {
    path: new CatmullRomCurve3(
      poses.map((p) => new Vector3(...p.pos)),
      false,
      'centripetal',
    ),
    targets: poses.map((p) => new Vector3(...p.target)),
    fovs: poses.map((p) => p.fov),
  }
}

export default function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const size = useThree((s) => s.size)
  const rigs = useMemo(() => ({ cam: build('cam'), mobile: build('mobile') }), [])
  const pos = useMemo(() => new Vector3(), [])
  const target = useMemo(() => new Vector3(), [])
  const look = useRef<Vector3 | null>(null)
  const offset = useRef({ x: 0, y: 0 })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const portrait = size.width / size.height < 0.95
    const rig = portrait ? rigs.mobile : rigs.cam
    const p = view.reduced ? Math.round(view.progress) : view.progress
    const i = Math.min(N - 1, Math.floor(p))
    const f = p - i

    rig.path.getPoint(p / N, pos)
    target.lerpVectors(rig.targets[i], rig.targets[i + 1], f)
    const fov = MathUtils.lerp(rig.fovs[i], rig.fovs[i + 1], f)

    // gentle parallax on desktop
    if (!portrait && !view.reduced) {
      pos.x += view.pointer.x * 0.18
      pos.y += view.pointer.y * 0.12
    }

    if (!look.current) {
      // first frame: start further out and dolly in
      look.current = target.clone()
      camera.position.copy(pos).sub(target).multiplyScalar(view.reduced ? 1 : 1.5).add(target)
    }
    const snap = view.reduced
    const l = 3.2
    camera.position.x = snap ? pos.x : MathUtils.damp(camera.position.x, pos.x, l, dt)
    camera.position.y = snap ? pos.y : MathUtils.damp(camera.position.y, pos.y, l, dt)
    camera.position.z = snap ? pos.z : MathUtils.damp(camera.position.z, pos.z, l, dt)
    if (snap) look.current.copy(target)
    else look.current.lerp(target, 1 - Math.exp(-l * 1.2 * dt))
    camera.lookAt(look.current)
    camera.fov = snap ? fov : MathUtils.damp(camera.fov, fov, l, dt)

    // shift the framing away from the panel
    const side = (k: number) => (STATIONS[k].side === 'left' ? -1 : 1)
    const ox = portrait ? 0 : MathUtils.lerp(side(i), side(i + 1), f) * 0.17 * size.width
    const oy = portrait ? 0.2 * size.height : 0
    offset.current.x = snap ? ox : MathUtils.damp(offset.current.x, ox, l, dt)
    offset.current.y = snap ? oy : MathUtils.damp(offset.current.y, oy, l, dt)
    camera.setViewOffset(size.width, size.height, offset.current.x, offset.current.y, size.width, size.height)
    camera.updateProjectionMatrix()
  })

  return null
}
