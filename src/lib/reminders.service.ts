// ============================================================
// Reminders Service Layer
// Supabase CRUD + server-side overdue processing engine.
// ============================================================

import { supabase } from './supabase';
import type { Reminder, ReminderStatus } from '../types';
import type { Database } from './database.types';

type ReminderInsert = Database['public']['Tables']['reminders']['Insert'];
type ReminderUpdate = Database['public']['Tables']['reminders']['Update'];

// ---- READ -------------------------------------------------------

export async function getReminders(
  status?: ReminderStatus | ReminderStatus[]
): Promise<Reminder[]> {
  let query = supabase
    .from('reminders')
    .select('*, application:applications(id, company_name, job_title, status)')
    .order('due_date', { ascending: true });

  if (status) {
    const statuses = Array.isArray(status) ? status : [status];
    query = query.in('status', statuses);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load reminders: ${error.message}`);
  return (data ?? []) as unknown as Reminder[];
}

// ---- CREATE -----------------------------------------------------

export type CreateReminderInput = Omit<ReminderInsert,
  'id' | 'user_id' | 'created_at' | 'updated_at' | 'processed_at' | 'status'
>;

export async function createReminder(
  userId: string,
  input: CreateReminderInput
): Promise<Reminder> {
  const payload: ReminderInsert = {
    ...input,
    user_id: userId,
    status: 'pending',
  };

  const { data, error } = await supabase
    .from('reminders')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(`Failed to create reminder: ${error.message}`);
  return data as unknown as Reminder;
}

// ---- UPDATE -----------------------------------------------------

export async function updateReminderStatus(
  id: string,
  status: ReminderStatus
): Promise<void> {
  const payload: ReminderUpdate = {
    status,
    processed_at: ['completed', 'dismissed'].includes(status)
      ? new Date().toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('reminders')
    .update(payload)
    .eq('id', id);

  if (error) throw new Error(`Failed to update reminder: ${error.message}`);
}

export const completeReminder = (id: string) => updateReminderStatus(id, 'completed');
export const dismissReminder  = (id: string) => updateReminderStatus(id, 'dismissed');

// ---- DELETE -----------------------------------------------------

export async function deleteReminder(id: string): Promise<void> {
  const { error } = await supabase.from('reminders').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete reminder: ${error.message}`);
}

// ---- SERVER-SIDE PROCESSING ------------------------------------

/**
 * Calls the Supabase stored procedure to atomically flip all
 * pending, past-due reminders to 'overdue'. Returns counts.
 *
 * This is a real database RPC call, not a client-side mock.
 */
export async function processOverdueReminders(userId?: string): Promise<{
  processed_count: number;
  overdue_count: number;
}> {
  const { data, error } = await supabase.rpc('process_due_reminders', {
    target_user_id: userId ?? null,
  });

  if (error) throw new Error(`Failed to process reminders: ${error.message}`);

  // The RPC returns TABLE rows; handle both array and single-row responses
  const row = Array.isArray(data) ? data[0] : (data as { processed_count?: number; overdue_count?: number } | null);
  return {
    processed_count: (row as { processed_count?: number })?.processed_count ?? 0,
    overdue_count:   (row as { overdue_count?: number })?.overdue_count   ?? 0,
  };
}

// ---- CLIENT-SIDE STATS -----------------------------------------

export interface ReminderStats {
  total: number;
  pending: number;
  overdue: number;
  dueToday: number;
}

export function computeReminderStats(reminders: Reminder[]): ReminderStats {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return {
    total: reminders.length,
    pending: reminders.filter((r) => r.status === 'pending').length,
    overdue: reminders.filter((r) => r.status === 'overdue').length,
    dueToday: reminders.filter((r) => {
      const d = new Date(r.due_date);
      return r.status === 'pending' && d >= startOfToday && d <= today;
    }).length,
  };
}
