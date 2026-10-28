-- ====================================================================
-- ApplyLedger Seed Data & Test Harness
-- Sample data for 2 different users to verify multi-tenant isolation
-- ====================================================================

-- User 1 ID (Simulated Demo User A)
-- e.g. 00000000-0000-0000-0000-000000000001
-- User 2 ID (Simulated Demo User B)
-- e.g. 00000000-0000-0000-0000-000000000002

-- Insert User A Profile
INSERT INTO public.profiles (id, email, full_name, target_role, target_salary_min, target_salary_max, currency)
VALUES 
('a0000000-0000-0000-0000-000000000001', 'alex.developer@example.com', 'Alex Rivera', 'Senior Full Stack Engineer', 130000, 165000, 'USD'),
('b0000000-0000-0000-0000-000000000002', 'taylor.coder@example.com', 'Taylor Brooks', 'Frontend Engineer', 95000, 120000, 'USD')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Applications for User A
INSERT INTO public.applications (id, user_id, company_name, job_title, job_url, location, location_type, salary_min, salary_max, status, priority, rating, applied_date, follow_up_date, notes)
VALUES
('a1111111-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Stripe', 'Staff Infrastructure Engineer', 'https://stripe.com/jobs/1', 'San Francisco, CA', 'remote', 170000, 210000, 'interviewing', 'high', 5, CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '2 days', 'Passed system design, waiting for architectural round.'),
('a1111111-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Datadog', 'Senior Cloud Platform Engineer', 'https://datadoghq.com/careers/2', 'New York, NY', 'hybrid', 155000, 185000, 'offer', 'high', 5, CURRENT_DATE - INTERVAL '21 days', CURRENT_DATE + INTERVAL '5 days', 'Received formal offer: $175k base + equity. Negotiating sign-on bonus.'),
('a1111111-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Airbnb', 'Full Stack Tech Lead', 'https://careers.airbnb.com/3', 'Remote, US', 'remote', 160000, 195000, 'screening', 'medium', 4, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '1 day', 'Recruiter phone screen scheduled for tomorrow.'),
('a1111111-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Figma', 'Senior Frontend Systems Engineer', 'https://figma.com/careers/4', 'San Francisco, CA', 'onsite', 165000, 200000, 'applied', 'high', 5, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '4 days', 'Referred by former colleague Mark on LinkedIn.'),
('a1111111-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Linear', 'Product Engineer', 'https://linear.app/careers/5', 'Remote', 'remote', 140000, 175000, 'wishlist', 'medium', 4, CURRENT_DATE, NULL, 'Tailoring portfolio with keyboard-first UI demo before applying.')
ON CONFLICT (id) DO NOTHING;

-- Applications for User B (Isolated Tenant)
INSERT INTO public.applications (id, user_id, company_name, job_title, job_url, location, location_type, salary_min, salary_max, status, priority, rating, applied_date, follow_up_date, notes)
VALUES
('b1111111-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Vercel', 'Next.js Framework Engineer', 'https://vercel.com/careers/1', 'Remote', 'remote', 130000, 160000, 'interviewing', 'high', 5, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '1 day', 'Taylor private notes - User A must NEVER see this.')
ON CONFLICT (id) DO NOTHING;

-- Interviews for User A
INSERT INTO public.interviews (application_id, user_id, round_type, scheduled_at, duration_minutes, interviewer_names, meeting_link, prep_notes)
VALUES
('a1111111-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'system_design', CURRENT_DATE + INTERVAL '2 days' + INTERVAL '14 hours', 60, 'Sarah Chen (Distinguished Eng)', 'https://meet.google.com/xyz-abc', 'Review distributed idempotency, ledger transactions, and rate limiting architectures.'),
('a1111111-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'phone_screen', CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours', 30, 'Jordan Bell (Recruiting Lead)', 'https://zoom.us/j/999888', 'Have talking points ready about past GraphQL migrations and team mentoring.')
ON CONFLICT (id) DO NOTHING;

-- Contacts for User A
INSERT INTO public.contacts (application_id, user_id, name, role, email, phone, linkedin_url, notes)
VALUES
('a1111111-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'David Kim', 'Technical Recruiter', 'david.k@stripe.com', '+1-415-555-0199', 'https://linkedin.com/in/davidkim', 'Very responsive, reaches out via email first.'),
('a1111111-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Elena Rostova', 'VP of Engineering', 'elena@datadoghq.com', '+1-212-555-0144', 'https://linkedin.com/in/elenarostova', 'Met during final loop, presented offer terms.')
ON CONFLICT (id) DO NOTHING;

-- Reminders for User A
INSERT INTO public.reminders (id, user_id, application_id, title, reminder_type, due_date, status, priority, notes)
VALUES
('a2222222-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000001', 'Prepare System Design Architecture diagrams for Stripe interview', 'interview_prep', CURRENT_DATE + INTERVAL '1 day' + INTERVAL '18 hours', 'pending', 'high', 'Focus on Kafka event streaming and consistency models.'),
('a2222222-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000002', 'Send Datadog counter-offer email before deadline', 'offer_deadline', CURRENT_DATE + INTERVAL '3 days', 'pending', 'high', 'Request +$10k base and 500 additional RSUs.'),
('a2222222-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000004', 'Follow up with Figma recruiter if no update received', 'follow_up', CURRENT_DATE - INTERVAL '1 day', 'overdue', 'medium', 'Submitted application 3 days ago.')
ON CONFLICT (id) DO NOTHING;
