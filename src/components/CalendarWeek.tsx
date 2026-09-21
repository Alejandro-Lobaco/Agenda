import { AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import { TaskItem } from './TaskItem'
import type { Task } from '../types'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

function toDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfWeek(offsetWeeks: number) {
  const now = new Date()
  const dow = now.getDay() // 0 = domingo
  const diffToMonday = dow === 0 ? -6 : 1 - dow
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  monday.setDate(monday.getDate() + diffToMonday + offsetWeeks * 7)
  return monday
}

export function CalendarWeek({
  tasks,
  onToggle,
  onDelete,
  onEdit,
  onOpenComments,
}: {
  tasks: Task[]
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  onOpenComments?: (task: Task) => void
}) {
  const [weekOffset, setWeekOffset] = useState(0)

  const days = useMemo(() => {
    const monday = startOfWeek(weekOffset)
    const todayStr = toDateStr(new Date())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dateStr = toDateStr(d)
      return {
        dateStr,
        weekday: WEEKDAYS[i],
        dayNumber: d.getDate(),
        month: MONTHS[d.getMonth()],
        isToday: dateStr === todayStr,
        tasks: tasks.filter((t) => t.due_date === dateStr),
      }
    })
  }, [weekOffset, tasks])

  const rangeLabel = `${days[0].dayNumber} ${days[0].month} – ${days[6].dayNumber} ${days[6].month}`

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          aria-label="Semana anterior"
          className="rounded-full px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          ‹
        </button>
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{rangeLabel}</p>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="text-xs text-violet-600 underline">
              Ir a hoy
            </button>
          )}
        </div>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          aria-label="Semana siguiente"
          className="rounded-full px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          ›
        </button>
      </div>

      <div className="space-y-4 px-4">
        {days.map((day) => (
          <div key={day.dateStr}>
            <h2
              className={`mb-1.5 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide ${
                day.isToday ? 'text-violet-600' : 'text-neutral-400'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  day.isToday ? 'bg-violet-600 text-white' : ''
                }`}
              >
                {day.dayNumber}
              </span>
              {day.weekday}
            </h2>
            {day.tasks.length === 0 ? (
              <p className="px-1 text-xs text-neutral-400">Nada</p>
            ) : (
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {day.tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      showSpace
                      showAuthor={task.scope === 'comun'}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onOpenComments={onOpenComments}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
