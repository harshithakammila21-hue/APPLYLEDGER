import React, { useState } from 'react';
import type { Application, ApplicationStatus } from '../types';

interface ApplicationCardProps {
  application: Application;
  allStatuses: ApplicationStatus[];
  isMoving: boolean;
  isDeleting: boolean;
  onStatusChange: (status: ApplicationStatus) => void;
  onDelete: () => void;
  onArchive: () => void;
}

const priorityDot: Record<string, string> = {
  high:   'bg-red-500',
  medium: 'bg-amber-400',
  low:    'bg-green-400',
};

const locationIcon: Record<string, string> = {
  remote: '🌐',
  hybrid: '🏢',
  onsite: '📍',
};

export default function ApplicationCard({
  application: app,
  allStatuses,
  isMoving,
  isDeleting,
  onStatusChange,
  onDelete,
  onArchive,
}: ApplicationCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const salaryText =
    app.salary_min || app.salary_max
      ? `${app.salary_currency ?? '$'}${app.salary_min ? (app.salary_min / 1000).toFixed(0) + 'k' : ''}${
          app.salary_max ? `–${(app.salary_max / 1000).toFixed(0)}k` : ''
        }`
      : null;

  const daysAgo = app.applied_date
    ? Math.round((Date.now() - new Date(app.applied_date).getTime()) / 86_400_000)
    : null;

  const isOverdueFollowUp =
    app.follow_up_date && new Date(app.follow_up_date) < new Date();

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 transition-opacity ${
        isMoving || isDeleting ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot[app.priority]}`} title={`${app.priority} priority`} />
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{app.company_name}</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{app.job_title}</p>
        </div>

        {/* Context menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
              {/* Move to status */}
              <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Move to</p>
              {allStatuses.filter((s) => s !== app.status).map((s) => (
                <button
                  key={s}
                  onClick={() => { onStatusChange(s); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 capitalize transition-colors"
                >
                  {s}
                </button>
              ))}
              <hr className="my-1 border-slate-100 dark:border-slate-700" />
              <button
                onClick={() => { onArchive(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              >
                Archive
              </button>
              <button
                onClick={() => { onDelete(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {app.location && (
          <span className="text-[10px] text-slate-500 dark:text-slate-500">
            {locationIcon[app.location_type] ?? ''} {app.location_type}
          </span>
        )}
        {salaryText && (
          <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
            {salaryText}
          </span>
        )}
        {daysAgo !== null && (
          <span className="text-[10px] text-slate-400 dark:text-slate-600 ml-auto">
            {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
          </span>
        )}
      </div>

      {/* Follow-up warning */}
      {isOverdueFollowUp && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-red-500 dark:text-red-400 font-medium">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          Follow-up overdue
        </div>
      )}

      {/* Tags */}
      {app.tags && app.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {app.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Expand notes */}
      {app.notes && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-[10px] text-brand-500 hover:text-brand-700 font-medium"
        >
          {expanded ? 'Hide notes ▲' : 'Show notes ▼'}
        </button>
      )}
      {expanded && app.notes && (
        <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
          {app.notes}
        </p>
      )}
    </div>
  );
}
