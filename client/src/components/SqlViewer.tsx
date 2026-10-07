import React, { useState } from 'react';
import '../styles/SqlViewer.css';

const SQL_SCRIPT = `-- Saved comparisons only; current bank rates are fetched from official bank pages.
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

grant select, insert, delete on public.saved_comparisons to authenticated;`;

export const SqlViewer: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sql-viewer-card">
      <div className="sql-viewer-header">
        <div>
          <h3 className="sql-viewer-title">Saved Comparisons SQL</h3>
          <p className="sql-viewer-desc">
            This script creates the user-scoped table for saved comparisons. Live rates are not seeded or stored here.
          </p>
        </div>
        <button type="button" className="btn-copy-sql" onClick={handleCopy}>
          {copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}
        </button>
      </div>
      <pre className="sql-code-block">{SQL_SCRIPT}</pre>
    </div>
  );
};
