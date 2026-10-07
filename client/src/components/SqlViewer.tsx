import React, { useState } from 'react';
import '../styles/SqlViewer.css';

const SQL_SCRIPT = `-- ==============================================================================
-- Supabase SQL Schema for Loan Comparison Platform
-- ==============================================================================

-- 1. Create table: loans
create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  bank_name text not null,
  loan_type text not null check (loan_type in ('home', 'personal', 'car', 'education')),
  interest_rate numeric not null,
  min_tenure_months int not null,
  max_tenure_months int not null,
  min_amount numeric not null,
  max_amount numeric not null,
  processing_fee_percent numeric default 0,
  flat_fee numeric default 0,
  prepayment_penalty_percent numeric default 0,
  created_at timestamptz default now()
);

-- 2. Create table: saved_comparisons
create table if not exists public.saved_comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  loan_ids uuid[] not null,
  amount numeric not null,
  tenure_months int not null,
  created_at timestamptz default now()
);

-- 3. Enable Row Level Security (RLS)
alter table public.loans enable row level security;
alter table public.saved_comparisons enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Everyone can read loans" on public.loans;
drop policy if exists "Users can select own comparisons" on public.saved_comparisons;
drop policy if exists "Users can insert own comparisons" on public.saved_comparisons;
drop policy if exists "Users can delete own comparisons" on public.saved_comparisons;

-- 4. RLS Policies
-- Everyone can read loans
create policy "Everyone can read loans"
  on public.loans
  for select
  using (true);

-- Authenticated users can select only their own saved comparisons
create policy "Users can select own comparisons"
  on public.saved_comparisons
  for select
  using (auth.uid() = user_id);

-- Authenticated users can insert only their own saved comparisons
create policy "Users can insert own comparisons"
  on public.saved_comparisons
  for insert
  with check (auth.uid() = user_id);

-- Authenticated users can delete only their own saved comparisons
create policy "Users can delete own comparisons"
  on public.saved_comparisons
  for delete
  using (auth.uid() = user_id);

-- 5. Seed Script: 12 Realistic Loans (3 per loan type)
insert into public.loans (
  bank_name,
  loan_type,
  interest_rate,
  min_tenure_months,
  max_tenure_months,
  min_amount,
  max_amount,
  processing_fee_percent,
  flat_fee,
  prepayment_penalty_percent
) values
  -- Home Loans (3)
  ('HDFC Bank Home Advantage', 'home', 8.50, 12, 360, 500000, 100000000, 0.50, 3000, 0.0),
  ('SBI Regular Home Loan', 'home', 8.40, 12, 360, 300000, 75000000, 0.35, 2000, 0.0),
  ('ICICI Express Home Loan', 'home', 8.75, 12, 300, 500000, 50000000, 0.50, 5000, 2.0),

  -- Personal Loans (3)
  ('Axis Bank Quick Personal', 'personal', 10.49, 12, 60, 50000, 2500000, 1.50, 1000, 3.0),
  ('Citibank Flexi Personal', 'personal', 9.99, 12, 60, 100000, 3000000, 1.00, 1500, 2.5),
  ('Kotak Mahindra Prime Personal', 'personal', 11.25, 12, 72, 50000, 2000000, 2.00, 500, 4.0),

  -- Car Loans (3)
  ('Bank of Baroda Car Loan', 'car', 8.70, 12, 84, 100000, 5000000, 0.75, 1500, 0.0),
  ('HDFC Custom Auto Loan', 'car', 8.95, 12, 84, 150000, 10000000, 0.50, 2500, 1.0),
  ('Punjab National Auto Loan', 'car', 8.65, 12, 84, 100000, 4000000, 0.25, 1000, 0.0),

  -- Education Loans (3)
  ('SBI Student Loan Scheme', 'education', 8.15, 12, 180, 50000, 7500000, 0.00, 0, 0.0),
  ('Axis Bank Education Loan', 'education', 9.50, 12, 180, 100000, 15000000, 1.00, 2000, 0.0),
  ('Avanse Global Education Loan', 'education', 10.25, 12, 144, 200000, 20000000, 1.25, 5000, 2.0);`;

export const SqlViewer: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sql-viewer-card">
      <div className="sql-viewer-header">
        <div>
          <h3 className="sql-viewer-title">Supabase SQL Editor Script</h3>
          <p className="sql-viewer-desc">
            Copy and run this script in your Supabase project's SQL Editor to create tables, RLS policies, and seed 12 realistic loans.
          </p>
        </div>
        <button
          type="button"
          className="btn-copy-sql"
          onClick={handleCopy}
        >
          {copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}
        </button>
      </div>

      <pre className="sql-code-block">{SQL_SCRIPT}</pre>
    </div>
  );
};
