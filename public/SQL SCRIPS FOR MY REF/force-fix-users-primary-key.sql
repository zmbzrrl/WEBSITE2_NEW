-- 🔧 FORCE FIX USERS TABLE PRIMARY KEY
-- More aggressive approach to fix the multiple primary keys issue

-- ===== STEP 1: Show what we're dealing with =====
SELECT '=== BEFORE FIX: All Primary Key Constraints ===' as step;
SELECT 
    tc.constraint_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY kcu.column_name;

-- ===== STEP 2: Drop ALL primary key constraints explicitly =====
-- Drop by specific constraint names we might find
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    -- Get all primary key constraint names
    FOR constraint_rec IN 
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
            AND table_name = 'users'
            AND constraint_type = 'PRIMARY KEY'
    LOOP
        BEGIN
            -- Try to drop with CASCADE
            EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I CASCADE', constraint_rec.constraint_name);
            RAISE NOTICE 'Dropped constraint: %', constraint_rec.constraint_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop constraint %: %', constraint_rec.constraint_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- ===== STEP 3: Double-check - drop any remaining primary keys =====
-- Sometimes constraints have different names, so let's be thorough
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    -- Check again and drop any remaining
    FOR constraint_rec IN 
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
            AND table_name = 'users'
            AND constraint_type = 'PRIMARY KEY'
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_rec.constraint_name);
            RAISE NOTICE 'Dropped remaining constraint: %', constraint_rec.constraint_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Error dropping %: %', constraint_rec.constraint_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- ===== STEP 4: Verify no primary keys exist =====
SELECT '=== CHECK: Primary Keys After Drop ===' as step;
SELECT 
    COUNT(*) as remaining_primary_keys,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ All primary keys dropped'
        ELSE '❌ Still has ' || COUNT(*) || ' primary key(s)'
    END as status
FROM information_schema.table_constraints
WHERE table_schema = 'public'
    AND table_name = 'users'
    AND constraint_type = 'PRIMARY KEY';

-- ===== STEP 5: Recreate primary key on email only =====
-- Only if there are no primary keys left
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
            AND table_name = 'users'
            AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (email);
        RAISE NOTICE '✅ Created primary key on email';
    ELSE
        RAISE NOTICE '⚠️ Cannot create primary key - other primary keys still exist';
    END IF;
END $$;

-- ===== STEP 6: Recreate foreign keys =====
-- Drop and recreate to ensure they're correct
ALTER TABLE public.user_projects 
DROP CONSTRAINT IF EXISTS user_projects_user_email_fkey;

ALTER TABLE public.layouts 
DROP CONSTRAINT IF EXISTS layouts_user_email_fkey;

ALTER TABLE public.user_designs 
DROP CONSTRAINT IF EXISTS user_designs_user_email_fkey;

-- Now recreate them
ALTER TABLE public.user_projects 
ADD CONSTRAINT user_projects_user_email_fkey 
FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;

ALTER TABLE public.layouts 
ADD CONSTRAINT layouts_user_email_fkey 
FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;

ALTER TABLE public.user_designs 
ADD CONSTRAINT user_designs_user_email_fkey 
FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;

-- ===== STEP 7: Final verification =====
SELECT '=== FINAL VERIFICATION ===' as step;
SELECT 
    COUNT(*) as total_primary_keys,
    STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.column_name) as primary_key_columns,
    CASE 
        WHEN COUNT(*) = 1 AND STRING_AGG(kcu.column_name, ', ') = 'email' THEN '✅ SUCCESS - email is the only primary key'
        WHEN COUNT(*) > 1 THEN '❌ FAILED - Still has multiple primary keys: ' || STRING_AGG(kcu.column_name, ', ')
        WHEN COUNT(*) = 0 THEN '❌ FAILED - No primary key'
        ELSE '⚠️ Unexpected: ' || STRING_AGG(kcu.column_name, ', ')
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'PRIMARY KEY';

-- Show all constraints on users table
SELECT '=== ALL CONSTRAINTS ON USERS TABLE ===' as step;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc
LEFT JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'users'
ORDER BY tc.constraint_type, kcu.column_name;

SELECT '✅ Force fix complete!' as result;

