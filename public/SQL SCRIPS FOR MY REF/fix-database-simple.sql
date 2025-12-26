-- 🔧 SIMPLE DATABASE FIX
-- Fixes the primary key and foreign key mismatches

-- ===== ISSUE 1: Property table uses 'id' but foreign keys need 'prop_id' =====

-- Step 1: Add prop_id column to property if it doesn't exist
ALTER TABLE public.property 
ADD COLUMN IF NOT EXISTS prop_id TEXT;

-- Step 2: Populate prop_id from id (convert UUID to text, or use a pattern)
-- If id is UUID, we'll generate a text prop_id
-- If id is already TEXT, we can copy it
UPDATE public.property 
SET prop_id = COALESCE(prop_id, id::TEXT)
WHERE prop_id IS NULL;

-- Step 3: Make prop_id NOT NULL
ALTER TABLE public.property 
ALTER COLUMN prop_id SET NOT NULL;

-- Step 4: Drop old primary key constraint
ALTER TABLE public.property 
DROP CONSTRAINT IF EXISTS property_pkey;

-- Step 5: Create new primary key on prop_id
ALTER TABLE public.property 
ADD CONSTRAINT property_pkey PRIMARY KEY (prop_id);

-- Step 6: Create unique index on id if it still exists and is needed
-- (We'll keep id column for now in case it's referenced elsewhere)

-- ===== ISSUE 2: Users table might have duplicate primary key =====

-- Check and fix: ensure only email is primary key
DO $$
BEGIN
    -- Drop any primary key constraint on 'id' if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public' 
            AND tc.table_name = 'users'
            AND tc.constraint_type = 'PRIMARY KEY'
            AND kcu.column_name = 'id'
    ) THEN
        ALTER TABLE public.users DROP CONSTRAINT users_pkey;
        ALTER TABLE public.users ADD PRIMARY KEY (email);
    END IF;
    
    -- Ensure email is primary key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public' 
            AND tc.table_name = 'users'
            AND tc.constraint_type = 'PRIMARY KEY'
            AND kcu.column_name = 'email'
    ) THEN
        ALTER TABLE public.users ADD PRIMARY KEY (email);
    END IF;
END $$;

-- ===== ISSUE 3: Fix foreign keys that reference property.prop_id =====

-- Fix layouts.prop_id foreign key
DO $$
DECLARE
    fk_constraint_name TEXT;
BEGIN
    -- Find and drop existing foreign key on prop_id
    SELECT constraint_name INTO fk_constraint_name
    FROM information_schema.table_constraints
    WHERE table_schema = 'public' 
        AND table_name = 'layouts'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%prop_id%'
    LIMIT 1;
    
    IF fk_constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.layouts DROP CONSTRAINT IF EXISTS %I', fk_constraint_name);
    END IF;
    
    -- Recreate foreign key
    ALTER TABLE public.layouts 
    ADD CONSTRAINT layouts_prop_id_fkey 
    FOREIGN KEY (prop_id) REFERENCES public.property(prop_id) ON DELETE CASCADE;
END $$;

-- Fix user_designs.prop_id foreign key (if column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'user_designs' AND column_name = 'prop_id'
    ) THEN
        -- Drop existing constraint
        ALTER TABLE public.user_designs 
        DROP CONSTRAINT IF EXISTS user_designs_prop_id_fkey;
        
        -- Recreate foreign key
        ALTER TABLE public.user_designs 
        ADD CONSTRAINT user_designs_prop_id_fkey 
        FOREIGN KEY (prop_id) REFERENCES public.property(prop_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Fix ug_property_access.prop_id foreign key
DO $$
BEGIN
    -- Drop existing constraint
    ALTER TABLE public.ug_property_access 
    DROP CONSTRAINT IF EXISTS ug_property_access_prop_id_fkey;
    
    -- Recreate foreign key
    ALTER TABLE public.ug_property_access 
    ADD CONSTRAINT ug_property_access_prop_id_fkey 
    FOREIGN KEY (prop_id) REFERENCES public.property(prop_id) ON DELETE CASCADE;
END $$;

-- ===== VERIFICATION =====
SELECT '=== VERIFICATION: Property Primary Key ===' as check;
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

SELECT '=== VERIFICATION: All Foreign Keys ===' as check;
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
        ELSE '❌ Broken'
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_schema, tc.table_name;

SELECT '✅ Database fixes applied!' as result;

