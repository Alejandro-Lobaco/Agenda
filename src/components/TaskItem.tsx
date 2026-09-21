import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { SPACES, type Task } from '../types'

const PRIORITY_STYLES: Record<Task['priority'], string> = {
  alta: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  media: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  baja: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
}

const SWIPE_THRESHOLD = 72

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
  onEdit,
}: {
  task: Task
  showSpace?: boolean
  showAuthor?: boolean
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
}) {
  const space = SPACES.find((s) => s.id === task.space)
  const x = useMotionValue(0)
  const completeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])
  const deleteOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0])

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) onToggle(task.id, !task.done)
    else if (info.offset.x < -SWIPE_THRESHOLD) onDelete(task.id)
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      className="relative"
    >
      <div className="absolute inset-0 flex items-center justify-between rounded-xl bg-neutral-100 px-4 dark:bg-neutral-800">
        <motion.span style={{ opacity: completeOpacity }} className="text-sm font-medium text-emerald-600">
          ✓ {task.done ? 'Pendiente' : 'Hecha'}
        </motion.span>
        <motion.span style={{ opacity: deleteOpacity }} className="text-sm font-medium text-red-600">
          🗑️ Borrar
        </motion.span>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        dragSnapToOrigin
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative z-10 flex touch-pan-y items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
      >
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

        <div className="flex shrink-0 flex-col gap-1">
          <button
            onClick={() => onEdit(task)}
            aria-label="Editar tarea"
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-violet-600 dark:hover:bg-neutral-800"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task.id)}
            aria-label="Eliminar tarea"
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </motion.li>
  )
}
