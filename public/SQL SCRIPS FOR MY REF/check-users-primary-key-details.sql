-- 🔍 CHECK USERS TABLE PRIMARY KEY DETAILS
-- This will show exactly what's happening with the users table

-- Show all columns in users table
SELECT '=== USERS TABLE COLUMNS ===' as section;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Show all primary key constraints on users table
SELECT '=== PRIMARY KEY CONSTRAINTS ON USERS TABLE ===' as section;
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

-- Count and list primary keys
SELECT '=== PRIMARY KEY SUMMARY ===' as section;
SELECT 
    COUNT(*) as total_primary_keys,
    STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.column_name) as primary_key_columns,
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ No primary key'
        WHEN COUNT(*) = 1 AND STRING_AGG(kcu.column_name, ', ') = 'email' THEN '✅ Correct - email is the only primary key'
        WHEN COUNT(*) = 1 AND STRING_AGG(kcu.column_name, ', ') = 'id' THEN '⚠️ id is primary key (should be email)'
        WHEN COUNT(*) = 1 THEN '⚠️ ' || STRING_AGG(kcu.column_name, ', ') || ' is primary key (should be email)'
        WHEN COUNT(*) > 1 THEN '❌ Multiple primary keys: ' || STRING_AGG(kcu.column_name, ', ')
        ELSE '❓ Unknown'
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'PRIMARY KEY';

-- Check if there's an id column and if it has any constraints
SELECT '=== ID COLUMN STATUS (if exists) ===' as section;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id'
        ) THEN '✅ id column exists'
        ELSE '❌ id column does not exist'
    END as id_column_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' 
                AND tc.table_name = 'users'
                AND tc.constraint_type = 'PRIMARY KEY'
                AND kcu.column_name = 'id'
        ) THEN '⚠️ id is a primary key'
        ELSE '✅ id is not a primary key'
    END as id_pk_status;

-- Check if email column exists and its status
SELECT '=== EMAIL COLUMN STATUS ===' as section;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email'
        ) THEN '✅ email column exists'
        ELSE '❌ email column does not exist'
    END as email_column_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' 
                AND tc.table_name = 'users'
                AND tc.constraint_type = 'PRIMARY KEY'
                AND kcu.column_name = 'email'
        ) THEN '✅ email is a primary key'
        ELSE '❌ email is not a primary key'
    END as email_pk_status;

