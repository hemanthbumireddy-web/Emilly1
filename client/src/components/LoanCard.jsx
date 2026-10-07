import React from 'react';
import '../styles/LoanCard.css';

const formatCheckedAt = (value) => new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Kolkata',
}).format(new Date(value));

export const LoanCard = ({ loan, isSelected, onToggle }) => {
  const rateLabel = loan.rate_kind === 'range' && loan.rate_max != null
    ? `${Number(loan.interest_rate).toFixed(2)}%–${Number(loan.rate_max).toFixed(2)}% p.a.`
    : `From ${Number(loan.interest_rate).toFixed(2)}% p.a.`;

  return (
    <article className={`loan-card ${isSelected ? 'selected' : ''}`}>
      <div className="loan-card-top">
        <div>
          <h2 className="loan-bank-name">{loan.bank_name}</h2>
          <p className="loan-product-name">{loan.product_name || `${loan.loan_type} loan`}</p>
          <span className={`loan-type-tag loan-type-${loan.loan_type}`}>
            {loan.loan_type} loan
          </span>
        </div>
        <label className="loan-card-select-label">
          <input
            type="checkbox"
            className="loan-card-checkbox"
            checked={isSelected}
            onChange={() => onToggle(loan.id)}
          />
          Compare
        </label>
      </div>

      <div className="loan-metric-primary">
        <div>
          <div className="metric-label">Published interest rate</div>
          <div className="metric-rate-large">{rateLabel}</div>
        </div>
        <div className="metric-rate-group">
          <div className="metric-label">Page checked</div>
          <div className="metric-value-large">{formatCheckedAt(loan.checked_at)} IST</div>
        </div>
      </div>

      <p className="loan-rate-caveat">
        Advertised rates are indicative and depend on eligibility and product terms. Fees are not included.
      </p>

      <div className="loan-source-footer">
        {loan.source_as_of && <span>Rate effective / page date: {loan.source_as_of}</span>}
        <a href={loan.source_url} target="_blank" rel="noopener noreferrer">
          View official source
        </a>
      </div>
    </article>
  );
};

export default LoanCard;
