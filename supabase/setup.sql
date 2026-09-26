-- Run this file in the Supabase SQL Editor for the portfolio project.
create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) <= 254 and position('@' in email) > 1),
  subject text not null check (char_length(subject) between 3 and 150),
  message text not null check (char_length(message) between 10 and 3000),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Remove broad API privileges, then grant only the columns needed by the form.
revoke all on table public.contact_messages from anon, authenticated;
grant usage on schema public to anon;
grant insert (name, email, subject, message) on public.contact_messages to anon;

drop policy if exists "Allow anonymous contact submissions" on public.contact_messages;

create policy "Allow anonymous contact submissions"
on public.contact_messages
for insert
to anon
with check (
  char_length(name) between 2 and 100
  and char_length(email) <= 254
  and position('@' in email) > 1
  and char_length(subject) between 3 and 150
  and char_length(message) between 10 and 3000
);

-- No SELECT policy or SELECT grant is created, so anonymous visitors cannot read messages.
