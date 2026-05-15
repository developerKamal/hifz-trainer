import type { SessionState } from './sessionEngine'

const KEY = 'hifz_session'

export function saveSession(state: SessionState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function loadSession(): SessionState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as SessionState
  } catch {
    return null
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
