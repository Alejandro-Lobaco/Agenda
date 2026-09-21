import { useState } from 'react'
import { COMUN_SPACES, SPACES, type NewTask, type Priority, type Scope, type Space } from '../types'

export function TaskForm({
  defaultScope,
  defaultSpace,
  onAdd,
  onClose,
}: {
  defaultScope: Scope
  defaultSpace: Space
  onAdd: (task: NewTask) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [scope, setScope] = useState<Scope>(defaultScope)
  const [space, setSpace] = useState<Space>(defaultSpace === 'instituto' && defaultScope === 'comun' ? 'empresa' : defaultSpace)
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Priority>('media')

  const availableSpaces = scope === 'comun' ? COMUN_SPACES : SPACES

  function handleScopeChange(next: Scope) {
    setScope(next)
    if (next === 'comun' && space === 'instituto') setSpace('empresa')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), scope, space, due_date: dueDate || null, priority })
    onClose()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed inset-x-0 bottom-0 z-20 rounded-t-2xl border-t border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="mx-auto max-w-md space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Nueva tarea</h2>
          <button type="button" onClick={onClose} className="text-neutral-400">
            ✕
          </button>
        </div>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué hay que hacer?"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
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
          Añadir
        </button>
      </div>
    </form>
  )
}
