-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types
CREATE TYPE policy_status AS ENUM ('draft', 'current', 'archived', 'pending_approval');
CREATE TYPE policy_category AS ENUM (
    'scheduling_policies',
    'officiating',
    'playing_rules', 
    'equipment_specifications',
    'facility_standards',
    'travel_procedures',
    'media_relations',
    'safety_protocols',
    'awards_recognition',
    'championship_procedures',
    'venue_requirements',
    'broadcasting_standards',
    'governance',
    'game_management',
    'crowd_control',
    'eligibility',
    'administrative'
);

-- Create sports table
CREATE TABLE IF NOT EXISTS sports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    abbreviation VARCHAR(10) NOT NULL UNIQUE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create policies table with enhanced features
CREATE TABLE IF NOT EXISTS policies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    category policy_category NOT NULL,
    sport_id INTEGER REFERENCES sports(id),
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    status policy_status NOT NULL DEFAULT 'current',
    content_text TEXT NOT NULL,
    content_html TEXT,
    summary TEXT,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    tags TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    applies_to_sports TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_by UUID,
    updated_by UUID,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create policy versions table for history tracking
CREATE TABLE IF NOT EXISTS policy_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_text TEXT NOT NULL,
    content_html TEXT,
    summary TEXT,
    changed_by UUID,
    change_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create manuals table
CREATE TABLE IF NOT EXISTS manuals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sport_id INTEGER REFERENCES sports(id),
    template_config JSONB DEFAULT '{}',
    is_template BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create manual_policies junction table
CREATE TABLE IF NOT EXISTS manual_policies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    manual_id UUID NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    section_order INTEGER NOT NULL,
    section_title VARCHAR(255),
    UNIQUE(manual_id, policy_id)
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'viewer',
    institution VARCHAR(255),
    department VARCHAR(255),
    phone VARCHAR(50),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    search_params JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create generated documents table
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    manual_id UUID REFERENCES manuals(id),
    file_path TEXT,
    file_size BIGINT,
    metadata JSONB DEFAULT '{}',
    generated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_policies_sport_id ON policies(sport_id);
CREATE INDEX idx_policies_category ON policies(category);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_policy_number ON policies(policy_number);
CREATE INDEX idx_policies_effective_date ON policies(effective_date);
CREATE INDEX idx_policies_tags ON policies USING GIN(tags);
CREATE INDEX idx_policies_keywords ON policies USING GIN(keywords);
CREATE INDEX idx_policies_applies_to_sports ON policies USING GIN(applies_to_sports);
CREATE INDEX idx_policies_content_text ON policies USING GIN(to_tsvector('english', content_text));

-- Create full-text search function
CREATE OR REPLACE FUNCTION search_policies(search_query TEXT)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    short_name VARCHAR(100),
    category policy_category,
    sport_id INTEGER,
    policy_number VARCHAR(50),
    summary TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.short_name,
        p.category,
        p.sport_id,
        p.policy_number,
        p.summary,
        ts_rank(to_tsvector('english', p.content_text), plainto_tsquery('english', search_query)) AS rank
    FROM policies p
    WHERE 
        p.status = 'current' AND
        (
            to_tsvector('english', p.content_text) @@ plainto_tsquery('english', search_query) OR
            p.title ILIKE '%' || search_query || '%' OR
            p.summary ILIKE '%' || search_query || '%' OR
            search_query = ANY(p.tags) OR
            search_query = ANY(p.keywords)
        )
    ORDER BY rank DESC, p.title;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manuals_updated_at BEFORE UPDATE ON manuals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers
CREATE TRIGGER audit_policies AFTER INSERT OR UPDATE OR DELETE ON policies
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_manuals AFTER INSERT OR UPDATE OR DELETE ON manuals
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Row Level Security
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public policies are viewable by everyone" ON policies
    FOR SELECT USING (status = 'current');

CREATE POLICY "Authenticated users can view all policies" ON policies
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage policies" ON policies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Insert initial sports data
INSERT INTO sports (name, abbreviation) VALUES
    ('Baseball', 'BSB'),
    ('Men''s Basketball', 'MBB'),
    ('Women''s Basketball', 'WBB'),
    ('Football', 'FB'),
    ('Gymnastics', 'GYM'),
    ('Lacrosse', 'LAX'),
    ('Soccer', 'SC'),
    ('Men''s Tennis', 'MTEN'),
    ('Women''s Tennis', 'WTEN'),
    ('Softball', 'SB'),
    ('Volleyball', 'VB'),
    ('Wrestling', 'WRES'),
    ('Men''s Cross Country', 'MXC'),
    ('Women''s Cross Country', 'WXC'),
    ('Men''s Golf', 'MGF'),
    ('Women''s Golf', 'WGF'),
    ('Men''s Track & Field', 'MTF'),
    ('Women''s Track & Field', 'WTF'),
    ('Men''s Swimming & Diving', 'MSD'),
    ('Women''s Swimming & Diving', 'WSD'),
    ('Beach Volleyball', 'BVB'),
    ('Rowing', 'ROW')
ON CONFLICT (name) DO NOTHING;