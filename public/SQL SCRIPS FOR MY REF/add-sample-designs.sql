-- 🎨 ADD SAMPLE DESIGNS TO YOUR NEW DATABASE
-- Run this after the main setup to add some sample designs

-- Add sample designs to existing projects
INSERT INTO api.user_designs (project_id, user_email, design_name, panel_type, design_data)
SELECT 
    up.id as project_id,
    up.user_email,
    up.project_name || ' - SP Panel' as design_name,
    'SP' as panel_type,
    '{
        "panelType": "SP",
        "backgroundColor": "#FFFFFF",
        "iconColor": "#1b92d1",
        "textColor": "#333333",
        "iconSize": "40px",
        "icons": [
            {
                "iconId": "B-1",
                "label": "Light Control",
                "position": 1,
                "text": "LIGHTS",
                "color": "#1b92d1"
            },
            {
                "iconId": "B-2",
                "label": "Temperature",
                "position": 2,
                "text": "TEMP",
                "color": "#ff6b35"
            }
        ],
        "layout": {
            "rows": 2,
            "columns": 2,
            "spacing": "10px"
        }
    }'::jsonb as design_data
FROM api.user_projects up;

-- Add another design type (IDPG) to the first project
INSERT INTO api.user_designs (project_id, user_email, design_name, panel_type, design_data)
SELECT 
    up.id as project_id,
    up.user_email,
    up.project_name || ' - IDPG Panel' as design_name,
    'IDPG' as panel_type,
    '{
        "panelType": "IDPG",
        "backgroundColor": "#F5F5F5",
        "iconColor": "#333333",
        "textColor": "#000000",
        "iconSize": "35px",
        "icons": [
            {
                "iconId": "G-1",
                "label": "Guest Services",
                "position": 1,
                "text": "SERVICE",
                "color": "#333333"
            }
        ],
        "layout": {
            "rows": 1,
            "columns": 1,
            "spacing": "5px"
        }
    }'::jsonb as design_data
FROM api.user_projects up
LIMIT 1;

-- Add panel configurations to the first design
INSERT INTO api.panel_configurations (design_id, panel_index, room_type, panel_data)
SELECT 
    ud.id as design_id,
    1 as panel_index,
    'Lobby' as room_type,
    '{
        "roomName": "Main Lobby",
        "panelPosition": "Entrance Wall",
        "customSettings": {
            "brightness": 80,
            "autoDim": true
        }
    }'::jsonb as panel_data
FROM api.user_designs ud
WHERE ud.panel_type = 'SP'
LIMIT 1;

-- Verify the results
SELECT 'Sample designs added!' as status;
SELECT COUNT(*) as design_count FROM api.user_designs;
SELECT COUNT(*) as configuration_count FROM api.panel_configurations;

-- Show the new designs
SELECT 
    d.design_name,
    d.panel_type,
    p.project_name,
    u.email
FROM api.user_designs d
LEFT JOIN api.user_projects p ON d.project_id = p.id
LEFT JOIN api.users u ON d.user_email = u.email;
