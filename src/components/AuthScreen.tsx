import { useState } from 'react'

export function AuthScreen({
  onSignIn,
  onSignUp,
}: {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>
  onSignUp: (email: string, password: string) => Promise<{ error: string | null }>
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)

    const result = mode === 'signin' ? await onSignIn(email, password) : await onSignUp(email, password)

    if (result.error) {
      setError(result.error)
    } else if (mode === 'signup') {
      setInfo('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.')
    }
    setSubmitting(false)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Mi Agenda</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {mode === 'signin' ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {info && <p className="text-sm text-emerald-600">{info}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === 'signin' ? 'signup' : 'signin')
          setError(null)
          setInfo(null)
        }}
        className="mt-4 text-center text-sm text-neutral-500"
      >
        {mode === 'signin' ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </div>
  )
}
