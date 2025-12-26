-- ✅ VERIFY FIX AND CHECK REMAINING ISSUES
-- Run this to confirm the property primary key fix worked and check for other issues

-- ===== STEP 1: Verify Property Table Primary Key =====
SELECT '=== VERIFICATION: Property Primary Key ===' as step;
SELECT 
    column_name,
    data_type,
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
    END as status
FROM information_schema.columns c
WHERE table_schema = 'public' AND table_name = 'property'
ORDER BY ordinal_position;

-- ===== STEP 2: Verify All Foreign Keys Are Now Valid =====
SELECT '=== VERIFICATION: All Foreign Keys (Should All Be Valid Now) ===' as step;
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
        ) THEN '✅ Valid (references Primary Key)'
        ELSE '❌ Still Broken'
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

-- ===== STEP 3: Check Users Table Primary Key Issue =====
SELECT '=== CHECK: Users Table Primary Key ===' as step;
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
ORDER BY ordinal_position;

-- Count how many primary keys the users table has
SELECT '=== CHECK: Multiple Primary Keys on Users Table? ===' as step;
SELECT 
    'users' as table_name,
    COUNT(*) as primary_key_count,
    STRING_AGG(kcu.column_name, ', ') as primary_key_columns,
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ No Primary Key'
        WHEN COUNT(*) = 1 THEN '✅ Correct (has 1 primary key)'
        WHEN COUNT(*) > 1 THEN '❌ PROBLEM: Has multiple primary keys!'
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'users';

-- ===== STEP 4: Summary of All Issues =====
SELECT '=== SUMMARY: Remaining Issues ===' as step;
SELECT 
    'Broken Foreign Keys' as issue_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ None - All fixed!'
        ELSE '❌ ' || COUNT(*) || ' still broken'
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc2
        JOIN information_schema.key_column_usage kcu2 
            ON tc2.constraint_name = kcu2.constraint_name
        WHERE tc2.table_schema = ccu.table_schema 
            AND tc2.table_name = ccu.table_name
            AND tc2.constraint_type = 'PRIMARY KEY'
            AND kcu2.column_name = ccu.column_name
    )
UNION ALL
SELECT 
    'Tables with Multiple Primary Keys' as issue_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ None'
        ELSE '❌ ' || COUNT(*) || ' table(s) have multiple primary keys'
    END as status
FROM (
    SELECT tc.table_schema, tc.table_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
    GROUP BY tc.table_schema, tc.table_name
    HAVING COUNT(*) > 1
) AS multi_pk;

SELECT '✅ Verification complete!' as result;

