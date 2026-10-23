-- Painel administrativo da West Car
-- A conta autorizada é criada no Supabase Auth e vinculada a admin_users.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

revoke all on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to authenticated;

create policy "Admins can verify their own access"
  on public.admin_users
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update on table public.vehicles to authenticated;

create policy "Authenticated catalog access"
  on public.vehicles
  for select
  to authenticated
  using (
    available = true
    or exists (
      select 1 from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  );

create policy "Admins can create vehicles"
  on public.vehicles
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  );

create policy "Admins can update vehicles"
  on public.vehicles
  for update
  to authenticated
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-images',
  'vehicle-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins can list vehicle images"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'vehicle-images'
    and exists (
      select 1 from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  );

create policy "Admins can upload vehicle images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'vehicle-images'
    and (storage.foldername(name))[1] is not null
    and storage.extension(name) in ('jpg', 'jpeg', 'png', 'webp')
    and exists (
      select 1 from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  );

create policy "Admins can update vehicle images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'vehicle-images'
    and exists (
      select 1 from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'vehicle-images'
    and storage.extension(name) in ('jpg', 'jpeg', 'png', 'webp')
    and exists (
      select 1 from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  );

create policy "Admins can delete vehicle images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'vehicle-images'
    and exists (
      select 1 from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  );
