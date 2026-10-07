import React from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { HomePage } from './pages/HomePage.js';

export default function App() {
  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  );
}
