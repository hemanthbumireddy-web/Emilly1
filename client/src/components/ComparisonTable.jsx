// client/src/components/ComparisonTable.jsx
import React from 'react';
import '../styles/ComparisonTable.css';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const ComparisonTable = ({ comparisons, onViewSchedule }) => {
  if (!comparisons || comparisons.length === 0) return null;

  const minRate = Math.min(...comparisons.map((c) => Number(c.loan.interest_rate)));
  const minEmi = Math.min(...comparisons.map((c) => Number(c.summary.monthlyEmi)));
  const minInterest = Math.min(...comparisons.map((c) => Number(c.summary.totalInterest)));
  const minFee = Math.min(...comparisons.map((c) => Number(c.summary.processingFee)));
  const minCost = Math.min(...comparisons.map((c) => Number(c.summary.totalCost)));
  const minEffectiveCost = Math.min(
    ...comparisons.map((c) => Number(c.summary.effectiveCostPercent))
  );

  return (
    <div className="comparison-table-card">
      <div className="comparison-table-scroll">
        <table className="side-by-side-table">
          <thead>
            <tr>
              <th>Bank</th>
              {comparisons.map(({ loan }) => (
                <th key={loan.id}>
                  <div className="bank-cell-header">
                    <span className="bank-name-text">{loan.bank_name}</span>
                    <span className="bank-type-tag">{loan.loan_type} loan</span>
                    {onViewSchedule && (
                      <button
                        type="button"
                        className="btn-view-schedule"
                        onClick={() => onViewSchedule(loan)}
                      >
                        View schedule
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Interest Rate</td>
              {comparisons.map(({ loan }) => {
                const isBest = Number(loan.interest_rate) === minRate;
                return (
                  <td key={loan.id} className={isBest ? 'highlight-best' : ''}>
                    {loan.interest_rate}% p.a.
                    {isBest && <span className="best-badge">Best</span>}
                  </td>
                );
              })}
            </tr>

            <tr>
              <td>Monthly EMI</td>
              {comparisons.map(({ loan, summary }) => {
                const isBest = Number(summary.monthlyEmi) === minEmi;
                return (
                  <td key={loan.id} className={isBest ? 'highlight-best' : ''}>
                    {formatCurrency(summary.monthlyEmi)}
                    {isBest && <span className="best-badge">Lowest</span>}
                  </td>
                );
              })}
            </tr>

            <tr>
              <td>Total Interest</td>
              {comparisons.map(({ loan, summary }) => {
                const isBest = Number(summary.totalInterest) === minInterest;
                return (
                  <td key={loan.id} className={isBest ? 'highlight-best' : ''}>
                    {formatCurrency(summary.totalInterest)}
                    {isBest && <span className="best-badge">Lowest</span>}
                  </td>
                );
              })}
            </tr>

            <tr>
              <td>Processing Fee</td>
              {comparisons.map(({ loan, summary }) => {
                const isBest = Number(summary.processingFee) === minFee;
                return (
                  <td key={loan.id} className={isBest ? 'highlight-best' : ''}>
                    {formatCurrency(summary.processingFee)}
                    {isBest && <span className="best-badge">Lowest</span>}
                  </td>
                );
              })}
            </tr>

            <tr>
              <td>Total Cost</td>
              {comparisons.map(({ loan, summary }) => {
                const isBest = Number(summary.totalCost) === minCost;
                return (
                  <td key={loan.id} className={isBest ? 'highlight-best' : ''}>
                    {formatCurrency(summary.totalCost)}
                    {isBest && <span className="best-badge">Lowest</span>}
                  </td>
                );
              })}
            </tr>

            <tr>
              <td>Effective Cost %</td>
              {comparisons.map(({ loan, summary }) => {
                const isBest = Number(summary.effectiveCostPercent) === minEffectiveCost;
                return (
                  <td key={loan.id} className={isBest ? 'highlight-best' : ''}>
                    {summary.effectiveCostPercent}%
                    {isBest && <span className="best-badge">Lowest</span>}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
