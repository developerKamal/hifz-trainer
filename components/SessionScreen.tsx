'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SessionState } from '@/lib/sessionEngine'
import {
  countAyaatCompleted, getElapsedMs, getRemainingMs,
  markComplete, pause, resume, stepLabel,
} from '@/lib/sessionEngine'
import { AYAAT, warshPageUrl } from '@/lib/ayaat'
import { clearSession, saveSession } from '@/lib/storage'
import VoiceIndicator from './VoiceIndicator'

interface Props {
  initialState: SessionState
  onDone: (ayaatCompleted: number, totalSeconds: number) => void
}

function fmtMs(ms: number) {
  const total = Math.ceil(ms / 1000)
  const m     = Math.floor(total / 60)
  const s     = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SessionScreen({ initialState, onDone }: Props) {
  const [state,   setState]   = useState<SessionState>(initialState)
  const [tick,    setTick]    = useState(0)   // drives timer re-renders
  const [voiceMode, setVoiceMode] = useState(initialState.config.inputMode === 'voice')
  const stateRef = useRef(state)
  stateRef.current = state

  // Persist every state change
  useEffect(() => { saveSession(state) }, [state])

  // Interval for countdown display and time-expiry detection
  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1)
    }, 500)
    return () => clearInterval(id)
  }, [])

  const handleMarkComplete = useCallback(() => {
    setState(prev => {
      const next = markComplete(prev)
      if (next.isComplete) {
        clearSession()
      }
      return next
    })
  }, [])

  // Navigate to done screen when complete
  useEffect(() => {
    if (state.isComplete) {
      const elapsed = Math.round(getElapsedMs(state) / 1000)
      onDone(countAyaatCompleted(state), elapsed)
    }
  }, [state.isComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePause = () => setState(prev => prev.pausedAt ? resume(prev) : pause(prev))

  const handleVoicePermissionDenied = useCallback(() => setVoiceMode(false), [])

  if (state.isComplete) return null

  const isPaused    = state.pausedAt != null
  const remaining   = getRemainingMs(state)
  const timeExpired = remaining === 0
  const step        = state.steps[state.currentStepIndex]

  const ayahNumbers = step.ayahIndices.map(i => AYAAT[i].number)
  const pages = Array.from(new Set(step.ayahIndices.map(i => AYAAT[i].page)))
  const ayahLabel   = ayahNumbers.length === 1
    ? `Ayah ${ayahNumbers[0]}`
    : `Ayaat ${ayahNumbers[0]}–${ayahNumbers[ayahNumbers.length - 1]}`

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-stone-50 border-b border-gray-100" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <span className="text-xs text-gray-400 uppercase tracking-wider">Soera 13 · {ayahLabel}</span>
        <button
          onClick={handlePause}
          className="text-sm text-emerald-700 font-medium px-3 py-1 rounded-lg bg-emerald-50"
        >
          {isPaused ? 'Hervat' : 'Pauze'}
        </button>
      </div>

      {/* Status */}
      <div className="px-6 pt-5 pb-2 text-center">
        <p className="text-sm font-medium text-gray-500">{stepLabel(step, state.config)}</p>
      </div>

      {/* Warsh mushaf page image(s) */}
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-3">
        {pages.map(page => (
          <img
            key={page}
            src={warshPageUrl(page)}
            alt={`Warsh pagina ${page}`}
            className="w-full rounded-lg shadow-sm border border-gray-100"
          />
        ))}
      </div>

      {/* Input area */}
      <div className="px-6 pb-8 space-y-4">
        {timeExpired && (
          <p className="text-center text-sm text-amber-600 font-medium">
            Tijd is om — voltooi de huidige stap
          </p>
        )}

        {isPaused ? (
          <p className="text-center text-gray-400 text-sm">Sessie gepauzeerd</p>
        ) : voiceMode ? (
          <div className="flex flex-col items-center gap-4">
            <VoiceIndicator
              stepIndex={state.currentStepIndex}
              active={!isPaused}
              onComplete={handleMarkComplete}
              onPermissionDenied={handleVoicePermissionDenied}
            />
            <button
              onClick={handleMarkComplete}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 text-sm"
            >
              Klaar (handmatig)
            </button>
          </div>
        ) : (
          <button
            onClick={handleMarkComplete}
            className="w-full py-5 rounded-2xl bg-emerald-600 text-white text-xl font-semibold shadow-md active:scale-95 transition-transform"
          >
            Klaar
          </button>
        )}

        {/* Timer */}
        <div className="flex justify-center">
          <span className={`text-sm tabular-nums font-medium ${timeExpired ? 'text-amber-500' : 'text-gray-400'}`}>
            {timeExpired ? 'Tijd verstreken' : fmtMs(remaining)}
          </span>
        </div>
      </div>
    </div>
  )
}
