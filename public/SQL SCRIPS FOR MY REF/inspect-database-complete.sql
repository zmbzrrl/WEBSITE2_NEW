-- 🔍 COMPREHENSIVE DATABASE INSPECTION SCRIPT
-- Run this in your Supabase SQL Editor to see your complete database structure
-- Copy the results and share them with me to help fix your database

-- ===== 1. LIST ALL TABLES IN ALL SCHEMAS =====
SELECT 
    '=== ALL TABLES ===' as section,
    table_schema,
    table_name,
    CASE 
        WHEN table_type = 'BASE TABLE' THEN 'Table'
        WHEN table_type = 'VIEW' THEN 'View'
        ELSE table_type
    END as type
FROM information_schema.tables 
WHERE table_schema IN ('public', 'api')
    AND table_type IN ('BASE TABLE', 'VIEW')
ORDER BY table_schema, table_name;

-- ===== 2. TABLE STRUCTURES (COLUMNS, TYPES, CONSTRAINTS) =====
SELECT 
    '=== TABLE STRUCTURES ===' as section,
    t.table_schema,
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY → ' || fk.foreign_table_schema || '.' || fk.foreign_table_name || '(' || fk.foreign_column_name || ')'
        ELSE ''
    END as constraints
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
LEFT JOIN (
    SELECT ku.table_schema, ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku 
        ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON c.table_schema = pk.table_schema AND c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
    SELECT 
        ku.table_schema,
        ku.table_name,
        ku.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS ku
        ON tc.constraint_name = ku.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON c.table_schema = fk.table_schema AND c.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE t.table_schema IN ('public', 'api')
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_schema, t.table_name, c.ordinal_position;

-- ===== 3. FOREIGN KEY RELATIONSHIPS =====
SELECT 
    '=== FOREIGN KEY RELATIONSHIPS ===' as section,
    tc.table_schema || '.' || tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_schema || '.' || ccu.table_name as to_table,
    ccu.column_name as to_column,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema IN ('public', 'api')
ORDER BY tc.table_schema, tc.table_name;

-- ===== 4. INDEXES =====
SELECT 
    '=== INDEXES ===' as section,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname IN ('public', 'api')
ORDER BY schemaname, tablename, indexname;

-- ===== 5. ROW COUNTS FOR ALL TABLES =====
SELECT 
    '=== ROW COUNTS ===' as section,
    schemaname,
    relname as tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname IN ('public', 'api')
ORDER BY schemaname, relname;

-- ===== 6. CHECK FOR COMMON ISSUES =====

-- 6.1 Tables without primary keys
SELECT 
    '=== TABLES WITHOUT PRIMARY KEYS ===' as section,
    t.table_schema,
    t.table_name
FROM information_schema.tables t
WHERE t.table_schema IN ('public', 'api')
    AND t.table_type = 'BASE TABLE'
    AND NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        WHERE tc.table_schema = t.table_schema
            AND tc.table_name = t.table_name
            AND tc.constraint_type = 'PRIMARY KEY'
    )
ORDER BY t.table_schema, t.table_name;

-- 6.2 Foreign keys pointing to non-existent tables/columns
SELECT 
    '=== POTENTIALLY BROKEN FOREIGN KEYS ===' as section,
    tc.table_schema || '.' || tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_schema || '.' || ccu.table_name as to_table,
    ccu.column_name as to_column,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.tables t
            WHERE t.table_schema = ccu.table_schema AND t.table_name = ccu.table_name
        ) THEN '❌ Target table does not exist'
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_schema = ccu.table_schema 
                AND c.table_name = ccu.table_name 
                AND c.column_name = ccu.column_name
        ) THEN '❌ Target column does not exist'
        ELSE '✅ OK'
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema IN ('public', 'api')
ORDER BY tc.table_schema, tc.table_name;

-- ===== 7. SAMPLE DATA FROM EACH TABLE =====
-- This will show a few rows from each table to understand the data structure

DO $$
DECLARE
    r RECORD;
    query_text TEXT;
BEGIN
    FOR r IN 
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_schema IN ('public', 'api')
            AND table_type = 'BASE TABLE'
        ORDER BY table_schema, table_name
    LOOP
        RAISE NOTICE '=== SAMPLE DATA: %.% ===', r.table_schema, r.table_name;
        query_text := format('SELECT * FROM %I.%I LIMIT 3', r.table_schema, r.table_name);
        -- Note: This will show in the messages/notices, not in the result set
        -- For actual data, you'll need to run individual SELECT queries
    END LOOP;
END $$;

-- ===== 8. VIEWS DEFINITIONS =====
SELECT 
    '=== VIEWS ===' as section,
    table_schema,
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema IN ('public', 'api')
ORDER BY table_schema, table_name;

-- ===== 9. SUMMARY STATISTICS =====
SELECT 
    '=== SUMMARY ===' as section,
    table_schema,
    COUNT(DISTINCT table_name) FILTER (WHERE table_type = 'BASE TABLE') as table_count,
    COUNT(DISTINCT table_name) FILTER (WHERE table_type = 'VIEW') as view_count,
    SUM(n_live_tup) as total_rows
FROM information_schema.tables t
LEFT JOIN pg_stat_user_tables s 
    ON t.table_schema = s.schemaname AND t.table_name = s.relname
WHERE t.table_schema IN ('public', 'api')
    AND t.table_type IN ('BASE TABLE', 'VIEW')
GROUP BY table_schema
ORDER BY table_schema;

