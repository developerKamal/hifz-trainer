'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  stepIndex: number   // changes with each step → resets detection
  active: boolean
  onComplete: () => void
  onPermissionDenied: () => void
}

const THRESHOLD = 15       // 0–255 average frequency bin
const SPEAK_MS  = 2_000
const SILENCE_MS = 2_000

export default function VoiceIndicator({ stepIndex, active, onComplete, onPermissionDenied }: Props) {
  const [volume, setVolume] = useState(0)
  const [error, setError]   = useState(false)

  const ctxRef        = useRef<AudioContext | null>(null)
  const analyserRef   = useRef<AnalyserNode | null>(null)
  const streamRef     = useRef<MediaStream | null>(null)
  const rafRef        = useRef<number | null>(null)
  const speakStartRef = useRef<number | null>(null)
  const silenceStartRef = useRef<number | null>(null)
  const hasSpokeRef   = useRef(false)
  const firedRef      = useRef(false)

  // Reset detection state on each new step
  useEffect(() => {
    speakStartRef.current  = null
    silenceStartRef.current = null
    hasSpokeRef.current    = false
    firedRef.current       = false
  }, [stepIndex])

  // Set up / tear down the audio pipeline
  useEffect(() => {
    if (!active) return
    let cancelled = false

    async function setup() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }

        streamRef.current = stream
        const ctx = new AudioContext()
        ctxRef.current = ctx
        const src     = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        src.connect(analyser)
        analyserRef.current = analyser

        const data = new Uint8Array(analyser.frequencyBinCount)

        const tick = () => {
          if (cancelled) return
          analyser.getByteFrequencyData(data)
          const avg = data.reduce((a, b) => a + b, 0) / data.length
          setVolume(avg)

          const now      = Date.now()
          const speaking = avg > THRESHOLD

          if (speaking) {
            silenceStartRef.current = null
            if (!speakStartRef.current) speakStartRef.current = now
            if (now - speakStartRef.current >= SPEAK_MS) hasSpokeRef.current = true
          } else {
            speakStartRef.current = null
            if (hasSpokeRef.current) {
              if (!silenceStartRef.current) silenceStartRef.current = now
              if (now - silenceStartRef.current >= SILENCE_MS && !firedRef.current) {
                firedRef.current = true
                onComplete()
              }
            }
          }

          rafRef.current = requestAnimationFrame(tick)
        }

        tick()
      } catch {
        if (!cancelled) {
          setError(true)
          onPermissionDenied()
        }
      }
    }

    setup()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      ctxRef.current?.close()
      ctxRef.current = null
    }
  }, [active, onComplete, onPermissionDenied])

  if (error) return null

  const scale = 0.4 + Math.min(volume / 100, 1) * 1.2

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-14 h-14 rounded-full bg-emerald-500 shadow-lg transition-transform duration-75"
        style={{ transform: `scale(${scale})` }}
      />
      <p className="text-sm text-gray-400">Microfoon actief — spreek na het lezen</p>
    </div>
  )
}
