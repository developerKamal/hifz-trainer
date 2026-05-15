'use client'

import { useState } from 'react'
import type { SessionConfig } from '@/lib/sessionEngine'
import { TOTAL_AYAAT } from '@/lib/ayaat'

interface Props {
  onStart: (config: SessionConfig) => void
  savedSession: boolean
  onResume: () => void
}

function Slider({
  label, value, min, max, onChange, format,
}: {
  label: string; value: number; min: number; max: number
  onChange: (v: number) => void; format?: (v: number) => string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm text-gray-500">
        <span>{label}</span>
        <span className="font-medium text-gray-800">{format ? format(value) : value}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-emerald-600"
      />
    </div>
  )
}

export default function SetupScreen({ onStart, savedSession, onResume }: Props) {
  const [startAyah, setStartAyah] = useState(1)
  const [endAyah,   setEndAyah]   = useState(3)
  const [reps,      setReps]      = useState(5)
  const [duration,  setDuration]  = useState(25)
  const [mode,      setMode]      = useState<'tap' | 'voice'>('tap')

  function handleStart() {
    onStart({ startAyah, endAyah, repsPerAyah: reps, durationMinutes: duration, inputMode: mode })
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">Hifz Trainer</h1>
          <p className="text-sm text-gray-500">Soera Ar-Ra'd · ayaat 35–43</p>
        </div>

        {savedSession && (
          <button
            onClick={onResume}
            className="w-full py-3 rounded-xl border-2 border-emerald-600 text-emerald-700 font-medium"
          >
            Doorgaan met vorige sessie
          </button>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-6">
          <div className="space-y-4">
            <Slider
              label="Begin ayah"
              value={startAyah} min={1} max={TOTAL_AYAAT}
              onChange={v => { setStartAyah(v); if (v > endAyah) setEndAyah(v) }}
            />
            <Slider
              label="Eind ayah"
              value={endAyah} min={startAyah} max={TOTAL_AYAAT}
              onChange={setEndAyah}
            />
            <Slider
              label="Herhalingen per ayah"
              value={reps} min={1} max={10}
              onChange={setReps}
            />
            <Slider
              label="Sessieduur"
              value={duration} min={5} max={60}
              onChange={setDuration}
              format={v => `${v} min`}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500">Invoermodus</p>
            <div className="grid grid-cols-2 gap-2">
              {(['tap', 'voice'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-2 rounded-xl text-sm font-medium border transition-colors ${
                    mode === m
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {m === 'tap' ? 'Tik (Klaar)' : 'Stem'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-emerald-600 text-white text-lg font-semibold shadow-md active:scale-95 transition-transform"
        >
          Start sessie
        </button>
      </div>
    </div>
  )
}
