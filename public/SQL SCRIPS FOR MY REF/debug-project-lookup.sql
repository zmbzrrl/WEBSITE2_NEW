-- Debug project lookup for layouts
-- Check if project with code AE-12-3456 exists

-- Check user_projects table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'api' AND table_name = 'user_projects'
ORDER BY ordinal_position;

-- Check if project exists with this code
SELECT id, project_name, project_description, user_email, created_at
FROM api.user_projects 
WHERE project_description = 'AE-12-3456'
ORDER BY created_at DESC;

-- Check all projects for this user (replace with actual user email)
SELECT id, project_name, project_description, user_email, created_at
FROM api.user_projects 
WHERE user_email = 'your-email@example.com'  -- Replace with actual email
ORDER BY created_at DESC;

-- Check layouts table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'layouts'
ORDER BY ordinal_position;
