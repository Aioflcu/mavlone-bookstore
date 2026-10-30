-- Messages from the contact page and newsletter signup (server-written only).
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  kind text not null default 'contact',
  handled boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
grant all on public.contact_messages to service_role;
