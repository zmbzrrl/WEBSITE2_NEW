-- 🔍 DETAILED STATUS CHECK
-- Shows exactly what's wrong and what's fixed

-- ===== 1. PROPERTY TABLE PRIMARY KEY =====
SELECT '=== 1. PROPERTY TABLE PRIMARY KEY ===' as section;

SELECT 
    column_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' 
                AND tc.table_name = 'property'
                AND tc.constraint_type = 'PRIMARY KEY'
                AND kcu.column_name = c.column_name
        ) THEN '✅ PRIMARY KEY'
        ELSE ''
    END as is_primary_key
FROM information_schema.columns c
WHERE table_schema = 'public' AND table_name = 'property'
ORDER BY 
    CASE WHEN column_name = 'prop_id' THEN 1 ELSE 2 END,
    ordinal_position;

-- ===== 2. BROKEN FOREIGN KEYS =====
SELECT '=== 2. BROKEN FOREIGN KEYS ===' as section;

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
        ELSE '❌ BROKEN'
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc2
            JOIN information_schema.key_column_usage kcu2 
                ON tc2.constraint_name = kcu2.constraint_name
            WHERE tc2.table_schema = ccu.table_schema 
                AND tc2.table_name = ccu.table_name
                AND tc2.constraint_type = 'PRIMARY KEY'
                AND kcu2.column_name = ccu.column_name
        ) THEN 1
        ELSE 0
    END,
    tc.table_schema, tc.table_name;

-- ===== 3. USERS TABLE PRIMARY KEY =====
SELECT '=== 3. USERS TABLE PRIMARY KEY ===' as section;

-- Show all columns and which is primary key
SELECT 
    column_name,
    data_type,
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
    END as is_primary_key
FROM information_schema.columns c
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY 
    CASE WHEN column_name = 'email' THEN 1 
         WHEN column_name = 'id' THEN 2 
         ELSE 3 END,
    ordinal_position;

-- Count primary keys
SELECT 
    'Primary Key Count' as metric,
    COUNT(*) as count,
    STRING_AGG(kcu.column_name, ', ') as primary_key_columns,
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ No primary key'
        WHEN COUNT(*) = 1 AND MAX(kcu.column_name) = 'email' THEN '✅ Correct - email is primary key'
        WHEN COUNT(*) = 1 AND MAX(kcu.column_name) = 'id' THEN '⚠️ id is primary key (should be email)'
        WHEN COUNT(*) > 1 THEN '❌ Multiple primary keys!'
        ELSE '❓ Unknown issue'
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'users';

-- ===== 4. SUMMARY =====
SELECT '=== 4. SUMMARY ===' as section;

SELECT 
    'Property prop_id is Primary Key' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' 
                AND tc.table_name = 'property'
                AND tc.constraint_type = 'PRIMARY KEY'
                AND kcu.column_name = 'prop_id'
        ) THEN '✅ YES'
        ELSE '❌ NO'
    END as status
UNION ALL
SELECT 
    'All Foreign Keys Valid' as check_item,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
            AND NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints tc2
                JOIN information_schema.key_column_usage kcu2 ON tc2.constraint_name = kcu2.constraint_name
                WHERE tc2.table_schema = ccu.table_schema AND tc2.table_name = ccu.table_name
                AND tc2.constraint_type = 'PRIMARY KEY' AND kcu2.column_name = ccu.column_name
            )
        ) = 0 THEN '✅ YES'
        ELSE '❌ NO'
    END as status
UNION ALL
SELECT 
    'Users: email is Primary Key (only one)' as check_item,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' AND tc.table_name = 'users'
            AND tc.constraint_type = 'PRIMARY KEY' AND kcu.column_name = 'email'
        ) = 1 
        AND (
            SELECT COUNT(*) FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' AND tc.table_name = 'users'
            AND tc.constraint_type = 'PRIMARY KEY'
        ) = 1
        THEN '✅ YES'
        ELSE '❌ NO'
    END as status;

