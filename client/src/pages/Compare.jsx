// client/src/pages/Compare.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { ComparisonTable } from '../components/ComparisonTable.jsx';
import { CostChart } from '../components/CostChart.jsx';
import { AmortizationModal } from '../components/AmortizationModal.jsx';
import { compareLoans, saveComparison, explainComparisonApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Compare.css';

export const Compare = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user, session } = useAuth();

  // Extract loan IDs from query params or router state
  const queryLoanIds = searchParams.get('loanIds');
  const initialLoanIds = queryLoanIds
    ? queryLoanIds.split(',').filter(Boolean)
    : location.state?.loanIds || [];

  const [loanIds, setLoanIds] = useState(initialLoanIds);
  const [amount, setAmount] = useState(500000);
  const [tenureMonths, setTenureMonths] = useState(60);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [saving, setSaving] = useState(false);
  const [comparisons, setComparisons] = useState([]);

  // Amortization modal state
  const [scheduleLoan, setScheduleLoan] = useState(null);

  // Gemini explanation state
  const [explaining, setExplaining] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [explainError, setExplainError] = useState(null);

  const handleRunComparison = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSaveSuccess(null);
    setRecommendation(null);
    setExplainError(null);

    if (!loanIds || loanIds.length < 2 || loanIds.length > 4) {
      setError('Please select between 2 and 4 loans to compare.');
      return;
    }

    setLoading(true);
    try {
      const response = await compareLoans({
        loanIds,
        amount,
        tenureMonths,
      });
      setComparisons(response.comparisons || []);
    } catch (err) {
      // Show validation errors returned by the API
      setError(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialLoanIds && initialLoanIds.length >= 2) {
      setLoanIds(initialLoanIds);
      handleRunComparison();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!user || !session?.access_token) return;

    setSaving(true);
    setError(null);
    setSaveSuccess(null);

    try {
      await saveComparison(session.access_token, {
        loanIds,
        amount,
        tenureMonths,
      });
      setSaveSuccess('Comparison saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save comparison');
    } finally {
      setSaving(false);
    }
  };

  const handleExplain = async () => {
    if (!comparisons || comparisons.length === 0) return;
    setExplaining(true);
    setExplainError(null);

    try {
      const text = await explainComparisonApi({
        amount,
        tenureMonths,
        comparisons,
      });
      setRecommendation(text);
    } catch (err) {
      setExplainError(err.message || 'Failed to generate explanation');
    } finally {
      setExplaining(false);
    }
  };

  if (!loanIds || loanIds.length < 2) {
    return (
      <div className="page-wrapper">
        <div className="empty-state-card">
          <h2 className="empty-state-title">No Loans Selected for Comparison</h2>
          <p className="empty-state-text">
            Please return to the Loans page and select between 2 and 4 loans to compare.
          </p>
          <Link to="/" className="btn-change-selection-link">
            Browse Loans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Side-by-Side Loan Comparison</h1>
        <p className="page-subtitle">
          Adjust loan amount and tenure below, then run comparison to view detailed tables, cost charts, and AI explanations.
        </p>
      </div>

      {saveSuccess && (
        <div className="status-alert status-alert-success">
          <span>{saveSuccess}</span>
          <button
            type="button"
            className="status-alert-dismiss"
            onClick={() => setSaveSuccess(null)}
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

      {/* Input Form for Amount & Tenure */}
      <form className="compare-input-card" onSubmit={handleRunComparison}>
        <div className="compare-input-grid">
          <div className="compare-field">
            <label className="compare-label" htmlFor="compare-amount">
              Loan Amount (₹)
            </label>
            <input
              id="compare-amount"
              type="number"
              className="compare-input"
              min="10000"
              step="10000"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
            />
          </div>

          <div className="compare-field">
            <label className="compare-label" htmlFor="compare-tenure">
              Tenure (Months)
            </label>
            <input
              id="compare-tenure"
              type="number"
              className="compare-input"
              min="6"
              max="360"
              step="6"
              required
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value) || 12)}
            />
          </div>

          <button
            type="submit"
            className="btn-trigger-compare"
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Compare'}
          </button>
        </div>
      </form>

      {/* Comparison results */}
      {comparisons.length > 0 && (
        <>
          <div className="compare-top-actions">
            <div>
              {user ? (
                <button
                  type="button"
                  className="btn-save-comparison-action"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save comparison'}
                </button>
              ) : (
                <Link to="/login" className="login-to-save-link">
                  Log in to save comparison
                </Link>
              )}
            </div>

            <div>
              <button
                type="button"
                className="btn-explain-comparison"
                onClick={handleExplain}
                disabled={explaining}
              >
                {explaining ? 'Analyzing with AI...' : 'Explain this comparison'}
              </button>
            </div>

            <Link to="/" className="btn-change-selection-link">
              Change Selection
            </Link>
          </div>

          {/* AI Recommendation Box */}
          {explaining && (
            <div className="explain-card">
              <div className="explain-header">
                <div className="explain-title-group">
                  <span className="explain-title">AI Recommendation</span>
                  <span className="explain-badge">Gemini</span>
                </div>
              </div>
              <p className="explain-loading-text">
                Analyzing loans, interest rates, and total payable amounts to formulate a concise recommendation...
              </p>
            </div>
          )}

          {explainError && (
            <div className="status-alert status-alert-error">
              <span>{explainError}</span>
              <button
                type="button"
                className="status-alert-dismiss"
                onClick={() => setExplainError(null)}
              >
                &times;
              </button>
            </div>
          )}

          {recommendation && !explaining && (
            <div className="explain-card">
              <div className="explain-header">
                <div className="explain-title-group">
                  <span className="explain-title">AI Recommendation</span>
                  <span className="explain-badge">Gemini Advisor</span>
                </div>
              </div>
              <p className="explain-body">{recommendation}</p>
            </div>
          )}

          {/* Side-by-Side Comparison Table with View Schedule button */}
          <ComparisonTable
            comparisons={comparisons}
            onViewSchedule={(loan) => setScheduleLoan(loan)}
          />

          {/* Recharts Bar Chart of Total Cost per loan */}
          <CostChart comparisons={comparisons} />
        </>
      )}

      {/* Amortization Schedule & Prepayment Simulator Modal */}
      <AmortizationModal
        isOpen={Boolean(scheduleLoan)}
        onClose={() => setScheduleLoan(null)}
        loan={scheduleLoan}
        amount={amount}
        tenureMonths={tenureMonths}
      />
    </div>
  );
};

export default Compare;
