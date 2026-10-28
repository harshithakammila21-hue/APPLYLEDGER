import React from 'react';
import type { Reminder } from '../types';
import { completeReminder, dismissReminder, deleteReminder } from '../lib/reminders.service';
import { formatDistanceToNow } from 'date-fns';

// ============================================================
// Reminders Panel — shows pending + overdue reminders
// ============================================================

interface RemindersPanelProps {
  reminders: Reminder[];
  onRemindersChange: () => Promise<void>;
  userId: string;
}

const statusBadge: Record<string, string> = {
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  overdue: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  dismissed: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
};

const typeLabel: Record<string, string> = {
  follow_up:            'Follow-Up',
  interview_prep:       'Interview Prep',
  thank_you_note:       'Thank You Note',
  application_deadline: 'App Deadline',
  offer_deadline:       'Offer Deadline',
  custom:               'Custom',
};

export default function RemindersPanel({ reminders, onRemindersChange }: RemindersPanelProps) {
  const sorted = [...reminders].sort((a, b) => {
    // overdue first, then by due date ascending
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (b.status === 'overdue' && a.status !== 'overdue') return 1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const handleComplete = async (id: string) => {
    try {
      await completeReminder(id);
      await onRemindersChange();
    } catch (err) {
      console.error('[Reminders] Complete failed:', err);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await dismissReminder(id);
      await onRemindersChange();
    } catch (err) {
      console.error('[Reminders] Dismiss failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await deleteReminder(id);
      await onRemindersChange();
    } catch (err) {
      console.error('[Reminders] Delete failed:', err);
    }
  };

  if (reminders.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">All caught up!</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">No pending or overdue reminders.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((reminder) => (
        <div
          key={reminder.id}
          className={`bg-white dark:bg-slate-900 rounded-xl border shadow-sm p-4 flex items-start gap-4 ${
            reminder.status === 'overdue'
              ? 'border-red-200 dark:border-red-800'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          {/* Left: priority dot */}
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${
            reminder.priority === 'high' ? 'bg-red-500' :
            reminder.priority === 'medium' ? 'bg-amber-400' : 'bg-green-400'
          }`} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{reminder.title}</p>
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md ${statusBadge[reminder.status]}`}>
                {reminder.status}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {typeLabel[reminder.reminder_type] ?? reminder.reminder_type}
              </span>
            </div>

            {reminder.application && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {(reminder.application as { company_name?: string; job_title?: string }).company_name} — {(reminder.application as { company_name?: string; job_title?: string }).job_title}
              </p>
            )}

            {reminder.notes && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">{reminder.notes}</p>
            )}

            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
              Due: {new Date(reminder.due_date).toLocaleDateString()} (
              {formatDistanceToNow(new Date(reminder.due_date), { addSuffix: true })})
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => handleComplete(reminder.id)}
              title="Mark complete"
              className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={() => handleDismiss(reminder.id)}
              title="Dismiss"
              className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(reminder.id)}
              title="Delete reminder"
              className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
