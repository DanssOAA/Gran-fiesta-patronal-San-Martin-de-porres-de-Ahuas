export function clampSeek(time, duration, start = 34) {
  const end = Number.isFinite(duration) && duration > 0 ? duration : Infinity
  const minimum = Math.min(start, Math.max(0, end - .1))
  return Math.min(Math.max(minimum, time), Math.max(minimum, end - .1))
}

export function remainingTime(date, now = Date.now()) {
  const target = new Date(date).getTime()
  const distance = Number.isFinite(target) ? Math.max(0, target - now) : 0
  return [Math.floor(distance / 86400000), Math.floor(distance / 3600000) % 24, Math.floor(distance / 60000) % 60, Math.floor(distance / 1000) % 60]
}
