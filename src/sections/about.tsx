import Reveal from '../components/reveal'
import { profile } from '../data/site'

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
      <div className="grid gap-14 md:grid-cols-[1fr_0.55fr] md:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow mb-8">01 — Who</p>
          </Reveal>
          <div className="space-y-6">
            {profile.about.map((para, i) => (
              <Reveal key={i} delay={i * 90} as="p">
                <span className="block max-w-[60ch] text-xl leading-relaxed text-bone/85 md:text-2xl md:leading-relaxed">
                  {para}
                </span>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={120} className="self-start">
          <figure className="relative">
            <div className="absolute -inset-3 rounded-2xl border border-ember/25" />
            <img
              src="/avatar.jpg"
              alt={`${profile.name}, ${profile.role}`}
              loading="lazy"
              className="relative aspect-square w-full rounded-xl object-cover grayscale-[0.25] [box-shadow:0_30px_60px_-20px_rgba(0,0,0,0.6)]"
            />
            <figcaption className="mt-4 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-fog">
              <span>{profile.location}</span>
              <span className="text-ember">// hi</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
