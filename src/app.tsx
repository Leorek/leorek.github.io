import { lazy, Suspense, useEffect } from 'react'
import { LangProvider, useLang } from './content/use-lang'
import { useLenis } from './lib/use-lenis'
import { bindViewListeners } from './lib/view-state'
import Nav from './components/nav'
import SceneBoundary from './scene/scene-boundary'
import Stations from './sections/stations'

// three.js + the whole studio live in their own chunk: text paints first,
// the 3D fades in when ready.
const Scene = lazy(() => import('./scene/scene'))

const hasWebGL = (() => {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
})()

function Layout() {
  const { t } = useLang()
  useLenis()
  useEffect(() => bindViewListeners(), [])

  return (
    <>
      <a href="#main" className="skip-link">
        {t.ui.skip}
      </a>
      {hasWebGL && (
        <SceneBoundary>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </SceneBoundary>
      )}
      <Nav />
      <main id="main" className="relative z-10">
        <Stations />
      </main>
    </>
  )
}

export default function App() {
  return (
    <LangProvider>
      <Layout />
    </LangProvider>
  )
}
