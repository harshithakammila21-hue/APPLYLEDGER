// ============================================================
// Applications Service Layer
// All Supabase CRUD operations for the applications table.
// RLS on the server guarantees user_id isolation automatically.
// ============================================================

import { supabase } from './supabase';
import type { Application, ApplicationStatus, PipelineStats } from '../types';
import type { Database } from './database.types';

type AppRow    = Database['public']['Tables']['applications']['Row'];
type AppInsert = Database['public']['Tables']['applications']['Insert'];
type AppUpdate = Database['public']['Tables']['applications']['Update'];

// ---- READ -------------------------------------------------------

/** Fetch all non-archived applications for the signed-in user, newest first. */
export async function getApplications(includeArchived = false): Promise<Application[]> {
  let query = supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (!includeArchived) {
    query = query.eq('archived', false);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load applications: ${error.message}`);
  return (data ?? []) as Application[];
}

/** Fetch a single application by its primary key. */
export async function getApplicationById(id: string): Promise<Application | null> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load application: ${error.message}`);
  return data as Application | null;
}

// ---- CREATE -----------------------------------------------------

export type CreateApplicationInput = Omit<AppInsert,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;

/** Insert a new application. */
export async function createApplication(
  userId: string,
  input: CreateApplicationInput
): Promise<Application> {
  const payload: AppInsert = {
    ...input,
    user_id: userId,
    tags: input.tags ?? [],
    archived: false,
  };

  const { data, error } = await supabase
    .from('applications')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(`Failed to create application: ${error.message}`);
  return data as Application;
}

// ---- UPDATE -----------------------------------------------------

/** Update an existing application. RLS prevents modifying other users' rows. */
export async function updateApplication(
  id: string,
  updates: AppUpdate
): Promise<Application> {
  const payload: AppUpdate = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('applications')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update application: ${error.message}`);
  return data as Application;
}

/** Convenience shortcut to move an application through the pipeline. */
export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<Application> {
  return updateApplication(id, { status });
}

/** Toggle the archived flag. */
export async function archiveApplication(id: string, archived: boolean): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .update({ archived, updated_at: new Date().toISOString() } satisfies AppUpdate)
    .eq('id', id);

  if (error) throw new Error(`Failed to archive application: ${error.message}`);
}

// ---- DELETE -----------------------------------------------------

/** Permanently delete an application and all related records (via CASCADE). */
export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete application: ${error.message}`);
}

// ---- ANALYTICS --------------------------------------------------

/** Compute pipeline statistics from the applications list (no extra DB call). */
export function computePipelineStats(applications: Application[]): PipelineStats {
  const active = applications.filter(
    (a) => !['rejected', 'withdrawn', 'wishlist'].includes(a.status)
  ).length;

  const applied = applications.filter((a) => a.status === 'applied').length;
  const offer = applications.filter((a) => a.status === 'offer').length;
  const totalAppliedOrMore = applications.filter(
    (a) => a.status !== 'wishlist'
  ).length;

  return {
    total: applications.length,
    active,
    wishlist: applications.filter((a) => a.status === 'wishlist').length,
    applied,
    screening: applications.filter((a) => a.status === 'screening').length,
    interviewing: applications.filter((a) => a.status === 'interviewing').length,
    offer,
    rejected: applications.filter((a) => a.status === 'rejected').length,
    responseRate: totalAppliedOrMore
      ? Math.round(((totalAppliedOrMore - applied) / totalAppliedOrMore) * 100)
      : 0,
    offerRate: totalAppliedOrMore
      ? Math.round((offer / totalAppliedOrMore) * 100)
      : 0,
  };
}

// ---- CSV IMPORT / EXPORT ----------------------------------------

const CSV_HEADERS = [
  'Company',
  'Job Title',
  'Status',
  'Location',
  'Location Type',
  'Salary Min',
  'Salary Max',
  'Currency',
  'Priority',
  'Applied Date',
  'Follow-Up Date',
  'Job URL',
  'Notes',
  'Tags',
];

function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportApplicationsToCSV(applications: Application[]): string {
  const rows = applications.map((app) => [
    escapeCsvField(app.company_name),
    escapeCsvField(app.job_title),
    escapeCsvField(app.status),
    escapeCsvField(app.location),
    escapeCsvField(app.location_type),
    escapeCsvField(app.salary_min),
    escapeCsvField(app.salary_max),
    escapeCsvField(app.salary_currency),
    escapeCsvField(app.priority),
    escapeCsvField(app.applied_date),
    escapeCsvField(app.follow_up_date),
    escapeCsvField(app.job_url),
    escapeCsvField(app.notes),
    escapeCsvField((app.tags ?? []).join(';')),
  ]);

  return [CSV_HEADERS.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export interface CsvImportResult {
  succeeded: number;
  failed: number;
  errors: string[];
}

export async function importApplicationsFromCSV(
  csvText: string,
  userId: string
): Promise<CsvImportResult> {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    return { succeeded: 0, failed: 0, errors: ['CSV file is empty or contains only headers.'] };
  }

  const headers = parseCsvLine(lines[0]).map((h) =>
    h.trim().toLowerCase().replace(/[\s-]+/g, '_')
  );
  const result: CsvImportResult = { succeeded: 0, failed: 0, errors: [] };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx]?.trim() ?? ''; });

      const companyName = row['company'];
      const jobTitle = row['job_title'];
      if (!companyName || !jobTitle) throw new Error('Company and Job Title are required.');

      const validStatuses: AppRow['status'][] = [
        'wishlist', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn',
      ];
      const status: AppRow['status'] = validStatuses.includes(row['status']?.toLowerCase() as AppRow['status'])
        ? (row['status'].toLowerCase() as AppRow['status'])
        : 'applied';

      const validLocationTypes: AppRow['location_type'][] = ['remote', 'hybrid', 'onsite'];
      const location_type: AppRow['location_type'] = validLocationTypes.includes(
        row['location_type']?.toLowerCase() as AppRow['location_type']
      )
        ? (row['location_type'].toLowerCase() as AppRow['location_type'])
        : 'remote';

      const validPriorities: AppRow['priority'][] = ['low', 'medium', 'high'];
      const priority: AppRow['priority'] = validPriorities.includes(
        row['priority']?.toLowerCase() as AppRow['priority']
      )
        ? (row['priority'].toLowerCase() as AppRow['priority'])
        : 'medium';

      await createApplication(userId, {
        company_name: companyName,
        job_title: jobTitle,
        status,
        location: row['location'] || null,
        location_type,
        salary_min: row['salary_min'] ? Number(row['salary_min']) : null,
        salary_max: row['salary_max'] ? Number(row['salary_max']) : null,
        salary_currency: row['currency'] || 'USD',
        priority,
        applied_date: row['applied_date'] || new Date().toISOString().split('T')[0],
        follow_up_date: row['follow_up_date'] || null,
        job_url: row['job_url'] || null,
        notes: row['notes'] || null,
        tags: row['tags'] ? row['tags'].split(';').map((t) => t.trim()).filter(Boolean) : [],
        rating: 3,
      });

      result.succeeded++;
    } catch (err) {
      result.failed++;
      result.errors.push(`Row ${i}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return result;
}
