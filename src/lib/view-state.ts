// Mutable, render-free shared state. The 3D scene samples this in useFrame;
// listeners write to it. Keeping it out of React avoids per-frame re-renders.
export const view = {
  pointer: { x: 0, y: 0 }, // normalized -1..1
  scroll: 0, // 0..1 over full page
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

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    view.scroll = max > 0 ? window.scrollY / max : 0
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}
