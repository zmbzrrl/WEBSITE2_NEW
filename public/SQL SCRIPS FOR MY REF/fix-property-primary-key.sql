-- 🔧 FIX PROPERTY TABLE PRIMARY KEY
-- This fixes the issue where foreign keys reference property.prop_id but it's not the primary key

-- ===== STEP 1: Check current property table structure =====
SELECT '=== CURRENT PROPERTY TABLE ===' as step;
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

-- ===== STEP 2: Ensure prop_id column exists and has data =====
-- Add prop_id if it doesn't exist
ALTER TABLE public.property 
ADD COLUMN IF NOT EXISTS prop_id TEXT;

-- Populate prop_id from id if it's empty
-- If id is UUID, convert to text. If id is already text, copy it.
UPDATE public.property 
SET prop_id = COALESCE(prop_id, id::TEXT)
WHERE prop_id IS NULL OR prop_id = '';

-- Make prop_id NOT NULL
ALTER TABLE public.property 
ALTER COLUMN prop_id SET NOT NULL;

-- ===== STEP 3: Change primary key from id to prop_id =====

-- Step 3a: Drop the existing primary key constraint on 'id'
ALTER TABLE public.property 
DROP CONSTRAINT IF EXISTS property_pkey;

-- Step 3b: Create new primary key on prop_id
ALTER TABLE public.property 
ADD CONSTRAINT property_pkey PRIMARY KEY (prop_id);

-- ===== STEP 4: Verify the fix =====
SELECT '=== VERIFICATION: Property Primary Key ===' as step;
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
    END as status
FROM information_schema.columns c
WHERE table_schema = 'public' AND table_name = 'property'
ORDER BY ordinal_position;

-- ===== STEP 5: Verify all foreign keys are now valid =====
SELECT '=== VERIFICATION: All Foreign Keys ===' as step;
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
        ELSE '❌ Broken (does not reference Primary Key)'
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_schema, tc.table_name;

SELECT '✅ Fix complete! All foreign keys should now be valid.' as result;

