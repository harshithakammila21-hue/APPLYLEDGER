-- ====================================================================
-- ApplyLedger Database Schema & RLS Architecture
-- Fully normalized Postgres schema for Supabase
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    target_role TEXT,
    target_salary_min NUMERIC,
    target_salary_max NUMERIC,
    currency TEXT DEFAULT 'USD',
    theme TEXT DEFAULT 'system',
    email_reminders BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    job_url TEXT,
    location TEXT,
    location_type TEXT CHECK (location_type IN ('remote', 'hybrid', 'onsite')) DEFAULT 'remote',
    salary_min NUMERIC,
    salary_max NUMERIC,
    salary_currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('wishlist', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn')) DEFAULT 'applied',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 3,
    applied_date DATE DEFAULT CURRENT_DATE,
    follow_up_date DATE,
    job_description TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON public.applications (user_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_follow_up ON public.applications (user_id, follow_up_date);
CREATE INDEX IF NOT EXISTS idx_applications_created ON public.applications (user_id, created_at DESC);

-- 4. Stages History Table
CREATE TABLE IF NOT EXISTS public.stages_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stages_app ON public.stages_history (application_id, created_at ASC);

-- 5. Interviews Table
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    round_type TEXT NOT NULL CHECK (round_type IN ('phone_screen', 'online_assessment', 'technical', 'behavioral', 'system_design', 'hiring_manager', 'final_round', 'other')) DEFAULT 'technical',
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 45,
    interviewer_names TEXT,
    meeting_link TEXT,
    prep_notes TEXT,
    feedback TEXT,
    outcome TEXT CHECK (outcome IN ('scheduled', 'passed', 'failed', 'cancelled')) DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_interviews_user_date ON public.interviews (user_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_app ON public.interviews (application_id);

-- 6. Contacts Table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    phone TEXT,
    linkedin_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contacts_app ON public.contacts (application_id);

-- 7. Reminders Table
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    reminder_type TEXT CHECK (reminder_type IN ('follow_up', 'interview_prep', 'thank_you_note', 'application_deadline', 'offer_deadline', 'custom')) DEFAULT 'follow_up',
    due_date TIMESTAMPTZ NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'dismissed', 'overdue')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    processed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_due ON public.reminders (user_id, due_date, status);

-- 8. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_logs (user_id, created_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensure absolute tenant isolation across all tables
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Applications Policies
CREATE POLICY "Users can view own applications" 
    ON public.applications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" 
    ON public.applications FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" 
    ON public.applications FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications" 
    ON public.applications FOR DELETE 
    USING (auth.uid() = user_id);

-- Stages History Policies
CREATE POLICY "Users can view own stages" 
    ON public.stages_history FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stages" 
    ON public.stages_history FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stages" 
    ON public.stages_history FOR DELETE 
    USING (auth.uid() = user_id);

-- Interviews Policies
CREATE POLICY "Users can view own interviews" 
    ON public.interviews FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interviews" 
    ON public.interviews FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interviews" 
    ON public.interviews FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interviews" 
    ON public.interviews FOR DELETE 
    USING (auth.uid() = user_id);

-- Contacts Policies
CREATE POLICY "Users can view own contacts" 
    ON public.contacts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts" 
    ON public.contacts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" 
    ON public.contacts FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" 
    ON public.contacts FOR DELETE 
    USING (auth.uid() = user_id);

-- Reminders Policies
CREATE POLICY "Users can view own reminders" 
    ON public.reminders FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" 
    ON public.reminders FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" 
    ON public.reminders FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" 
    ON public.reminders FOR DELETE 
    USING (auth.uid() = user_id);

-- Activity Logs Policies
CREATE POLICY "Users can view own activity logs" 
    ON public.activity_logs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs" 
    ON public.activity_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- DATABASE TRIGGERS & STORED PROCEDURES
-- ====================================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users for new user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically record stage transitions
CREATE OR REPLACE FUNCTION public.handle_application_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.stages_history (application_id, user_id, stage, notes)
        VALUES (
            NEW.id,
            NEW.user_id,
            NEW.status,
            'Stage transitioned to ' || NEW.status
        );

        -- Also log activity
        INSERT INTO public.activity_logs (user_id, application_id, action_type, description)
        VALUES (
            NEW.user_id,
            NEW.id,
            'stage_changed',
            'Application for ' || NEW.company_name || ' (' || NEW.job_title || ') moved to ' || NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_application_stage_changed ON public.applications;
CREATE TRIGGER on_application_stage_changed
    AFTER INSERT OR UPDATE OF status ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.handle_application_stage_change();

-- Stored Procedure to process due and overdue reminders
CREATE OR REPLACE FUNCTION public.process_due_reminders(target_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    processed_count INTEGER,
    overdue_count INTEGER
) AS $$
DECLARE
    v_overdue_count INTEGER;
    v_processed_count INTEGER;
BEGIN
    -- Update pending reminders that are past due date to 'overdue'
    WITH updated AS (
        UPDATE public.reminders
        SET 
            status = 'overdue',
            processed_at = timezone('utc'::text, now()),
            updated_at = timezone('utc'::text, now())
        WHERE 
            status = 'pending'
            AND due_date < timezone('utc'::text, now())
            AND (target_user_id IS NULL OR user_id = target_user_id)
        RETURNING id
    )
    SELECT count(*) INTO v_overdue_count FROM updated;

    -- Count total pending due within today
    SELECT count(*) INTO v_processed_count 
    FROM public.reminders
    WHERE (target_user_id IS NULL OR user_id = target_user_id)
      AND status IN ('pending', 'overdue');

    RETURN QUERY SELECT v_processed_count, v_overdue_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
