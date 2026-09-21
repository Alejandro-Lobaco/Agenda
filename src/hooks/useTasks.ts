import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { NewTask, Task } from '../types'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setTasks(data as Task[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()

    if (!supabase) return
    const client = supabase
    const channel = client
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks()
      })
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [fetchTasks])

  const addTask = useCallback(async (task: NewTask) => {
    if (!supabase) return
    const { error } = await supabase.from('tasks').insert({
      space: task.space,
      title: task.title,
      notes: task.notes ?? null,
      due_date: task.due_date ?? null,
      priority: task.priority ?? 'media',
    })
    if (error) setError(error.message)
    else fetchTasks()
  }, [fetchTasks])

  const toggleTask = useCallback(async (id: string, done: boolean) => {
    if (!supabase) return
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)))
    const { error } = await supabase.from('tasks').update({ done }).eq('id', id)
    if (error) setError(error.message)
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    if (!supabase) return
    setTasks((prev) => prev.filter((t) => t.id !== id))
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) setError(error.message)
  }, [])

  return { tasks, loading, error, addTask, toggleTask, deleteTask }
}
