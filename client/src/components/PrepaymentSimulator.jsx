// client/src/components/PrepaymentSimulator.jsx
import React, { useState } from 'react';
import { simulatePrepayment } from '../utils/loanCalculator.js';
import '../styles/PrepaymentSimulator.css';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const PrepaymentSimulator = ({ principal, annualRate, tenureMonths }) => {
  const [extraMonthly, setExtraMonthly] = useState(2000);

  const result = simulatePrepayment(
    principal,
    annualRate,
    tenureMonths,
    Number(extraMonthly) || 0
  );

  return (
    <div className="prepayment-card">
      <h4 className="prepayment-title">Prepayment Simulator</h4>
      <p className="prepayment-subtitle">
        See how adding an extra amount to your monthly payment reduces your tenure and interest.
      </p>

      <div className="prepayment-form-row">
        <label className="prepayment-label" htmlFor="prepayment-extra-input">
          Extra Monthly Payment (₹):
        </label>
        <input
          id="prepayment-extra-input"
          type="number"
          min="0"
          step="500"
          className="prepayment-input"
          value={extraMonthly}
          onChange={(e) => setExtraMonthly(Number(e.target.value) || 0)}
        />
      </div>

      <div className="prepayment-results-grid">
        <div className="prepayment-result-box">
          <span className="prepayment-result-key">New Tenure</span>
          <span className="prepayment-result-val">
            {result.newTenureMonths} Months
          </span>
        </div>

        <div className="prepayment-result-box prepayment-box-success">
          <span className="prepayment-result-key">Tenure Saved</span>
          <span className="prepayment-result-val-highlight">
            {result.monthsSaved} Months ({Math.round((result.monthsSaved / 12) * 10) / 10} Yrs)
          </span>
        </div>

        <div className="prepayment-result-box prepayment-box-success">
          <span className="prepayment-result-key">Interest Saved</span>
          <span className="prepayment-result-val-highlight">
            {formatCurrency(result.interestSaved)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrepaymentSimulator;
