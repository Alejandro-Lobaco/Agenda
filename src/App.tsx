import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { AuthScreen } from './components/AuthScreen'
import { CalendarWeek } from './components/CalendarWeek'
import { CommentsSheet } from './components/CommentsSheet'
import { SetupNotice } from './components/SetupNotice'
import { SpaceTabs, type View } from './components/SpaceTabs'
import { TaskForm } from './components/TaskForm'
import { TaskItem } from './components/TaskItem'
import { useAuth } from './hooks/useAuth'
import { useComments } from './hooks/useComments'
import { usePushNotifications } from './hooks/usePushNotifications'
import { useTasks } from './hooks/useTasks'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { SPACES, type Task } from './types'

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const [view, setView] = useState<View>('hoy')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [hideDone, setHideDone] = useState(true)
  const [search, setSearch] = useState('')
  const [commentsTask, setCommentsTask] = useState<Task | null>(null)
  const { tasks, loading, error, addTask, editTask, toggleTask, deleteTask } = useTasks(user)
  const push = usePushNotifications(user)
  const { comments, loading: commentsLoading, addComment, deleteComment } = useComments(commentsTask?.id ?? null)

  const visibleTasks = useMemo(() => {
    let list = tasks.filter((t) => (view === 'comun' ? t.scope === 'comun' : t.scope === 'personal'))
    if (view !== 'hoy' && view !== 'comun') list = list.filter((t) => t.space === view)
    if (hideDone) list = list.filter((t) => !t.done)

    const query = search.trim().toLowerCase()
    if (query) {
      list = list.filter(
        (t) => t.title.toLowerCase().includes(query) || (t.notes ?? '').toLowerCase().includes(query),
      )
    }

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
  }, [tasks, view, hideDone, search])

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

  function openEdit(task: Task) {
    setEditingTask(task)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingTask(null)
  }

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

      {view !== 'calendario' && (
        <>
          <div className="relative px-4 pb-2">
            <span className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
              🔍
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tareas..."
              className="w-full rounded-lg border border-neutral-200 py-2 pl-8 pr-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>

          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs text-neutral-500">
              {visibleTasks.length} tarea{visibleTasks.length === 1 ? '' : 's'}
            </span>
            <label className="flex items-center gap-1.5 text-xs text-neutral-500">
              <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
              Ocultar hechas
            </label>
          </div>
        </>
      )}

      {loading && <p className="mt-8 text-center text-sm text-neutral-400">Cargando…</p>}
      {error && <p className="mt-8 text-center text-sm text-red-500">{error}</p>}

      {view === 'calendario' ? (
        <CalendarWeek
          tasks={tasks}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onEdit={openEdit}
          onOpenComments={setCommentsTask}
        />
      ) : (
      <main className="px-4">
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
                  <AnimatePresence initial={false}>
                    {groupTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        showSpace
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                        onEdit={openEdit}
                        onOpenComments={setCommentsTask}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {visibleTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  showSpace={view === 'hoy'}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onEdit={openEdit}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </main>
      )}

      <motion.button
        onClick={() => setShowForm(true)}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-2xl text-white shadow-lg"
        aria-label="Añadir tarea"
      >
        +
      </motion.button>

      <AnimatePresence>
        {showForm && (
          <TaskForm
            defaultScope={view === 'comun' ? 'comun' : 'personal'}
            defaultSpace={view === 'instituto' || view === 'empresa' || view === 'proyectos' ? view : SPACES[0].id}
            editingTask={editingTask}
            onAdd={addTask}
            onEdit={editTask}
            onClose={closeForm}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {commentsTask && (
          <CommentsSheet
            task={commentsTask}
            user={user}
            comments={comments}
            loading={commentsLoading}
            onAdd={addComment}
            onDelete={deleteComment}
            onClose={() => setCommentsTask(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
