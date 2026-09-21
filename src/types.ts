export type Space = 'instituto' | 'empresa' | 'proyectos'

export type Priority = 'baja' | 'media' | 'alta'

export interface Task {
  id: string
  space: Space
  title: string
  notes: string | null
  due_date: string | null // formato 'YYYY-MM-DD'
  priority: Priority
  done: boolean
  created_at: string
}

export interface NewTask {
  space: Space
  title: string
  notes?: string | null
  due_date?: string | null
  priority?: Priority
}

export const SPACES: { id: Space; label: string; emoji: string }[] = [
  { id: 'instituto', label: 'Instituto', emoji: '📚' },
  { id: 'empresa', label: 'Empresa', emoji: '💼' },
  { id: 'proyectos', label: 'Proyectos', emoji: '🛠️' },
]
