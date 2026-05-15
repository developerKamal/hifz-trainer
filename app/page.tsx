'use client'

import { useEffect, useState } from 'react'
import SetupScreen  from '@/components/SetupScreen'
import SessionScreen from '@/components/SessionScreen'
import DoneScreen   from '@/components/DoneScreen'
import { createSession } from '@/lib/sessionEngine'
import type { SessionConfig, SessionState } from '@/lib/sessionEngine'
import { clearSession, loadSession, saveSession } from '@/lib/storage'

type Screen = 'setup' | 'session' | 'done'

interface DoneInfo { ayaatCompleted: number; totalSeconds: number }

export default function Home() {
  const [screen,      setScreen]      = useState<Screen>('setup')
  const [session,     setSession]     = useState<SessionState | null>(null)
  const [saved,       setSaved]       = useState<SessionState | null>(null)
  const [doneInfo,    setDoneInfo]    = useState<DoneInfo | null>(null)

  useEffect(() => {
    const s = loadSession()
    if (s && !s.isComplete) setSaved(s)
  }, [])

  function handleStart(config: SessionConfig) {
    clearSession()
    const s = createSession(config)
    saveSession(s)
    setSession(s)
    setScreen('session')
  }

  function handleResume() {
    if (!saved) return
    setSession(saved)
    setScreen('session')
  }

  function handleDone(ayaatCompleted: number, totalSeconds: number) {
    setSaved(null)
    setDoneInfo({ ayaatCompleted, totalSeconds })
    setScreen('done')
  }

  function handleNewSession() {
    setScreen('setup')
    setSaved(null)
  }

  if (screen === 'session' && session) {
    return <SessionScreen key={session.startedAt} initialState={session} onDone={handleDone} />
  }

  if (screen === 'done' && doneInfo) {
    return (
      <DoneScreen
        ayaatCompleted={doneInfo.ayaatCompleted}
        totalSeconds={doneInfo.totalSeconds}
        onNewSession={handleNewSession}
      />
    )
  }

  return (
    <SetupScreen
      onStart={handleStart}
      savedSession={saved != null}
      onResume={handleResume}
    />
  )
}
