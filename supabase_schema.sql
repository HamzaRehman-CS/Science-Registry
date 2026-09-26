-- 1. Create table
CREATE TABLE applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applicant_name TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    department TEXT NOT NULL,
    semester TEXT NOT NULL,
    applied_position TEXT NOT NULL,
    answers JSONB NOT NULL
);

-- 2. Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Anyone can insert (Submit application)
CREATE POLICY "Allow public insert" ON applications
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- 4. Policy: Only authenticated users can view applications
CREATE POLICY "Allow authenticated read" ON applications
    FOR SELECT 
    TO authenticated
    USING (true);

-- Note: No UPDATE or DELETE policies. Applications are immutable.
