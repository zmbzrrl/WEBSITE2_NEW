-- 🔧 FIX USERS TABLE PRIMARY KEY (if needed)
-- Only run this if the verification shows users table has multiple primary keys

-- ===== STEP 1: Check Current State =====
SELECT '=== CURRENT USERS TABLE PRIMARY KEYS ===' as step;
SELECT 
    tc.constraint_name,
    kcu.column_name,
    'Will be removed if not email' as action
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'users';

-- ===== STEP 2: Fix Primary Key =====
-- Check if email is already the primary key
DO $$
DECLARE
    email_is_pk BOOLEAN;
    id_is_pk BOOLEAN;
    pk_constraint_name TEXT;
BEGIN
    -- Check if email is primary key
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public' 
            AND tc.table_name = 'users'
            AND tc.constraint_type = 'PRIMARY KEY'
            AND kcu.column_name = 'email'
    ) INTO email_is_pk;
    
    -- Check if id is primary key
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public' 
            AND tc.table_name = 'users'
            AND tc.constraint_type = 'PRIMARY KEY'
            AND kcu.column_name = 'id'
    ) INTO id_is_pk;
    
    -- Get the primary key constraint name
    SELECT constraint_name INTO pk_constraint_name
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
        AND table_name = 'users'
        AND constraint_type = 'PRIMARY KEY'
    LIMIT 1;
    
    IF email_is_pk AND NOT id_is_pk THEN
        RAISE NOTICE '✅ Email is already the primary key - no changes needed';
    ELSIF id_is_pk AND NOT email_is_pk THEN
        -- Need to change from id to email
        -- First, drop foreign keys temporarily (we'll recreate them)
        RAISE NOTICE 'Changing primary key from id to email...';
        
        -- Drop foreign keys that depend on users primary key
        ALTER TABLE public.user_projects 
        DROP CONSTRAINT IF EXISTS user_projects_user_email_fkey;
        
        ALTER TABLE public.layouts 
        DROP CONSTRAINT IF EXISTS layouts_user_email_fkey;
        
        ALTER TABLE public.user_designs 
        DROP CONSTRAINT IF EXISTS user_designs_user_email_fkey;
        
        -- Now drop the primary key
        IF pk_constraint_name IS NOT NULL THEN
            EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', pk_constraint_name);
            RAISE NOTICE 'Dropped primary key constraint: %', pk_constraint_name;
        END IF;
        
        -- Create new primary key on email
        ALTER TABLE public.users 
        ADD CONSTRAINT users_pkey PRIMARY KEY (email);
        
        -- Recreate foreign keys
        ALTER TABLE public.user_projects 
        ADD CONSTRAINT user_projects_user_email_fkey 
        FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;
        
        ALTER TABLE public.layouts 
        ADD CONSTRAINT layouts_user_email_fkey 
        FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;
        
        ALTER TABLE public.user_designs 
        ADD CONSTRAINT user_designs_user_email_fkey 
        FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;
        
        RAISE NOTICE '✅ Changed primary key to email and recreated foreign keys';
    ELSIF email_is_pk AND id_is_pk THEN
        -- Both are primary keys (shouldn't happen, but handle it)
        RAISE NOTICE '⚠️ Both email and id are primary keys - this is unusual';
        RAISE NOTICE 'Dropping primary key on id...';
        
        -- Find and drop the id primary key constraint
        -- This is tricky - we need to identify which constraint is on id
        -- For now, drop all and recreate on email only
        IF pk_constraint_name IS NOT NULL THEN
            -- Drop foreign keys first
            ALTER TABLE public.user_projects 
            DROP CONSTRAINT IF EXISTS user_projects_user_email_fkey;
            
            ALTER TABLE public.layouts 
            DROP CONSTRAINT IF EXISTS layouts_user_email_fkey;
            
            ALTER TABLE public.user_designs 
            DROP CONSTRAINT IF EXISTS user_designs_user_email_fkey;
            
            -- Drop all primary key constraints
            FOR pk_constraint_name IN 
                SELECT constraint_name
                FROM information_schema.table_constraints
                WHERE table_schema = 'public'
                    AND table_name = 'users'
                    AND constraint_type = 'PRIMARY KEY'
            LOOP
                EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I CASCADE', pk_constraint_name);
            END LOOP;
            
            -- Recreate on email only
            ALTER TABLE public.users 
            ADD CONSTRAINT users_pkey PRIMARY KEY (email);
            
            -- Recreate foreign keys
            ALTER TABLE public.user_projects 
            ADD CONSTRAINT user_projects_user_email_fkey 
            FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;
            
            ALTER TABLE public.layouts 
            ADD CONSTRAINT layouts_user_email_fkey 
            FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;
            
            ALTER TABLE public.user_designs 
            ADD CONSTRAINT user_designs_user_email_fkey 
            FOREIGN KEY (user_email) REFERENCES public.users(email) ON DELETE CASCADE;
        END IF;
    ELSE
        RAISE NOTICE '⚠️ No primary key found on users table - creating one on email';
        ALTER TABLE public.users 
        ADD CONSTRAINT users_pkey PRIMARY KEY (email);
    END IF;
END $$;

-- ===== STEP 3: Remove id column if it exists and is not needed =====
-- Check if id column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
            AND table_name = 'users' 
            AND column_name = 'id'
    ) THEN
        -- Check if id is used in any foreign keys
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public'
                AND tc.table_name != 'users'
                AND tc.constraint_type = 'FOREIGN KEY'
                AND kcu.column_name = 'id'
                AND EXISTS (
                    SELECT 1 FROM information_schema.constraint_column_usage ccu
                    WHERE ccu.constraint_name = tc.constraint_name
                        AND ccu.table_schema = 'public'
                        AND ccu.table_name = 'users'
                )
        ) THEN
            -- id column exists but is not referenced, we can drop it
            ALTER TABLE public.users DROP COLUMN IF EXISTS id;
            RAISE NOTICE 'Removed unused id column from users table';
        ELSE
            RAISE NOTICE 'id column exists but is referenced elsewhere - keeping it';
        END IF;
    END IF;
END $$;

-- ===== STEP 4: Verify Fix =====
SELECT '=== VERIFICATION: Users Table Primary Key ===' as step;
SELECT 
    column_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' 
                AND tc.table_name = 'users'
                AND tc.constraint_type = 'PRIMARY KEY'
                AND kcu.column_name = c.column_name
        ) THEN '✅ PRIMARY KEY'
        ELSE ''
    END as status
FROM information_schema.columns c
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

SELECT '✅ Users table primary key fixed!' as result;

