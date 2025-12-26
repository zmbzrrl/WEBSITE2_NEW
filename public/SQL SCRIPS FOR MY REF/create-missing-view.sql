-- 🔧 CREATE THE MISSING VIEW
-- Run this to create the designs_with_hierarchy view

-- Create the designs_with_hierarchy view
CREATE OR REPLACE VIEW api.designs_with_hierarchy AS
SELECT 
    d.id,
    d.design_name,
    d.panel_type,
    d.design_data,
    d.created_at,
    d.last_modified,
    d.user_email,
    p.project_name,
    p.project_description,
    u.ug_id,
    ug.ug as user_group,
    prop.property_name,
    prop.region
FROM api.user_designs d
LEFT JOIN api.user_projects p ON d.project_id = p.id
LEFT JOIN api.users u ON d.user_email = u.email
LEFT JOIN api.ug ON u.ug_id = api.ug.id
LEFT JOIN api.property prop ON api.ug.prop_id = prop.id
WHERE d.is_active = true AND p.is_active = true;

-- Verify the view was created
SELECT 'View created successfully!' as status;

-- Test the view (it might be empty if no designs exist)
SELECT COUNT(*) as design_count FROM api.designs_with_hierarchy;
