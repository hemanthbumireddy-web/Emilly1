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
    loan.processing_fee_percent,
    loan.flat_fee
  );

  const isAmountOutOfRange = amount < loan.min_amount || amount > loan.max_amount;
  const isTenureOutOfRange = tenureMonths < loan.min_tenure_months || tenureMonths > loan.max_tenure_months;

  return (
    <div className={`loan-card ${isSelected ? 'selected' : ''}`}>
      <div className="loan-card-top">
        <div>
          <h3 className="loan-bank-name">{loan.bank_name}</h3>
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
          <div className="metric-label">Estimated EMI</div>
          <div className="metric-value-large">
            {formatCurrency(calculation.monthlyEmi)}
          </div>
        </div>
        <div className="metric-rate-group">
          <div className="metric-label">Interest Rate</div>
          <div className="metric-rate-large">{loan.interest_rate}% p.a.</div>
        </div>
      </div>

      <div className="loan-details-grid">
        <div className="detail-row">
          <span className="detail-key">Total Interest</span>
          <span className="detail-val">{formatCurrency(calculation.totalInterest)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-key">Processing Fee</span>
          <span className="detail-val">
            {loan.processing_fee_percent}% {loan.flat_fee > 0 ? `+ ₹${loan.flat_fee}` : ''}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-key">Total Cost (Payable)</span>
          <span className="detail-val">{formatCurrency(calculation.totalPayable)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-key">Prepayment Penalty</span>
          <span className="detail-val">
            {loan.prepayment_penalty_percent > 0 ? `${loan.prepayment_penalty_percent}%` : 'Nil'}
          </span>
        </div>
      </div>

      <div className="loan-card-footer">
        <span>Tenure: {loan.min_tenure_months} - {loan.max_tenure_months} mo</span>
        <span>Limits: {formatCurrency(loan.min_amount)} - {formatCurrency(loan.max_amount)}</span>
      </div>

      {isAmountOutOfRange && (
        <div className="error-banner range-warning">
          Selected amount ₹{amount.toLocaleString()} is outside this loan's limit.
        </div>
      )}
      {isTenureOutOfRange && (
        <div className="error-banner range-warning">
          Selected tenure {tenureMonths} mo is outside this loan's range.
        </div>
      )}
    </div>
  );
};
