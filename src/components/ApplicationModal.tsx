import React, { useState } from 'react';
import { createApplication } from '../lib/applications.service';
import type { ApplicationStatus, LocationType, PriorityLevel } from '../types';

// ============================================================
// Application Modal — Create new job application
// user_id is always set server-side via RLS and passed as prop.
// ============================================================

interface ApplicationModalProps {
  onClose: () => void;
  onSaved: () => Promise<void>;
  userId: string;
}

const statusOptions: ApplicationStatus[] = [
  'wishlist', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn'
];

export default function ApplicationModal({ onClose, onSaved, userId }: ApplicationModalProps) {
  const [form, setForm] = useState({
    company_name: '',
    job_title: '',
    job_url: '',
    location: '',
    location_type: 'remote' as LocationType,
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    status: 'applied' as ApplicationStatus,
    priority: 'medium' as PriorityLevel,
    rating: 3,
    applied_date: new Date().toISOString().split('T')[0],
    follow_up_date: '',
    notes: '',
    tags: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name.trim() || !form.job_title.trim()) {
      setError('Company name and job title are required.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      await createApplication(userId, {
        company_name: form.company_name.trim(),
        job_title: form.job_title.trim(),
        job_url: form.job_url.trim() || undefined,
        location: form.location.trim() || undefined,
        location_type: form.location_type,
        salary_min: form.salary_min ? Number(form.salary_min) : undefined,
        salary_max: form.salary_max ? Number(form.salary_max) : undefined,
        salary_currency: form.salary_currency,
        status: form.status,
        priority: form.priority,
        rating: form.rating,
        applied_date: form.applied_date,
        follow_up_date: form.follow_up_date || undefined,
        notes: form.notes.trim() || undefined,
        tags: form.tags
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      });
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add Application</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Company Name *</label>
              <input className="input" required value={form.company_name} onChange={(e) => set('company_name', e.target.value)} placeholder="Stripe" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Job Title *</label>
              <input className="input" required value={form.job_title} onChange={(e) => set('job_title', e.target.value)} placeholder="Senior Engineer" />
            </div>
          </div>

          <div>
            <label className="label">Job URL</label>
            <input className="input" type="url" value={form.job_url} onChange={(e) => set('job_url', e.target.value)} placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => set('status', e.target.value as ApplicationStatus)}>
                {statusOptions.map((s) => (
                  <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => set('priority', e.target.value as PriorityLevel)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Remote" />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.location_type} onChange={(e) => set('location_type', e.target.value as LocationType)}>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
            <div>
              <label className="label">Currency</label>
              <input className="input" value={form.salary_currency} onChange={(e) => set('salary_currency', e.target.value)} placeholder="USD" maxLength={3} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Salary Min</label>
              <input className="input" type="number" value={form.salary_min} onChange={(e) => set('salary_min', e.target.value)} placeholder="120000" min={0} />
            </div>
            <div>
              <label className="label">Salary Max</label>
              <input className="input" type="number" value={form.salary_max} onChange={(e) => set('salary_max', e.target.value)} placeholder="160000" min={0} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Applied Date</label>
              <input className="input" type="date" value={form.applied_date} onChange={(e) => set('applied_date', e.target.value)} />
            </div>
            <div>
              <label className="label">Follow-Up Date</label>
              <input className="input" type="date" value={form.follow_up_date} onChange={(e) => set('follow_up_date', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Recruiter details, referrals, impressions…" />
          </div>

          <div>
            <label className="label">Tags (comma-separated)</label>
            <input className="input" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="React, startup, Series B" />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
