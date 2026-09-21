-- Migración: login + espacio "Común" compartido con el equipo
-- Ejecuta esto en Supabase: Dashboard > SQL Editor > New query > Run
-- (se puede ejecutar aunque ya tengas la tabla `tasks` del script anterior)

alter table tasks add column if not exists user_id uuid references auth.users(id);
alter table tasks add column if not exists created_by_email text;
alter table tasks add column if not exists scope text not null default 'personal' check (scope in ('personal', 'comun'));

-- Fuera las políticas abiertas de antes
drop policy if exists "allow all - select" on tasks;
drop policy if exists "allow all - insert" on tasks;
drop policy if exists "allow all - update" on tasks;
drop policy if exists "allow all - delete" on tasks;

-- Solo usuarios con sesión iniciada pueden ver/tocar tareas.
-- Las "personales" solo las ve su dueño; las "comun" las ve y edita cualquiera del equipo.
create policy "select own or common" on tasks for select
  using (scope = 'comun' or user_id = auth.uid());

create policy "insert own" on tasks for insert
  with check (user_id = auth.uid());

create policy "update own or common" on tasks for update
  using (scope = 'comun' or user_id = auth.uid());

create policy "delete own or common" on tasks for delete
  using (scope = 'comun' or user_id = auth.uid());

-- Nota: en el espacio "Común" cualquier compañero autenticado puede completar
-- o borrar tareas de otros (como una lista compartida). Si prefieres que cada
-- quien solo pueda tocar lo suyo también ahí, cambia esas dos políticas por
-- "using (user_id = auth.uid())".
