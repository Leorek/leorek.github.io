import type { ReactNode } from 'react'
import { useLang } from '../content/use-lang'
import { profile, projects, socials, stacks } from '../data/site'
import { STATIONS, type StationId } from '../lib/stations'
import { launchCoaster } from '../lib/view-state'

// One <section> per station. The panels are the real content (readable and
// crawlable without WebGL); the 3D studio behind them just follows along.

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="chips">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  )
}

function Header({ id, tag, title }: { id: StationId; tag: string; title: string }) {
  const n = STATIONS.findIndex((s) => s.id === id)
  return (
    <>
      <p className="eyebrow">
        <span className="sticker">{tag}</span>
        <span className="count">
          {String(n).padStart(2, '0')} / {String(STATIONS.length - 1).padStart(2, '0')}
        </span>
      </p>
      <h2 className="title">{title}</h2>
    </>
  )
}

function Hello() {
  const { t } = useLang()
  return (
    <>
      <p className="eyebrow">
        <span className="sticker sticker-live">
          <span className="live-dot" aria-hidden="true" />
          {t.hello.status}
        </span>
      </p>
      <h1 className="title title-xl">{t.hello.title}</h1>
      <p className="role">{t.hello.role}</p>
      <p className="lead">{t.hello.lead}</p>
      <div className="actions">
        <a href="#work" className="btn btn-primary">
          {t.hello.tour} <span aria-hidden="true">↓</span>
        </a>
        <a href="#contact" className="btn">
          {t.hello.talk}
        </a>
      </div>
      <p className="hint">{t.ui.hint}</p>
    </>
  )
}

function Work() {
  const { t, lang } = useLang()
  const real = projects.filter((p) => p.kind === 'product' && !p.draft)
  return (
    <>
      <Header id="work" tag={t.work.tag} title={t.work.title} />
      <p className="body">{t.work.body}</p>
      <h3 className="sub">{t.work.stack}</h3>
      <Chips items={stacks.product} />
      {real.length ? (
        <ul className="projects">
          {real.map((p) => (
            <li key={p.title}>
              <strong>{p.title}</strong> <span className="muted">{p.year}</span>
              <p>{p.blurb[lang]}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="note">{t.work.soon}</p>
      )}
    </>
  )
}

function Worlds() {
  const { t } = useLang()
  return (
    <>
      <Header id="worlds" tag={t.worlds.tag} title={t.worlds.title} />
      <p className="body">{t.worlds.body}</p>
      <h3 className="sub">{t.worlds.stack}</h3>
      <Chips items={stacks.worlds} />
      <p className="note">{t.worlds.soon}</p>
    </>
  )
}

function Music() {
  const { t } = useLang()
  return (
    <>
      <Header id="music" tag={t.music.tag} title={t.music.title} />
      <p className="body">{t.music.body}</p>
      <ul className="records">
        <li>
          <span className="record record-a" aria-hidden="true" />
          <span>
            <strong>{t.music.sideA}</strong>
            <span className="muted">{t.music.sideANote}</span>
          </span>
        </li>
        <li>
          <span className="record record-b" aria-hidden="true" />
          <span>
            <strong>{t.music.sideB}</strong>
            <span className="muted">{t.music.sideBNote}</span>
          </span>
        </li>
      </ul>
    </>
  )
}

function Parks() {
  const { t } = useLang()
  return (
    <>
      <Header id="parks" tag={t.parks.tag} title={t.parks.title} />
      <p className="body">{t.parks.body}</p>
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={launchCoaster}>
          {t.parks.launch} <span aria-hidden="true">🎢</span>
        </button>
      </div>
    </>
  )
}

function Travel() {
  const { t } = useLang()
  return (
    <>
      <Header id="travel" tag={t.travel.tag} title={t.travel.title} />
      <p className="body">{t.travel.body}</p>
      <dl className="facts">
        <dt>{t.travel.home}</dt>
        <dd>{t.travel.homeValue}</dd>
      </dl>
    </>
  )
}

function Contact() {
  const { t } = useLang()
  return (
    <>
      <Header id="contact" tag={t.contact.tag} title={t.contact.title} />
      <p className="body">{t.contact.body}</p>
      <div className="actions">
        <a href={`mailto:${profile.email}`} className="btn btn-primary btn-mail">
          {profile.email}
        </a>
        {socials.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="btn">
            {s.label}
          </a>
        ))}
        {profile.resumeUrl && (
          <a href={profile.resumeUrl} className="btn">
            CV
          </a>
        )}
      </div>
      <p className="footer">
        © {new Date().getFullYear()} {profile.name} · {t.contact.footer}
      </p>
    </>
  )
}

const PANELS: Record<StationId, () => ReactNode> = {
  hello: Hello,
  work: Work,
  worlds: Worlds,
  music: Music,
  parks: Parks,
  travel: Travel,
  contact: Contact,
}

export default function Stations() {
  return (
    <>
      {STATIONS.map((s) => {
        const Panel = PANELS[s.id]
        return (
          <section key={s.id} id={s.id} className="station" data-side={s.side}>
            <div className="panel" data-ui>
              <Panel />
            </div>
          </section>
        )
      })}
    </>
  )
}
