-- Sortify initial schema + RLS
-- Run in Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists public.sessions (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	voice text not null check (voice in ('gentle', 'grounded', 'coach')),
	title text,
	status text not null default 'active' check (status in ('active', 'completed', 'abandoned', 'safety_interrupted')),
	started_at timestamptz not null default now(),
	ended_at timestamptz,
	turn_count int not null default 0 check (turn_count >= 0),
	safety_flag boolean not null default false,
	safety_type text,
	model text,
	prompt_version text,
	created_at timestamptz not null default now()
);

create index if not exists sessions_user_created_idx on public.sessions(user_id, created_at desc);

create table if not exists public.messages (
	id uuid primary key default gen_random_uuid(),
	session_id uuid not null references public.sessions(id) on delete cascade,
	role text not null check (role in ('user', 'assistant', 'system')),
	content text not null,
	token_count int,
	latency_ms int,
	created_at timestamptz not null default now()
);

create index if not exists messages_session_created_idx on public.messages(session_id, created_at asc);

create table if not exists public.takeaways (
	id uuid primary key default gen_random_uuid(),
	session_id uuid not null references public.sessions(id) on delete cascade,
	format text not null check (format in ('letter', 'realizations', 'steps')),
	content text not null,
	version int not null default 1 check (version >= 1),
	regenerated_from_message_id uuid references public.messages(id) on delete set null,
	created_at timestamptz not null default now()
);

create index if not exists takeaways_session_created_idx on public.takeaways(session_id, created_at desc);

alter table public.sessions enable row level security;
alter table public.messages enable row level security;
alter table public.takeaways enable row level security;

-- sessions policies
drop policy if exists "sessions_select_own" on public.sessions;
create policy "sessions_select_own"
on public.sessions
for select
using (auth.uid() = user_id);

drop policy if exists "sessions_insert_own" on public.sessions;
create policy "sessions_insert_own"
on public.sessions
for insert
with check (auth.uid() = user_id);

drop policy if exists "sessions_update_own" on public.sessions;
create policy "sessions_update_own"
on public.sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "sessions_delete_own" on public.sessions;
create policy "sessions_delete_own"
on public.sessions
for delete
using (auth.uid() = user_id);

-- messages policies
drop policy if exists "messages_select_own" on public.messages;
create policy "messages_select_own"
on public.messages
for select
using (
	exists (
		select 1
		from public.sessions s
		where s.id = messages.session_id
		  and s.user_id = auth.uid()
	)
);

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own"
on public.messages
for insert
with check (
	exists (
		select 1
		from public.sessions s
		where s.id = messages.session_id
		  and s.user_id = auth.uid()
	)
);

drop policy if exists "messages_update_own" on public.messages;
create policy "messages_update_own"
on public.messages
for update
using (
	exists (
		select 1
		from public.sessions s
		where s.id = messages.session_id
		  and s.user_id = auth.uid()
	)
)
with check (
	exists (
		select 1
		from public.sessions s
		where s.id = messages.session_id
		  and s.user_id = auth.uid()
	)
);

drop policy if exists "messages_delete_own" on public.messages;
create policy "messages_delete_own"
on public.messages
for delete
using (
	exists (
		select 1
		from public.sessions s
		where s.id = messages.session_id
		  and s.user_id = auth.uid()
	)
);

-- takeaways policies
drop policy if exists "takeaways_select_own" on public.takeaways;
create policy "takeaways_select_own"
on public.takeaways
for select
using (
	exists (
		select 1
		from public.sessions s
		where s.id = takeaways.session_id
		  and s.user_id = auth.uid()
	)
);

drop policy if exists "takeaways_insert_own" on public.takeaways;
create policy "takeaways_insert_own"
on public.takeaways
for insert
with check (
	exists (
		select 1
		from public.sessions s
		where s.id = takeaways.session_id
		  and s.user_id = auth.uid()
	)
);

drop policy if exists "takeaways_update_own" on public.takeaways;
create policy "takeaways_update_own"
on public.takeaways
for update
using (
	exists (
		select 1
		from public.sessions s
		where s.id = takeaways.session_id
		  and s.user_id = auth.uid()
	)
)
with check (
	exists (
		select 1
		from public.sessions s
		where s.id = takeaways.session_id
		  and s.user_id = auth.uid()
	)
);

drop policy if exists "takeaways_delete_own" on public.takeaways;
create policy "takeaways_delete_own"
on public.takeaways
for delete
using (
	exists (
		select 1
		from public.sessions s
		where s.id = takeaways.session_id
		  and s.user_id = auth.uid()
	)
);

create table if not exists public.profiles (
	user_id uuid primary key references auth.users(id) on delete cascade,
	display_name text,
	about_me text,
	avatar_path text,
	updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles
for delete
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
	'avatars',
	'avatars',
	true,
	2097152,
	array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
	public = excluded.public,
	file_size_limit = excluded.file_size_limit,
	allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects
for select
using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
on storage.objects
for insert
with check (
	bucket_id = 'avatars'
	and auth.role() = 'authenticated'
	and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
on storage.objects
for update
using (
	bucket_id = 'avatars'
	and auth.role() = 'authenticated'
	and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
	bucket_id = 'avatars'
	and auth.role() = 'authenticated'
	and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
on storage.objects
for delete
using (
	bucket_id = 'avatars'
	and auth.role() = 'authenticated'
	and (storage.foldername(name))[1] = auth.uid()::text
);
