import React from 'react';
import '../styles/ComparisonTable.css';

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(value);

const formatRate = (loan) => loan.rate_kind === 'range' && loan.rate_max != null
  ? `${Number(loan.interest_rate).toFixed(2)}%–${Number(loan.rate_max).toFixed(2)}% p.a.`
  : `From ${Number(loan.interest_rate).toFixed(2)}% p.a.`;

export const ComparisonTable = ({ comparisons, onViewSchedule }) => {
  if (!comparisons || comparisons.length === 0) return null;

  const lowestRate = Math.min(...comparisons.map(({ loan }) => Number(loan.interest_rate)));
  const lowestEmi = Math.min(...comparisons.map(({ summary }) => Number(summary.monthlyEmi)));
  const lowestInterest = Math.min(...comparisons.map(({ summary }) => Number(summary.totalInterest)));
  const lowestTotal = Math.min(...comparisons.map(({ summary }) => Number(summary.totalCost)));

  return (
    <section className="comparison-section" aria-labelledby="live-comparison-title">
      <div className="comparison-header">
        <div>
          <h2 className="comparison-title" id="live-comparison-title">Indicative loan comparison</h2>
          <p className="section-subtitle">Estimates use the advertised starting rate or the minimum of a published range. Fees are excluded.</p>
        </div>
      </div>
      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <caption className="sr-only">Indicative loan cost comparison based on official bank rates</caption>
          <thead>
            <tr>
              <th scope="col">Feature</th>
              {comparisons.map(({ loan }) => (
                <th scope="col" key={loan.id}>
                  <div>{loan.bank_name}</div>
                  <span className={`loan-type-tag loan-type-${loan.loan_type}`}>
                    {loan.product_name || `${loan.loan_type} loan`}
                  </span>
                  {onViewSchedule && (
                    <button type="button" className="btn-view-schedule" onClick={() => onViewSchedule(loan)}>
                      View estimate schedule
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Official rate</th>
              {comparisons.map(({ loan }) => (
                <td key={loan.id} className={Number(loan.interest_rate) === lowestRate ? 'highlight-lowest' : ''}>
                  {formatRate(loan)}
                  {Number(loan.interest_rate) === lowestRate && <span className="best-badge">Lowest start</span>}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Estimated monthly EMI</th>
              {comparisons.map(({ loan, summary }) => (
                <td key={loan.id} className={Number(summary.monthlyEmi) === lowestEmi ? 'highlight-lowest' : ''}>
                  {formatCurrency(summary.monthlyEmi)}
                  {Number(summary.monthlyEmi) === lowestEmi && <span className="best-badge">Lowest</span>}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Estimated total interest</th>
              {comparisons.map(({ loan, summary }) => (
                <td key={loan.id} className={Number(summary.totalInterest) === lowestInterest ? 'highlight-lowest' : ''}>
                  {formatCurrency(summary.totalInterest)}
                </td>
              ))}
            </tr>
            <tr className="highlight-row">
              <th scope="row">Estimated total payable, excluding fees</th>
              {comparisons.map(({ loan, summary }) => (
                <td key={loan.id} className={Number(summary.totalCost) === lowestTotal ? 'highlight-lowest' : ''}>
                  {formatCurrency(summary.totalCost)}
                  {Number(summary.totalCost) === lowestTotal && <span className="best-badge">Lowest</span>}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Rate source</th>
              {comparisons.map(({ loan }) => (
                <td key={loan.id}>
                  <a href={loan.source_url} target="_blank" rel="noopener noreferrer">Official bank page</a>
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

export default ComparisonTable;
