import { SPACES, type Task } from '../types'

const PRIORITY_STYLES: Record<Task['priority'], string> = {
  alta: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  media: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  baja: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function TaskItem({
  task,
  showSpace,
  showAuthor,
  onToggle,
  onDelete,
}: {
  task: Task
  showSpace?: boolean
  showAuthor?: boolean
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
}) {
  const space = SPACES.find((s) => s.id === task.space)

  return (
    <li className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
      <button
        onClick={() => onToggle(task.id, !task.done)}
        aria-label={task.done ? 'Marcar como pendiente' : 'Marcar como hecha'}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
          task.done
            ? 'border-violet-600 bg-violet-600 text-white'
            : 'border-neutral-300 dark:border-neutral-600'
        }`}
      >
        {task.done ? '✓' : ''}
      </button>

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${task.done ? 'text-neutral-400 line-through' : 'text-neutral-900 dark:text-neutral-100'}`}>
          {task.title}
        </p>
        {task.notes && <p className="mt-0.5 text-xs text-neutral-500">{task.notes}</p>}
        {showAuthor && (
          <p className="mt-0.5 text-xs text-neutral-400">Añadida por {task.created_by_email}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {showSpace && space && (
            <span className={`rounded-full px-2 py-0.5 text-xs ${space.accent}`}>
              {space.emoji} {space.label}
            </span>
          )}
          {task.due_date && (
            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
              📅 {formatDate(task.due_date)}
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${PRIORITY_STYLES[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        aria-label="Eliminar tarea"
        className="shrink-0 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800"
      >
        ✕
      </button>
    </li>
  )
}
