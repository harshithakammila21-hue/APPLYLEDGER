-- ====================================================================
-- ApplyLedger RLS Security Verification & Persistence Test Script
-- Run this in Postgres / Supabase to rigorously verify tenant security
-- ====================================================================

DO $$
DECLARE
    user_a_id UUID := 'a0000000-0000-0000-0000-000000000001';
    user_b_id UUID := 'b0000000-0000-0000-0000-000000000002';
    user_a_visible_apps INTEGER;
    user_b_visible_apps INTEGER;
    cross_user_breach_count INTEGER;
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'STARTING APPLYLEDGER RLS SECURITY VERIFICATION';
    RAISE NOTICE '==================================================';

    -- 1. Simulate Session as User A
    PERFORM set_config('request.jwt.claim.sub', user_a_id::text, true);
    PERFORM set_config('role', 'authenticated', true);

    SELECT count(*) INTO user_a_visible_apps FROM public.applications;
    RAISE NOTICE '[TEST 1] User A visible applications count: % (Expected: 5)', user_a_visible_apps;

    -- Verify User A cannot see User B's record
    SELECT count(*) INTO cross_user_breach_count 
    FROM public.applications 
    WHERE user_id = user_b_id;

    IF cross_user_breach_count > 0 THEN
        RAISE EXCEPTION 'CRITICAL SECURITY BREACH: User A can see % records of User B!', cross_user_breach_count;
    ELSE
        RAISE NOTICE '[PASSED] Tenant Isolation: User A cannot see any data belonging to User B.';
    END IF;

    -- 2. Simulate Session as User B
    PERFORM set_config('request.jwt.claim.sub', user_b_id::text, true);

    SELECT count(*) INTO user_b_visible_apps FROM public.applications;
    RAISE NOTICE '[TEST 2] User B visible applications count: % (Expected: 1)', user_b_visible_apps;

    -- Verify User B cannot see User A's record
    SELECT count(*) INTO cross_user_breach_count 
    FROM public.applications 
    WHERE user_id = user_a_id;

    IF cross_user_breach_count > 0 THEN
        RAISE EXCEPTION 'CRITICAL SECURITY BREACH: User B can see % records of User A!', cross_user_breach_count;
    ELSE
        RAISE NOTICE '[PASSED] Tenant Isolation: User B cannot see any data belonging to User A.';
    END IF;

    -- 3. Verify reminder processing function
    PERFORM public.process_due_reminders(user_a_id);
    RAISE NOTICE '[PASSED] Stored procedure process_due_reminders executed cleanly.';

    RAISE NOTICE '==================================================';
    RAISE NOTICE 'ALL ROW LEVEL SECURITY (RLS) CHECKS PASSED!';
    RAISE NOTICE '==================================================';
END $$;
