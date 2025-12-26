-- Update layouts table to use project_id instead of prop_id
-- This aligns layouts with the same project-based flow as panel designs

-- Add project_id column to layouts table
ALTER TABLE public.layouts 
ADD COLUMN project_id UUID REFERENCES api.user_projects(id) ON DELETE CASCADE;

-- Migrate existing data (if any) - this is a placeholder since we're changing the structure
-- You may need to handle existing data migration separately

-- Remove the old prop_id column (after confirming no data loss)
-- ALTER TABLE public.layouts DROP COLUMN prop_id;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_layouts_project_id ON public.layouts(project_id);
CREATE INDEX IF NOT EXISTS idx_layouts_user_email ON public.layouts(user_email);

-- Grant permissions
GRANT ALL ON public.layouts TO anon;
GRANT ALL ON public.layouts TO authenticated;

-- Disable RLS for development
ALTER TABLE public.layouts DISABLE ROW LEVEL SECURITY;

-- Verify the updated table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'layouts'
ORDER BY ordinal_position;
