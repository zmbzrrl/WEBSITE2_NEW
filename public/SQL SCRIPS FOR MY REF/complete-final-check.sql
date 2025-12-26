-- 🎉 COMPLETE FINAL CHECK
-- Verify all three issues are fixed

SELECT '=== FINAL DATABASE STATUS ===' as section;

-- Check 1: Property primary key
SELECT 
    '1. Property prop_id is Primary Key' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
            JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
            WHERE n.nspname = 'public'
                AND t.relname = 'property'
                AND c.contype = 'p'
            GROUP BY c.conname
            HAVING STRING_AGG(a.attname, ', ' ORDER BY k.ord) = 'prop_id'
        ) THEN '✅ YES'
        ELSE '❌ NO'
    END as status

UNION ALL

-- Check 2: All foreign keys valid
SELECT 
    '2. All Foreign Keys Valid' as check_item,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
            AND NOT EXISTS (
                SELECT 1 FROM pg_constraint c2
                JOIN pg_class t2 ON c2.conrelid = t2.oid
                JOIN pg_namespace n2 ON t2.relnamespace = n2.oid
                JOIN LATERAL unnest(c2.conkey) WITH ORDINALITY AS k2(attnum, ord) ON true
                JOIN pg_attribute a2 ON a2.attrelid = c2.conrelid AND a2.attnum = k2.attnum
                WHERE n2.nspname = ccu.table_schema
                    AND t2.relname = ccu.table_name
                    AND c2.contype = 'p'
                GROUP BY c2.conname
                HAVING STRING_AGG(a2.attname, ', ' ORDER BY k2.ord) = ccu.column_name
            )
        ) = 0 THEN '✅ YES'
        ELSE '❌ NO'
    END as status

UNION ALL

-- Check 3: Users email is primary key (only one)
SELECT 
    '3. Users: email is Primary Key (only one)' as check_item,
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
        THEN '✅ YES'
        ELSE '❌ NO'
    END as status;

-- Overall summary
SELECT 
    CASE 
        WHEN (
            -- All three checks pass
            EXISTS (
                SELECT 1 FROM pg_constraint c
                JOIN pg_class t ON c.conrelid = t.oid
                JOIN pg_namespace n ON t.relnamespace = n.oid
                JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
                JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
                WHERE n.nspname = 'public' AND t.relname = 'property' AND c.contype = 'p'
                GROUP BY c.conname
                HAVING STRING_AGG(a.attname, ', ' ORDER BY k.ord) = 'prop_id'
            )
            AND (
                SELECT COUNT(*) FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
                AND NOT EXISTS (
                    SELECT 1 FROM pg_constraint c2
                    JOIN pg_class t2 ON c2.conrelid = t2.oid
                    JOIN pg_namespace n2 ON t2.relnamespace = n2.oid
                    JOIN LATERAL unnest(c2.conkey) WITH ORDINALITY AS k2(attnum, ord) ON true
                    JOIN pg_attribute a2 ON a2.attrelid = c2.conrelid AND a2.attnum = k2.attnum
                    WHERE n2.nspname = ccu.table_schema AND t2.relname = ccu.table_name AND c2.contype = 'p'
                    GROUP BY c2.conname
                    HAVING STRING_AGG(a2.attname, ', ' ORDER BY k2.ord) = ccu.column_name
                )
            ) = 0
            AND (
                SELECT COUNT(DISTINCT c.conname)
                FROM pg_constraint c
                JOIN pg_class t ON c.conrelid = t.oid
                JOIN pg_namespace n ON t.relnamespace = n.oid
                WHERE n.nspname = 'public' AND t.relname = 'users' AND c.contype = 'p'
            ) = 1
            AND (
                SELECT STRING_AGG(a.attname, ', ' ORDER BY k.ord)
                FROM pg_constraint c
                JOIN pg_class t ON c.conrelid = t.oid
                JOIN pg_namespace n ON t.relnamespace = n.oid
                JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
                JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
                WHERE n.nspname = 'public' AND t.relname = 'users' AND c.contype = 'p'
            ) = 'email'
        ) THEN '🎉🎉🎉 ALL FIXED! Your database is in perfect shape! 🎉🎉🎉'
        ELSE '⚠️ Some issues may remain'
    END as overall_status;

