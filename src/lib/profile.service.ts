// ============================================================
// User Profile Service Layer
// ============================================================

import { supabase } from './supabase';
import type { UserProfile } from '../types';
import type { Database } from './database.types';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load profile: ${error.message}`);
  return data as UserProfile | null;
}

export type UpdateProfileInput = Partial<Omit<UserProfile, 'id' | 'email'>>;

export async function updateProfile(
  userId: string,
  updates: UpdateProfileInput
): Promise<UserProfile> {
  const payload: ProfileUpdate = {
    full_name:          updates.full_name,
    target_role:        updates.target_role,
    target_salary_min:  updates.target_salary_min,
    target_salary_max:  updates.target_salary_max,
    currency:           updates.currency,
    theme:              updates.theme,
    email_reminders:    updates.email_reminders,
    updated_at:         new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update profile: ${error.message}`);
  return data as UserProfile;
}

/** Upsert profile row — used as a defensive fallback if the trigger didn't fire. */
export async function upsertProfile(userId: string, email: string, fullName?: string): Promise<void> {
  const payload: ProfileInsert = {
    id:         userId,
    email,
    full_name:  fullName ?? email.split('@')[0],
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' });

  if (error) throw new Error(`Failed to upsert profile: ${error.message}`);
}
