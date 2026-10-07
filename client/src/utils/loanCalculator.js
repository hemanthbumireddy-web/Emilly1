// client/src/utils/loanCalculator.js
/**
 * Pure loan calculation utilities (ES Module)
 */

function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates monthly EMI
 * r = annualRate / 12 / 100
 * EMI = P * r * (1+r)^n / ((1+r)^n - 1), if r = 0 then EMI = P / n
 */
export function calculateEmi(principal, annualRate, tenureMonths) {
  const p = Number(principal);
  const rate = Number(annualRate);
  const n = Number(tenureMonths);

  if (p <= 0 || n <= 0) return 0;

  const r = rate / 12 / 100;
  if (r === 0) {
    return round2(p / n);
  }

  const factor = Math.pow(1 + r, n);
  const emi = (p * r * factor) / (factor - 1);
  return round2(emi);
}

/**
 * Calculates comprehensive loan cost summary
 */
export function calculateLoanSummary(loan, amount, tenureMonths) {
  const p = Number(amount);
  const n = Number(tenureMonths);
  const rate = Number(loan.interest_rate || 0);
  const feePercent = Number(loan.processing_fee_percent || 0);
  const flatFee = Number(loan.flat_fee || 0);

  const monthlyEmi = calculateEmi(p, rate, n);
  const totalPayment = round2(monthlyEmi * n);
  const totalInterest = round2(Math.max(0, totalPayment - p));
  const processingFee = round2((p * feePercent / 100) + flatFee);
  const totalFees = processingFee;
  const totalCost = round2(totalPayment + processingFee);
  const effectiveCostPercent = p > 0 ? round2(((totalCost - p) / p) * 100) : 0;

  return {
    monthlyEmi,
    totalPayment,
    totalInterest,
    processingFee,
    totalFees,
    totalCost,
    effectiveCostPercent,
  };
}

/**
 * Generates month-by-month loan amortization schedule
 */
export function generateSchedule(principal, annualRate, tenureMonths) {
  const p = Number(principal);
  const rate = Number(annualRate);
  const n = Number(tenureMonths);

  if (p <= 0 || n <= 0) return [];

  const emi = calculateEmi(p, rate, n);
  const monthlyRate = rate / 12 / 100;
  let balance = p;
  const schedule = [];

  for (let month = 1; month <= n; month++) {
    const interestPaid = monthlyRate === 0 ? 0 : round2(balance * monthlyRate);
    let principalPaid = round2(emi - interestPaid);

    if (month === n || principalPaid > balance) {
      principalPaid = round2(balance);
      const actualEmi = round2(principalPaid + interestPaid);
      balance = 0;
      schedule.push({
        month,
        emi: actualEmi,
        principalPaid,
        interestPaid,
        balance: 0,
      });
      break;
    }

    balance = round2(balance - principalPaid);
    schedule.push({
      month,
      emi,
      principalPaid,
      interestPaid,
      balance: Math.max(0, balance),
    });
  }

  return schedule;
}

/**
 * Simulates early payoff with additional monthly payment
 */
export function simulatePrepayment(principal, annualRate, tenureMonths, extraMonthly) {
  const p = Number(principal);
  const rate = Number(annualRate);
  const n = Number(tenureMonths);
  const extra = Math.max(0, Number(extraMonthly || 0));

  if (p <= 0 || n <= 0) {
    return { newTenureMonths: 0, interestSaved: 0, monthsSaved: 0 };
  }

  const baseEmi = calculateEmi(p, rate, n);
  const originalTotalPayment = baseEmi * n;
  const originalTotalInterest = Math.max(0, originalTotalPayment - p);

  if (extra === 0) {
    return {
      newTenureMonths: n,
      interestSaved: 0,
      monthsSaved: 0,
    };
  }

  const monthlyRate = rate / 12 / 100;
  const targetMonthlyPayment = baseEmi + extra;
  let balance = p;
  let newTenureMonths = 0;
  let newTotalInterest = 0;

  while (balance > 0.01 && newTenureMonths < n) {
    newTenureMonths++;
    const interest = monthlyRate === 0 ? 0 : balance * monthlyRate;

    if (balance + interest <= targetMonthlyPayment) {
      newTotalInterest += interest;
      balance = 0;
      break;
    }

    const principalPaid = targetMonthlyPayment - interest;
    balance -= principalPaid;
    newTotalInterest += interest;
  }

  const interestSaved = round2(Math.max(0, originalTotalInterest - newTotalInterest));
  const monthsSaved = Math.max(0, n - newTenureMonths);

  return {
    newTenureMonths,
    interestSaved,
    monthsSaved,
  };
}

/*
================================================================================
TEST CASES AND EXPECTED OUTPUTS:
--------------------------------------------------------------------------------
Test Case 1 (Standard Personal Loan):
calculateEmi(100000, 12, 12)
=> Expected Output: 8884.88

calculateLoanSummary({ interest_rate: 12, processing_fee_percent: 1, flat_fee: 500 }, 100000, 12)
=> Expected Output:
   {
     monthlyEmi: 8884.88,
     totalPayment: 106618.56,
     totalInterest: 6618.56,
     processingFee: 1500.00,
     totalFees: 1500.00,
     totalCost: 108118.56,
     effectiveCostPercent: 8.12
   }

Test Case 2 (Zero-Rate Case):
calculateEmi(120000, 0, 12)
=> Expected Output: 10000.00

calculateLoanSummary({ interest_rate: 0, processing_fee_percent: 0, flat_fee: 0 }, 120000, 12)
=> Expected Output:
   {
     monthlyEmi: 10000.00,
     totalPayment: 120000.00,
     totalInterest: 0.00,
     processingFee: 0.00,
     totalFees: 0.00,
     totalCost: 120000.00,
     effectiveCostPercent: 0.00
   }

simulatePrepayment(120000, 0, 12, 2000)
=> Expected Output:
   {
     newTenureMonths: 10,
     interestSaved: 0.00,
     monthsSaved: 2
   }

Test Case 3 (Long-Term Home Loan):
calculateEmi(5000000, 8.5, 240)
=> Expected Output: 43391.16

calculateLoanSummary({ interest_rate: 8.5, processing_fee_percent: 0.5, flat_fee: 3000 }, 5000000, 240)
=> Expected Output:
   {
     monthlyEmi: 43391.16,
     totalPayment: 10413878.40,
     totalInterest: 5413878.40,
     processingFee: 28000.00,
     totalFees: 28000.00,
     totalCost: 10441878.40,
     effectiveCostPercent: 108.84
   }

Test Case 4 (Prepayment Simulation on 3-Year Loan):
simulatePrepayment(200000, 10, 36, 2000)
=> Expected Output:
   {
     newTenureMonths: 27,
     interestSaved: 8352.63,
     monthsSaved: 9
   }

Test Case 5 (Amortization Schedule Generation):
const schedule = generateSchedule(600000, 9, 60);
schedule[0] (Month 1):
=> Expected Output:
   {
     month: 1,
     emi: 12455.01,
     principalPaid: 7955.01,
     interestPaid: 4500.00,
     balance: 592044.99
   }
schedule[59] (Month 60):
=> Expected Output:
   balance === 0
================================================================================
*/
