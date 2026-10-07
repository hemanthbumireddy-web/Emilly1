// client/src/services/comparisonService.ts
import { supabase } from './supabaseClient.js';
import { Loan } from './loanService.js';

export interface SavedComparison {
  id: string;
  user_id: string;
  loan_ids: string[];
  amount: number;
  tenure_months: number;
  created_at: string;
  loans?: Loan[];
}

export interface CompareApiResponse {
  amount: number;
  tenureMonths: number;
  comparisons: Array<{
    loan: Loan;
    summary: {
      monthlyEmi: number;
      totalPayment: number;
      totalInterest: number;
      processingFee: number;
      totalFees: number;
      totalCost: number;
      effectiveCostPercent: number;
    };
  }>;
  bestValue: {
    emi: string;
    totalInterest: string;
    totalFees: string;
    totalCost: string;
  };
}

export const compareLoansApi = async (
  loanIds: string[],
  amount: number,
  tenureMonths: number
): Promise<CompareApiResponse | null> => {
  try {
    const res = await fetch('/api/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        loanIds,
        amount,
        tenureMonths,
      }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API /api/compare call failed:', err);
  }
  return null;
};

export const fetchSavedComparisons = async (token: string): Promise<SavedComparison[]> => {
  try {
    const res = await fetch('/api/saved', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Server fetchSavedComparisons failed, trying Supabase direct:', err);
  }

  // Fallback direct Supabase
  const { data, error } = await supabase
    .from('saved_comparisons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as SavedComparison[]) || [];
};

export const saveComparison = async (
  token: string,
  loanIds: string[],
  amount: number,
  tenureMonths: number
): Promise<SavedComparison> => {
  try {
    const res = await fetch('/api/saved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        loanIds,
        amount,
        tenureMonths,
      }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Server saveComparison failed, trying Supabase direct:', err);
  }

  // Fallback direct Supabase
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('saved_comparisons')
    .insert([
      {
        user_id: userData.user.id,
        loan_ids: loanIds,
        amount,
        tenure_months: tenureMonths,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SavedComparison;
};

export const deleteComparison = async (token: string, comparisonId: string): Promise<void> => {
  try {
    const res = await fetch(`/api/saved/${comparisonId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      return;
    }
  } catch (err) {
    console.warn('Server deleteComparison failed, trying Supabase direct:', err);
  }

  const { error } = await supabase
    .from('saved_comparisons')
    .delete()
    .eq('id', comparisonId);

  if (error) {
    throw new Error(error.message);
  }
};
