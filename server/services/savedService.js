// server/services/savedService.js
const { createAuthenticatedClient } = require('../config/supabase.js');
const { getLoansByIds } = require('./loanService.js');

const getSaved = async (token, userId) => {
  const client = createAuthenticatedClient(token);

  const { data, error } = await client
    .from('saved_comparisons')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Enrich with loan details
  const enriched = await Promise.all(
    (data || []).map(async (item) => {
      if (!item.loan_ids || item.loan_ids.length === 0) {
        return { ...item, loans: [] };
      }
      const loans = await getLoansByIds(item.loan_ids);
      return {
        ...item,
        loans,
      };
    })
  );

  return enriched;
};

const createSaved = async (token, userId, { loanIds, amount, tenureMonths }) => {
  if (!Array.isArray(loanIds) || loanIds.length === 0) {
    const err = new Error('loanIds must be a non-empty array of loan IDs');
    err.statusCode = 400;
    throw err;
  }

  const numAmount = Number(amount);
  const numTenure = Number(tenureMonths);

  if (isNaN(numAmount) || numAmount <= 0) {
    const err = new Error('amount must be a positive number');
    err.statusCode = 400;
    throw err;
  }

  if (isNaN(numTenure) || numTenure <= 0) {
    const err = new Error('tenureMonths must be a positive integer');
    err.statusCode = 400;
    throw err;
  }

  const client = createAuthenticatedClient(token);

  const { data, error } = await client
    .from('saved_comparisons')
    .insert([
      {
        user_id: userId,
        loan_ids: loanIds,
        amount: numAmount,
        tenure_months: numTenure,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const deleteSaved = async (token, userId, id) => {
  if (!id) {
    const err = new Error('Saved comparison ID is required');
    err.statusCode = 400;
    throw err;
  }

  const client = createAuthenticatedClient(token);

  const { error } = await client
    .from('saved_comparisons')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, id };
};

module.exports = {
  getSaved,
  createSaved,
  deleteSaved,
};
