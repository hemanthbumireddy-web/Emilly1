import React from 'react';
import { SavedComparison } from '../services/comparisonService.js';
import { Loan } from '../services/loanService.js';
import { formatCurrency } from '../utils/emiCalculator.js';
import '../styles/SavedComparisons.css';

interface SavedComparisonsListProps {
  savedList: SavedComparison[];
  allLoans: Loan[];
  onLoad: (comp: SavedComparison) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
}

export const SavedComparisonsList: React.FC<SavedComparisonsListProps> = ({
  savedList,
  allLoans,
  onLoad,
  onDelete,
  isLoading,
  isLoggedIn,
  onOpenAuth,
}) => {
  if (!isLoggedIn) {
    return (
      <div className="empty-state">
        <h3 className="section-title">Sign In Required</h3>
        <p className="section-subtitle">
          Please sign in to view, save, and manage your personalized loan comparisons.
        </p>
        <div className="saved-auth-cta">
          <button type="button" className="btn-auth" onClick={onOpenAuth}>
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="empty-state">
        <p>Loading your saved comparisons...</p>
      </div>
    );
  }

  if (savedList.length === 0) {
    return (
      <div className="empty-state">
        <h3 className="section-title">No Saved Comparisons Yet</h3>
        <p className="section-subtitle">
          Select 2 or more loans from the comparison page and click "Save Comparison" to bookmark them here.
        </p>
      </div>
    );
  }

  const getLoanDetails = (loanId: string): Loan | undefined => {
    return allLoans.find((l) => l.id === loanId);
  };

  return (
    <div className="saved-comparisons-container">
      {savedList.map((comp) => {
        const dateStr = new Date(comp.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={comp.id} className="saved-card">
            <div className="saved-card-header">
              <div className="saved-card-meta">
                <span className="saved-badge">
                  {comp.loan_ids.length} Loans Compared
                </span>
                <span>Amount: <strong>{formatCurrency(comp.amount)}</strong></span>
                <span>Tenure: <strong>{comp.tenure_months} mo</strong></span>
                <span>Saved on {dateStr}</span>
              </div>
              <div className="comparison-actions">
                <button
                  type="button"
                  className="btn-load-saved"
                  onClick={() => onLoad(comp)}
                >
                  Load in View
                </button>
                <button
                  type="button"
                  className="btn-delete-saved"
                  onClick={() => onDelete(comp.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="saved-loans-chips">
              {comp.loan_ids.map((id) => {
                const loan = getLoanDetails(id);
                return (
                  <div key={id} className="saved-loan-chip">
                    <span className="saved-loan-name">
                      {loan ? loan.bank_name : `Loan #${id.slice(0, 8)}`}
                    </span>
                    {loan && (
                      <span className="saved-loan-rate">
                        {loan.interest_rate}% p.a.
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
