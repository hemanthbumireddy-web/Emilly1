// client/src/pages/Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoanCard } from '../components/LoanCard.jsx';
import { getLoans } from '../services/api.js';
import '../styles/Home.css';

export const Home = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sort
  const [loanType, setLoanType] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [sort, setSort] = useState('rate_asc');

  // Selected loans (up to 4)
  const [selectedIds, setSelectedIds] = useState([]);
  const [limitNotice, setLimitNotice] = useState(null);

  const navigate = useNavigate();

  const fetchLoansList = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLoans({
        type: loanType,
        minRate,
        maxRate,
        sort,
        refresh: forceRefresh,
      });
      setLoans(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  }, [loanType, minRate, maxRate, sort]);

  useEffect(() => {
    fetchLoansList();
  }, [fetchLoansList]);

  const handleToggleLoan = (loanId) => {
    setLimitNotice(null);
    setSelectedIds((prev) => {
      if (prev.includes(loanId)) {
        return prev.filter((id) => id !== loanId);
      }
      if (prev.length >= 4) {
        setLimitNotice('You can select a maximum of 4 loans to compare. Deselect one first.');
        return prev;
      }
      return [...prev, loanId];
    });
  };

  const handleCompare = () => {
    if (selectedIds.length < 2 || selectedIds.length > 4) return;
    const query = new URLSearchParams({
      loanIds: selectedIds.join(','),
    });
    navigate(`/compare?${query.toString()}`, {
      state: { loanIds: selectedIds },
    });
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Indian Loan Rate Comparison</h1>
        <p className="page-subtitle">
          Compare rates fetched directly from official bank pages. Each offer shows its published or effective date; starting rates are indicative and your final terms depend on lender eligibility.
        </p>
      </div>

      {limitNotice && (
        <div className="home-limit-notice">
          <span>{limitNotice}</span>
          <button
            type="button"
            className="status-alert-dismiss"
            onClick={() => setLimitNotice(null)}
          >
            &times;
          </button>
        </div>
      )}

      {error && (
        <div className="status-alert status-alert-error">
          <span>{error}</span>
          <button
            type="button"
            className="status-alert-dismiss"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Filters & Sorting */}
      <div className="home-filter-card">
        <div className="home-filter-grid">
          <div className="home-filter-field">
            <label className="home-filter-label" htmlFor="filter-loan-type">
              Loan Type
            </label>
            <select
              id="filter-loan-type"
              className="home-filter-select"
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
            >
              <option value="">All Loan Types</option>
              <option value="home">Home Loan</option>
              <option value="personal">Personal Loan</option>
              <option value="car">Car Loan</option>
            </select>
          </div>

          <div className="home-filter-field">
            <label className="home-filter-label" htmlFor="filter-min-rate">
              Min Starting Rate (%)
            </label>
            <input
              id="filter-min-rate"
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 8.0"
              className="home-filter-input"
              value={minRate}
              onChange={(e) => setMinRate(e.target.value)}
            />
          </div>

          <div className="home-filter-field">
            <label className="home-filter-label" htmlFor="filter-max-rate">
              Max Starting Rate (%)
            </label>
            <input
              id="filter-max-rate"
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 12.0"
              className="home-filter-input"
              value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
            />
          </div>

          <div className="home-filter-field">
            <label className="home-filter-label" htmlFor="filter-sort">
              Sort By
            </label>
            <select
              id="filter-sort"
              className="home-filter-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="rate_asc">Lowest Starting Rate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="home-action-row">
        <div className="home-selection-info">
          Selected: <span className="home-selection-count">{selectedIds.length}</span> of 4 loans
        </div>

        <button
          type="button"
          className="btn-refresh-rates"
          onClick={() => fetchLoansList(true)}
          disabled={loading}
        >
          {loading ? 'Checking bank pages…' : 'Refresh official rates'}
        </button>

        <button
          type="button"
          className="btn-home-compare"
          disabled={selectedIds.length < 2 || selectedIds.length > 4}
          onClick={handleCompare}
        >
          {selectedIds.length < 2
            ? 'Select at least 2 loans'
            : `Compare (${selectedIds.length})`}
        </button>
      </div>

      {/* Loans Grid / Loading / Empty */}
      {loading ? (
        <div className="empty-state-card">
          <p className="empty-state-text">Checking official bank rate pages…</p>
        </div>
      ) : loans.length === 0 ? (
        <div className="empty-state-card">
          <h2 className="empty-state-title">No verified offers match these filters</h2>
          <p className="empty-state-text">Try another loan type or widen the rate range.</p>
        </div>
      ) : (
        <div className="home-loans-grid">
          {loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              isSelected={selectedIds.includes(loan.id)}
              onToggle={handleToggleLoan}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
