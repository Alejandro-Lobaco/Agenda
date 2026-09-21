-- Ejecuta esto en Supabase: Dashboard > SQL Editor > New query > Run

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  space text not null check (space in ('instituto', 'empresa', 'proyectos')),
  title text not null,
  notes text,
  due_date date,
  priority text not null default 'media' check (priority in ('baja', 'media', 'alta')),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- Habilita Row Level Security y permite acceso abierto (uso personal, sin login).
-- Si más adelante añades login, cambia estas políticas para filtrar por auth.uid().
alter table tasks enable row level security;

create policy "allow all - select" on tasks for select using (true);
create policy "allow all - insert" on tasks for insert with check (true);
create policy "allow all - update" on tasks for update using (true);
create policy "allow all - delete" on tasks for delete using (true);

-- Habilita las actualizaciones en tiempo real (para que la app se refresque sola)
alter publication supabase_realtime add table tasks;
