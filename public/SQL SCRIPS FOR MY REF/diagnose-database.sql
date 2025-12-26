-- 🔍 DIAGNOSE DATABASE STRUCTURE
-- Run this first to understand the exact current state

-- 1. Property table structure
SELECT '=== PROPERTY TABLE ===' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' 
                AND tc.table_name = 'property'
                AND tc.constraint_type = 'PRIMARY KEY'
                AND kcu.column_name = c.column_name
        ) THEN 'PRIMARY KEY'
        ELSE ''
    END as is_primary_key
FROM information_schema.columns c
WHERE table_schema = 'public' AND table_name = 'property'
ORDER BY ordinal_position;

-- 2. Users table structure
SELECT '=== USERS TABLE ===' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' 
                AND tc.table_name = 'users'
                AND tc.constraint_type = 'PRIMARY KEY'
                AND kcu.column_name = c.column_name
        ) THEN 'PRIMARY KEY'
        ELSE ''
    END as is_primary_key
FROM information_schema.columns c
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. UG table structure
SELECT '=== UG TABLE ===' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' 
                AND tc.table_name = 'ug'
                AND tc.constraint_type = 'PRIMARY KEY'
                AND kcu.column_name = c.column_name
        ) THEN 'PRIMARY KEY'
        ELSE ''
    END as is_primary_key
FROM information_schema.columns c
WHERE table_schema = 'public' AND table_name = 'ug'
ORDER BY ordinal_position;

-- 4. Layouts table structure
SELECT '=== LAYOUTS TABLE ===' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns c
WHERE table_schema = 'public' AND table_name = 'layouts'
ORDER BY ordinal_position;

-- 5. User_designs table structure
SELECT '=== USER_DESIGNS TABLE ===' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns c
WHERE table_schema = 'public' AND table_name = 'user_designs'
ORDER BY ordinal_position;

-- 6. All foreign key constraints with their target columns
SELECT '=== ALL FOREIGN KEYS ===' as section;
SELECT 
    tc.table_schema || '.' || tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_schema || '.' || ccu.table_name as to_table,
    ccu.column_name as to_column,
    tc.constraint_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_schema = ccu.table_schema 
                AND c.table_name = ccu.table_name 
                AND c.column_name = ccu.column_name
        ) THEN '✅ Column exists'
        ELSE '❌ Column missing'
    END as column_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc2
            JOIN information_schema.key_column_usage kcu2 
                ON tc2.constraint_name = kcu2.constraint_name
            WHERE tc2.table_schema = ccu.table_schema 
                AND tc2.table_name = ccu.table_name
                AND tc2.constraint_type = 'PRIMARY KEY'
                AND kcu2.column_name = ccu.column_name
        ) THEN '✅ Is Primary Key'
        ELSE '⚠️ Not Primary Key'
    END as pk_status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_schema, tc.table_name;

