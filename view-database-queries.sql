-- 🔍 DATABASE VIEWING QUERIES
-- Copy and paste these into your Supabase SQL Editor to see your data

-- ===== BASIC TABLE VIEWS =====

-- 1. See all properties
SELECT * FROM api.property;

-- 2. See all user groups
SELECT * FROM api.ug;

-- 3. See all users
SELECT * FROM api.users;

-- 4. See all projects
SELECT * FROM api.user_projects;

-- 5. See all designs
SELECT * FROM api.user_designs;

-- ===== HIERARCHY VIEWS (Using the views I created) =====

-- 6. See users with their full hierarchy (Property → User Group → User)
SELECT * FROM api.users_with_hierarchy;

-- 7. See designs with full hierarchy (Property → User Group → User → Project → Design)
SELECT * FROM api.designs_with_hierarchy;

-- ===== DETAILED QUERIES =====

-- 8. See which users belong to which properties
SELECT 
    u.email,
    u.ug_id,
    ug.ug as user_group,
    p.property_name,
    p.region
FROM api.users u
LEFT JOIN api.ug ON u.ug_id = api.ug.ug
LEFT JOIN api.property p ON api.ug.prop_id = p.id;

-- 9. Count how many users are in each property
SELECT 
    p.property_name,
    p.region,
    COUNT(u.email) as user_count
FROM api.property p
LEFT JOIN api.ug ON p.id = api.ug.prop_id
LEFT JOIN api.users u ON api.ug.ug = u.ug_id
GROUP BY p.id, p.property_name, p.region;

-- 10. See all projects with their property information
SELECT 
    up.project_name,
    up.project_description,
    u.email,
    u.ug_id,
    ug.ug as user_group,
    p.property_name,
    p.region
FROM api.user_projects up
LEFT JOIN api.users u ON up.user_email = u.email
LEFT JOIN api.ug ON u.ug_id = api.ug.ug
LEFT JOIN api.property p ON api.ug.prop_id = p.id;

-- ===== TEST QUERIES =====

-- 11. Test the relationships work correctly
SELECT 
    'Property' as level,
    property_name as name,
    region as location
FROM api.property
UNION ALL
SELECT 
    'User Group' as level,
    ug as name,
    p.region as location
FROM api.ug
LEFT JOIN api.property p ON api.ug.prop_id = p.id
UNION ALL
SELECT 
    'User' as level,
    email as name,
    p.region as location
FROM api.users
LEFT JOIN api.ug ON users.ug_id = api.ug.ug
LEFT JOIN api.property p ON api.ug.prop_id = p.id;

-- 12. See the complete hierarchy for one specific user
SELECT 
    u.email,
    u.ug_id,
    ug.ug as user_group,
    p.property_name,
    p.region,
    COUNT(up.id) as project_count,
    COUNT(ud.id) as design_count
FROM api.users u
LEFT JOIN api.ug ON u.ug_id = api.ug.ug
LEFT JOIN api.property p ON api.ug.prop_id = p.id
LEFT JOIN api.user_projects up ON u.email = up.user_email
LEFT JOIN api.user_designs ud ON up.id = ud.project_id
WHERE u.email = 'admin@marriott.com'
GROUP BY u.email, u.ug_id, ug.ug, p.property_name, p.region;
