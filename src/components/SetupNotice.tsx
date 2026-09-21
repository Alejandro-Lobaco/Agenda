export function SetupNotice() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-3xl">🔌</p>
      <h1 className="text-lg font-semibold">Falta conectar Supabase</h1>
      <p className="text-sm text-neutral-500">
        Crea un archivo <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">.env</code> en
        la raíz del proyecto (copia <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">.env.example</code>)
        con tu <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">VITE_SUPABASE_URL</code> y{' '}
        <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">VITE_SUPABASE_ANON_KEY</code>, y reinicia{' '}
        <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">npm run dev</code>.
      </p>
    </div>
  )
}
