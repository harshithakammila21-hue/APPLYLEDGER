// ============================================================
// Supabase TypeScript Database Types
// Mirrors the schema in supabase/schema.sql exactly.
// Used to type-check all Supabase queries at compile time.
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          target_role: string | null;
          target_salary_min: number | null;
          target_salary_max: number | null;
          currency: string | null;
          theme: string | null;
          email_reminders: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          target_role?: string | null;
          target_salary_min?: number | null;
          target_salary_max?: number | null;
          currency?: string | null;
          theme?: string | null;
          email_reminders?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          target_role?: string | null;
          target_salary_min?: number | null;
          target_salary_max?: number | null;
          currency?: string | null;
          theme?: string | null;
          email_reminders?: boolean | null;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          job_title: string;
          job_url: string | null;
          location: string | null;
          location_type: 'remote' | 'hybrid' | 'onsite';
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string;
          status: 'wishlist' | 'applied' | 'screening' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
          priority: 'low' | 'medium' | 'high';
          rating: number;
          applied_date: string;
          follow_up_date: string | null;
          job_description: string | null;
          notes: string | null;
          tags: string[];
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          job_title: string;
          job_url?: string | null;
          location?: string | null;
          location_type?: 'remote' | 'hybrid' | 'onsite';
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          status?: 'wishlist' | 'applied' | 'screening' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
          priority?: 'low' | 'medium' | 'high';
          rating?: number;
          applied_date?: string;
          follow_up_date?: string | null;
          job_description?: string | null;
          notes?: string | null;
          tags?: string[];
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          company_name?: string;
          job_title?: string;
          job_url?: string | null;
          location?: string | null;
          location_type?: 'remote' | 'hybrid' | 'onsite';
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          status?: 'wishlist' | 'applied' | 'screening' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
          priority?: 'low' | 'medium' | 'high';
          rating?: number;
          applied_date?: string;
          follow_up_date?: string | null;
          job_description?: string | null;
          notes?: string | null;
          tags?: string[];
          archived?: boolean;
          updated_at?: string;
        };
      };
      stages_history: {
        Row: {
          id: string;
          application_id: string;
          user_id: string;
          stage: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          user_id: string;
          stage: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      interviews: {
        Row: {
          id: string;
          application_id: string;
          user_id: string;
          round_type: 'phone_screen' | 'online_assessment' | 'technical' | 'behavioral' | 'system_design' | 'hiring_manager' | 'final_round' | 'other';
          scheduled_at: string;
          duration_minutes: number;
          interviewer_names: string | null;
          meeting_link: string | null;
          prep_notes: string | null;
          feedback: string | null;
          outcome: 'scheduled' | 'passed' | 'failed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          user_id: string;
          round_type?: 'phone_screen' | 'online_assessment' | 'technical' | 'behavioral' | 'system_design' | 'hiring_manager' | 'final_round' | 'other';
          scheduled_at: string;
          duration_minutes?: number;
          interviewer_names?: string | null;
          meeting_link?: string | null;
          prep_notes?: string | null;
          feedback?: string | null;
          outcome?: 'scheduled' | 'passed' | 'failed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          round_type?: 'phone_screen' | 'online_assessment' | 'technical' | 'behavioral' | 'system_design' | 'hiring_manager' | 'final_round' | 'other';
          scheduled_at?: string;
          duration_minutes?: number;
          interviewer_names?: string | null;
          meeting_link?: string | null;
          prep_notes?: string | null;
          feedback?: string | null;
          outcome?: 'scheduled' | 'passed' | 'failed' | 'cancelled';
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          application_id: string;
          user_id: string;
          name: string;
          role: string | null;
          email: string | null;
          phone: string | null;
          linkedin_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          user_id: string;
          name: string;
          role?: string | null;
          email?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          role?: string | null;
          email?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          notes?: string | null;
        };
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          application_id: string | null;
          title: string;
          reminder_type: 'follow_up' | 'interview_prep' | 'thank_you_note' | 'application_deadline' | 'offer_deadline' | 'custom';
          due_date: string;
          status: 'pending' | 'completed' | 'dismissed' | 'overdue';
          priority: 'low' | 'medium' | 'high';
          processed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id?: string | null;
          title: string;
          reminder_type?: 'follow_up' | 'interview_prep' | 'thank_you_note' | 'application_deadline' | 'offer_deadline' | 'custom';
          due_date: string;
          status?: 'pending' | 'completed' | 'dismissed' | 'overdue';
          priority?: 'low' | 'medium' | 'high';
          processed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          reminder_type?: 'follow_up' | 'interview_prep' | 'thank_you_note' | 'application_deadline' | 'offer_deadline' | 'custom';
          due_date?: string;
          status?: 'pending' | 'completed' | 'dismissed' | 'overdue';
          priority?: 'low' | 'medium' | 'high';
          processed_at?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          application_id: string | null;
          action_type: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id?: string | null;
          action_type: string;
          description: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
    };
    Functions: {
      process_due_reminders: {
        Args: { target_user_id?: string };
        Returns: Array<{ processed_count: number; overdue_count: number }>;
      };
    };
  };
}
