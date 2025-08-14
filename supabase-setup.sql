-- 🏗️ FRESH SUPABASE DATABASE SETUP FOR PANEL CUSTOMIZER
-- Run this in your Supabase SQL Editor to create all necessary tables
-- Note: This script uses the 'api' schema to match your project configuration

-- ===== CLEAN SLATE =====
-- Drop existing tables if they exist
DROP TABLE IF EXISTS api.user_designs CASCADE;
DROP TABLE IF EXISTS api.user_projects CASCADE;
DROP TABLE IF EXISTS api.panel_configurations CASCADE;
DROP TABLE IF EXISTS api.design_versions CASCADE;

-- ===== CREATE TABLES =====

-- 1. USER PROJECTS TABLE (Main project container)
CREATE TABLE api.user_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    project_name TEXT NOT NULL,
    project_description TEXT,
    location TEXT, -- 🗺️ Location field (Dubai, London, etc.)
    operator TEXT, -- 🏢 Operator/Service Partner field (Marriott, Hilton, etc.)
    service_partner TEXT, -- 🏢 Service Partner field (alternative to operator)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 2. USER DESIGNS TABLE (Individual panel designs)
CREATE TABLE api.user_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES api.user_projects(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    design_name TEXT NOT NULL,
    panel_type TEXT NOT NULL, -- SP, DP, X1, X2, etc.
    design_data JSONB NOT NULL, -- Complete design configuration
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true
);

-- 3. PANEL CONFIGURATIONS TABLE (Detailed panel specs)
CREATE TABLE api.panel_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID REFERENCES api.user_designs(id) ON DELETE CASCADE,
    panel_index INTEGER NOT NULL, -- Position in layout
    room_type TEXT,
    panel_data JSONB NOT NULL, -- Panel-specific configuration
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. DESIGN VERSIONS TABLE (Version history)
CREATE TABLE api.design_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID REFERENCES api.user_designs(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    design_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by TEXT NOT NULL
);

-- ===== CREATE INDEXES FOR PERFORMANCE =====
CREATE INDEX idx_user_projects_email ON api.user_projects(user_email);
CREATE INDEX idx_user_projects_location ON api.user_projects(location);
CREATE INDEX idx_user_projects_operator ON api.user_projects(operator);
CREATE INDEX idx_user_designs_project_id ON api.user_designs(project_id);
CREATE INDEX idx_user_designs_email ON api.user_designs(user_email);
CREATE INDEX idx_panel_configurations_design_id ON api.panel_configurations(design_id);
CREATE INDEX idx_design_versions_design_id ON api.design_versions(design_id);

-- ===== SET UP ROW LEVEL SECURITY (RLS) =====
-- For now, disable RLS to avoid permission issues during development
ALTER TABLE api.user_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_designs DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.panel_configurations DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.design_versions DISABLE ROW LEVEL SECURITY;

-- ===== GRANT PERMISSIONS =====
GRANT ALL ON api.user_projects TO anon;
GRANT ALL ON api.user_projects TO authenticated;
GRANT ALL ON api.user_designs TO anon;
GRANT ALL ON api.user_designs TO authenticated;
GRANT ALL ON api.panel_configurations TO anon;
GRANT ALL ON api.panel_configurations TO authenticated;
GRANT ALL ON api.design_versions TO anon;
GRANT ALL ON api.design_versions TO authenticated;

-- ===== INSERT SAMPLE DATA =====
-- Create a sample project with location and operator
INSERT INTO api.user_projects (user_email, project_name, project_description, location, operator)
VALUES ('test@example.com', 'Sample Hotel Project', 'A sample hotel lighting control project', 'Dubai', 'Marriott Hotels');

-- Get the project ID for the sample design
DO $$
DECLARE
    project_id UUID;
BEGIN
    SELECT id INTO project_id FROM api.user_projects WHERE user_email = 'test@example.com' LIMIT 1;
    
    -- Create a sample design
    INSERT INTO api.user_designs (project_id, user_email, design_name, panel_type, design_data)
    VALUES (
        project_id,
        'test@example.com',
        'Sample SP Panel',
        'SP',
        '{"panelType": "SP", "backgroundColor": "#FFFFFF", "iconSize": "40px", "iconColor": "#000000"}'
    );
END $$;

-- ===== CREATE VIEWS FOR EASY QUERYING =====
-- View to get designs with project information including location and operator
CREATE OR REPLACE VIEW api.designs_with_projects AS
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
    p.location,
    p.operator,
    p.service_partner
FROM api.user_designs d
LEFT JOIN api.user_projects p ON d.project_id = p.id
WHERE d.is_active = true AND p.is_active = true;

-- ===== SAMPLE DATA FOR TESTING =====
-- Insert more sample projects with different locations and operators
INSERT INTO api.user_projects (user_email, project_name, project_description, location, operator) VALUES
('test@example.com', 'Palm Jumeirah Resort', 'Luxury resort lighting project', 'Dubai', 'Marriott Hotels'),
('test@example.com', 'London Business Hotel', 'Corporate hotel lighting system', 'London', 'Hilton Group'),
('test@example.com', 'Tokyo Tower Hotel', 'Modern hotel lighting design', 'Tokyo', 'Hyatt Hotels'),
('test@example.com', 'New York Downtown', 'Urban hotel lighting project', 'New York', 'InterContinental Hotels Group');

-- Get project IDs and create sample designs
DO $$
DECLARE
    project_record RECORD;
BEGIN
    FOR project_record IN 
        SELECT id, project_name, location, operator 
        FROM api.user_projects 
        WHERE user_email = 'test@example.com' AND project_name != 'Sample Hotel Project'
    LOOP
        -- Create sample designs for each project
        INSERT INTO api.user_designs (project_id, user_email, design_name, panel_type, design_data)
        VALUES 
        (project_record.id, 'test@example.com', project_record.project_name || ' - SP Panel', 'SP', 
         '{"panelType": "SP", "backgroundColor": "#FFFFFF", "iconSize": "40px", "iconColor": "#000000", "location": "' || project_record.location || '", "operator": "' || project_record.operator || '"}'),
        (project_record.id, 'test@example.com', project_record.project_name || ' - IDPG Panel', 'IDPG', 
         '{"panelType": "IDPG", "backgroundColor": "#F5F5F5", "iconSize": "35px", "iconColor": "#333333", "location": "' || project_record.location || '", "operator": "' || project_record.operator || '"}');
    END LOOP;
END $$;

-- ===== VERIFY SETUP =====
SELECT 'Database setup complete!' as status;
SELECT COUNT(*) as project_count FROM api.user_projects;
SELECT COUNT(*) as design_count FROM api.user_designs;
