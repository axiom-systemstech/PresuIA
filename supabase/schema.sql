-- PresuIA database
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_name text,
  email text,
  phone text,
  plan text not null default 'free' check (plan in ('free','pro')),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nuevo presupuesto',
  summary text,
  content jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.quotes enable row level security;

drop policy if exists "profiles own select" on public.profiles;
create policy "profiles own select" on public.profiles for select using (auth.uid()=id);
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update using (auth.uid()=id) with check (auth.uid()=id);

drop policy if exists "quotes own select" on public.quotes;
create policy "quotes own select" on public.quotes for select using (auth.uid()=user_id);
drop policy if exists "quotes own insert" on public.quotes;
create policy "quotes own insert" on public.quotes for insert with check (auth.uid()=user_id);
drop policy if exists "quotes own update" on public.quotes;
create policy "quotes own update" on public.quotes for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "quotes own delete" on public.quotes;
create policy "quotes own delete" on public.quotes for delete using (auth.uid()=user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id,email) values (new.id,new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- IMPORTANT: the Stripe webhook uses the service role key server-side only.
-- Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
