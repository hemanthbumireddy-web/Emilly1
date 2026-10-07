# Loan Comparison & EMI Calculator Platform

A full-stack, logic-focused loan comparison web platform built with Node.js/Express, Vite, React, React Router, Recharts, and Supabase.

---

## 1. Project Overview

The Loan Comparison Platform allows users to:
- Browse and filter verified loans by loan type (Home, Personal, Car, Education) and interest rate range.
- Sort loans by lowest interest rate or lowest processing fee.
- Select between 2 and 4 loans for side-by-side comparison.
- Calculate accurate monthly EMIs, total interest, processing fees, total overall cost, and effective cost percentage.
- View side-by-side comparison tables highlighting the best value for every metric.
- Visualize cost breakdowns (Principal, Total Interest, Fees) using responsive Recharts bar charts.
- View month-by-month loan amortization schedules with a Principal vs. Interest Pie Chart.
- Simulate early payoffs and tenure reductions with a client-side Prepayment Simulator.
- Authenticate via Supabase Auth and save/manage personal loan comparisons secured by PostgreSQL Row Level Security (RLS).

---

## 2. Folder Structure

```
├── client/
│   └── src/
│       ├── components/
│       │   ├── AmortizationModal.jsx     # Month-by-month schedule & pie chart modal
│       │   ├── ComparisonTable.jsx       # Side-by-side metric comparison table
│       │   ├── CostChart.jsx             # Recharts bar chart of total loan costs
│       │   ├── LoanCard.jsx              # Loan card with limits and selection checkbox
│       │   ├── Navbar.jsx                # Global navigation bar with auth status
│       │   ├── PrepaymentSimulator.jsx   # Extra monthly payment payoff simulator
│       │   └── ProtectedRoute.jsx        # Route guard for authenticated views
│       ├── context/
│       │   └── AuthContext.jsx           # React context wrapping Supabase authentication
│       ├── pages/
│       │   ├── Compare.jsx               # Comparison page with inputs, table & chart
│       │   ├── Home.jsx                  # Loan directory, filter & selection page
│       │   ├── Login.jsx                 # Login and Registration form
│       │   └── Saved.jsx                 # Saved comparisons page with load & delete
│       ├── services/
│       │   ├── api.js                    # API client for Express backend endpoints
│       │   └── supabaseClient.js         # Supabase client (auth only)
│       ├── styles/
│       │   ├── AmortizationModal.css
│       │   ├── Compare.css
│       │   ├── ComparisonTable.css
│       │   ├── CostChart.css
│       │   ├── global.css
│       │   ├── Home.css
│       │   ├── LoanCard.css
│       │   ├── Login.css
│       │   ├── Navbar.css
│       │   ├── PrepaymentSimulator.css
│       │   └── Saved.css
│       ├── utils/
│       │   └── loanCalculator.js         # Pure EMI, summary & amortization math (ESM)
│       ├── App.jsx                       # React Router configuration
│       └── main.jsx                      # Client application entry point
├── server/
│   ├── config/
│   │   └── supabase.js                   # Backend Supabase client configuration
│   ├── controllers/
│   │   ├── compareController.js          # POST /api/compare handler
│   │   ├── loanController.js             # GET /api/loans and /api/loans/:id handler
│   │   └── savedController.js            # GET, POST, DELETE /api/saved handlers
│   ├── middleware/
│   │   └── auth.js                       # Supabase JWT authentication middleware
│   ├── routes/
│   │   ├── compareRoutes.js              # /api/compare route definition
│   │   ├── loanRoutes.js                 # /api/loans route definition
│   │   └── savedRoutes.js                # /api/saved route definition
│   ├── services/
│   │   ├── compareService.js             # Comparison validation and best-value logic
│   │   ├── loanCalculator.js             # Pure EMI and summary math (CommonJS)
│   │   ├── loanService.js                # Loan querying, filtering, and sorting
│   │   └── savedService.js               # Saved comparisons database queries
│   └── index.js                          # Express application entry point
├── schema.sql                            # Complete Supabase schema, RLS policies & seed
├── server.ts                             # Development and production unified server entry
├── .env.example                          # Environment variable specifications
└── package.json
```

---

## 3. Supabase Setup Steps

### Step 1: Run SQL in Supabase SQL Editor
1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. In the left navigation, go to **SQL Editor**.
3. Create a new query, paste the contents of `schema.sql`, and click **Run**.

```sql
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

-- 4. RLS Policies
create policy "Everyone can read loans"
  on public.loans for select using (true);

create policy "Users can select own comparisons"
  on public.saved_comparisons for select using (auth.uid() = user_id);

create policy "Users can insert own comparisons"
  on public.saved_comparisons for insert with check (auth.uid() = user_id);

create policy "Users can delete own comparisons"
  on public.saved_comparisons for delete using (auth.uid() = user_id);

-- 5. Seed Script: 12 Realistic Loans (3 per loan type)
insert into public.loans (
  bank_name, loan_type, interest_rate, min_tenure_months, max_tenure_months,
  min_amount, max_amount, processing_fee_percent, flat_fee, prepayment_penalty_percent
) values
  ('HDFC Bank Home Advantage', 'home', 8.50, 12, 360, 500000, 100000000, 0.50, 3000, 0.0),
  ('SBI Regular Home Loan', 'home', 8.40, 12, 360, 300000, 75000000, 0.35, 2000, 0.0),
  ('ICICI Express Home Loan', 'home', 8.75, 12, 300, 500000, 50000000, 0.50, 5000, 2.0),
  ('Axis Bank Quick Personal', 'personal', 10.49, 12, 60, 50000, 2500000, 1.50, 1000, 3.0),
  ('Citibank Flexi Personal', 'personal', 9.99, 12, 60, 100000, 3000000, 1.00, 1500, 2.5),
  ('Kotak Mahindra Prime Personal', 'personal', 11.25, 12, 72, 50000, 2000000, 2.00, 500, 4.0),
  ('Bank of Baroda Car Loan', 'car', 8.70, 12, 84, 100000, 5000000, 0.75, 1500, 0.0),
  ('HDFC Custom Auto Loan', 'car', 8.95, 12, 84, 150000, 10000000, 0.50, 2500, 1.0),
  ('Punjab National Auto Loan', 'car', 8.65, 12, 84, 100000, 4000000, 0.25, 1000, 0.0),
  ('SBI Student Loan Scheme', 'education', 8.15, 12, 180, 50000, 7500000, 0.00, 0, 0.0),
  ('Axis Bank Education Loan', 'education', 9.50, 12, 180, 100000, 15000000, 1.00, 2000, 0.0),
  ('Avanse Global Education Loan', 'education', 10.25, 12, 144, 200000, 20000000, 1.25, 5000, 2.0);
```

### Step 2: Enable Email Authentication
1. In your Supabase Dashboard, go to **Authentication** > **Providers**.
2. Ensure **Email** is turned ON.
3. (Optional for local testing) In **Authentication** > **URL Configuration**, set the Site URL to `http://localhost:3000`. You can also disable "Confirm email" under **Email Auth** if you want instant registration without confirmation emails.

---

## 4. Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```env
# Server Configuration
PORT=3000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Client Configuration (Vite)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Recommendations (Server-Side Only)
GEMINI_API_KEY=your-gemini-api-key
```

---

## 5. Commands to Run

### Install Dependencies
```bash
npm install
```

### Run Full-Stack Development Server (Client + Server on port 3000)
```bash
npm run dev
```

### Run Standalone Express Server
```bash
node server/index.js
```

### Build for Production
```bash
npm run build
```
