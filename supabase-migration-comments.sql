-- Migración: comentarios en tareas del espacio Común
-- Ejecuta esto en Supabase: Dashboard > SQL Editor > New query > Run

create table if not exists task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_email text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table task_comments enable row level security;

drop policy if exists "select comments on common tasks" on task_comments;
create policy "select comments on common tasks" on task_comments for select
  using (exists (select 1 from tasks t where t.id = task_comments.task_id and t.scope = 'comun'));

drop policy if exists "insert own comment on common tasks" on task_comments;
create policy "insert own comment on common tasks" on task_comments for insert
  with check (
    user_id = auth.uid()
    and exists (select 1 from tasks t where t.id = task_comments.task_id and t.scope = 'comun')
  );

drop policy if exists "delete own comment" on task_comments;
create policy "delete own comment" on task_comments for delete
  using (user_id = auth.uid());

-- Tiempo real (para que los comentarios aparezcan sin recargar), de forma segura
-- aunque se ejecute el script más de una vez.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'task_comments'
  ) then
    execute 'alter publication supabase_realtime add table task_comments';
  end if;
end $$;
