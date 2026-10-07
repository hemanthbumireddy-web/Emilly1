// client/src/utils/emiCalculator.ts
import { calculateLoanSummary } from './loanCalculator.js';

export interface LoanCalculationResult {
  monthlyEmi: number;
  totalInterest: number;
  processingFee: number;
  totalPayable: number;
  totalFees?: number;
  effectiveCostPercent?: number;
}

export const calculateLoanDetails = (
  principal: number,
  annualInterestRate: number,
  tenureMonths: number,
  processingFeePercent: number = 0,
  flatFee: number = 0
): LoanCalculationResult => {
  const summary = calculateLoanSummary(
    {
      interest_rate: annualInterestRate,
      processing_fee_percent: processingFeePercent,
      flat_fee: flatFee,
    },
    principal,
    tenureMonths
  );

  return {
    monthlyEmi: summary.monthlyEmi,
    totalInterest: summary.totalInterest,
    processingFee: summary.processingFee,
    totalPayable: summary.totalCost,
    totalFees: summary.totalFees,
    effectiveCostPercent: summary.effectiveCostPercent,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
