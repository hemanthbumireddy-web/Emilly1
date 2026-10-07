import React from 'react';
import { Loan } from '../services/loanService.js';
import { calculateLoanDetails, formatCurrency } from '../utils/emiCalculator.js';
import '../styles/ComparisonTable.css';

interface ComparisonTableProps {
  selectedLoans: Loan[];
  amount: number;
  tenureMonths: number;
  onClear: () => void;
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  selectedLoans,
  amount,
  tenureMonths,
  onClear,
  onSave,
  isSaving,
  canSave,
}) => {
  if (selectedLoans.length === 0) {
    return null;
  }

  const calculatedLoans = selectedLoans.map((loan) => ({
    loan,
    calc: calculateLoanDetails(
      amount,
      loan.interest_rate,
      tenureMonths,
      loan.processing_fee_percent,
      loan.flat_fee
    ),
  }));

  const lowestEmi = Math.min(...calculatedLoans.map((c) => c.calc.monthlyEmi));
  const lowestRate = Math.min(...calculatedLoans.map((c) => c.loan.interest_rate));
  const lowestTotalPayable = Math.min(...calculatedLoans.map((c) => c.calc.totalPayable));

  return (
    <section className="comparison-section">
      <div className="comparison-header">
        <div>
          <h2 className="comparison-title">
            Comparing {selectedLoans.length} Loan{selectedLoans.length > 1 ? 's' : ''}
          </h2>
          <span className="section-subtitle">
            Based on ₹{amount.toLocaleString()} for {tenureMonths} Months ({Math.round((tenureMonths / 12) * 10) / 10} Years)
          </span>
        </div>

        <div className="comparison-actions">
          <button
            type="button"
            className="btn-save-comparison"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : canSave ? 'Save Comparison' : 'Sign in to Save'}
          </button>
          <button
            type="button"
            className="btn-clear-comparison"
            onClick={onClear}
          >
            Clear Selection
          </button>
        </div>
      </div>

      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Feature / Metric</th>
              {calculatedLoans.map(({ loan }) => (
                <th key={loan.id}>
                  <div>{loan.bank_name}</div>
                  <span className={`loan-type-tag loan-type-${loan.loan_type}`}>
                    {loan.loan_type}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="highlight-row">
              <td>Monthly EMI</td>
              {calculatedLoans.map(({ loan, calc }) => (
                <td
                  key={loan.id}
                  className={calc.monthlyEmi === lowestEmi ? 'highlight-lowest' : ''}
                >
                  {formatCurrency(calc.monthlyEmi)}
                  {calc.monthlyEmi === lowestEmi && ' (Lowest)'}
                </td>
              ))}
            </tr>

            <tr>
              <td>Interest Rate</td>
              {calculatedLoans.map(({ loan }) => (
                <td
                  key={loan.id}
                  className={loan.interest_rate === lowestRate ? 'highlight-lowest' : ''}
                >
                  {loan.interest_rate}% p.a.
                  {loan.interest_rate === lowestRate && ' (Best)'}
                </td>
              ))}
            </tr>

            <tr>
              <td>Total Interest</td>
              {calculatedLoans.map(({ loan, calc }) => (
                <td key={loan.id}>{formatCurrency(calc.totalInterest)}</td>
              ))}
            </tr>

            <tr>
              <td>Processing Fee</td>
              {calculatedLoans.map(({ loan, calc }) => (
                <td key={loan.id}>
                  {formatCurrency(calc.processingFee)} ({loan.processing_fee_percent}%
                  {loan.flat_fee > 0 ? ` + ₹${loan.flat_fee}` : ''})
                </td>
              ))}
            </tr>

            <tr>
              <td>Prepayment Penalty</td>
              {calculatedLoans.map(({ loan }) => (
                <td key={loan.id}>
                  {loan.prepayment_penalty_percent > 0
                    ? `${loan.prepayment_penalty_percent}%`
                    : 'Nil (0%)'}
                </td>
              ))}
            </tr>

            <tr className="highlight-row">
              <td>Total Amount Payable</td>
              {calculatedLoans.map(({ loan, calc }) => (
                <td
                  key={loan.id}
                  className={calc.totalPayable === lowestTotalPayable ? 'highlight-lowest' : ''}
                >
                  {formatCurrency(calc.totalPayable)}
                  {calc.totalPayable === lowestTotalPayable && ' (Lowest Overall)'}
                </td>
              ))}
            </tr>

            <tr>
              <td>Loan Amount Limits</td>
              {calculatedLoans.map(({ loan }) => (
                <td key={loan.id}>
                  {formatCurrency(loan.min_amount)} to {formatCurrency(loan.max_amount)}
                </td>
              ))}
            </tr>

            <tr>
              <td>Allowed Tenure</td>
              {calculatedLoans.map(({ loan }) => (
                <td key={loan.id}>
                  {loan.min_tenure_months} to {loan.max_tenure_months} months
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
