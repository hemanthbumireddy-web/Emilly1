import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import '../styles/Navbar.css';

interface NavbarProps {
  onOpenAuth: () => void;
  activeTab: 'compare' | 'saved' | 'sql';
  setActiveTab: (tab: 'compare' | 'saved' | 'sql') => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  activeTab,
  setActiveTab,
  savedCount,
}) => {
  const { user, signOut } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <svg
            className="navbar-logo-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
          <span className="navbar-title">LoanCompare</span>
        </div>

        <div className="navbar-actions">
          <button
            className={`tab-button ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            Compare Loans
          </button>
          <button
            className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Comparisons {savedCount > 0 ? `(${savedCount})` : ''}
          </button>
          <button
            className={`tab-button ${activeTab === 'sql' ? 'active' : ''}`}
            onClick={() => setActiveTab('sql')}
          >
            Database SQL
          </button>

          {user ? (
            <>
              <span className="user-badge" title={user.email || ''}>
                {user.email}
              </span>
              <button className="btn-logout" onClick={() => signOut()}>
                Sign Out
              </button>
            </>
          ) : (
            <button className="btn-auth" onClick={onOpenAuth}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
