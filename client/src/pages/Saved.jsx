// client/src/pages/Saved.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSavedComparisons, deleteSavedComparison } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Saved.css';

const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const Saved = () => {
  const { session } = useAuth();
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const navigate = useNavigate();
  const token = session?.access_token;

  const loadSaved = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSavedComparisons(token);
      setSavedList(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch saved comparisons');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const handleDelete = async (id) => {
    if (!token) return;
    try {
      await deleteSavedComparison(token, id);
      setSavedList((prev) => prev.filter((item) => item.id !== id));
      setMsg('Saved comparison deleted successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete comparison');
    }
  };

  const handleOpen = (comp) => {
    const params = new URLSearchParams({
      loanIds: comp.loan_ids.join(','),
      amount: comp.amount.toString(),
      tenureMonths: comp.tenure_months.toString(),
    });
    navigate(`/compare?${params.toString()}`);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Your Saved Comparisons</h1>
        <p className="page-subtitle">
          Reload previously compared loan combinations, review options, or delete outdated bookmarks.
        </p>
      </div>

      {msg && (
        <div className="status-alert status-alert-success">
          <span>{msg}</span>
          <button
            type="button"
            className="status-alert-dismiss"
            onClick={() => setMsg(null)}
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

      {loading ? (
        <div className="empty-state-card">
          <p className="empty-state-text">Loading saved comparisons...</p>
        </div>
      ) : savedList.length === 0 ? (
        <div className="empty-state-card">
          <h2 className="empty-state-title">No Saved Comparisons Yet</h2>
          <p className="empty-state-text">
            Compare 2 to 4 loans and click "Save Comparison" to bookmark them in your profile.
          </p>
          <Link to="/" className="btn-open-comparison">
            Start Comparing Loans
          </Link>
        </div>
      ) : (
        <div className="saved-list-container">
          {savedList.map((comp) => {
            const formattedDate = new Date(comp.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={comp.id} className="saved-card">
                <div className="saved-card-header">
                  <div className="saved-meta-group">
                    <span className="saved-count-pill">
                      {comp.loan_ids?.length || 0} Loans
                    </span>
                    <span>Amount: <strong>{formatINR(comp.amount)}</strong></span>
                    <span>Tenure: <strong>{comp.tenure_months} mo</strong></span>
                    <span>Saved: {formattedDate}</span>
                  </div>

                  <div className="saved-actions">
                    <button
                      type="button"
                      className="btn-open-comparison"
                      onClick={() => handleOpen(comp)}
                    >
                      Open Comparison
                    </button>
                    <button
                      type="button"
                      className="btn-delete-comparison"
                      onClick={() => handleDelete(comp.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="saved-loans-row">
                  {comp.loans && comp.loans.length > 0 ? (
                    comp.loans.map((loan) => (
                      <div key={loan.id} className="saved-loan-item-pill">
                        <span className="saved-loan-name">{loan.bank_name}</span>
                        <span className="saved-loan-rate">
                          {loan.rate_kind === 'range' && loan.rate_max != null
                            ? `${Number(loan.interest_rate).toFixed(2)}%–${Number(loan.rate_max).toFixed(2)}% p.a.`
                            : `From ${Number(loan.interest_rate).toFixed(2)}% p.a.`}
                        </span>
                      </div>
                    ))
                  ) : (
                    comp.loan_ids.map((id) => (
                      <div key={id} className="saved-loan-item-pill">
                        <span className="saved-loan-name">Loan ID: {id.slice(0, 8)}...</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Saved;
