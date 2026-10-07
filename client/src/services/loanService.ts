export interface Loan {
  id: string;
  bank_name: string;
  product_name: string;
  loan_type: 'home' | 'personal' | 'car' | 'education';
  interest_rate: number;
  rate_max: number | null;
  rate_kind: 'from' | 'range';
  source_url: string;
  source_title: string;
  source_as_of: string | null;
  checked_at: string;
  min_tenure_months?: number;
  max_tenure_months?: number;
  min_amount?: number;
  max_amount?: number;
  processing_fee_percent?: number;
  flat_fee?: number;
  prepayment_penalty_percent?: number;
  created_at?: string;
}

export const fetchLoans = async (filters?: {
  loan_type?: string;
  type?: string;
  minRate?: number;
  maxRate?: number;
  sort?: string;
  amount?: number;
  tenure_months?: number;
  refresh?: boolean;
}): Promise<Loan[]> => {
  const params = new URLSearchParams();
  const type = filters?.type || filters?.loan_type;
  if (type && type !== 'all') params.set('type', type);
  if (filters?.minRate !== undefined) params.set('minRate', String(filters.minRate));
  if (filters?.maxRate !== undefined) params.set('maxRate', String(filters.maxRate));
  if (filters?.sort) params.set('sort', filters.sort);
  if (filters?.refresh) params.set('refresh', '1');

  const response = await fetch(`/api/loans${params.size ? `?${params.toString()}` : ''}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Could not verify current rates from official bank pages.');
  }
  if (!Array.isArray(data)) {
    throw new Error('The bank rate service returned an invalid response.');
  }
  return data as Loan[];
};
