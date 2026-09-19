-- Stella database foundation. Apply through Supabase migrations after configuring credentials.
create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  role text not null default 'client' check (role in ('client', 'translator', 'admin')),
  phone text,
  company text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists translator_profiles (id uuid primary key references profiles(id) on delete cascade, description text, languages text[], specializations text[], experience text, education text, status text default 'pending', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists services (id uuid primary key default uuid_generate_v4(), title text not null, slug text unique not null, description text, active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists orders (id uuid primary key default uuid_generate_v4(), client_id uuid not null references profiles(id), translator_id uuid references profiles(id), service_id uuid references services(id), service_name text, source_language text, target_language text, deadline date, status text default 'new', price numeric, comment text, created_at timestamptz default now(), updated_at timestamptz default now());
alter table orders add column if not exists service_name text;
create table if not exists order_files (id uuid primary key default uuid_generate_v4(), order_id uuid not null references orders(id) on delete cascade, path text not null, filename text not null, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists translator_applications (id uuid primary key default uuid_generate_v4(), profile_id uuid references profiles(id), data jsonb not null, status text default 'pending', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists messages (id uuid primary key default uuid_generate_v4(), sender_id uuid references profiles(id), recipient_id uuid references profiles(id), order_id uuid references orders(id), body text not null, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists contact_messages (id uuid primary key default uuid_generate_v4(), name text not null, email text not null, phone text, message text not null, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists notifications (id uuid primary key default uuid_generate_v4(), profile_id uuid references profiles(id) on delete cascade, title text not null, body text, read_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    case when new.raw_user_meta_data ->> 'role' = 'translator' then 'translator' else 'client' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.translator_profiles to authenticated;
grant select, insert, update, delete on table public.orders to authenticated;
grant select, insert, update, delete on table public.order_files to authenticated;
grant select, insert, update, delete on table public.translator_applications to authenticated;
grant select, insert, update, delete on table public.messages to authenticated;
grant select, insert, update, delete on table public.contact_messages to authenticated;
grant select, insert, update, delete on table public.notifications to authenticated;

alter table profiles enable row level security;
alter table translator_profiles enable row level security;
alter table services enable row level security;
alter table orders enable row level security;
alter table order_files enable row level security;
alter table translator_applications enable row level security;
alter table messages enable row level security;
alter table contact_messages enable row level security;
alter table notifications enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;

drop policy if exists "profiles self access" on profiles;
drop policy if exists "profiles self insert" on profiles;
drop policy if exists "profiles self update" on profiles;
drop policy if exists "profiles self delete" on profiles;
drop policy if exists "admins manage profiles" on profiles;
drop policy if exists "public active services" on services;
drop policy if exists "admins manage services" on services;
drop policy if exists "clients own orders" on orders;
drop policy if exists "participants read orders" on orders;
drop policy if exists "clients create orders" on orders;
drop policy if exists "admins manage orders" on orders;
drop policy if exists "assigned translator updates orders" on orders;
drop policy if exists "order files participants" on order_files;
drop policy if exists "participants upload order files" on order_files;
drop policy if exists "translator profiles public read" on translator_profiles;
drop policy if exists "translator owns profile" on translator_profiles;
drop policy if exists "translator edits profile" on translator_profiles;
drop policy if exists "admins manage translator profiles" on translator_profiles;
drop policy if exists "translator applications own" on translator_applications;
drop policy if exists "participants read messages" on messages;
drop policy if exists "participants send messages" on messages;
drop policy if exists "admins read contact messages" on contact_messages;
drop policy if exists "public create contact messages" on contact_messages;
drop policy if exists "own notifications" on notifications;
create policy "profiles self access" on profiles for select using (auth.uid() = id);
create policy "profiles self insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles self update" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles self delete" on profiles for delete using (auth.uid() = id);
create policy "admins manage profiles" on profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "public active services" on services for select using (active = true or public.is_admin());
create policy "admins manage services" on services for all using (public.is_admin()) with check (public.is_admin());
create policy "participants read orders" on orders for select using (auth.uid() = client_id or auth.uid() = translator_id or public.is_admin());
create policy "clients create orders" on orders for insert with check (auth.uid() = client_id);
create policy "admins manage orders" on orders for all using (public.is_admin()) with check (public.is_admin());
create policy "assigned translator updates orders" on orders for update using (auth.uid() = translator_id) with check (auth.uid() = translator_id);

-- Admin order workspace: the authenticated role needs table privileges as well as RLS policies.
grant select, insert, update, delete on table public.orders to authenticated;
drop policy if exists "admin orders select" on orders;
drop policy if exists "admin orders insert" on orders;
drop policy if exists "admin orders update" on orders;
drop policy if exists "admin orders delete" on orders;
create policy "admin orders select" on orders for select to authenticated using (public.is_admin());
create policy "admin orders insert" on orders for insert to authenticated with check (public.is_admin());
create policy "admin orders update" on orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin orders delete" on orders for delete to authenticated using (public.is_admin());
create policy "order files participants" on order_files for select using (exists (select 1 from orders where orders.id = order_files.order_id and (orders.client_id = auth.uid() or orders.translator_id = auth.uid() or public.is_admin())));
create policy "participants upload order files" on order_files for insert with check (exists (select 1 from orders where orders.id = order_files.order_id and (orders.client_id = auth.uid() or orders.translator_id = auth.uid() or public.is_admin())));
create policy "translator profiles public read" on translator_profiles for select using (true);
create policy "translator owns profile" on translator_profiles for insert with check (auth.uid() = id and exists (select 1 from profiles where id = auth.uid() and role = 'translator'));
create policy "translator edits profile" on translator_profiles for update using (auth.uid() = id);
create policy "admins manage translator profiles" on translator_profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "translator applications own" on translator_applications for all using (profile_id = auth.uid() or public.is_admin()) with check (profile_id = auth.uid() or public.is_admin());
create policy "participants read messages" on messages for select using (sender_id = auth.uid() or recipient_id = auth.uid() or public.is_admin());
create policy "participants send messages" on messages for insert with check (sender_id = auth.uid());
create policy "admins read contact messages" on contact_messages for select using (public.is_admin());
create policy "public create contact messages" on contact_messages for insert with check (true);
create policy "own notifications" on notifications for select using (profile_id = auth.uid() or public.is_admin());

insert into storage.buckets (id, name, public)
values ('order-files', 'order-files', false)
on conflict (id) do nothing;

drop policy if exists "order files participant read" on storage.objects;
drop policy if exists "order files participant upload" on storage.objects;
create policy "order files participant read" on storage.objects for select using (
  bucket_id = 'order-files' and (
    public.is_admin() or
    exists (select 1 from public.order_files f join public.orders o on o.id = f.order_id where f.path = name and (o.client_id = auth.uid() or o.translator_id = auth.uid()))
  )
);
create policy "order files participant upload" on storage.objects for insert with check (
  bucket_id = 'order-files' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
);

select to_regclass('public.orders') as orders_table,
       relrowsecurity as orders_rls_enabled
from pg_class
where oid = 'public.orders'::regclass;
