// client/src/services/api.js
const API_BASE = '/api';

export const getLoans = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.type) query.append('type', params.type);
  if (params.minRate !== undefined && params.minRate !== '') query.append('minRate', params.minRate);
  if (params.maxRate !== undefined && params.maxRate !== '') query.append('maxRate', params.maxRate);
  if (params.sort) query.append('sort', params.sort);

  const url = `${API_BASE}/loans${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch loans');
  }
  return data;
};

export const getLoanById = async (id) => {
  const res = await fetch(`${API_BASE}/loans/${id}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch loan details');
  }
  return data;
};

export const compareLoans = async ({ loanIds, amount, tenureMonths }) => {
  const res = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      loanIds,
      amount: Number(amount),
      tenureMonths: Number(tenureMonths),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to compare loans');
  }
  return data;
};

export const getSavedComparisons = async (token) => {
  const res = await fetch(`${API_BASE}/saved`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch saved comparisons');
  }
  return data;
};

export const saveComparison = async (token, { loanIds, amount, tenureMonths }) => {
  const res = await fetch(`${API_BASE}/saved`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      loanIds,
      amount: Number(amount),
      tenureMonths: Number(tenureMonths),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to save comparison');
  }
  return data;
};

export const deleteSavedComparison = async (token, id) => {
  const res = await fetch(`${API_BASE}/saved/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete saved comparison');
  }
  return data;
};

export const explainComparisonApi = async (comparisonData) => {
  const res = await fetch(`${API_BASE}/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(comparisonData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate explanation');
  }
  return data.recommendation;
};

