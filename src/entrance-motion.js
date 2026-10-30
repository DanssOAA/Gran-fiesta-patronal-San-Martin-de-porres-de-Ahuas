const TARGETS = [
  '.cover-kicker', '.envelope', '.cover-title', '.cover-date',
  '.hero-topline', '.saint-frame', '.patron-hero > .eyebrow', '.patron-hero h1',
  '.hero-description', '.floral-ornament', '.hero-date',
  '.music-instruction', '.music-player', '.music-credit', '.scroll-cue',
  '.section-heading > .eyebrow', '.section-heading > h2',
  '.welcome > .eyebrow', '.welcome > h2', '.welcome-copy > p',
  '.date-pair > div', '.date-amp', '.countdown-copy', '.countdown > div',
  '.name-row', '.representative', '.program-date', '.program-events > li',
  '.pdf-photo', '.pdf-photo figcaption', '.photo-section-copy',
  '.venue-name', '.location address', '.location > .button',
  '.closing-copy > .eyebrow', '.closing-copy > h2',
  '.closing-copy > p:not(.eyebrow)', '.closing-copy > strong',
  '.footer > p', '.footer > button',
].join(', ')

const GROUPS = '.cover-content, .patron-hero, .section-heading, .welcome-copy, .date-pair, .countdown, .name-list, .program-events, .closing-copy'

function entranceFor(element, photoIndex) {
  if (element.matches('.floral-ornament')) return 'ornament'
  if (element.matches('.pdf-photo')) return photoIndex % 2 ? 'photo-right' : 'photo-left'
  if (element.matches('.envelope')) return 'envelope'
  if (element.matches('.saint-frame')) return 'portrait'
  if (element.matches('h1, h2')) return 'heading'
  if (element.matches('.program-date')) return 'left'
  if (element.matches('.name-row, .program-events > li')) return 'row'
  if (element.matches('.date-pair > div, .countdown > div, .music-player, .location > .button')) return 'pop'
  return 'up'
}

// Elements remain visible unless the observers have been installed successfully.
export function mountEntranceMotion(root) {
  if (!root || typeof window === 'undefined' || !window.IntersectionObserver) return () => {}
  const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  if (preference?.matches) return () => {}

  const elements = [...root.querySelectorAll(TARGETS)]
  const sections = root.matches('.cover') ? [root] : [...root.querySelectorAll('section')]
  let entranceObserver
  let sectionObserver
  let disposed = false
  let photoIndex = 0

  function show(element, delay = 0) {
    if (!element || element.classList.contains('motion-entered')) return
    element.style.setProperty('--motion-delay', `${delay}ms`)
    element.classList.add('motion-entered')
    element.classList.remove('motion-pending')
    entranceObserver?.unobserve(element)
  }

  function revealAll() {
    root.classList.remove('motion-ready')
    elements.forEach((element) => element.classList.remove('motion-pending'))
    entranceObserver?.disconnect()
    sectionObserver?.disconnect()
    sections.forEach((section) => section.classList.remove('motion-in-view'))
  }

  function onPreferenceChange(event) {
    if (event.matches) revealAll()
  }

  function onFocus(event) {
    show(event.target?.closest?.('[data-motion]'))
  }

  try {
    entranceObserver = new window.IntersectionObserver((entries) => {
      if (disposed) return
      const groups = new Map()
      entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top).forEach((entry) => {
        const group = entry.target.closest(GROUPS) ?? entry.target.parentElement
        const position = groups.get(group) ?? 0
        groups.set(group, position + 1)
        show(entry.target, Math.min(position, 5) * 65)
      })
    }, { threshold: .08, rootMargin: '0px 0px -24px 0px' })

    sectionObserver = new window.IntersectionObserver((entries) => {
      if (disposed) return
      for (const entry of entries) entry.target.classList.toggle('motion-in-view', entry.isIntersecting)
    }, { threshold: 0, rootMargin: '40px 0px' })

    for (const element of elements) {
      element.dataset.motion = entranceFor(element, photoIndex)
      if (element.matches('.pdf-photo')) photoIndex += 1
      element.classList.add('motion-pending')
      entranceObserver.observe(element)
    }
    sections.forEach((section) => sectionObserver.observe(section))
    root.classList.add('motion-ready')
    root.addEventListener('focusin', onFocus)
    preference?.addEventListener?.('change', onPreferenceChange)
  } catch {
    revealAll()
  }

  return () => {
    disposed = true
    revealAll()
    root.removeEventListener('focusin', onFocus)
    preference?.removeEventListener?.('change', onPreferenceChange)
    for (const element of elements) {
      element.classList.remove('motion-entered')
      delete element.dataset.motion
      element.style.removeProperty('--motion-delay')
    }
  }
}
