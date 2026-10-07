// client/src/components/LoanCard.jsx
import React from 'react';
import '../styles/LoanCard.css';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const LoanCard = ({ loan, isSelected, onToggle }) => {
  return (
    <div className={`loan-card-item ${isSelected ? 'selected' : ''}`}>
      <div>
        <div className="loan-card-top">
          <div className="loan-card-bank-info">
            <h3 className="loan-card-bank-name">{loan.bank_name}</h3>
            <span className={`loan-card-type-tag loan-card-type-${loan.loan_type}`}>
              {loan.loan_type} loan
            </span>
          </div>

          <label className="loan-card-checkbox-label">
            <input
              type="checkbox"
              className="loan-card-checkbox"
              checked={isSelected}
              onChange={() => onToggle(loan.id)}
            />
            Select
          </label>
        </div>

        <div className="loan-card-rate-box">
          <span className="loan-card-rate-label">Interest Rate</span>
          <span className="loan-card-rate-val">{loan.interest_rate}% p.a.</span>
        </div>

        <div className="loan-card-details-grid">
          <div className="loan-card-detail-item">
            <span className="loan-card-detail-key">Tenure Range</span>
            <span className="loan-card-detail-value">
              {loan.min_tenure_months} - {loan.max_tenure_months} mo
            </span>
          </div>

          <div className="loan-card-detail-item">
            <span className="loan-card-detail-key">Amount Range</span>
            <span className="loan-card-detail-value">
              {formatCurrency(loan.min_amount)} - {formatCurrency(loan.max_amount)}
            </span>
          </div>

          <div className="loan-card-detail-item">
            <span className="loan-card-detail-key">Processing Fee</span>
            <span className="loan-card-detail-value">
              {loan.processing_fee_percent}%
            </span>
          </div>

          <div className="loan-card-detail-item">
            <span className="loan-card-detail-key">Flat Fee</span>
            <span className="loan-card-detail-value">
              {loan.flat_fee > 0 ? formatCurrency(loan.flat_fee) : 'Nil'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCard;
