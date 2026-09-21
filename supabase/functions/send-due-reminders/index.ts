// Función Edge de Supabase: envía un push a quien tenga tareas que vencen hoy.
// Cómo desplegarla: Supabase Dashboard > Edge Functions > Create a new function
// > nómbrala "send-due-reminders" > pega este código > Deploy.
// Luego, en esa misma función, ve a "Secrets" y añade (valores en el chat,
// no los escribas aquí para no dejarlos guardados en el repositorio):
//   CRON_SECRET
//   VAPID_PUBLIC_KEY
//   VAPID_PRIVATE_KEY
//   VAPID_SUBJECT     = mailto:tu-correo@example.com
// (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY ya los inyecta Supabase solo.)
// Cuando la función esté desplegada, marca "Enforce JWT Verification" como OFF:
// la llama pg_cron, no un usuario logueado, y ya la protegemos con CRON_SECRET.

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const CRON_SECRET = Deno.env.get('CRON_SECRET')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:example@example.com'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const today = new Date().toISOString().slice(0, 10)

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, title, due_date, user_id')
    .eq('due_date', today)
    .eq('done', false)

  if (error) return new Response(error.message, { status: 500 })
  if (!tasks || tasks.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } })
  }

  const userIds = [...new Set(tasks.map((t) => t.user_id))]
  const { data: subs } = await supabase.from('push_subscriptions').select('*').in('user_id', userIds)

  let sent = 0
  for (const task of tasks) {
    const userSubs = (subs ?? []).filter((s) => s.user_id === task.user_id)
    for (const sub of userSubs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({
            title: `Vence hoy: ${task.title}`,
            body: 'Tienes una tarea con fecha límite hoy.',
            url: '/',
          }),
        )
        sent++
      } catch (err) {
        const statusCode = (err as { statusCode?: number })?.statusCode
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        }
      }
    }
  }

  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } })
})
