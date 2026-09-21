import { useMemo, useState } from 'react'
import { SetupNotice } from './components/SetupNotice'
import { SpaceTabs, type View } from './components/SpaceTabs'
import { TaskForm } from './components/TaskForm'
import { TaskItem } from './components/TaskItem'
import { useTasks } from './hooks/useTasks'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { SPACES, type Space } from './types'

function App() {
  const [view, setView] = useState<View>('hoy')
  const [showForm, setShowForm] = useState(false)
  const [hideDone, setHideDone] = useState(true)
  const { tasks, loading, error, addTask, toggleTask, deleteTask } = useTasks()

  const visibleTasks = useMemo(() => {
    let list = tasks
    if (view !== 'hoy') list = list.filter((t) => t.space === view)
    if (hideDone) list = list.filter((t) => !t.done)

    if (view === 'hoy') {
      // "Hoy": lo vencido/hoy primero, luego el resto por prioridad
      const todayStr = new Date().toISOString().slice(0, 10)
      list = [...list].sort((a, b) => {
        const aUrgent = a.due_date && a.due_date <= todayStr ? 0 : 1
        const bUrgent = b.due_date && b.due_date <= todayStr ? 0 : 1
        return aUrgent - bUrgent
      })
    }
    return list
  }, [tasks, view, hideDone])

  if (!isSupabaseConfigured) return <SetupNotice />

  return (
    <div className="mx-auto min-h-screen max-w-md bg-neutral-50 pb-24 dark:bg-neutral-950">
      <header className="px-4 pb-3 pt-6">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Mi Agenda</h1>
        <p className="text-sm text-neutral-500">Instituto, empresa y proyectos, todo en un sitio.</p>
      </header>

      <SpaceTabs active={view} onChange={setView} />

      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs text-neutral-500">
          {visibleTasks.length} tarea{visibleTasks.length === 1 ? '' : 's'}
        </span>
        <label className="flex items-center gap-1.5 text-xs text-neutral-500">
          <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
          Ocultar hechas
        </label>
      </div>

      <main className="px-4">
        {loading && <p className="mt-8 text-center text-sm text-neutral-400">Cargando…</p>}
        {error && <p className="mt-8 text-center text-sm text-red-500">{error}</p>}

        {!loading && visibleTasks.length === 0 && (
          <p className="mt-8 text-center text-sm text-neutral-400">Nada por aquí. ¡Buen trabajo! 🎉</p>
        )}

        <ul className="space-y-2">
          {visibleTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              showSpace={view === 'hoy'}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          ))}
        </ul>
      </main>

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-2xl text-white shadow-lg"
        aria-label="Añadir tarea"
      >
        +
      </button>

      {showForm && (
        <TaskForm
          defaultSpace={view === 'hoy' ? SPACES[0].id : (view as Space)}
          onAdd={addTask}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

export default App
