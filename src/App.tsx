import React from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const { session, loading } = useAuth();

  // ---- Global loading state (session bootstrap from localStorage)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ---- Route: unauthenticated → Auth, authenticated → Dashboard
  if (!session) {
    return <AuthPage />;
  }

  return <DashboardPage />;
}
