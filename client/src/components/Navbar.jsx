// client/src/components/Navbar.jsx
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Navbar.css';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <svg
            className="navbar-logo"
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
          <span>LoanCompare</span>
        </Link>

        <nav className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Loans
          </NavLink>
          <NavLink
            to="/compare"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Compare
          </NavLink>
          <NavLink
            to="/saved"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Saved Comparisons
          </NavLink>
        </nav>

        <div className="navbar-auth">
          {user ? (
            <>
              <span className="user-email-tag" title={user.email}>
                {user.email}
              </span>
              <button
                type="button"
                className="btn-nav-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-nav-login">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
