-- 🔍 CHECK YOUR CURRENT DATABASE STRUCTURE
-- Run this in Supabase SQL Editor to see what you currently have

-- 1. See what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'api' 
ORDER BY table_name;

-- 2. Check if the new tables exist
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'property') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as property_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'ug') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as ug_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'users') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as users_table;

-- 3. See what's in your existing tables
SELECT 'user_projects' as table_name, COUNT(*) as record_count FROM api.user_projects
UNION ALL
SELECT 'user_designs' as table_name, COUNT(*) as record_count FROM api.user_designs
UNION ALL
SELECT 'panel_configurations' as table_name, COUNT(*) as record_count FROM api.panel_configurations
UNION ALL
SELECT 'design_versions' as table_name, COUNT(*) as record_count FROM api.design_versions;

-- 4. See sample data from existing tables
SELECT 'Sample user_projects:' as info;
SELECT * FROM api.user_projects LIMIT 3;

SELECT 'Sample user_designs:' as info;
SELECT * FROM api.user_designs LIMIT 3;
