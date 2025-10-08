-- Check layouts table schema to see what columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'layouts'
ORDER BY ordinal_position;

-- Check if project_id column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'layouts' AND column_name = 'project_id';

-- Check user_projects table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_projects'
ORDER BY ordinal_position;
