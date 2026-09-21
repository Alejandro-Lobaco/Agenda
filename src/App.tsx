import { useMemo, useState } from 'react'
import { AuthScreen } from './components/AuthScreen'
import { SetupNotice } from './components/SetupNotice'
import { SpaceTabs, type View } from './components/SpaceTabs'
import { TaskForm } from './components/TaskForm'
import { TaskItem } from './components/TaskItem'
import { useAuth } from './hooks/useAuth'
import { usePushNotifications } from './hooks/usePushNotifications'
import { useTasks } from './hooks/useTasks'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { SPACES, type Space, type Task } from './types'

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const [view, setView] = useState<View>('hoy')
  const [showForm, setShowForm] = useState(false)
  const [hideDone, setHideDone] = useState(true)
  const { tasks, loading, error, addTask, toggleTask, deleteTask } = useTasks(user)
  const push = usePushNotifications(user)

  const visibleTasks = useMemo(() => {
    let list = tasks.filter((t) => (view === 'comun' ? t.scope === 'comun' : t.scope === 'personal'))
    if (view !== 'hoy' && view !== 'comun') list = list.filter((t) => t.space === view)
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

  const comunGroups = useMemo(() => {
    if (view !== 'comun') return null
    const groups = new Map<string, Task[]>()
    for (const task of visibleTasks) {
      const key = task.created_by_email
      groups.set(key, [...(groups.get(key) ?? []), task])
    }
    return [...groups.entries()].sort(([a], [b]) => {
      if (a === user?.email) return -1
      if (b === user?.email) return 1
      return a.localeCompare(b)
    })
  }, [view, visibleTasks, user?.email])

  if (!isSupabaseConfigured) return <SetupNotice />
  if (authLoading) return null
  if (!user) return <AuthScreen onSignIn={signIn} onSignUp={signUp} />

  return (
    <div className="mx-auto min-h-screen max-w-md bg-neutral-50 pb-24 dark:bg-neutral-950">
      <header className="flex items-start justify-between px-4 pb-3 pt-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Mi Agenda</h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </div>
        <button onClick={signOut} className="mt-1 text-xs text-neutral-400 underline">
          Salir
        </button>
      </header>

      {push.supported && !push.subscribed && (
        <div className="mx-4 mb-2 flex items-center justify-between gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
          <span>🔔 Activa avisos para las fechas límite</span>
          <button onClick={push.subscribe} className="shrink-0 rounded-full bg-violet-600 px-2.5 py-1 font-medium text-white">
            Activar
          </button>
        </div>
      )}
      {push.error && <p className="mx-4 mb-2 text-xs text-red-500">{push.error}</p>}

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

        {view === 'comun' && comunGroups ? (
          <div className="space-y-4">
            {comunGroups.map(([email, groupTasks]) => (
              <div key={email}>
                <h2 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  {email === user.email ? 'Tú' : email}
                </h2>
                <ul className="space-y-2">
                  {groupTasks.map((task) => (
                    <TaskItem key={task.id} task={task} showSpace onToggle={toggleTask} onDelete={deleteTask} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
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
        )}
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
          defaultScope={view === 'comun' ? 'comun' : 'personal'}
          defaultSpace={view === 'hoy' || view === 'comun' ? SPACES[0].id : (view as Space)}
          onAdd={addTask}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

export default App
