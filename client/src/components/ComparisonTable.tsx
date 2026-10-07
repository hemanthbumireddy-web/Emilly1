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
  if (selectedLoans.length === 0) return null;

  const calculatedLoans = selectedLoans.map((loan) => ({
    loan,
    calc: calculateLoanDetails(
      amount,
      loan.interest_rate,
      tenureMonths,
      loan.processing_fee_percent ?? 0,
      loan.flat_fee ?? 0
    ),
  }));
  const lowestEmi = Math.min(...calculatedLoans.map(({ calc }) => calc.monthlyEmi));
  const lowestRate = Math.min(...calculatedLoans.map(({ loan }) => loan.interest_rate));
  const lowestTotalPayable = Math.min(...calculatedLoans.map(({ calc }) => calc.totalPayable));

  return (
    <section className="comparison-section" aria-labelledby="comparison-title">
      <div className="comparison-header">
        <div>
          <h2 className="comparison-title" id="comparison-title">
            Comparing {selectedLoans.length} Loan{selectedLoans.length > 1 ? 's' : ''}
          </h2>
          <span className="section-subtitle">
            Indicative estimates for ₹{amount.toLocaleString('en-IN')} over {tenureMonths} months, using each bank&apos;s advertised starting rate. Fees excluded.
          </span>
        </div>
        <div className="comparison-actions">
          <button type="button" className="btn-save-comparison" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : canSave ? 'Save Comparison' : 'Sign in to Save'}
          </button>
          <button type="button" className="btn-clear-comparison" onClick={onClear}>
            Clear Selection
          </button>
        </div>
      </div>

      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <caption className="sr-only">Indicative loan cost comparison based on advertised starting rates</caption>
          <thead>
            <tr>
              <th scope="col">Feature / Metric</th>
              {calculatedLoans.map(({ loan }) => (
                <th scope="col" key={loan.id}>
                  <div>{loan.bank_name}</div>
                  <span className={`loan-type-tag loan-type-${loan.loan_type}`}>
                    {loan.product_name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="highlight-row">
              <th scope="row">Estimated monthly EMI</th>
              {calculatedLoans.map(({ loan, calc }) => (
                <td key={loan.id} className={calc.monthlyEmi === lowestEmi ? 'highlight-lowest' : ''}>
                  {formatCurrency(calc.monthlyEmi)}{calc.monthlyEmi === lowestEmi && ' (Lowest)'}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Official rate</th>
              {calculatedLoans.map(({ loan }) => (
                <td key={loan.id} className={loan.interest_rate === lowestRate ? 'highlight-lowest' : ''}>
                  {loan.rate_kind === 'range' && loan.rate_max !== null
                    ? `${loan.interest_rate.toFixed(2)}%–${loan.rate_max.toFixed(2)}% p.a.`
                    : `From ${loan.interest_rate.toFixed(2)}% p.a.`}
                  {loan.interest_rate === lowestRate && ' (Lowest starting rate)'}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Estimated total interest</th>
              {calculatedLoans.map(({ loan, calc }) => (
                <td key={loan.id}>{formatCurrency(calc.totalInterest)}</td>
              ))}
            </tr>
            <tr className="highlight-row">
              <th scope="row">Estimated total payable, excluding fees</th>
              {calculatedLoans.map(({ loan, calc }) => (
                <td key={loan.id} className={calc.totalPayable === lowestTotalPayable ? 'highlight-lowest' : ''}>
                  {formatCurrency(calc.totalPayable)}{calc.totalPayable === lowestTotalPayable && ' (Lowest)'}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Rate source</th>
              {calculatedLoans.map(({ loan }) => (
                <td key={loan.id}>
                  <a href={loan.source_url} target="_blank" rel="noopener noreferrer">
                    Official bank page
                  </a>
                  {loan.source_as_of && <div>Effective / published: {loan.source_as_of}</div>}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
