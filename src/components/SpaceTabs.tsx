import { SPACES, type Space } from '../types'

type View = Space | 'hoy' | 'comun' | 'calendario'

const TABS: { id: View; label: string; emoji: string }[] = [
  { id: 'hoy', label: 'Hoy', emoji: '⭐️' },
  { id: 'calendario', label: 'Calendario', emoji: '📅' },
  ...SPACES,
  { id: 'comun', label: 'Común', emoji: '👥' },
]

export function SpaceTabs({ active, onChange }: { active: View; onChange: (v: View) => void }) {
  return (
    <nav className="flex gap-2 overflow-x-auto px-4 pb-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            active === tab.id
              ? 'bg-violet-600 text-white'
              : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
          }`}
        >
          {tab.emoji} {tab.label}
        </button>
      ))}
    </nav>
  )
}

export type { View }
