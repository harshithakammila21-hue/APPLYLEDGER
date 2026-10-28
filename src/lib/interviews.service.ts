// ============================================================
// Interviews & Contacts Service Layer
// ============================================================

import { supabase } from './supabase';
import type { Interview, Contact } from '../types';
import type { Database } from './database.types';

type InterviewInsert = Database['public']['Tables']['interviews']['Insert'];
type InterviewUpdate = Database['public']['Tables']['interviews']['Update'];
type ContactInsert   = Database['public']['Tables']['contacts']['Insert'];
type ContactUpdate   = Database['public']['Tables']['contacts']['Update'];

// ---- INTERVIEWS -------------------------------------------------

export async function getInterviewsByApplication(applicationId: string): Promise<Interview[]> {
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('application_id', applicationId)
    .order('scheduled_at', { ascending: true });

  if (error) throw new Error(`Failed to load interviews: ${error.message}`);
  return (data ?? []) as Interview[];
}

/** Fetch all upcoming scheduled interviews for the current user (calendar view). */
export async function getUpcomingInterviews(): Promise<Interview[]> {
  const { data, error } = await supabase
    .from('interviews')
    .select('*, application:applications(id, company_name, job_title)')
    .gte('scheduled_at', new Date().toISOString())
    .eq('outcome', 'scheduled')
    .order('scheduled_at', { ascending: true });

  if (error) throw new Error(`Failed to load upcoming interviews: ${error.message}`);
  return (data ?? []) as unknown as Interview[];
}

export type CreateInterviewInput = Omit<InterviewInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export async function createInterview(
  userId: string,
  input: CreateInterviewInput
): Promise<Interview> {
  const payload: InterviewInsert = { ...input, user_id: userId };

  const { data, error } = await supabase
    .from('interviews')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(`Failed to schedule interview: ${error.message}`);
  return data as Interview;
}

export async function updateInterview(
  id: string,
  updates: InterviewUpdate
): Promise<Interview> {
  const payload: InterviewUpdate = { ...updates, updated_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from('interviews')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update interview: ${error.message}`);
  return data as Interview;
}

export async function deleteInterview(id: string): Promise<void> {
  const { error } = await supabase.from('interviews').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete interview: ${error.message}`);
}

// ---- CONTACTS ---------------------------------------------------

export async function getContactsByApplication(applicationId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to load contacts: ${error.message}`);
  return (data ?? []) as Contact[];
}

export type CreateContactInput = Omit<ContactInsert, 'id' | 'user_id' | 'created_at'>;

export async function createContact(
  userId: string,
  input: CreateContactInput
): Promise<Contact> {
  const payload: ContactInsert = { ...input, user_id: userId };

  const { data, error } = await supabase
    .from('contacts')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(`Failed to add contact: ${error.message}`);
  return data as Contact;
}

export async function updateContact(
  id: string,
  updates: ContactUpdate
): Promise<Contact> {
  const { data, error } = await supabase
    .from('contacts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update contact: ${error.message}`);
  return data as Contact;
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase.from('contacts').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete contact: ${error.message}`);
}

// ---- STAGE HISTORY ----------------------------------------------

export async function getStageHistory(applicationId: string) {
  const { data, error } = await supabase
    .from('stages_history')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to load stage history: ${error.message}`);
  return data ?? [];
}
