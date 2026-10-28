export type ApplicationStatus = 
  | 'wishlist' 
  | 'applied' 
  | 'screening' 
  | 'interviewing' 
  | 'offer' 
  | 'rejected' 
  | 'withdrawn';

export type PriorityLevel = 'low' | 'medium' | 'high';

export type LocationType = 'remote' | 'hybrid' | 'onsite';

export type InterviewRound = 
  | 'phone_screen' 
  | 'online_assessment' 
  | 'technical' 
  | 'behavioral' 
  | 'system_design' 
  | 'hiring_manager' 
  | 'final_round' 
  | 'other';

export type InterviewOutcome = 'scheduled' | 'passed' | 'failed' | 'cancelled';

export type ReminderType = 
  | 'follow_up' 
  | 'interview_prep' 
  | 'thank_you_note' 
  | 'application_deadline' 
  | 'offer_deadline' 
  | 'custom';

export type ReminderStatus = 'pending' | 'completed' | 'dismissed' | 'overdue';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  target_role?: string;
  target_salary_min?: number;
  target_salary_max?: number;
  currency?: string;
  theme?: 'light' | 'dark' | 'system';
  email_reminders?: boolean;
}

export interface Application {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  job_url?: string;
  location?: string;
  location_type: LocationType;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  status: ApplicationStatus;
  priority: PriorityLevel;
  rating: number; // 1 - 5
  applied_date: string;
  follow_up_date?: string;
  job_description?: string;
  notes?: string;
  tags?: string[];
  archived?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StageHistory {
  id: string;
  application_id: string;
  user_id: string;
  stage: ApplicationStatus;
  notes?: string;
  created_at: string;
}

export interface Interview {
  id: string;
  application_id: string;
  user_id: string;
  round_type: InterviewRound;
  scheduled_at: string;
  duration_minutes: number;
  interviewer_names?: string;
  meeting_link?: string;
  prep_notes?: string;
  feedback?: string;
  outcome: InterviewOutcome;
  created_at: string;
  updated_at?: string;
}

export interface Contact {
  id: string;
  application_id: string;
  user_id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  notes?: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  application_id?: string;
  title: string;
  reminder_type: ReminderType;
  due_date: string;
  status: ReminderStatus;
  priority: PriorityLevel;
  processed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Join helper
  application?: Application;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  application_id?: string;
  action_type: string;
  description: string;
  created_at: string;
}

export interface PipelineStats {
  total: number;
  active: number;
  wishlist: number;
  applied: number;
  screening: number;
  interviewing: number;
  offer: number;
  rejected: number;
  responseRate: number;
  offerRate: number;
}
