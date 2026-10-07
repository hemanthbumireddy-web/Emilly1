const { fetchOfficialRates } = require('./bankRatesService.js');

const filterAndSort = (loans, { type, minRate, maxRate, sort }) => {
  let result = [...loans];
  if (type && type !== 'all') result = result.filter((loan) => loan.loan_type === type);
  if (minRate !== undefined && minRate !== '' && Number.isFinite(Number(minRate))) {
    result = result.filter((loan) => loan.interest_rate >= Number(minRate));
  }
  if (maxRate !== undefined && maxRate !== '' && Number.isFinite(Number(maxRate))) {
    result = result.filter((loan) => loan.interest_rate <= Number(maxRate));
  }
  if (sort === 'fee_asc') {
    result.sort((a, b) => a.interest_rate - b.interest_rate);
  } else {
    result.sort((a, b) => a.interest_rate - b.interest_rate || a.bank_name.localeCompare(b.bank_name));
  }
  return result;
};

const getLoans = async ({ type, minRate, maxRate, sort, refresh } = {}) => {
  const loans = await fetchOfficialRates({ forceRefresh: refresh === true || refresh === '1' });
  return filterAndSort(loans, { type, minRate, maxRate, sort });
};

const getLoanById = async (id) => {
  if (!id) throw new Error('Loan ID is required');
  const loans = await fetchOfficialRates();
  return loans.find((loan) => loan.id === id) || null;
};

const getLoansByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const loans = await fetchOfficialRates();
  const loanMap = new Map(loans.map((loan) => [loan.id, loan]));
  return ids.map((id) => loanMap.get(id)).filter(Boolean);
};

module.exports = { getLoans, getLoanById, getLoansByIds };
