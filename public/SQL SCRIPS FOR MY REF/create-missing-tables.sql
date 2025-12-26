-- 🔧 CREATE MISSING TABLES
-- Run this to create any missing tables from the new structure

-- Create user_projects table first (needed for foreign key references)
CREATE TABLE IF NOT EXISTS api.user_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT REFERENCES api.users(email) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    project_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- Create user_designs table if it doesn't exist
CREATE TABLE IF NOT EXISTS api.user_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES api.user_projects(id) ON DELETE CASCADE,
    user_email TEXT REFERENCES api.users(email) ON DELETE CASCADE,
    design_name TEXT NOT NULL,
    panel_type TEXT NOT NULL, -- SP, DP, X1, X2, etc.
    design_data JSONB NOT NULL, -- Complete design configuration
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true
);

-- Create panel_configurations table if it doesn't exist
CREATE TABLE IF NOT EXISTS api.panel_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID REFERENCES api.user_designs(id) ON DELETE CASCADE,
    panel_index INTEGER NOT NULL, -- Position in layout
    room_type TEXT,
    panel_data JSONB NOT NULL, -- Panel-specific configuration
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create design_versions table if it doesn't exist
CREATE TABLE IF NOT EXISTS api.design_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID REFERENCES api.user_designs(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    design_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by TEXT REFERENCES api.users(email) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_projects_email ON api.user_projects(user_email);
CREATE INDEX IF NOT EXISTS idx_user_designs_project_id ON api.user_designs(project_id);
CREATE INDEX IF NOT EXISTS idx_user_designs_email ON api.user_designs(user_email);
CREATE INDEX IF NOT EXISTS idx_panel_configurations_design_id ON api.panel_configurations(design_id);
CREATE INDEX IF NOT EXISTS idx_design_versions_design_id ON api.design_versions(design_id);

-- Grant permissions
GRANT ALL ON api.user_projects TO anon;
GRANT ALL ON api.user_projects TO authenticated;
GRANT ALL ON api.user_designs TO anon;
GRANT ALL ON api.user_designs TO authenticated;
GRANT ALL ON api.panel_configurations TO anon;
GRANT ALL ON api.panel_configurations TO authenticated;
GRANT ALL ON api.design_versions TO anon;
GRANT ALL ON api.design_versions TO authenticated;

-- Disable RLS
ALTER TABLE api.user_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_designs DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.panel_configurations DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.design_versions DISABLE ROW LEVEL SECURITY;

-- Verify tables were created
SELECT 'Missing tables created successfully!' as status;

-- Check what tables exist now
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'api' 
ORDER BY table_name;

-- ===== NEW: MANY-TO-MANY SUPPORT TABLES =====
-- 1) user_ug_membership: allow a user to belong to multiple UGs
CREATE TABLE IF NOT EXISTS api.user_ug_membership (
    user_email TEXT NOT NULL,
    ug_id TEXT REFERENCES api.ug(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_email, ug_id)
);

-- Conditionally add FK to api.users if it is a base table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'api' AND table_name = 'users' AND table_type = 'BASE TABLE'
  ) THEN
    BEGIN
      ALTER TABLE api.user_ug_membership
      ADD CONSTRAINT user_ug_membership_user_fk
      FOREIGN KEY (user_email) REFERENCES api.users(email) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END$$;

-- 2) ug_property_access: allow a UG to access multiple properties
-- If this table already exists in your project, this will be a no-op
DO $$
BEGIN
  -- Only create the TABLE if there is no relation (table/view) named api.ug_property_access
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'api' AND c.relname = 'ug_property_access'
  ) THEN
    BEGIN
      EXECUTE 'CREATE TABLE api.ug_property_access (
        ug_id TEXT REFERENCES api.ug(id) ON DELETE CASCADE,
        prop_id TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (ug_id, prop_id)
      )';
    EXCEPTION WHEN duplicate_table THEN NULL; END;
  END IF;
END$$;

-- For ug_property_access.prop_id, support both UUID (api.property.id) and TEXT (public.property.prop_id) deployments
-- Prefer referencing api.property if present
DO $$
BEGIN
  -- Only create indexes if ug_property_access is a BASE TABLE
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'api' AND table_name = 'ug_property_access' AND table_type = 'BASE TABLE'
  ) THEN
    BEGIN
      CREATE INDEX IF NOT EXISTS idx_ug_property_access_prop_id ON api.ug_property_access(prop_id);
    EXCEPTION WHEN others THEN NULL; END;
  END IF;
END$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_ug_membership_user ON api.user_ug_membership(user_email);
CREATE INDEX IF NOT EXISTS idx_user_ug_membership_ug ON api.user_ug_membership(ug_id);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'api' AND table_name = 'ug_property_access' AND table_type = 'BASE TABLE'
  ) THEN
    BEGIN
      CREATE INDEX IF NOT EXISTS idx_ug_property_access_ug ON api.ug_property_access(ug_id);
    EXCEPTION WHEN others THEN NULL; END;
  END IF;
END$$;

-- Grants
GRANT ALL ON api.user_ug_membership TO anon;
GRANT ALL ON api.user_ug_membership TO authenticated;
GRANT ALL ON api.ug_property_access TO anon;
GRANT ALL ON api.ug_property_access TO authenticated;

-- Disable RLS for development
ALTER TABLE api.user_ug_membership DISABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'api' AND table_name = 'ug_property_access' AND table_type = 'BASE TABLE'
  ) THEN
    BEGIN
      EXECUTE 'ALTER TABLE api.ug_property_access DISABLE ROW LEVEL SECURITY';
    EXCEPTION WHEN others THEN NULL; END;
  END IF;
END$$;
