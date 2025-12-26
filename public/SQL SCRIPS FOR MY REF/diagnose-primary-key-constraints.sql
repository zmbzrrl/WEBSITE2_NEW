-- 🔍 DIAGNOSE PRIMARY KEY CONSTRAINTS
-- This will show exactly what constraints exist and why they can't be dropped

-- Show all constraints on users table
SELECT '=== ALL CONSTRAINTS ON USERS TABLE ===' as section;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    kcu.ordinal_position
FROM information_schema.table_constraints AS tc
LEFT JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
    AND tc.table_name = kcu.table_name
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'users'
ORDER BY tc.constraint_type, tc.constraint_name, kcu.ordinal_position;

-- Show primary key constraints in detail
SELECT '=== PRIMARY KEY CONSTRAINTS DETAIL ===' as section;
SELECT 
    tc.constraint_name,
    COUNT(kcu.column_name) as column_count,
    STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns_in_pk,
    CASE 
        WHEN COUNT(kcu.column_name) = 1 THEN 'Single column primary key'
        WHEN COUNT(kcu.column_name) > 1 THEN 'Composite primary key (multiple columns)'
        ELSE 'No columns'
    END as pk_type
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
    AND tc.table_name = kcu.table_name
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'PRIMARY KEY'
GROUP BY tc.constraint_name
ORDER BY tc.constraint_name;

-- Check if there's a composite primary key
SELECT '=== CHECK FOR COMPOSITE PRIMARY KEY ===' as section;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public'
                AND tc.table_name = 'users'
                AND tc.constraint_type = 'PRIMARY KEY'
            GROUP BY tc.constraint_name
            HAVING COUNT(kcu.column_name) > 1
        ) THEN '⚠️ YES - There is a composite primary key (multiple columns in one constraint)'
        ELSE '✅ NO - No composite primary key'
    END as has_composite_pk;

-- Show the actual table definition from pg_catalog
SELECT '=== ACTUAL TABLE DEFINITION ===' as section;
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    CASE contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'c' THEN 'CHECK'
        ELSE contype::text
    END as constraint_type_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
    AND contype = 'p'  -- 'p' = primary key
ORDER BY conname;

-- Try to get the actual column list for each primary key
SELECT '=== PRIMARY KEY COLUMNS FROM PG_CATALOG ===' as section;
SELECT 
    c.conname as constraint_name,
    a.attname as column_name,
    a.attnum as column_position
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
WHERE n.nspname = 'public'
    AND t.relname = 'users'
    AND c.contype = 'p'  -- primary key
ORDER BY c.conname, k.ord;

