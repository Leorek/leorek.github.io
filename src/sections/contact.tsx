import Reveal from '../components/reveal'
import Magnetic from '../components/magnetic'
import { profile, socials } from '../data/site'

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-44">
      <Reveal>
        <p className="eyebrow mb-6">05 — Say hi</p>
        <h2 className="max-w-4xl text-5xl font-bold leading-[0.95] tracking-tighter md:text-8xl">
          Got something
          <br />
          worth building?
        </h2>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Magnetic strength={0.3}>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-3 rounded-full bg-ember px-7 py-4 text-lg font-medium text-ink transition-transform active:scale-[0.97]"
            >
              {profile.email}
              <span>→</span>
            </a>
          </Magnetic>
          {profile.resumeUrl && (
            <a
              href={profile.resumeUrl}
              className="rounded-full border border-line px-7 py-4 text-lg text-bone transition-colors hover:border-ember/40"
            >
              Résumé
            </a>
          )}
        </div>
      </Reveal>

      <footer className="mt-28 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-fog">
          © {new Date().getFullYear()} {profile.name} — built with three.js & too much coffee
        </p>
        <div className="flex gap-6">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-fog transition-colors hover:text-ember"
            >
              {s.label}
            </a>
          ))}
        </div>
      </footer>
    </section>
  )
}
