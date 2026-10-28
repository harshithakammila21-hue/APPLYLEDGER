import React, { useState } from 'react';
import type { Application, ApplicationStatus } from '../types';
import { updateApplicationStatus, deleteApplication, archiveApplication } from '../lib/applications.service';
import ApplicationCard from './ApplicationCard';

// ============================================================
// Kanban Board — drag-free pipeline view
// Status columns match the DB CHECK constraint values exactly.
// ============================================================

const COLUMNS: { status: ApplicationStatus; label: string; color: string }[] = [
  { status: 'wishlist',     label: 'Wishlist',     color: 'bg-slate-100 dark:bg-slate-800/60' },
  { status: 'applied',      label: 'Applied',      color: 'bg-blue-50 dark:bg-blue-900/20' },
  { status: 'screening',    label: 'Screening',    color: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { status: 'interviewing', label: 'Interviewing', color: 'bg-purple-50 dark:bg-purple-900/20' },
  { status: 'offer',        label: 'Offer',        color: 'bg-green-50 dark:bg-green-900/20' },
  { status: 'rejected',     label: 'Rejected',     color: 'bg-red-50 dark:bg-red-900/20' },
];

interface KanbanBoardProps {
  applications: Application[];
  onApplicationsChange: () => Promise<void>;
}

export default function KanbanBoard({ applications, onApplicationsChange }: KanbanBoardProps) {
  const [movingId, setMovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    setMovingId(id);
    try {
      await updateApplicationStatus(id, newStatus);
      await onApplicationsChange();
    } catch (err) {
      console.error('[Kanban] Status change failed:', err);
    } finally {
      setMovingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this application? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteApplication(id);
      await onApplicationsChange();
    } finally {
      setDeletingId(null);
    }
  };

  const handleArchive = async (id: string) => {
    await archiveApplication(id, true);
    await onApplicationsChange();
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {COLUMNS.map(({ status, label, color }) => {
          const cards = applications.filter((a) => a.status === status);
          return (
            <div key={status} className={`w-64 flex-shrink-0 rounded-2xl ${color} p-3`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {label}
                </h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-500 bg-white dark:bg-slate-700 rounded-full px-2 py-0.5 shadow-sm">
                  {cards.length}
                </span>
              </div>

              <div className="space-y-2">
                {cards.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    allStatuses={COLUMNS.map((c) => c.status)}
                    isMoving={movingId === app.id}
                    isDeleting={deletingId === app.id}
                    onStatusChange={(s) => handleStatusChange(app.id, s)}
                    onDelete={() => handleDelete(app.id)}
                    onArchive={() => handleArchive(app.id)}
                  />
                ))}

                {cards.length === 0 && (
                  <div className="text-center py-6 text-slate-400 dark:text-slate-600 text-xs italic">
                    No applications
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
