-- ====================================================================
-- PAF-IAST DATA SCIENCE COMMUNITY: RECRUITMENT REGISTRY 2026–27
-- Database Schema & Security Configuration
-- ====================================================================

-- 1. Create Applications Table with Complete Structured Fields
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Personal & Identification Details
    applicant_name TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    personal_email TEXT,
    phone_number TEXT,
    gender TEXT,
    date_of_birth DATE,
    province TEXT,
    city TEXT,
    
    -- Academic Details
    department TEXT NOT NULL,
    degree_program TEXT,
    semester TEXT NOT NULL,
    
    -- Position Selection
    applied_category TEXT DEFAULT 'Department Team Member', -- 'Executive Leadership', 'Directorate Lead', 'Department Team Member'
    applied_position TEXT NOT NULL,
    second_choice_position TEXT,
    skill_level TEXT DEFAULT 'Beginner',
    
    -- Data Science Scope & Passion Questions
    ds_interest_reason TEXT,
    ds_community_vision TEXT,
    
    -- Motivation & Availability
    motivation_join TEXT,
    motivation_drive TEXT,
    can_participate_competitions TEXT DEFAULT 'Yes',
    can_travel TEXT DEFAULT 'Yes',
    willing_commit_deadlines TEXT DEFAULT 'Yes',
    is_member_other_society TEXT DEFAULT 'No',
    other_society_details TEXT,
    
    -- Experience & Credentials
    detailed_prior_experience TEXT,
    awards_certificates TEXT,
    portfolio_link TEXT,
    additional_info TEXT,
    
    -- Recruitment Evaluation & Admin Notes
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Shortlisted', 'Interview Scheduled', 'Accepted', 'Rejected'
    admin_notes TEXT,
    
    -- Complete raw JSON answers payload for backwards compatibility
    answers JSONB DEFAULT '{}'::jsonb
);

-- Unique constraint on Registration Number to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_reg_no_unique 
    ON applications (LOWER(TRIM(registration_number)));

-- Helpful performance indexes
CREATE INDEX IF NOT EXISTS idx_applications_position ON applications (applied_position);
CREATE INDEX IF NOT EXISTS idx_applications_category ON applications (applied_category);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications (created_at DESC);

-- ====================================================================
-- 2. Row Level Security (RLS) Setup
-- ====================================================================

-- Recommended: Disable RLS so Admin Portal can instantly view all applications across devices
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;

-- Or if you keep RLS enabled, these public policies ensure admin and applicant access:
DROP POLICY IF EXISTS "Allow public to submit application" ON applications;
CREATE POLICY "Allow public to submit application" ON applications
    FOR INSERT 
    TO public
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated admin to read applications" ON applications;
DROP POLICY IF EXISTS "Allow public to read applications" ON applications;
CREATE POLICY "Allow public to read applications" ON applications
    FOR SELECT 
    TO public
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated admin to update applications" ON applications;
DROP POLICY IF EXISTS "Allow public to update applications" ON applications;
CREATE POLICY "Allow public to update applications" ON applications
    FOR UPDATE 
    TO public
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated admin to delete applications" ON applications;
DROP POLICY IF EXISTS "Allow public to delete applications" ON applications;
CREATE POLICY "Allow public to delete applications" ON applications
    FOR DELETE 
    TO public
    USING (true);

-- ====================================================================
-- 3. Admin Credentials Configuration
-- ====================================================================
-- Admin ID: dsc26
-- Password: register
-- ====================================================================

