-- 🔍 CHECK IF USERS TABLE HAS MULTIPLE PRIMARY KEYS
-- Simple check to see if both id and email are primary keys

SELECT '=== ALL PRIMARY KEYS ON USERS TABLE ===' as section;
SELECT 
    kcu.column_name as primary_key_column,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY kcu.column_name;

-- Count them
SELECT '=== PRIMARY KEY COUNT ===' as section;
SELECT 
    COUNT(*) as total_primary_keys,
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ No primary key'
        WHEN COUNT(*) = 1 THEN '✅ Only 1 primary key (correct)'
        WHEN COUNT(*) > 1 THEN '❌ PROBLEM: Multiple primary keys! (' || COUNT(*) || ' total)'
    END as status,
    STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.column_name) as all_primary_key_columns
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'PRIMARY KEY';

