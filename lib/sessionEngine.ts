export interface SessionConfig {
  startAyah: number   // 1-indexed position in AYAAT (1 = ayah 36)
  endAyah: number
  repsPerAyah: number
  durationMinutes: number
  inputMode: 'tap' | 'voice'
}

export interface Step {
  type: 'single' | 'combined'
  ayahIndices: number[]   // 0-indexed into AYAAT[]
  repNumber: number       // 1-indexed
  totalReps: number
}

export interface SessionState {
  config: SessionConfig
  steps: Step[]
  currentStepIndex: number
  startedAt: number       // Date.now()
  pausedAt: number | null
  totalPausedMs: number
  isComplete: boolean
}

const COMBINED_REPS = 3

export function generateSteps(startAyah: number, endAyah: number, repsPerAyah: number): Step[] {
  const steps: Step[] = []
  const startIdx = startAyah - 1
  const endIdx = endAyah - 1

  for (let ayahIdx = startIdx; ayahIdx <= endIdx; ayahIdx++) {
    for (let rep = 1; rep <= repsPerAyah; rep++) {
      steps.push({ type: 'single', ayahIndices: [ayahIdx], repNumber: rep, totalReps: repsPerAyah })
    }
    if (ayahIdx > startIdx) {
      const combined = Array.from({ length: ayahIdx - startIdx + 1 }, (_, i) => startIdx + i)
      for (let rep = 1; rep <= COMBINED_REPS; rep++) {
        steps.push({ type: 'combined', ayahIndices: combined, repNumber: rep, totalReps: COMBINED_REPS })
      }
    }
  }

  return steps
}

export function createSession(config: SessionConfig): SessionState {
  return {
    config,
    steps: generateSteps(config.startAyah, config.endAyah, config.repsPerAyah),
    currentStepIndex: 0,
    startedAt: Date.now(),
    pausedAt: null,
    totalPausedMs: 0,
    isComplete: false,
  }
}

export function getElapsedMs(state: SessionState): number {
  const pauseExtra = state.pausedAt != null ? Date.now() - state.pausedAt : 0
  return Date.now() - state.startedAt - state.totalPausedMs - pauseExtra
}

export function getRemainingMs(state: SessionState): number {
  return Math.max(0, state.config.durationMinutes * 60_000 - getElapsedMs(state))
}

export function isTimeExpired(state: SessionState): boolean {
  return getRemainingMs(state) === 0
}

export function markComplete(state: SessionState): SessionState {
  const nextIndex = state.currentStepIndex + 1
  const timeUp    = isTimeExpired(state)
  const noMore    = nextIndex >= state.steps.length
  return {
    ...state,
    currentStepIndex: nextIndex,   // always advance; SessionScreen guards on isComplete
    isComplete: noMore || timeUp,
  }
}

export function pause(state: SessionState): SessionState {
  if (state.pausedAt != null) return state
  return { ...state, pausedAt: Date.now() }
}

export function resume(state: SessionState): SessionState {
  if (state.pausedAt == null) return state
  return {
    ...state,
    totalPausedMs: state.totalPausedMs + (Date.now() - state.pausedAt),
    pausedAt: null,
  }
}

export function countAyaatCompleted(state: SessionState): number {
  // currentStepIndex is always nextIndex after markComplete, so it equals "steps done count"
  const limit = Math.min(state.currentStepIndex, state.steps.length)
  const seen  = new Set<number>()
  state.steps.slice(0, limit).forEach(s => {
    if (s.type === 'single' && s.repNumber === s.totalReps) seen.add(s.ayahIndices[0])
  })
  return seen.size
}

export function stepLabel(step: Step, config: SessionConfig): string {
  const toSessionPos = (idx: number) => idx - (config.startAyah - 1) + 1

  if (step.type === 'single') {
    const pos = toSessionPos(step.ayahIndices[0])
    return `Ayah ${pos} — herhaling ${step.repNumber} van ${step.totalReps}`
  }
  const positions = step.ayahIndices.map(toSessionPos).join(', ')
  return `Samen: ayah ${positions} — ${step.repNumber} van ${step.totalReps}`
}
