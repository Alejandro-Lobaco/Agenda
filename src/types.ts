export type Space = 'instituto' | 'empresa' | 'proyectos'
export type Scope = 'personal' | 'comun'
export type Priority = 'baja' | 'media' | 'alta'

export interface Task {
  id: string
  scope: Scope
  space: Space
  title: string
  notes: string | null
  due_date: string | null // formato 'YYYY-MM-DD'
  priority: Priority
  done: boolean
  created_at: string
  user_id: string
  created_by_email: string
}

export interface NewTask {
  scope: Scope
  space: Space
  title: string
  notes?: string | null
  due_date?: string | null
  priority?: Priority
}

export const SPACES: { id: Space; label: string; emoji: string; accent: string; accentActive: string }[] = [
  { id: 'instituto', label: 'Instituto', emoji: '📚', accent: 'text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-900/30', accentActive: 'bg-sky-600' },
  { id: 'empresa', label: 'Empresa', emoji: '💼', accent: 'text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-900/30', accentActive: 'bg-orange-600' },
  { id: 'proyectos', label: 'Proyectos', emoji: '🛠️', accent: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30', accentActive: 'bg-emerald-600' },
]

// El espacio Común es de equipo: no tiene sentido meter ahí temas de instituto.
export const COMUN_SPACES = SPACES.filter((s) => s.id !== 'instituto')
