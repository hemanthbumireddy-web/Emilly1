import React from 'react';
import '../styles/LoanFilter.css';

interface LoanFilterProps {
  amount: number;
  setAmount: (amount: number) => void;
  tenureMonths: number;
  setTenureMonths: (tenure: number) => void;
  loanType: string;
  setLoanType: (type: string) => void;
}

export const LoanFilter: React.FC<LoanFilterProps> = ({
  amount,
  setAmount,
  tenureMonths,
  setTenureMonths,
  loanType,
  setLoanType,
}) => {
  const commonAmounts = [
    { label: '₹1 Lakh', val: 100000 },
    { label: '₹5 Lakhs', val: 500000 },
    { label: '₹10 Lakhs', val: 1000000 },
    { label: '₹25 Lakhs', val: 2500000 },
    { label: '₹50 Lakhs', val: 5000000 },
  ];

  const commonTenures = [
    { label: '1 Yr (12m)', val: 12 },
    { label: '3 Yrs (36m)', val: 36 },
    { label: '5 Yrs (60m)', val: 60 },
    { label: '10 Yrs (120m)', val: 120 },
    { label: '20 Yrs (240m)', val: 240 },
  ];

  return (
    <div className="filter-card">
      <div className="filter-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="loan-type-select">
            Loan Type
          </label>
          <select
            id="loan-type-select"
            className="form-select"
            value={loanType}
            onChange={(e) => setLoanType(e.target.value)}
          >
            <option value="all">All Loan Types</option>
            <option value="home">Home Loan</option>
            <option value="personal">Personal Loan</option>
            <option value="car">Car Loan</option>
            <option value="education">Education Loan</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="loan-amount-input">
            Loan Amount (₹)
          </label>
          <input
            id="loan-amount-input"
            type="number"
            className="form-input"
            min="10000"
            max="100000000"
            step="10000"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
          />
          <div className="tenure-presets">
            {commonAmounts.map((preset) => (
              <button
                key={preset.val}
                type="button"
                className="preset-chip"
                onClick={() => setAmount(preset.val)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="tenure-input">
            Tenure (Months)
          </label>
          <input
            id="tenure-input"
            type="number"
            className="form-input"
            min="6"
            max="360"
            step="6"
            value={tenureMonths}
            onChange={(e) => setTenureMonths(Number(e.target.value) || 12)}
          />
          <div className="tenure-presets">
            {commonTenures.map((preset) => (
              <button
                key={preset.val}
                type="button"
                className="preset-chip"
                onClick={() => setTenureMonths(preset.val)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
