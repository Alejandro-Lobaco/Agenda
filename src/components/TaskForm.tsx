import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { COMUN_SPACES, SPACES, type NewTask, type Priority, type Scope, type Space, type Task } from '../types'

export function TaskForm({
  defaultScope,
  defaultSpace,
  editingTask,
  onAdd,
  onEdit,
  onClose,
}: {
  defaultScope: Scope
  defaultSpace: Space
  editingTask?: Task | null
  onAdd: (task: NewTask) => void
  onEdit: (id: string, task: NewTask) => void
  onClose: () => void
}) {
  const isEditing = Boolean(editingTask)
  const [title, setTitle] = useState(editingTask?.title ?? '')
  const [notes, setNotes] = useState(editingTask?.notes ?? '')
  const [scope, setScope] = useState<Scope>(editingTask?.scope ?? defaultScope)
  const [space, setSpace] = useState<Space>(
    editingTask?.space ?? (defaultSpace === 'instituto' && defaultScope === 'comun' ? 'empresa' : defaultSpace),
  )
  const [dueDate, setDueDate] = useState(editingTask?.due_date ?? '')
  const [priority, setPriority] = useState<Priority>(editingTask?.priority ?? 'media')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const hasFocused = useRef(false)

  const availableSpaces = scope === 'comun' ? COMUN_SPACES : SPACES

  function handleScopeChange(next: Scope) {
    setScope(next)
    if (next === 'comun' && space === 'instituto') setSpace('empresa')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const payload: NewTask = {
      title: title.trim(),
      notes: notes.trim() || null,
      scope,
      space,
      due_date: dueDate || null,
      priority,
    }
    if (isEditing && editingTask) onEdit(editingTask.id, payload)
    else onAdd(payload)
    onClose()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-10 bg-black/30"
      />
      <motion.form
        onSubmit={handleSubmit}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 38 }}
        onAnimationComplete={() => {
          if (hasFocused.current) return
          hasFocused.current = true
          titleInputRef.current?.focus()
        }}
        className="fixed inset-x-0 bottom-0 z-20 rounded-t-2xl border-t border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
      >
      <div className="mx-auto max-w-md space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{isEditing ? 'Editar tarea' : 'Nueva tarea'}</h2>
          <button type="button" onClick={onClose} className="text-neutral-400">
            ✕
          </button>
        </div>

        <input
          ref={titleInputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué hay que hacer?"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas (opcional)"
          rows={2}
          className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />

        <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700">
          <input
            type="checkbox"
            checked={scope === 'comun'}
            onChange={(e) => handleScopeChange(e.target.checked ? 'comun' : 'personal')}
          />
          👥 Compartir con el equipo (espacio Común)
        </label>

        <div className="flex gap-2">
          <select
            value={space}
            onChange={(e) => setSpace(e.target.value as Space)}
            className="flex-1 rounded-lg border border-neutral-200 px-2 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          >
            {availableSpaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.emoji} {s.label}
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="flex-1 rounded-lg border border-neutral-200 px-2 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          >
            <option value="baja">Prioridad baja</option>
            <option value="media">Prioridad media</option>
            <option value="alta">Prioridad alta</option>
          </select>
        </div>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-medium text-white"
        >
          {isEditing ? 'Guardar' : 'Añadir'}
        </button>
      </div>
      </motion.form>
    </>
  )
}
