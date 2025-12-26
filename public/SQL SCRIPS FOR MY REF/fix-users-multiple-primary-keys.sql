-- 🔧 FIX MULTIPLE PRIMARY KEYS ON USERS TABLE
-- This will remove the id primary key and keep only email as primary key

-- ===== STEP 1: Show current state =====
SELECT '=== CURRENT STATE: All Primary Keys ===' as step;
SELECT 
    kcu.column_name as primary_key_column,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY kcu.column_name;

-- ===== STEP 2: Drop all primary key constraints =====
-- We'll use CASCADE to automatically handle foreign keys, then recreate them
DO $$
DECLARE
    pk_constraint RECORD;
BEGIN
    -- Drop all primary key constraints (CASCADE will handle foreign keys)
    FOR pk_constraint IN 
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
            AND table_name = 'users'
            AND constraint_type = 'PRIMARY KEY'
    LOOP
        EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I CASCADE', pk_constraint.constraint_name);
        RAISE NOTICE 'Dropped primary key constraint: % (with CASCADE)', pk_constraint.constraint_name;
    END LOOP;
END $$;

-- ===== STEP 3: Recreate primary key on email only =====
ALTER TABLE public.users 
ADD CONSTRAINT users_pkey PRIMARY KEY (email);

-- ===== STEP 4: Recreate foreign keys that were dropped =====
-- These foreign keys reference users.email, so we need to recreate them

-- Recreate user_projects foreign key
ALTER TABLE public.user_projects 
ADD CONSTRAINT user_projects_user_email_fkey 
FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;

-- Recreate layouts foreign key
ALTER TABLE public.layouts 
ADD CONSTRAINT layouts_user_email_fkey 
FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;

-- Recreate user_designs foreign key
ALTER TABLE public.user_designs 
ADD CONSTRAINT user_designs_user_email_fkey 
FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;

-- ===== STEP 5: Verify the fix =====
SELECT '=== VERIFICATION: Primary Keys After Fix ===' as step;
SELECT 
    COUNT(*) as total_primary_keys,
    STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.column_name) as primary_key_columns,
    CASE 
        WHEN COUNT(*) = 1 AND STRING_AGG(kcu.column_name, ', ') = 'email' THEN '✅ FIXED - email is the only primary key'
        WHEN COUNT(*) > 1 THEN '❌ Still has multiple primary keys'
        WHEN COUNT(*) = 0 THEN '❌ No primary key'
        ELSE '⚠️ Unexpected state'
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'PRIMARY KEY';

-- Verify foreign keys are recreated
SELECT '=== VERIFICATION: Foreign Keys Recreated ===' as step;
SELECT 
    tc.table_schema || '.' || tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_schema || '.' || ccu.table_name || '(' || ccu.column_name || ')' as references,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc2
            JOIN information_schema.key_column_usage kcu2 
                ON tc2.constraint_name = kcu2.constraint_name
            WHERE tc2.table_schema = ccu.table_schema 
                AND tc2.table_name = ccu.table_name
                AND tc2.constraint_type = 'PRIMARY KEY'
                AND kcu2.column_name = ccu.column_name
        ) THEN '✅ Valid'
        ELSE '❌ Broken'
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND ccu.table_schema = 'public'
    AND ccu.table_name = 'users'
ORDER BY tc.table_schema, tc.table_name;

SELECT '✅ Fix complete! Users table should now have only email as primary key.' as result;

