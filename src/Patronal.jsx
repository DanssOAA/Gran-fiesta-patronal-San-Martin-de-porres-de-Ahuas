import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { fiesta, images, mapUrl } from './fiesta.js'
import { clampSeek, remainingTime } from './playback.js'
import { mountEntranceMotion } from './entrance-motion.js'
import musicUrl from './upload/BANDA ORQUESTA CENTRO MUSICAL HUANRI - ABREME LA PUERTA OCROS ANCASH.mp3'
import './fonts.css'
import './patronal.css'
import './folklore.css'
import './motion.css'

const insideInvitation = () => window.location.hash !== '' && window.location.hash !== '#portada'
const useMotionEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect
const photoDimensions = {
  [images.pollada]: [583, 341],
  [images.cuy]: [1280, 1048],
  [images.negritos]: [1537, 817],
  [images.pallas]: [1254, 1254],
  [images.tradition]: [702, 566],
  [images.band]: [1280, 813],
}

function useEntranceMotion() {
  const root = useRef(null)
  useMotionEffect(() => mountEntranceMotion(root.current), [])
  return root
}

function FestiveDetails() {
  const positions = [[7, 13], [91, 9], [15, 38], [85, 32], [8, 67], [94, 59], [19, 87], [82, 84]]
  return <div className="festive-details" aria-hidden="true">{positions.map(([x, y], index) => <i key={index} style={{ left: `${x}%`, top: `${y}%`, '--drift-delay': `${-index * 1.3}s`, '--drift-duration': `${7 + index % 4 * 1.6}s` }} />)}</div>
}

function FloralOrnament({ className = '' }) {
  return <svg className={`floral-ornament ${className}`} viewBox="0 0 260 52" fill="none" aria-hidden="true">
    <path pathLength="1" d="M7 28c40 0 54-1 88-4m158 4c-40 0-54-1-88-4M78 25c-8-8-15-9-23-8 5 7 12 10 23 8Zm-17 2c-7 7-14 9-22 8 4-7 11-10 22-8Zm121-2c8-8 15-9 23-8-5 7-12 10-23 8Zm17 2c7 7 14 9 22 8-4-7-11-10-22-8Z" stroke="currentColor" strokeWidth="1" />
    <path pathLength="1" d="M130 5c-8 8-8 13 0 21 8-8 8-13 0-21Zm0 42c-8-8-8-13 0-21 8 8 8 13 0 21Zm-21-21c8-8 13-8 21 0-8 8-13 8-21 0Zm42 0c-8-8-13-8-21 0 8 8 13 8 21 0Z" stroke="currentColor" />
    <circle cx="130" cy="26" r="5" fill="currentColor" />
    <path pathLength="1" d="m105 10 8 6m42-6-8 6m-42 26 8-6m42 6-8-6" stroke="currentColor" />
  </svg>
}

function ArrowIcon({ direction = 'down' }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={`arrow-icon arrow-${direction}`}><path d="M12 4v15m-6-6 6 6 6-6" /></svg>
}

function useMusic() {
  const audio = useRef(null)
  const ready = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const prepare = useCallback(() => {
    const player = audio.current
    if (!player?.readyState || ready.current) return
    player.currentTime = clampSeek(fiesta.musicStart, player.duration, fiesta.musicStart)
    ready.current = true
  }, [])
  const play = useCallback(async () => {
    prepare()
    setError('')
    try { await audio.current.play() }
    catch { setPlaying(false); setError('Pulsa reproducir para iniciar la música.') }
  }, [prepare])
  const pause = useCallback(() => audio.current?.pause(), [])
  const toggle = useCallback(() => audio.current?.paused ? play() : pause(), [play, pause])
  const seek = useCallback((seconds) => {
    const player = audio.current
    if (!player?.readyState) return
    prepare()
    player.currentTime = clampSeek(player.currentTime + seconds, player.duration, fiesta.musicStart)
  }, [prepare])
  const restart = useCallback(() => { audio.current.currentTime = fiesta.musicStart; void play() }, [play])
  return {
    playing, error, toggle, seek, pause,
    element: <audio ref={audio} src={`${musicUrl}#t=${fiesta.musicStart}`} preload="metadata" onLoadedMetadata={prepare}
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={restart}
      onError={() => { setPlaying(false); setError('No se pudo cargar la música. Vuelve a intentarlo.') }} />,
  }
}

function PlayIcon({ playing }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{playing ? <path d="M8 5v14M16 5v14" className="pause-lines" /> : <path d="m8 5 11 7-11 7Z" />}</svg>
}

function MusicPlayer({ music }) {
  return <div className="music-block">
    <p className="music-instruction">Dale play para escuchar la música</p>
    <div className={`music-player ${music.playing ? 'is-playing' : ''}`} role="group" aria-label="Reproductor de música">
      <button className="main-play" onClick={music.toggle} aria-label={music.playing ? 'Pausar música' : 'Reproducir música desde 0:34'} aria-pressed={music.playing}><PlayIcon playing={music.playing} /></button>
      <span className="music-divider" />
      <button className="skip-track" onClick={() => music.seek(-10)} aria-label="Retroceder diez segundos" title="Retroceder 10 segundos"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14m13-14L7 12l12 7Z" /></svg></button>
      <button className="pause-track" onClick={music.toggle} aria-label={music.playing ? 'Pausar música' : 'Continuar música'}><PlayIcon playing={music.playing} /></button>
      <button className="skip-track" onClick={() => music.seek(10)} aria-label="Adelantar diez segundos" title="Adelantar 10 segundos"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 5v14M5 5l12 7-12 7Z" /></svg></button>
    </div>
    <p className="music-credit">Banda Orquesta Centro Musical Huanri</p>
    <span className="sr-only" role="status">{music.playing ? 'Música reproduciéndose' : 'Música pausada'}</span>
    {music.error && <p className="music-error" role="alert">{music.error}</p>}
  </div>
}

function Countdown() {
  const labels = ['Días', 'Horas', 'Minutos', 'Segundos']
  const [remaining, setRemaining] = useState(() => remainingTime(fiesta.startsAt))
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(remainingTime(fiesta.startsAt)), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return <div className="countdown" role="timer" aria-label="Cuenta regresiva para el inicio de la fiesta">
    {remaining.map((value, i) => <div key={labels[i]}><strong>{String(value).padStart(2, '0')}</strong><span>{labels[i]}</span></div>)}
  </div>
}

function Cover({ onOpen, opening }) {
  const motionRoot = useEntranceMotion()
  return <main ref={motionRoot} className={`cover ${opening ? 'is-opening' : ''}`} id="portada">
    <img className="cover-landscape" src={images.village} width="1280" height="802" alt="" fetchpriority="high" />
    <div className="cover-shade" />
    <FestiveDetails />
    <div className="cover-content">
      <p className="cover-kicker">Ahuas · Gorgor · Cajatambo</p>
      <button className="envelope" onClick={onOpen} disabled={opening} aria-label="Abrir la invitación a la fiesta de San Martín de Porres">
        <span className="envelope-frame" />
        <span className="envelope-topline">Centro Social<br />San Martin de Porres de Ahuas</span>
        <span className="envelope-flap" />
        <span className="envelope-fold" />
        <span className="patron-seal"><img src={images.saint} width="931" height="1485" alt="" /></span>
        <span className="envelope-caption">Tienes una invitación</span>
        <span className="envelope-action">Haz clic para abrir <ArrowIcon direction="right" /></span>
      </button>
      <h1 className="cover-title">Gran Fiesta Patronal <em>en Lima</em></h1>
      <p className="cover-date">21 &amp; 22 de noviembre · {fiesta.year}</p>
      <FloralOrnament />
    </div>
  </main>
}

function SectionHeading({ eyebrow, children, light = false }) {
  return <header className={`section-heading ${light ? 'heading-light' : ''}`}>
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h2>{children}</h2>
    <FloralOrnament />
  </header>
}

function NameList({ rows, className = '' }) {
  return <dl className={`name-list ${className}`}>{rows.map(([name, contribution]) => <div className="name-row" key={name}><dt>{name}</dt><dd>{contribution}</dd></div>)}</dl>
}

function Photo({ src, alt, caption, className = '' }) {
  const [width, height] = photoDimensions[src] ?? []
  return <figure className={`pdf-photo reveal ${className}`}><div className="photo-window"><img src={src} width={width} height={height} alt={alt} loading="lazy" decoding="async" /></div>{caption && <figcaption>{caption}</figcaption>}</figure>
}

function Invitation({ music, onHome }) {
  const motionRoot = useEntranceMotion()

  return <main ref={motionRoot} className="invitation" id="invitacion">
    <section className="patron-hero" aria-labelledby="hero-title">
      <FestiveDetails />
      <p className="hero-topline">Gran Fiesta Patronal en Lima</p>
      <div className="saint-frame"><img src={images.saint} width="931" height="1485" alt="San Martin de Porres, rodeado de rosas y acompañado de los animales" fetchpriority="high" /></div>
      <p className="eyebrow">En honor a nuestro Santo Patrón</p>
      <h1 id="hero-title">San Martín <em>de Porres</em></h1>
      <p className="hero-description">Patrón tutelar del pueblo de<br /><strong>Ahuas · Gorgor · Cajatambo</strong></p>
      <FloralOrnament />
      <p className="hero-date">21 &amp; 22 <span>de noviembre</span> {fiesta.year}</p>
      <MusicPlayer music={music} />
      <a className="scroll-cue" href="#invitacion-familia"><span>Desliza para descubrir la invitación</span><ArrowIcon /></a>
    </section>

    <section className="welcome section-pad reveal" id="invitacion-familia" aria-labelledby="welcome-title">
      <p className="eyebrow">Con fe y tradición</p>
      <h2 id="welcome-title">Tenemos el honor<br /><em>de invitarte</em></h2>
      <FloralOrnament />
      <div className="welcome-copy">
        <p>{fiesta.invitation}</p>
        <p className="welcome-address">{fiesta.address}</p>
        <p>{fiesta.band}</p>
        <p>{fiesta.food}</p>
        <p>{fiesta.drinks}</p>
      </div>
    </section>

    <section className="date-section section-pad reveal" aria-label="Fecha y cuenta regresiva">
      <SectionHeading eyebrow="Guarda la fecha">Una celebración<br /><em>para reencontrarnos</em></SectionHeading>
      <div className="date-pair">
        <div><p>Sábado</p><strong>21</strong><span>Noviembre</span><small>Novena · 20:00 horas</small></div>
        <span className="date-amp" aria-hidden="true">&amp;</span>
        <div><p>Domingo</p><strong>22</strong><span>Noviembre</span><small>Degustación · 08:00–10:00 horas<br />Misa · 11:00 horas</small></div>
      </div>
      <p className="countdown-copy">La cuenta regresiva ha comenzado…</p>
      <Countdown />
    </section>

    <section className="mayordomos section-pad reveal" id="mayordomos" aria-labelledby="mayordomos-title">
      <header className="section-heading"><p className="eyebrow">Nuestra comunidad</p><h2 id="mayordomos-title">Mayordomos <em>de banda</em></h2><FloralOrnament /></header>
      <NameList rows={fiesta.mayordomos} />
      <p className="representative">Representante Centro Social Huancapon</p>
      <NameList rows={[fiesta.representative]} />
    </section>

    <section className="donors section-pad reveal" aria-labelledby="donors-title">
      <header className="section-heading"><p className="eyebrow">Con gratitud</p><h2 id="donors-title">Donantes</h2><FloralOrnament /></header>
      <NameList rows={fiesta.donors} className="donor-list" />
    </section>

    <section className="program section-pad" id="programa" aria-label="Programación completa">
      <SectionHeading eyebrow="Fe, música y costumbres" light>Programación</SectionHeading>
      {fiesta.program.map((day) => <div className="program-day reveal" key={day.date}>
        <header className="program-date"><span>{day.day}</span><strong>{day.date}</strong><span>{day.month}</span></header>
        <ol className="program-events">{day.events.map(([time, description, endTime]) => <li key={time}>
          <div className="program-time">
            <time dateTime={`${day.isoDate}T${time}:00-05:00`}>{time}</time>
            {endTime && <span className="program-time-end">–<time dateTime={`${day.isoDate}T${endTime}:00-05:00`}>{endTime}</time></span>}
            <span className="program-time-label">horas</span>
          </div>
          <p>{description}</p>
        </li>)}</ol>
      </div>)}
    </section>

    <section className="food section-pad" aria-label="Gastronomía de la fiesta">
      <SectionHeading eyebrow="Sabores de nuestra tierra">Para compartir<br /><em>en familia</em></SectionHeading>
      <div className="food-photos">
        <Photo src={images.pollada} alt="Plato de pollada con papas y ensalada, fotografía del PDF" caption="Una deliciosa Pollada" />
        <Photo src={images.cuy} alt="Picante de cuy con arroz, fotografía del PDF" caption="Picante de Cuy al estilo Ahuasino" />
      </div>
      <p className="photo-section-copy">{fiesta.drinks}</p>
    </section>

    <section className="traditions section-pad" aria-label="Danzas y tradiciones de Ahuas">
      <SectionHeading eyebrow="El orgullo de nuestras raíces">Una tradición<br /><em>que nos une</em></SectionHeading>
      <Photo src={images.negritos} alt="Danzantes de Negritos con máscaras y trajes tradicionales de colores" caption="Negritos de Ahuas" className="landscape-photo" />
      <Photo src={images.pallas} alt="Pallas con sombreros floridos y trajes tradicionales andinos" caption="Pallas de Ahuas" className="pallas-photo" />
    </section>

    <section className="music-tradition section-pad" aria-label="Nuestra música y celebración">
      <SectionHeading eyebrow="Nuestra fiesta estará amenizada por">Banda Orquesta<br /><em>Centro Musical Huanri</em></SectionHeading>
      <Photo src={images.tradition} alt="Grupo de Negritos con vestimenta tradicional" className="negritos-photo" />
      <Photo src={images.band} alt="Integrantes de la Banda Orquesta Centro Musical Huanri con sus instrumentos" caption="Banda Orquesta Centro Musical Huanri" className="band-photo" />
    </section>

    <section className="location section-pad reveal" id="ubicacion" aria-label="Lugar de la celebración">
      <SectionHeading eyebrow="Nos encontramos en Lima">Te esperamos</SectionHeading>
      <p className="venue-name">{fiesta.venue}</p>
      <address>{fiesta.address}</address>
      <a className="button button-burgundy" href={mapUrl} target="_blank" rel="noreferrer">Ver ubicación <ArrowIcon direction="right" /></a>
      {fiesta.rsvpUrl && <a className="button button-outline" href={fiesta.rsvpUrl} target="_blank" rel="noreferrer">Confirmar asistencia</a>}
    </section>

    <section className="closing" aria-label="Mensaje final y paisaje de Ahuas">
      <img src={images.village} width="1280" height="802" alt="Paisaje de Ahuas entre montañas, campos y cielo nublado, fotografía del PDF" loading="lazy" />
      <div className="closing-shade" />
      <div className="closing-copy"><p className="eyebrow">Ahuas · Gorgor · Cajatambo</p><FloralOrnament /><h2>Que la fe y la tradición<br /><em>nos vuelvan a reunir.</em></h2><p>Centro Social San Martin de Porres de Ahuas</p><strong>¡Te esperamos!</strong></div>
    </section>
    <footer className="footer"><p>Gran Fiesta Patronal · San Martín de Porres · {fiesta.year}</p><button onClick={onHome}>Volver a la portada <ArrowIcon direction="up" /></button></footer>
  </main>
}

export default function Patronal() {
  const [opened, setOpened] = useState(insideInvitation)
  const [opening, setOpening] = useState(false)
  const [floatingVisible, setFloatingVisible] = useState(false)
  const timer = useRef(null)
  const music = useMusic()
  useEffect(() => {
    const onHash = () => {
      const next = insideInvitation()
      setOpened(next)
      if (!next) { music.pause(); setFloatingVisible(false) }
      if (!next || window.location.hash === '#invitacion') window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', onHash)
    return () => { window.removeEventListener('hashchange', onHash); window.clearTimeout(timer.current) }
  }, [music.pause])
  function open() {
    if (opening) return
    setOpening(true)
    timer.current = window.setTimeout(() => {
      window.location.hash = 'invitacion'; setOpening(false)
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1100)
  }
  function home() { music.pause(); window.location.hash = 'portada' }
  function toggleMusic() { setFloatingVisible(true); void music.toggle() }
  return <div className="site-shell">
    {music.element}
    <a className="skip-link" href={opened ? '#programa' : '#portada'}>{opened ? 'Ir a la programación' : 'Ir a la portada'}</a>
    {opened ? <Invitation music={{ ...music, toggle: toggleMusic }} onHome={home} /> : <Cover onOpen={open} opening={opening} />}
    {opened && floatingVisible && <button className={`floating-music ${music.playing ? 'is-playing' : ''}`} onClick={music.toggle} aria-label={music.playing ? 'Pausar música' : 'Continuar música'} aria-pressed={music.playing}>
      <span className="sound-bars" aria-hidden="true"><i /><i /><i /><i /></span>
    </button>}
  </div>
}
