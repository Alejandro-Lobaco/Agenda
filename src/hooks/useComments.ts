import type { User } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Comment } from '../types'

export function useComments(taskId: string | null) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!supabase || !taskId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })

    if (error) setError(error.message)
    else setComments(data as Comment[])
    setLoading(false)
  }, [taskId])

  useEffect(() => {
    if (!taskId) {
      setComments([])
      return
    }
    fetchComments()

    if (!supabase) return
    const client = supabase
    const channel = client
      .channel(`comments-${taskId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_comments', filter: `task_id=eq.${taskId}` },
        fetchComments,
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [taskId, fetchComments])

  const addComment = useCallback(
    async (body: string, user: User) => {
      if (!supabase || !taskId || !body.trim()) return
      const { error } = await supabase.from('task_comments').insert({
        task_id: taskId,
        user_id: user.id,
        author_email: user.email,
        body: body.trim(),
      })
      if (error) setError(error.message)
      else fetchComments()
    },
    [taskId, fetchComments],
  )

  const deleteComment = useCallback(
    async (id: string) => {
      if (!supabase) return
      setComments((prev) => prev.filter((c) => c.id !== id))
      const { error } = await supabase.from('task_comments').delete().eq('id', id)
      if (error) setError(error.message)
    },
    [],
  )

  return { comments, loading, error, addComment, deleteComment }
}
