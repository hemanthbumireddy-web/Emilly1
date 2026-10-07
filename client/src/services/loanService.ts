import { supabase } from './supabaseClient.js';

export interface Loan {
  id: string;
  bank_name: string;
  loan_type: 'home' | 'personal' | 'car' | 'education';
  interest_rate: number;
  min_tenure_months: number;
  max_tenure_months: number;
  min_amount: number;
  max_amount: number;
  processing_fee_percent: number;
  flat_fee: number;
  prepayment_penalty_percent: number;
  created_at?: string;
}

const FALLBACK_LOANS: Loan[] = [
  {
    id: 'e1001-hdfc-home',
    bank_name: 'HDFC Bank Home Advantage',
    loan_type: 'home',
    interest_rate: 8.50,
    min_tenure_months: 12,
    max_tenure_months: 360,
    min_amount: 500000,
    max_amount: 100000000,
    processing_fee_percent: 0.50,
    flat_fee: 3000,
    prepayment_penalty_percent: 0.0,
  },
  {
    id: 'e1002-sbi-home',
    bank_name: 'SBI Regular Home Loan',
    loan_type: 'home',
    interest_rate: 8.40,
    min_tenure_months: 12,
    max_tenure_months: 360,
    min_amount: 300000,
    max_amount: 75000000,
    processing_fee_percent: 0.35,
    flat_fee: 2000,
    prepayment_penalty_percent: 0.0,
  },
  {
    id: 'e1003-icici-home',
    bank_name: 'ICICI Express Home Loan',
    loan_type: 'home',
    interest_rate: 8.75,
    min_tenure_months: 12,
    max_tenure_months: 300,
    min_amount: 500000,
    max_amount: 50000000,
    processing_fee_percent: 0.50,
    flat_fee: 5000,
    prepayment_penalty_percent: 2.0,
  },
  {
    id: 'e1004-axis-personal',
    bank_name: 'Axis Bank Quick Personal',
    loan_type: 'personal',
    interest_rate: 10.49,
    min_tenure_months: 12,
    max_tenure_months: 60,
    min_amount: 50000,
    max_amount: 2500000,
    processing_fee_percent: 1.50,
    flat_fee: 1000,
    prepayment_penalty_percent: 3.0,
  },
  {
    id: 'e1005-citi-personal',
    bank_name: 'Citibank Flexi Personal',
    loan_type: 'personal',
    interest_rate: 9.99,
    min_tenure_months: 12,
    max_tenure_months: 60,
    min_amount: 100000,
    max_amount: 3000000,
    processing_fee_percent: 1.00,
    flat_fee: 1500,
    prepayment_penalty_percent: 2.5,
  },
  {
    id: 'e1006-kotak-personal',
    bank_name: 'Kotak Mahindra Prime Personal',
    loan_type: 'personal',
    interest_rate: 11.25,
    min_tenure_months: 12,
    max_tenure_months: 72,
    min_amount: 50000,
    max_amount: 2000000,
    processing_fee_percent: 2.00,
    flat_fee: 500,
    prepayment_penalty_percent: 4.0,
  },
  {
    id: 'e1007-bob-car',
    bank_name: 'Bank of Baroda Car Loan',
    loan_type: 'car',
    interest_rate: 8.70,
    min_tenure_months: 12,
    max_tenure_months: 84,
    min_amount: 100000,
    max_amount: 5000000,
    processing_fee_percent: 0.75,
    flat_fee: 1500,
    prepayment_penalty_percent: 0.0,
  },
  {
    id: 'e1008-hdfc-car',
    bank_name: 'HDFC Custom Auto Loan',
    loan_type: 'car',
    interest_rate: 8.95,
    min_tenure_months: 12,
    max_tenure_months: 84,
    min_amount: 150000,
    max_amount: 10000000,
    processing_fee_percent: 0.50,
    flat_fee: 2500,
    prepayment_penalty_percent: 1.0,
  },
  {
    id: 'e1009-pnb-car',
    bank_name: 'Punjab National Auto Loan',
    loan_type: 'car',
    interest_rate: 8.65,
    min_tenure_months: 12,
    max_tenure_months: 84,
    min_amount: 100000,
    max_amount: 4000000,
    processing_fee_percent: 0.25,
    flat_fee: 1000,
    prepayment_penalty_percent: 0.0,
  },
  {
    id: 'e1010-sbi-edu',
    bank_name: 'SBI Student Loan Scheme',
    loan_type: 'education',
    interest_rate: 8.15,
    min_tenure_months: 12,
    max_tenure_months: 180,
    min_amount: 50000,
    max_amount: 7500000,
    processing_fee_percent: 0.00,
    flat_fee: 0,
    prepayment_penalty_percent: 0.0,
  },
  {
    id: 'e1011-axis-edu',
    bank_name: 'Axis Bank Education Loan',
    loan_type: 'education',
    interest_rate: 9.50,
    min_tenure_months: 12,
    max_tenure_months: 180,
    min_amount: 100000,
    max_amount: 15000000,
    processing_fee_percent: 1.00,
    flat_fee: 2000,
    prepayment_penalty_percent: 0.0,
  },
  {
    id: 'e1012-avanse-edu',
    bank_name: 'Avanse Global Education Loan',
    loan_type: 'education',
    interest_rate: 10.25,
    min_tenure_months: 12,
    max_tenure_months: 144,
    min_amount: 200000,
    max_amount: 2000000,
    processing_fee_percent: 1.25,
    flat_fee: 5000,
    prepayment_penalty_percent: 2.0,
  },
];

export const fetchLoans = async (filters?: {
  loan_type?: string;
  type?: string;
  minRate?: number;
  maxRate?: number;
  sort?: string;
  amount?: number;
  tenure_months?: number;
}): Promise<Loan[]> => {
  try {
    const params = new URLSearchParams();
    const typeVal = filters?.type || filters?.loan_type;
    if (typeVal && typeVal !== 'all') {
      params.append('type', typeVal);
    }
    if (filters?.minRate !== undefined) {
      params.append('minRate', filters.minRate.toString());
    }
    if (filters?.maxRate !== undefined) {
      params.append('maxRate', filters.maxRate.toString());
    }
    if (filters?.sort) {
      params.append('sort', filters.sort);
    }

    const res = await fetch(`/api/loans?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend API request failed, trying Supabase direct client:', err);
  }

  // Fallback direct to Supabase
  try {
    let query = supabase.from('loans').select('*').order('interest_rate', { ascending: true });
    if (filters?.loan_type && filters.loan_type !== 'all') {
      query = query.eq('loan_type', filters.loan_type);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as Loan[];
    }
  } catch (err) {
    console.warn('Supabase direct query failed:', err);
  }

  // If Supabase table is not yet created or empty, filter fallback loans
  return FALLBACK_LOANS.filter((l) => {
    if (filters?.loan_type && filters.loan_type !== 'all' && l.loan_type !== filters.loan_type) {
      return false;
    }
    if (filters?.amount && (filters.amount < l.min_amount || filters.amount > l.max_amount)) {
      return false;
    }
    if (filters?.tenure_months && (filters.tenure_months < l.min_tenure_months || filters.tenure_months > l.max_tenure_months)) {
      return false;
    }
    return true;
  });
};
