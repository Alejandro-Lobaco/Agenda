-- Migración: notificaciones push
-- Ejecuta esto en Supabase: Dashboard > SQL Editor > New query > Run

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "manage own subscription" on push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Cron: dispara la función send-due-reminders todos los días a las 07:00 UTC
-- (≈ 08:00/09:00 hora de España según horario de verano/invierno).
-- Antes de ejecutar esto, crea y despliega la función send-due-reminders
-- (ver supabase/functions/send-due-reminders/index.ts) y sustituye
-- <CRON_SECRET> por el mismo valor que pongas como secreto de la función.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'send-due-reminders-daily',
  '0 7 * * *',
  $$
  select net.http_post(
    url := 'https://rytkosebxabwvadgcyfo.supabase.co/functions/v1/send-due-reminders',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', '<CRON_SECRET>'),
    body := '{}'::jsonb
  );
  $$
);
