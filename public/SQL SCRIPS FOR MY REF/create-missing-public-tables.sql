-- Create missing public.user_projects table
CREATE TABLE IF NOT EXISTS public.user_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT REFERENCES public.users(email) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    project_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- Create missing public.user_designs table  
CREATE TABLE IF NOT EXISTS public.user_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.user_projects(id) ON DELETE CASCADE,
    user_email TEXT REFERENCES public.users(email) ON DELETE CASCADE,
    design_name TEXT NOT NULL,
    panel_type TEXT NOT NULL,
    design_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_public_user_projects_email ON public.user_projects(user_email);
CREATE INDEX IF NOT EXISTS idx_public_user_designs_project_id ON public.user_designs(project_id);
CREATE INDEX IF NOT EXISTS idx_public_user_designs_email ON public.user_designs(user_email);

-- Enable RLS
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_designs ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all operations on public.user_projects" ON public.user_projects FOR ALL USING (true);
CREATE POLICY "Allow all operations on public.user_designs" ON public.user_designs FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.user_projects TO anon;
GRANT ALL ON public.user_projects TO authenticated;
GRANT ALL ON public.user_designs TO anon;
GRANT ALL ON public.user_designs TO authenticated;
