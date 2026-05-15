'use client'

interface Props {
  ayaatCompleted: number
  totalSeconds: number
  onNewSession: () => void
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function DoneScreen({ ayaatCompleted, totalSeconds, onNewSession }: Props) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 gap-8">
      <div className="text-center space-y-2">
        <div className="text-6xl">🌿</div>
        <h2 className="text-2xl font-semibold text-gray-900">Sessie voltooid</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full max-w-xs space-y-4">
        <Stat label="Ayaat geleerd" value={String(ayaatCompleted)} />
        <Stat label="Tijd besteed" value={fmt(totalSeconds)} />
      </div>

      <button
        onClick={onNewSession}
        className="w-full max-w-xs py-4 rounded-2xl bg-emerald-600 text-white text-lg font-semibold shadow-md active:scale-95 transition-transform"
      >
        Nieuwe sessie
      </button>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-900 font-semibold text-lg">{value}</span>
    </div>
  )
}
