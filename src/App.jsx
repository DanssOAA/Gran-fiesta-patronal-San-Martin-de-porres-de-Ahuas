import React, { useCallback, useEffect, useRef, useState } from 'react'
import layout from './invitation.json'
import { event } from './event.js'
import { clampSeek, remainingTime } from './playback.js'
import musicUrl from './upload/BANDA ORQUESTA CENTRO MUSICAL HUANRI - ABREME LA PUERTA OCROS ANCASH.mp3'
import './fonts.css'
import './invitation.css'

const isInvitationHash = () => /^#(?:invitacion|seccion-\d+)$/.test(window.location.hash)
const themeColor = (color) => color === '#0a1931' ? event.colors.background : color === '#d39d26' ? event.colors.gold : color

function useMusic() {
  const audio = useRef(null)
  const initialized = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const prepare = useCallback(() => {
    const player = audio.current
    if (!player || initialized.current || !player.readyState) return
    player.currentTime = clampSeek(event.musicStart, player.duration, event.musicStart)
    initialized.current = true
  }, [])
  const play = useCallback(async () => {
    const player = audio.current
    if (!player) return
    setError('')
    prepare()
    try { await player.play() }
    catch {
      setPlaying(false)
      setError('No se pudo iniciar la música. Pulsa reproducir para intentarlo de nuevo.')
    }
  }, [prepare])
  const pause = useCallback(() => audio.current?.pause(), [])
  const toggle = useCallback(() => {
    if (audio.current?.paused) return play()
    pause()
  }, [play, pause])
  const seek = useCallback((seconds) => {
    const player = audio.current
    if (!player?.readyState) return
    prepare()
    player.currentTime = clampSeek(player.currentTime + seconds, player.duration, event.musicStart)
  }, [prepare])
  const restart = useCallback(() => {
    if (!audio.current) return
    audio.current.currentTime = event.musicStart
    void play()
  }, [play])
  return {
    playing, error, toggle, seek, pause,
    element: <audio ref={audio} src={`${musicUrl}#t=${event.musicStart}`} preload="metadata"
      onLoadedMetadata={prepare} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onEnded={restart} onError={() => { setPlaying(false); setError('La música no está disponible. Inténtalo de nuevo.') }} />,
  }
}

function MusicIcon({ playing }) {
  return playing
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 4 12 8-12 8Z" /></svg>
}

function MusicPlayer({ music }) {
  return <div className={`music-player ${music.playing ? 'is-playing' : ''}`}>
    <button className="player-main" onClick={music.toggle} aria-label={music.playing ? 'Pausar música' : 'Reproducir música desde 0:34'} aria-pressed={music.playing}>
      <MusicIcon playing={music.playing} />
    </button>
    <div className="player-controls">
      <button onClick={() => music.seek(-10)} aria-label="Retroceder diez segundos" title="Retroceder 10 segundos">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14m13-14L7 12l12 7Z" /></svg>
      </button>
      <button onClick={music.toggle} aria-label={music.playing ? 'Pausar música' : 'Continuar música'}><MusicIcon playing={music.playing} /></button>
      <button onClick={() => music.seek(10)} aria-label="Adelantar diez segundos" title="Adelantar 10 segundos">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 5v14M5 5l12 7-12 7Z" /></svg>
      </button>
    </div>
    <span className="sr-only" role="status">{music.playing ? 'Música reproduciéndose' : 'Música pausada'}</span>
    {music.error && <p className="music-error" role="alert">{music.error}</p>}
  </div>
}

function Countdown() {
  const labels = ['Días', 'Horas', 'Minutos', 'Segundos']
  const [remaining, setRemaining] = useState(() => remainingTime(event.date))
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(remainingTime(event.date)), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return <div className="countdown" aria-label="Cuenta regresiva para el evento" role="timer">
    {remaining.map((value, index) => <div className="countdown-unit" key={labels[index]}>
      <strong>{String(value).padStart(2, '0')}</strong><span>{labels[index]}</span>
    </div>)}
  </div>
}

// The stored line lengths and text metrics preserve the original composition.
function textLines(item, text) {
  if (!item.lineLengths?.length || text !== item.text) return text.split('\n')
  let cursor = 0
  return item.lineLengths.map((length) => {
    const line = text.slice(cursor, cursor + length).replace(/\n/g, '')
    cursor += length
    return line
  }).filter((line) => line.length)
}

function TextElement({ item }) {
  const text = event.text[item.id] ?? item.text
  const lines = textLines(item, text)
  const width = item.textWidth ?? item.width
  const scale = item.width / width
  const height = item.textHeight ?? item.height / scale
  const lineHeight = height / Math.max(lines.length, 1)
  return <div className="reference-text" style={{ ...item.style, color: themeColor(item.style.color), width, transform: `scale(${scale})`, lineHeight: `${lineHeight}px` }}>
    {lines.map((line, index) => <div key={index} style={item.lineStyles?.[index]}>{line.split(/(Cessna|AN-32B|MI-17|UH-1H-II|EC-145|UH-60)/g).map((part, i) => i % 2 ? <strong className="gold-text" key={i}>{part}</strong> : part) || '\u00a0'}</div>)}
  </div>
}

function PointerIllustration({ item }) {
  // This vector export stores two color masks side by side in a sprite sheet.
  return <svg viewBox="0 0 1562 1600" width="100%" height="100%" aria-hidden="true">
    <defs>{[1, 2].map((frame) => <mask key={frame} id={`pointer-${frame}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1562" height="1600" style={{ maskType: 'luminance' }}>
      <image href={item.src} x={-1562 * frame} y="0" width="4686" height="1600" />
    </mask>)}</defs>
    <rect width="1562" height="1600" fill="#1a1a1a" mask="url(#pointer-1)" />
    <rect width="1562" height="1600" fill="#fff" mask="url(#pointer-2)" />
  </svg>
}

function CroppedImage({ item, eager }) {
  const source = event.images[item.id] ?? item.src
  const crop = event.images[item.id] ? { x: 0, y: 0, width: item.width, height: item.height } : item.crop
  return <div className="crop" style={{ transform: `scale(${item.flipX ? -1 : 1}, ${item.flipY ? -1 : 1})` }}>
    <img src={source} alt={item.alt ?? ''} loading={eager ? 'eager' : 'lazy'} decoding="async"
      fetchpriority={eager ? 'high' : 'auto'} draggable="false"
      style={{ left: crop.x, top: crop.y, width: crop.width, height: crop.height, objectFit: event.images[item.id] ? 'cover' : 'fill' }} />
  </div>
}

function ShapeElement({ item }) {
  return <svg width="100%" height="100%" viewBox={`0 0 ${item.viewWidth} ${item.viewHeight}`} preserveAspectRatio="none" aria-hidden="true">
    <defs>{item.paths.map((path, index) => path.src && <clipPath id={`${item.id}-${index}`} key={index}><path d={path.path} /></clipPath>)}</defs>
    {item.paths.map((path, index) => path.src
      ? <image key={index} href={event.images[item.id] ?? path.src} x={path.crop.x} y={path.crop.y} width={path.crop.width} height={path.crop.height} clipPath={`url(#${item.id}-${index})`} preserveAspectRatio="none" />
      : <path key={index} d={path.path} fill={path.color} />)}
  </svg>
}

function VideoElement({ item }) {
  const video = useRef(null)
  useEffect(() => {
    const player = video.current
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) void player.play().catch(() => {})
      else player.pause()
    }, { threshold: .25 })
    observer.observe(player)
    return () => { observer.disconnect(); player.pause() }
  }, [])
  return <video ref={video} className="event-video" src={event.video ?? item.src} poster={item.poster} muted controls loop playsInline preload="none" aria-label={item.alt} />
}

function Element({ item, eager, music }) {
  let content
  switch (item.kind) {
    case 'text': content = <TextElement item={item} />; break
    case 'image': content = item.src?.endsWith('766ea74c1273d40c607e00c35ab24cdc.png') ? <PointerIllustration item={item} /> : <CroppedImage item={item} eager={eager} />; break
    case 'shape': content = <ShapeElement item={item} />; break
    case 'video': content = <VideoElement item={item} />; break
    case 'music': content = <MusicPlayer music={music} />; break
    case 'countdown': content = <Countdown />; break
    case 'line': content = <div style={{ background: themeColor(item.color), width: '100%', height: '100%' }} />; break
    default: return null
  }
  return <div className={`scene-element ${item.reveal ? 'reveal-item' : ''}`} style={{ left: item.x, top: item.y, width: item.width, height: item.height, opacity: item.opacity, transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined }}>{content}</div>
}

function Scene({ scene, music, onAction, first = false }) {
  const root = useRef(null)
  const [scale, setScale] = useState(() => Math.min(window.innerWidth, event.maxWidth) / layout.width)
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / layout.width))
    observer.observe(root.current)
    return () => observer.disconnect()
  }, [])
  const hotspot = scene.hotspot
  return <section ref={root} id={scene.id} className={`scene ${first ? 'first-scene' : ''}`} aria-label={scene.label} style={{ height: scene.height * scale, background: themeColor(scene.background) }}>
    <div className="scene-canvas" style={{ width: layout.width, height: scene.height, transform: `scale(${scale})` }}>
      {scene.elements.map((item) => <Element key={item.id} item={item} eager={first} music={music} />)}
      {hotspot && <button className={`scene-hotspot ${hotspot.action === 'open' ? 'open-invitation' : ''}`} style={{ left: hotspot.x, top: hotspot.y, width: hotspot.width, height: hotspot.height }} onClick={() => onAction(hotspot.action)} aria-label={hotspot.label} />}
    </div>
  </section>
}

function RsvpDialog({ onClose }) {
  const dialog = useRef(null)
  useEffect(() => { const modal = dialog.current; modal.showModal(); return () => modal.close() }, [])
  return <dialog className="rsvp-dialog" ref={dialog} onCancel={onClose} onClick={(e) => { if (e.target === dialog.current) onClose() }} aria-labelledby="rsvp-title">
    <button className="dialog-close" onClick={onClose} aria-label="Cerrar">×</button>
    <span className="dialog-ornament" aria-hidden="true">✦</span>
    <h2 id="rsvp-title">Confirmación de asistencia</h2>
    <p>Pronto compartiremos los detalles para confirmar tu asistencia.</p>
    <button className="gold-button" onClick={onClose}>Volver a la invitación</button>
  </dialog>
}

function Footer({ onHome }) {
  return <footer className="footer"><p>Copyright © {new Date().getFullYear()} {event.designer}</p><button onClick={onHome}>Volver al inicio <span aria-hidden="true">↑</span></button></footer>
}

export default function App() {
  const [opened, setOpened] = useState(isInvitationHash)
  const [opening, setOpening] = useState(false)
  const [rsvpOpen, setRsvpOpen] = useState(false)
  const [showFloatingMusic, setShowFloatingMusic] = useState(false)
  const transitionTimer = useRef(null)
  const music = useMusic()
  useEffect(() => {
    const handleHash = () => {
      const isOpen = isInvitationHash()
      setOpened(isOpen); setRsvpOpen(false)
      if (!isOpen) { setShowFloatingMusic(false); music.pause() }
      if (!isOpen || window.location.hash === '#invitacion') window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', handleHash)
    return () => { window.removeEventListener('hashchange', handleHash); window.clearTimeout(transitionTimer.current) }
  }, [music.pause])
  useEffect(() => {
    if (!opened) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) }
    }, { threshold: .12 })
    document.querySelectorAll('.reveal-item').forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [opened])

  function handleAction(action) {
    if (action === 'open' && !opening) {
      setOpening(true)
      transitionTimer.current = window.setTimeout(() => {
        window.location.hash = 'invitacion'; setOpening(false)
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450)
    }
    if (action === 'rsvp') {
      if (event.rsvpUrl) window.open(event.rsvpUrl, '_blank', 'noopener,noreferrer')
      else setRsvpOpen(true)
    }
  }
  function goHome() { window.location.hash = ''; music.pause() }
  function toggleMusic() { setShowFloatingMusic(true); void music.toggle() }
  return <div className={`site-shell ${opened ? 'invitation-open' : 'cover-view'} ${opening ? 'is-opening' : ''}`} style={{ '--invitation-width': `${event.maxWidth}px`, '--navy': event.colors.background, '--gold': event.colors.gold }}>
    {music.element}
    <a className="skip-link" href={opened ? '#seccion-7' : '#portada'}>{opened ? 'Ir a confirmar asistencia' : 'Ir a la portada'}</a>
    <main className="invitation" key={opened ? 'invitation' : 'cover'}>
      <h1 className="sr-only">{event.title}</h1>
      {opened ? layout.sections.map((scene, index) => <Scene key={scene.id} scene={scene} music={{ ...music, toggle: toggleMusic }} first={index === 0} onAction={handleAction} />)
        : <Scene scene={layout.cover} first onAction={handleAction} music={music} />}
      <Footer onHome={goHome} />
    </main>
    {opened && showFloatingMusic && <button className={`floating-music ${music.playing ? 'is-playing' : ''}`} onClick={music.toggle} aria-label={music.playing ? 'Pausar música' : 'Continuar música'} aria-pressed={music.playing} title={music.playing ? 'Pausar música' : 'Continuar música'}>
      <span aria-hidden="true" className="sound-bars"><i /><i /><i /><i /></span>
    </button>}
    {rsvpOpen && <RsvpDialog onClose={() => setRsvpOpen(false)} />}
  </div>
}
