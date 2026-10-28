import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getApplications, computePipelineStats, exportApplicationsToCSV } from '../lib/applications.service';
import { getReminders, processOverdueReminders, computeReminderStats } from '../lib/reminders.service';
import type { Application, Reminder, PipelineStats } from '../types';
import KanbanBoard from '../components/KanbanBoard';
import RemindersPanel from '../components/RemindersPanel';
import ApplicationModal from '../components/ApplicationModal';
import StatCard from '../components/StatCard';

// ============================================================
// Dashboard — the main authenticated view
// ============================================================

type DashboardTab = 'pipeline' | 'reminders' | 'calendar';

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<DashboardTab>('pipeline');
  const [showNewApp, setShowNewApp] = useState(false);

  // ---- data loading ------------------------------------------
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [apps, rems] = await Promise.all([
        getApplications(),
        getReminders(['pending', 'overdue']),
      ]);
      setApplications(apps);
      setReminders(rems);
      setStats(computePipelineStats(apps));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Process overdue reminders on mount, then load data
  useEffect(() => {
    if (user) {
      processOverdueReminders(user.id)
        .catch((e) => console.warn('[Reminders] Server processing note:', e?.message))
        .finally(() => loadData());
    }
  }, [user, loadData]);

  // ---- CSV export --------------------------------------------
  const handleExportCSV = () => {
    const csv = exportApplicationsToCSV(applications);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applyledger-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reminderStats = computeReminderStats(reminders);
  const overdueCount = reminderStats.overdue;
  const todayCount = reminderStats.dueToday;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading your pipeline…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ---- Header ---- */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-lg tracking-tight">ApplyLedger</span>
          </div>

          <nav className="hidden sm:flex items-center gap-1">
            {(['pipeline', 'reminders', 'calendar'] as DashboardTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize relative ${
                  tab === t
                    ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t}
                {t === 'reminders' && overdueCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                    {overdueCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              title="Export to CSV"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0-3-3m3 3 3-3m2 8H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
              </svg>
              Export
            </button>

            <button
              onClick={() => setShowNewApp(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Application
            </button>

            <button
              onClick={signOut}
              title="Sign out"
              className="ml-2 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ---- Error banner ---- */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ---- Welcome & Stats ---- */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {profile?.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]}!` : 'Your Job Search Pipeline'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total Applications" value={stats.total} color="brand" />
            <StatCard label="Active Pipeline" value={stats.active} color="blue" />
            <StatCard label="Offers Received" value={stats.offer} color="green" />
            <StatCard
              label={overdueCount > 0 ? `${overdueCount} Overdue Reminder${overdueCount > 1 ? 's' : ''}` : todayCount > 0 ? `${todayCount} Due Today` : 'All Caught Up'}
              value={overdueCount > 0 ? overdueCount : todayCount}
              color={overdueCount > 0 ? 'red' : todayCount > 0 ? 'amber' : 'green'}
              onClick={() => setTab('reminders')}
            />
          </div>
        )}

        {/* ---- Tab Content ---- */}
        {tab === 'pipeline' && (
          <KanbanBoard
            applications={applications}
            onApplicationsChange={loadData}
          />
        )}

        {tab === 'reminders' && (
          <RemindersPanel
            reminders={reminders}
            onRemindersChange={loadData}
            userId={user?.id ?? ''}
          />
        )}

        {tab === 'calendar' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500 dark:text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <p className="font-medium">Interview Calendar</p>
            <p className="text-sm mt-1">Upcoming interviews will appear here.</p>
          </div>
        )}
      </main>

      {/* ---- Application Modal ---- */}
      {showNewApp && (
        <ApplicationModal
          onClose={() => setShowNewApp(false)}
          onSaved={async () => {
            setShowNewApp(false);
            await loadData();
          }}
          userId={user?.id ?? ''}
        />
      )}
    </div>
  );
}
