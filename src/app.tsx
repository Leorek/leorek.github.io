import { useLenis } from './lib/use-lenis'
import Scene from './scene/scene'
import SceneBoundary from './scene/scene-boundary'
import Nav from './components/nav'
import Hero from './sections/hero'
import About from './sections/about'
import Skills from './sections/skills'
import Projects from './sections/projects'
import Play from './sections/play'
import Contact from './sections/contact'

export default function App() {
  useLenis()

  return (
    <>
      <SceneBoundary>
        <Scene />
      </SceneBoundary>
      <div className="grain" />
      <Nav />

      <main className="relative z-10">
        <Hero />
        {/* content sits on a gradient so the 3D reads in the hero, then text stays legible */}
        <div className="bg-gradient-to-b from-transparent via-ink/90 to-ink">
          <About />
          <Skills />
          <Projects />
          <Play />
          <Contact />
        </div>
      </main>
    </>
  )
}
