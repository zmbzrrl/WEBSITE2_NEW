-- ✅ FINAL VERIFICATION
-- Simple check using pg_catalog (more reliable than information_schema)

-- Check using pg_catalog (PostgreSQL's internal catalog - most reliable)
SELECT '=== PRIMARY KEY FROM PG_CATALOG (Most Reliable) ===' as section;
SELECT 
    c.conname as constraint_name,
    COUNT(a.attname) as column_count,
    STRING_AGG(a.attname, ', ' ORDER BY k.ord) as primary_key_columns,
    CASE 
        WHEN COUNT(a.attname) = 1 AND STRING_AGG(a.attname, ', ') = 'email' THEN '✅ CORRECT - email is the only primary key'
        WHEN COUNT(a.attname) > 1 THEN '❌ PROBLEM - Composite primary key with ' || COUNT(a.attname) || ' columns: ' || STRING_AGG(a.attname, ', ')
        WHEN COUNT(a.attname) = 1 AND STRING_AGG(a.attname, ', ') != 'email' THEN '❌ PROBLEM - ' || STRING_AGG(a.attname, ', ') || ' is primary key (should be email)'
        ELSE '❌ No primary key found'
    END as status
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
WHERE n.nspname = 'public'
    AND t.relname = 'users'
    AND c.contype = 'p'  -- 'p' = primary key
GROUP BY c.conname;

-- Count total primary key constraints
SELECT '=== PRIMARY KEY CONSTRAINT COUNT ===' as section;
SELECT 
    COUNT(DISTINCT c.conname) as total_primary_key_constraints,
    CASE 
        WHEN COUNT(DISTINCT c.conname) = 0 THEN '❌ No primary key constraint'
        WHEN COUNT(DISTINCT c.conname) = 1 THEN '✅ Correct - Only 1 primary key constraint'
        WHEN COUNT(DISTINCT c.conname) > 1 THEN '❌ PROBLEM - Multiple primary key constraints: ' || COUNT(DISTINCT c.conname)
    END as status
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public'
    AND t.relname = 'users'
    AND c.contype = 'p';

-- Check using information_schema (what the other queries use)
SELECT '=== PRIMARY KEY FROM INFORMATION_SCHEMA ===' as section;
SELECT 
    COUNT(DISTINCT tc.constraint_name) as constraint_count,
    COUNT(kcu.column_name) as total_column_references,
    STRING_AGG(DISTINCT kcu.column_name, ', ' ORDER BY kcu.column_name) as all_columns_referenced,
    CASE 
        WHEN COUNT(DISTINCT tc.constraint_name) = 1 AND COUNT(kcu.column_name) = 1 AND STRING_AGG(DISTINCT kcu.column_name, ', ') = 'email' THEN '✅ CORRECT'
        WHEN COUNT(DISTINCT tc.constraint_name) > 1 THEN '❌ Multiple constraints'
        WHEN COUNT(kcu.column_name) > 1 THEN '❌ Composite primary key or multiple columns'
        ELSE '❌ Issue detected'
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'PRIMARY KEY';

-- Final summary
SELECT '=== FINAL SUMMARY ===' as section;
SELECT 
    CASE 
        WHEN (
            SELECT COUNT(DISTINCT c.conname)
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            WHERE n.nspname = 'public'
                AND t.relname = 'users'
                AND c.contype = 'p'
        ) = 1
        AND (
            SELECT STRING_AGG(a.attname, ', ' ORDER BY k.ord)
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
            JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
            WHERE n.nspname = 'public'
                AND t.relname = 'users'
                AND c.contype = 'p'
        ) = 'email'
        THEN '🎉 SUCCESS - Database is fixed! email is the only primary key.'
        ELSE '⚠️ Issue remains - check details above'
    END as final_status;

