import React from 'react';
import { Loan } from '../services/loanService.js';
import { calculateLoanDetails, formatCurrency } from '../utils/emiCalculator.js';
import '../styles/LoanCard.css';

interface LoanCardProps {
  loan: Loan;
  amount: number;
  tenureMonths: number;
  isSelected: boolean;
  onToggleSelect: (loanId: string) => void;
}

const formatCheckedAt = (value: string) => new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Kolkata',
}).format(new Date(value));

export const LoanCard: React.FC<LoanCardProps> = ({
  loan,
  amount,
  tenureMonths,
  isSelected,
  onToggleSelect,
}) => {
  const calculation = calculateLoanDetails(
    amount,
    loan.interest_rate,
    tenureMonths,
    loan.processing_fee_percent ?? 0,
    loan.flat_fee ?? 0
  );
  const rateLabel = loan.rate_kind === 'range' && loan.rate_max !== null
    ? `${loan.interest_rate.toFixed(2)}%–${loan.rate_max.toFixed(2)}% p.a.`
    : `From ${loan.interest_rate.toFixed(2)}% p.a.`;

  return (
    <article className={`loan-card ${isSelected ? 'selected' : ''}`}>
      <div className="loan-card-top">
        <div>
          <h3 className="loan-bank-name">{loan.bank_name}</h3>
          <p className="loan-product-name">{loan.product_name}</p>
          <span className={`loan-type-tag loan-type-${loan.loan_type}`}>
            {loan.loan_type} loan
          </span>
        </div>
        <label className="loan-card-select-label">
          <input
            type="checkbox"
            className="loan-card-checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(loan.id)}
          />
          Compare
        </label>
      </div>

      <div className="loan-metric-primary">
        <div>
          <div className="metric-label">Estimated EMI at starting rate</div>
          <div className="metric-value-large">{formatCurrency(calculation.monthlyEmi)}</div>
        </div>
        <div className="metric-rate-group">
          <div className="metric-label">Official rate</div>
          <div className="metric-rate-large">{rateLabel}</div>
        </div>
      </div>

      <p className="loan-rate-caveat">
        Indicative only. Your approved rate depends on eligibility, credit profile, and loan terms. Fees are not included.
      </p>

      <div className="loan-details-grid">
        <div className="detail-row">
          <span className="detail-key">Estimated interest</span>
          <span className="detail-val">{formatCurrency(calculation.totalInterest)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-key">Total payable, excluding fees</span>
          <span className="detail-val">{formatCurrency(calculation.totalPayable)}</span>
        </div>
      </div>

      <div className="loan-source-footer">
        <span>Checked {formatCheckedAt(loan.checked_at)} IST</span>
        {loan.source_as_of && <span>Official rate date: {loan.source_as_of}</span>}
        <a href={loan.source_url} target="_blank" rel="noopener noreferrer">
          View official source
        </a>
      </div>
    </article>
  );
};
