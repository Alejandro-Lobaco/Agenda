import { motion } from 'framer-motion'
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Comment, Task } from '../types'

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ' · ' +
    d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function CommentsSheet({
  task,
  user,
  comments,
  loading,
  onAdd,
  onDelete,
  onClose,
}: {
  task: Task
  user: User
  comments: Comment[]
  loading: boolean
  onAdd: (body: string, user: User) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [body, setBody] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    onAdd(body, user)
    setBody('')
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
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 38 }}
        className="fixed inset-x-0 bottom-0 z-20 flex max-h-[80vh] flex-col rounded-t-2xl border-t border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="mx-auto flex w-full max-w-md items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800">
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Comentarios</h2>
            <p className="truncate text-xs text-neutral-500">{task.title}</p>
          </div>
          <button onClick={onClose} className="shrink-0 text-neutral-400">
            ✕
          </button>
        </div>

        <div className="mx-auto w-full max-w-md flex-1 space-y-3 overflow-y-auto p-4">
          {loading && <p className="text-center text-xs text-neutral-400">Cargando…</p>}
          {!loading && comments.length === 0 && (
            <p className="text-center text-xs text-neutral-400">Sin comentarios todavía. ¡Sé el primero!</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-800">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {c.user_id === user.id ? 'Tú' : c.author_email}
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-neutral-900 dark:text-neutral-100">
                    {c.body}
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-400">{formatTime(c.created_at)}</p>
                </div>
                {c.user_id === user.id && (
                  <button
                    onClick={() => onDelete(c.id)}
                    aria-label="Borrar comentario"
                    className="shrink-0 text-xs text-neutral-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-md items-center gap-2 border-t border-neutral-100 p-3 dark:border-neutral-800"
        >
          <input
            autoFocus
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Escribe un comentario..."
            className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <button
            type="submit"
            disabled={!body.trim()}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      </motion.div>
    </>
  )
}
