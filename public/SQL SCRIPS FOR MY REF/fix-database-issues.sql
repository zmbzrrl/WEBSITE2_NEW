-- 🔧 FIX DATABASE ISSUES
-- This script fixes the identified problems in your database structure

-- ===== STEP 1: CHECK CURRENT STATE =====
-- First, let's see what we're working with

SELECT '=== CURRENT PROPERTY TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'property'
ORDER BY ordinal_position;

SELECT '=== CURRENT USERS TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

SELECT '=== CURRENT UG TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'ug'
ORDER BY ordinal_position;

-- ===== STEP 2: FIX PROPERTY TABLE =====
-- Option A: If property table has 'id' but foreign keys need 'prop_id'
-- We'll add prop_id column and make it the primary key, or sync them

-- Check if property has both id and prop_id
DO $$
DECLARE
    has_id BOOLEAN;
    has_prop_id BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'property' AND column_name = 'id'
    ) INTO has_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'property' AND column_name = 'prop_id'
    ) INTO has_prop_id;
    
    IF has_id AND NOT has_prop_id THEN
        -- Add prop_id column and populate it from id
        ALTER TABLE public.property ADD COLUMN IF NOT EXISTS prop_id TEXT;
        
        -- Generate prop_id from id (UUID to text, or use a pattern)
        UPDATE public.property 
        SET prop_id = id::TEXT 
        WHERE prop_id IS NULL;
        
        -- Make prop_id NOT NULL
        ALTER TABLE public.property ALTER COLUMN prop_id SET NOT NULL;
        
        -- Drop old primary key on id
        ALTER TABLE public.property DROP CONSTRAINT IF EXISTS property_pkey;
        
        -- Create new primary key on prop_id
        ALTER TABLE public.property ADD PRIMARY KEY (prop_id);
        
        -- Optionally drop id column if not needed elsewhere
        -- ALTER TABLE public.property DROP COLUMN IF EXISTS id;
        
        RAISE NOTICE '✅ Fixed property table: Added prop_id and set as primary key';
    ELSIF has_prop_id AND NOT has_id THEN
        RAISE NOTICE '✅ Property table already uses prop_id as primary key';
    ELSIF has_id AND has_prop_id THEN
        -- Both exist - need to decide which to use
        RAISE NOTICE '⚠️ Property table has both id and prop_id - need to decide which to use';
    ELSE
        RAISE NOTICE '❌ Property table structure unclear';
    END IF;
END $$;

-- ===== STEP 3: FIX USERS TABLE =====
-- Remove duplicate primary key constraint if it exists
-- Users should only have 'email' as primary key

DO $$
BEGIN
    -- Check if there's an 'id' column that shouldn't be there
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id'
    ) THEN
        -- Check if id is a primary key
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' 
                AND tc.table_name = 'users' 
                AND tc.constraint_type = 'PRIMARY KEY'
                AND kcu.column_name = 'id'
        ) THEN
            -- Drop primary key on id
            ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_pkey;
            
            -- Recreate primary key on email
            ALTER TABLE public.users ADD PRIMARY KEY (email);
            
            -- Drop id column if it exists and is not needed
            ALTER TABLE public.users DROP COLUMN IF EXISTS id;
            
            RAISE NOTICE '✅ Fixed users table: Removed id column, email is now primary key';
        END IF;
    END IF;
    
    -- Ensure email is the primary key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public' 
            AND tc.table_name = 'users' 
            AND tc.constraint_type = 'PRIMARY KEY'
            AND kcu.column_name = 'email'
    ) THEN
        ALTER TABLE public.users ADD PRIMARY KEY (email);
        RAISE NOTICE '✅ Ensured email is primary key on users table';
    END IF;
END $$;

-- ===== STEP 4: FIX FOREIGN KEY CONSTRAINTS =====
-- Drop and recreate foreign keys that reference property.prop_id

-- Fix layouts.prop_id foreign key
DO $$
BEGIN
    -- Drop existing foreign key if it references wrong column
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.table_schema = 'public' 
            AND tc.table_name = 'layouts'
            AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        -- Get constraint name
        DECLARE
            fk_name TEXT;
        BEGIN
            SELECT constraint_name INTO fk_name
            FROM information_schema.table_constraints
            WHERE table_schema = 'public' 
                AND table_name = 'layouts'
                AND constraint_type = 'FOREIGN KEY'
                AND constraint_name LIKE '%prop_id%'
            LIMIT 1;
            
            IF fk_name IS NOT NULL THEN
                EXECUTE format('ALTER TABLE public.layouts DROP CONSTRAINT IF EXISTS %I', fk_name);
            END IF;
        END;
    END IF;
    
    -- Recreate foreign key to property.prop_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'property' AND column_name = 'prop_id'
    ) THEN
        ALTER TABLE public.layouts 
        DROP CONSTRAINT IF EXISTS layouts_prop_id_fkey,
        ADD CONSTRAINT layouts_prop_id_fkey 
        FOREIGN KEY (prop_id) REFERENCES public.property(prop_id) ON DELETE CASCADE;
        
        RAISE NOTICE '✅ Fixed layouts.prop_id foreign key';
    END IF;
END $$;

-- Fix user_designs.prop_id foreign key
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'user_designs' AND column_name = 'prop_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'property' AND column_name = 'prop_id'
    ) THEN
        ALTER TABLE public.user_designs 
        DROP CONSTRAINT IF EXISTS user_designs_prop_id_fkey,
        ADD CONSTRAINT user_designs_prop_id_fkey 
        FOREIGN KEY (prop_id) REFERENCES public.property(prop_id) ON DELETE CASCADE;
        
        RAISE NOTICE '✅ Fixed user_designs.prop_id foreign key';
    END IF;
END $$;

-- Fix ug_property_access.prop_id foreign key
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'ug_property_access' AND column_name = 'prop_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'property' AND column_name = 'prop_id'
    ) THEN
        ALTER TABLE public.ug_property_access 
        DROP CONSTRAINT IF EXISTS ug_property_access_prop_id_fkey,
        ADD CONSTRAINT ug_property_access_prop_id_fkey 
        FOREIGN KEY (prop_id) REFERENCES public.property(prop_id) ON DELETE CASCADE;
        
        RAISE NOTICE '✅ Fixed ug_property_access.prop_id foreign key';
    END IF;
END $$;

-- Fix ug table - check if it uses 'id' or 'ug_id' as primary key
DO $$
BEGIN
    -- Check current primary key
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public' 
            AND tc.table_name = 'ug' 
            AND tc.constraint_type = 'PRIMARY KEY'
            AND kcu.column_name != 'ug_id'
    ) THEN
        -- Primary key is not on ug_id, but foreign keys reference ug_id
        -- This needs manual review
        RAISE NOTICE '⚠️ UG table primary key mismatch - foreign keys reference ug_id but PK might be on different column';
    END IF;
END $$;

-- ===== STEP 5: VERIFY FIXES =====
SELECT '=== VERIFICATION: PROPERTY TABLE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'property'
ORDER BY ordinal_position;

SELECT '=== VERIFICATION: PRIMARY KEYS ===' as info;
SELECT 
    tc.table_schema || '.' || tc.table_name as table_name,
    kcu.column_name as primary_key_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_schema, tc.table_name;

SELECT '=== VERIFICATION: FOREIGN KEYS ===' as info;
SELECT 
    tc.table_schema || '.' || tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_schema || '.' || ccu.table_name as to_table,
    ccu.column_name as to_column,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_schema = ccu.table_schema 
                AND c.table_name = ccu.table_name 
                AND c.column_name = ccu.column_name
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
ORDER BY tc.table_schema, tc.table_name;

SELECT '=== FIXES COMPLETE ===' as status;

