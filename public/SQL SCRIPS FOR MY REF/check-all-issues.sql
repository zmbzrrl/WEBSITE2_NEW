-- 🔍 CHECK ALL DATABASE ISSUES
-- This will show you ALL potential problems in your database

-- ===== ISSUE CHECK #1: Broken Foreign Keys =====
SELECT '=== ISSUE #1: BROKEN FOREIGN KEYS ===' as check_type;
SELECT 
    tc.table_schema || '.' || tc.table_name as table_with_issue,
    kcu.column_name as foreign_key_column,
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
        ) THEN '✅ VALID'
        ELSE '❌ BROKEN - Does not reference a Primary Key'
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

-- ===== ISSUE CHECK #2: Tables with Multiple Primary Keys =====
SELECT '=== ISSUE #2: TABLES WITH MULTIPLE PRIMARY KEYS ===' as check_type;
SELECT 
    tc.table_schema || '.' || tc.table_name as table_name,
    COUNT(*) as primary_key_count,
    STRING_AGG(kcu.column_name, ', ') as primary_key_columns,
    CASE 
        WHEN COUNT(*) > 1 THEN '❌ HAS MULTIPLE PRIMARY KEYS (should only have 1)'
        ELSE '✅ OK (has 1 primary key)'
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
GROUP BY tc.table_schema, tc.table_name
ORDER BY primary_key_count DESC, tc.table_schema, tc.table_name;

-- ===== ISSUE CHECK #3: Tables Without Primary Keys =====
SELECT '=== ISSUE #3: TABLES WITHOUT PRIMARY KEYS ===' as check_type;
SELECT 
    t.table_schema || '.' || t.table_name as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            WHERE tc.table_schema = t.table_schema
                AND tc.table_name = t.table_name
                AND tc.constraint_type = 'PRIMARY KEY'
        ) THEN '✅ Has Primary Key'
        ELSE '❌ Missing Primary Key'
    END as status
FROM information_schema.tables t
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            WHERE tc.table_schema = t.table_schema
                AND tc.table_name = t.table_name
                AND tc.constraint_type = 'PRIMARY KEY'
        ) THEN 1
        ELSE 0
    END,
    t.table_schema, t.table_name;

-- ===== ISSUE CHECK #4: Foreign Keys Pointing to Non-Existent Columns =====
SELECT '=== ISSUE #4: FOREIGN KEYS TO MISSING COLUMNS ===' as check_type;
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
        ) THEN '✅ Column exists'
        ELSE '❌ Column does not exist'
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_schema = ccu.table_schema 
            AND c.table_name = ccu.table_name 
            AND c.column_name = ccu.column_name
    )
ORDER BY tc.table_schema, tc.table_name;

-- ===== ISSUE CHECK #5: Orphaned Data (data that references non-existent records) =====
SELECT '=== ISSUE #5: ORPHANED DATA CHECK ===' as check_type;
SELECT 
    'layouts.prop_id' as check_description,
    COUNT(*) as orphaned_records,
    CASE 
        WHEN COUNT(*) > 0 THEN '❌ Has ' || COUNT(*) || ' layout(s) referencing non-existent properties'
        ELSE '✅ No orphaned records'
    END as status
FROM public.layouts l
WHERE l.prop_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM public.property p WHERE p.prop_id = l.prop_id
    )
UNION ALL
SELECT 
    'user_designs.prop_id' as check_description,
    COUNT(*) as orphaned_records,
    CASE 
        WHEN COUNT(*) > 0 THEN '❌ Has ' || COUNT(*) || ' design(s) referencing non-existent properties'
        ELSE '✅ No orphaned records'
    END as status
FROM public.user_designs ud
WHERE ud.prop_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM public.property p WHERE p.prop_id = ud.prop_id
    )
UNION ALL
SELECT 
    'ug_property_access.prop_id' as check_description,
    COUNT(*) as orphaned_records,
    CASE 
        WHEN COUNT(*) > 0 THEN '❌ Has ' || COUNT(*) || ' access record(s) referencing non-existent properties'
        ELSE '✅ No orphaned records'
    END as status
FROM public.ug_property_access upa
WHERE upa.prop_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM public.property p WHERE p.prop_id = upa.prop_id
    );

-- ===== SUMMARY =====
SELECT '=== SUMMARY ===' as summary;
SELECT 
    'Total Issues Found' as metric,
    (
        -- Count broken foreign keys
        (SELECT COUNT(*) FROM information_schema.table_constraints AS tc
         JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
         JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
         WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
         AND NOT EXISTS (
             SELECT 1 FROM information_schema.table_constraints tc2
             JOIN information_schema.key_column_usage kcu2 ON tc2.constraint_name = kcu2.constraint_name
             WHERE tc2.table_schema = ccu.table_schema AND tc2.table_name = ccu.table_name
             AND tc2.constraint_type = 'PRIMARY KEY' AND kcu2.column_name = ccu.column_name
         ))
        +
        -- Count tables with multiple primary keys
        (SELECT COUNT(*) FROM (
             SELECT tc.table_schema, tc.table_name
             FROM information_schema.table_constraints AS tc
             JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
             WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
             GROUP BY tc.table_schema, tc.table_name
             HAVING COUNT(*) > 1
         ) AS multi_pk)
        +
        -- Count tables without primary keys
        (SELECT COUNT(*) FROM information_schema.tables t
         WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
         AND NOT EXISTS (
             SELECT 1 FROM information_schema.table_constraints tc
             WHERE tc.table_schema = t.table_schema AND tc.table_name = t.table_name
             AND tc.constraint_type = 'PRIMARY KEY'
         ))
    ) as issue_count;

