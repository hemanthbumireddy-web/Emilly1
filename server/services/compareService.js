// server/services/compareService.js
const { getLoansByIds } = require('./loanService.js');
const { calculateLoanSummary } = require('./loanCalculator.js');

const compareLoans = async ({ loanIds, amount, tenureMonths }) => {
  // 1. Validate loanIds length
  if (!Array.isArray(loanIds) || loanIds.length < 2 || loanIds.length > 4) {
    const err = new Error('You must provide between 2 and 4 loan IDs for comparison');
    err.statusCode = 400;
    throw err;
  }

  // 2. Validate amount and tenure
  const numAmount = Number(amount);
  const numTenure = Number(tenureMonths);

  if (isNaN(numAmount) || numAmount <= 0) {
    const err = new Error('Amount must be a positive number');
    err.statusCode = 400;
    throw err;
  }

  if (isNaN(numTenure) || numTenure <= 0 || !Number.isInteger(numTenure)) {
    const err = new Error('Tenure must be a positive integer in months');
    err.statusCode = 400;
    throw err;
  }

  // 3. Fetch loans
  const loans = await getLoansByIds(loanIds);
  if (loans.length !== loanIds.length) {
    const err = new Error('One or more requested loans could not be found');
    err.statusCode = 404;
    throw err;
  }

  // 4. Validate amount and tenure boundaries against each loan's limits
  for (const loan of loans) {
    if (loan.min_amount != null && numAmount < Number(loan.min_amount)) {
      const err = new Error(`Amount ₹${numAmount} is below the minimum limit of ₹${loan.min_amount} for ${loan.bank_name}`);
      err.statusCode = 400;
      throw err;
    }
    if (loan.max_amount != null && numAmount > Number(loan.max_amount)) {
      const err = new Error(`Amount ₹${numAmount} exceeds the maximum limit of ₹${loan.max_amount} for ${loan.bank_name}`);
      err.statusCode = 400;
      throw err;
    }
    if (loan.min_tenure_months != null && numTenure < Number(loan.min_tenure_months)) {
      const err = new Error(`Tenure ${numTenure} months is below the minimum tenure of ${loan.min_tenure_months} months for ${loan.bank_name}`);
      err.statusCode = 400;
      throw err;
    }
    if (loan.max_tenure_months != null && numTenure > Number(loan.max_tenure_months)) {
      const err = new Error(`Tenure ${numTenure} months exceeds the maximum tenure of ${loan.max_tenure_months} months for ${loan.bank_name}`);
      err.statusCode = 400;
      throw err;
    }
  }

  // 5. Calculate summary for each loan using loanCalculator.js
  const comparisons = loans.map((loan) => {
    const summary = calculateLoanSummary(loan, numAmount, numTenure);
    return {
      loan,
      summary,
    };
  });

  // 6. Find best-value loan ID for emi, totalInterest, totalFees, totalCost
  let bestEmiId = comparisons[0].loan.id;
  let minEmi = comparisons[0].summary.monthlyEmi;

  let bestInterestId = comparisons[0].loan.id;
  let minInterest = comparisons[0].summary.totalInterest;

  let bestFeesId = comparisons[0].loan.id;
  let minFees = comparisons[0].summary.totalFees;

  let bestCostId = comparisons[0].loan.id;
  let minCost = comparisons[0].summary.totalCost;

  for (let i = 1; i < comparisons.length; i++) {
    const item = comparisons[i];
    if (item.summary.monthlyEmi < minEmi) {
      minEmi = item.summary.monthlyEmi;
      bestEmiId = item.loan.id;
    }
    if (item.summary.totalInterest < minInterest) {
      minInterest = item.summary.totalInterest;
      bestInterestId = item.loan.id;
    }
    if (item.summary.totalFees < minFees) {
      minFees = item.summary.totalFees;
      bestFeesId = item.loan.id;
    }
    if (item.summary.totalCost < minCost) {
      minCost = item.summary.totalCost;
      bestCostId = item.loan.id;
    }
  }

  return {
    amount: numAmount,
    tenureMonths: numTenure,
    comparisons,
    bestValue: {
      emi: bestEmiId,
      totalInterest: bestInterestId,
      totalFees: bestFeesId,
      totalCost: bestCostId,
    },
  };
};

module.exports = {
  compareLoans,
};
