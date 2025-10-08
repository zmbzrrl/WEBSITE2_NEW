-- Fix layouts table to support project-based flow
-- This adds project_id column and removes prop_id dependency

-- Step 1: Add project_id column (using public schema)
ALTER TABLE public.layouts 
ADD COLUMN project_id UUID REFERENCES public.user_projects(id) ON DELETE CASCADE;

-- Step 2: Add index for performance
CREATE INDEX IF NOT EXISTS idx_layouts_project_id ON public.layouts(project_id);
CREATE INDEX IF NOT EXISTS idx_layouts_user_email ON public.layouts(user_email);

-- Step 3: Grant permissions
GRANT ALL ON public.layouts TO anon;
GRANT ALL ON public.layouts TO authenticated;

-- Step 4: Disable RLS for development
ALTER TABLE public.layouts DISABLE ROW LEVEL SECURITY;

-- Step 5: Verify the updated table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'layouts'
ORDER BY ordinal_position;

-- Note: You may want to migrate existing data from prop_id to project_id
-- before dropping the prop_id column. For now, we'll keep both columns.
