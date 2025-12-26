-- 🔍 QUICK DATABASE CHECK
-- Run these queries one at a time and share the results

-- 1. List all tables
SELECT 
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

-- 2. Show structure of each table (run this separately for each table you find)
-- Replace 'users' with each table name from query 1
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'users'  -- Change this to each table name
ORDER BY ordinal_position;

-- 3. Show foreign keys
SELECT 
    tc.table_schema || '.' || tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_schema || '.' || ccu.table_name as to_table,
    ccu.column_name as to_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema IN ('public', 'api')
ORDER BY tc.table_schema, tc.table_name;

-- 4. Show primary keys
SELECT 
    tc.table_schema || '.' || tc.table_name as table_name,
    kcu.column_name as primary_key_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema IN ('public', 'api')
ORDER BY tc.table_schema, tc.table_name;

-- 5. Row counts
SELECT 
    schemaname,
    relname as tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname IN ('public', 'api')
ORDER BY schemaname, relname;

