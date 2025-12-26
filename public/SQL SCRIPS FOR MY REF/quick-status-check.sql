-- ✅ QUICK STATUS CHECK
-- Simple summary to see if everything is fixed

-- 1. Property table primary key
SELECT 'Property Primary Key' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' 
                AND tc.table_name = 'property'
                AND tc.constraint_type = 'PRIMARY KEY'
                AND kcu.column_name = 'prop_id'
        ) THEN '✅ FIXED - prop_id is primary key'
        ELSE '❌ NOT FIXED - prop_id is not primary key'
    END as status;

-- 2. Broken foreign keys count
SELECT 'Broken Foreign Keys' as check_item,
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
        ) = 0 THEN '✅ FIXED - All foreign keys are valid'
        ELSE '❌ NOT FIXED - ' || (
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
        ) || ' foreign key(s) still broken'
    END as status;

-- 3. Users table primary key
SELECT 'Users Table Primary Key' as check_item,
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
            AND tc.constraint_type = 'PRIMARY KEY' AND kcu.column_name = 'id'
        ) = 0
        THEN '✅ OK - email is primary key (only one)'
        WHEN (
            SELECT COUNT(*) FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' AND tc.table_name = 'users'
            AND tc.constraint_type = 'PRIMARY KEY'
        ) > 1
        THEN '❌ PROBLEM - Multiple primary keys on users table'
        WHEN (
            SELECT COUNT(*) FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' AND tc.table_name = 'users'
            AND tc.constraint_type = 'PRIMARY KEY' AND kcu.column_name = 'id'
        ) = 1
        THEN '⚠️ WARNING - id is primary key (should be email)'
        ELSE '❓ UNKNOWN - Check manually'
    END as status;

-- 4. Overall status
SELECT 
    CASE 
        WHEN (
            -- Property has prop_id as PK
            EXISTS (
                SELECT 1 FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
                WHERE tc.table_schema = 'public' AND tc.table_name = 'property'
                AND tc.constraint_type = 'PRIMARY KEY' AND kcu.column_name = 'prop_id'
            )
            -- No broken foreign keys
            AND (
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
            ) = 0
            -- Users has email as PK (only one)
            AND (
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
        ) THEN '🎉 ALL FIXED! Your database is in good shape!'
        ELSE '⚠️ Some issues remain - see details above'
    END as overall_status;

