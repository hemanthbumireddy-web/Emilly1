import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar.js';
import { LoanFilter } from '../components/LoanFilter.js';
import { LoanCard } from '../components/LoanCard.js';
import { ComparisonTable } from '../components/ComparisonTable.js';
import { SavedComparisonsList } from '../components/SavedComparisonsList.js';
import { AuthModal } from '../components/AuthModal.js';
import { SqlViewer } from '../components/SqlViewer.js';
import { Loan, fetchLoans } from '../services/loanService.js';
import {
  SavedComparison,
  fetchSavedComparisons,
  saveComparison,
  deleteComparison,
} from '../services/comparisonService.js';
import { useAuth } from '../context/AuthContext.js';
import '../styles/App.css';

export const HomePage: React.FC = () => {
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<'compare' | 'saved' | 'sql'>('compare');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Filter states
  const [amount, setAmount] = useState<number>(500000);
  const [tenureMonths, setTenureMonths] = useState<number>(60);
  const [loanType, setLoanType] = useState<string>('all');

  // Loans state
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loadingLoans, setLoadingLoans] = useState<boolean>(true);
  const [selectedLoanIds, setSelectedLoanIds] = useState<string[]>([]);

  // Saved comparisons state
  const [savedList, setSavedList] = useState<SavedComparison[]>([]);
  const [loadingSaved, setLoadingSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Status and error banners
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load loans
  const loadLoans = useCallback(async (forceRefresh = false) => {
    setLoadingLoans(true);
    setErrorMessage(null);
    try {
      const data = await fetchLoans({
        loan_type: loanType,
        amount,
        tenure_months: tenureMonths,
        refresh: forceRefresh,
      });
      setLoans(data);

      // Default select first two loans for initial side-by-side comparison if none selected
      if (selectedLoanIds.length === 0 && data.length >= 2) {
        setSelectedLoanIds([data[0].id, data[1].id]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch loans');
    } finally {
      setLoadingLoans(false);
    }
  }, [loanType, amount, tenureMonths]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  // Load saved comparisons when user is logged in
  const loadSaved = useCallback(async () => {
    if (!token) {
      setSavedList([]);
      return;
    }
    setLoadingSaved(true);
    try {
      const data = await fetchSavedComparisons(token);
      setSavedList(data);
    } catch (err: any) {
      console.warn('Failed to load saved comparisons:', err);
    } finally {
      setLoadingSaved(false);
    }
  }, [token]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const handleToggleSelectLoan = (loanId: string) => {
    setSelectedLoanIds((prev) => {
      if (prev.includes(loanId)) {
        return prev.filter((id) => id !== loanId);
      }
      if (prev.length >= 4) {
        setStatusMessage('You can compare a maximum of 4 loans side-by-side.');
        setTimeout(() => setStatusMessage(null), 3000);
        return prev;
      }
      return [...prev, loanId];
    });
  };

  const handleClearSelection = () => {
    setSelectedLoanIds([]);
  };

  const handleSaveComparison = async () => {
    if (!user || !token) {
      setIsAuthModalOpen(true);
      return;
    }

    if (selectedLoanIds.length < 2) {
      setStatusMessage('Please select at least 2 loans to compare and save.');
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    try {
      await saveComparison(token, selectedLoanIds, amount, tenureMonths);
      setStatusMessage('Comparison saved successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
      await loadSaved();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save comparison');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSavedComparison = (comp: SavedComparison) => {
    setAmount(comp.amount);
    setTenureMonths(comp.tenure_months);
    setSelectedLoanIds(comp.loan_ids);
    setActiveTab('compare');
    setStatusMessage('Loaded saved comparison.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDeleteSavedComparison = async (id: string) => {
    if (!token) return;
    try {
      await deleteComparison(token, id);
      setSavedList((prev) => prev.filter((c) => c.id !== id));
      setStatusMessage('Saved comparison deleted.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete saved comparison');
    }
  };

  const selectedLoans = loans.filter((l) => selectedLoanIds.includes(l.id));

  return (
    <div className="app-container">
      <Navbar
        onOpenAuth={() => setIsAuthModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedList.length}
      />

      <main className="main-content">
        {statusMessage && (
          <div className="info-banner">
            <span>{statusMessage}</span>
            <button
              type="button"
              className="tab-button"
              onClick={() => setStatusMessage(null)}
            >
              &times;
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="error-banner">
            <span>{errorMessage}</span>
          </div>
        )}

        {activeTab === 'compare' && (
          <>
            <div className="section-header">
              <h1 className="section-title">Indian Loan Rate Comparison & EMI Calculator</h1>
              <p className="section-subtitle">
                Compare published rates fetched from official bank pages. Effective dates are shown per offer; EMI estimates are indicative and final terms depend on lender eligibility.
              </p>
            </div>

            <LoanFilter
              amount={amount}
              setAmount={setAmount}
              tenureMonths={tenureMonths}
              setTenureMonths={setTenureMonths}
              loanType={loanType}
              setLoanType={setLoanType}
            />

            {selectedLoans.length > 0 && (
              <ComparisonTable
                selectedLoans={selectedLoans}
                amount={amount}
                tenureMonths={tenureMonths}
                onClear={handleClearSelection}
                onSave={handleSaveComparison}
                isSaving={isSaving}
                canSave={Boolean(user)}
              />
            )}

            <div className="section-header">
              <h2 className="section-title">
                Available Loans ({loans.length})
              </h2>
              <p className="section-subtitle">
                Select 2 or more offers to compare indicative EMIs. Rates are fetched from official bank pages; eligibility and fees may change your final offer.
              </p>
              <button
                type="button"
                className="tab-button rate-refresh-button"
                onClick={() => loadLoans(true)}
                disabled={loadingLoans}
              >
                {loadingLoans ? 'Checking bank pages…' : 'Refresh official rates'}
              </button>
            </div>

            {loadingLoans ? (
              <div className="empty-state">
                <p>Loading loan offers...</p>
              </div>
            ) : loans.length === 0 ? (
              <div className="empty-state">
                <h3>No current offers are available for this loan type.</h3>
                <p>Try another loan type or refresh the official bank pages.</p>
              </div>
            ) : (
              <div className="loan-list-grid">
                {loans.map((loan) => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    amount={amount}
                    tenureMonths={tenureMonths}
                    isSelected={selectedLoanIds.includes(loan.id)}
                    onToggleSelect={handleToggleSelectLoan}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <>
            <div className="section-header">
              <h1 className="section-title">Your Saved Comparisons</h1>
              <p className="section-subtitle">
                View, reload, and manage loan comparisons you have previously saved.
              </p>
            </div>

            <SavedComparisonsList
              savedList={savedList}
              allLoans={loans}
              onLoad={handleLoadSavedComparison}
              onDelete={handleDeleteSavedComparison}
              isLoading={loadingSaved}
              isLoggedIn={Boolean(user)}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          </>
        )}

        {activeTab === 'sql' && (
          <>
            <div className="section-header">
              <h1 className="section-title">Saved Comparisons Database Setup</h1>
              <p className="section-subtitle">
                Row Level Security policies for saved comparisons. Live rates are fetched from official bank pages.
              </p>
            </div>

            <SqlViewer />
          </>
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
