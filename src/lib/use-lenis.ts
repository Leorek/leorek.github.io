import { useEffect } from 'react'
import Lenis from 'lenis'

// Lenis smooth scroll. Exposed on window so goto() and the scene can use it.
// Skipped entirely for reduced motion — native scrolling is the right call.
export function useLenis() {
  useEffect(() => {
    // deep links (#work…): the sections render after the browser tried to
    // jump, so jump again once layout has settled
    const id = location.hash.slice(1)
    const el = id && document.getElementById(id)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (el) requestAnimationFrame(() => el.scrollIntoView())
      return
    }

    const lenis = new Lenis({ autoRaf: true, anchors: true, duration: 1.1 })
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
    if (el) requestAnimationFrame(() => lenis.scrollTo(el, { immediate: true }))

    return () => {
      lenis.destroy()
      delete (window as unknown as { __lenis?: Lenis }).__lenis
    }
  }, [])
}
