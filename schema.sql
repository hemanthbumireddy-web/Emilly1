-- Saved comparisons only; current bank rates are fetched from official bank pages.
create table if not exists public.saved_comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  loan_ids uuid[] not null,
  amount numeric not null,
  tenure_months int not null,
  created_at timestamptz not null default now()
);

alter table public.saved_comparisons enable row level security;

drop policy if exists "Users can select own comparisons" on public.saved_comparisons;
drop policy if exists "Users can insert own comparisons" on public.saved_comparisons;
drop policy if exists "Users can delete own comparisons" on public.saved_comparisons;

create policy "Users can select own comparisons"
  on public.saved_comparisons for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own comparisons"
  on public.saved_comparisons for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own comparisons"
  on public.saved_comparisons for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, delete on public.saved_comparisons to authenticated;
