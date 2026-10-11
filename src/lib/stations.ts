// The guided tour. Each station is one HTML section (same id) plus a camera
// pose in the studio. The scroll position between two sections blends the
// camera between their poses; clicking an object scrolls to its section.

export type StationId = 'hello' | 'work' | 'worlds' | 'music' | 'parks' | 'travel' | 'contact'

type Vec3 = [number, number, number]
export type CameraPose = { pos: Vec3; target: Vec3; fov: number }

export type Station = {
  id: StationId
  /** which side the HTML panel sits on (desktop). The 3D framing shifts the
   *  other way so the panel never covers the object. */
  side: 'left' | 'right'
  cam: CameraPose
  /** portrait / narrow screens: panel sits at the bottom, object on top */
  mobile: CameraPose
}

export const STATIONS: Station[] = [
  {
    id: 'hello',
    side: 'left',
    cam: { pos: [11.5, 6.4, 12.5], target: [0, 2.0, -0.8], fov: 34 },
    mobile: { pos: [14, 10.5, 16], target: [0, 1.2, -0.5], fov: 44 },
  },
  {
    id: 'work',
    side: 'right',
    cam: { pos: [0.6, 2.75, 0.9], target: [-1.0, 1.7, -3.5], fov: 40 },
    mobile: { pos: [0.6, 3.3, 2.6], target: [-1.0, 1.6, -3.4], fov: 52 },
  },
  {
    id: 'worlds',
    side: 'right',
    cam: { pos: [-2.9, 2.55, 1.15], target: [-4.1, 1.65, -3.0], fov: 40 },
    mobile: { pos: [-2.0, 3.0, 1.9], target: [-3.9, 1.5, -2.9], fov: 52 },
  },
  {
    id: 'music',
    side: 'left',
    cam: { pos: [3.4, 2.35, -0.8], target: [2.5, 1.2, -3.5], fov: 42 },
    mobile: { pos: [3.4, 3.0, 0.6], target: [2.5, 1.1, -3.4], fov: 54 },
  },
  {
    id: 'parks',
    side: 'left',
    cam: { pos: [7.2, 3.6, 5.2], target: [3.3, 1.3, 1.6], fov: 38 },
    mobile: { pos: [8.4, 5.2, 7.4], target: [3.3, 1.1, 1.6], fov: 50 },
  },
  {
    id: 'travel',
    side: 'right',
    cam: { pos: [-0.8, 2.95, 1.9], target: [-4.7, 2.8, 0.35], fov: 42 },
    mobile: { pos: [0.6, 3.0, 2.6], target: [-4.7, 2.6, 0.35], fov: 56 },
  },
  {
    id: 'contact',
    side: 'left',
    cam: { pos: [2.6, 2.75, -1.4], target: [2.6, 2.3, -20], fov: 50 },
    mobile: { pos: [2.6, 2.9, -0.6], target: [2.6, 2.0, -20], fov: 62 },
  },
]

export const stationIndex = (id: string) => STATIONS.findIndex((s) => s.id === id)
