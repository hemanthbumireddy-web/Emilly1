// server/services/loanService.js
const { supabase } = require('../config/supabase.js');

const SEED_LOANS = [
  {
    id: 'f1001-hdfc-home',
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
    id: 'f1002-sbi-home',
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
    id: 'f1003-icici-home',
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
    id: 'f1004-axis-personal',
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
    id: 'f1005-citi-personal',
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
    id: 'f1006-kotak-personal',
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
    id: 'f1007-bob-car',
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
    id: 'f1008-hdfc-car',
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
    id: 'f1009-pnb-car',
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
    id: 'f1010-sbi-edu',
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
    id: 'f1011-axis-edu',
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
    id: 'f1012-avanse-edu',
    bank_name: 'Avanse Global Education Loan',
    loan_type: 'education',
    interest_rate: 10.25,
    min_tenure_months: 12,
    max_tenure_months: 144,
    min_amount: 200000,
    max_amount: 20000000,
    processing_fee_percent: 1.25,
    flat_fee: 5000,
    prepayment_penalty_percent: 2.0,
  },
];

const filterAndSortLocal = (list, { type, minRate, maxRate, sort }) => {
  let result = [...list];
  if (type) {
    result = result.filter((l) => l.loan_type === type);
  }
  if (minRate !== undefined && !isNaN(Number(minRate))) {
    result = result.filter((l) => Number(l.interest_rate) >= Number(minRate));
  }
  if (maxRate !== undefined && !isNaN(Number(maxRate))) {
    result = result.filter((l) => Number(l.interest_rate) <= Number(maxRate));
  }
  if (sort === 'fee_asc') {
    result.sort((a, b) => (a.processing_fee_percent - b.processing_fee_percent) || (a.flat_fee - b.flat_fee));
  } else {
    result.sort((a, b) => a.interest_rate - b.interest_rate);
  }
  return result;
};

const getLoans = async ({ type, minRate, maxRate, sort }) => {
  try {
    let query = supabase.from('loans').select('*');

    if (type) {
      query = query.eq('loan_type', type);
    }

    if (minRate !== undefined && minRate !== '' && !isNaN(Number(minRate))) {
      query = query.gte('interest_rate', Number(minRate));
    }

    if (maxRate !== undefined && maxRate !== '' && !isNaN(Number(maxRate))) {
      query = query.lte('interest_rate', Number(maxRate));
    }

    if (sort === 'fee_asc') {
      query = query
        .order('processing_fee_percent', { ascending: true })
        .order('flat_fee', { ascending: true });
    } else {
      query = query.order('interest_rate', { ascending: true });
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return data;
    }
    if (error) {
      console.warn('Supabase query error, using local fallback:', error.message);
      return filterAndSortLocal(SEED_LOANS, { type, minRate, maxRate, sort });
    }
  } catch (err) {
    console.warn('Supabase query error, using local fallback:', err.message);
  }

  // Graceful fallback to seed loans if table not yet migrated
  return filterAndSortLocal(SEED_LOANS, { type, minRate, maxRate, sort });
};

const getLoanById = async (id) => {
  if (!id) {
    throw new Error('Loan ID is required');
  }

  try {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    // Fall through to fallback
  }

  const local = SEED_LOANS.find((l) => l.id === id);
  if (local) return local;

  throw new Error('Loan not found');
};

const getLoansByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .in('id', ids);

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    // Fall through to fallback
  }

  return SEED_LOANS.filter((l) => ids.includes(l.id));
};

module.exports = {
  getLoans,
  getLoanById,
  getLoansByIds,
};
