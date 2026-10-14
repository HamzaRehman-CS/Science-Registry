-- ====================================================================
-- PAF-IAST SCIENCE SOCIETY: ANONYMOUS ROAST & TOAST VAULT
-- ====================================================================

-- 1. Default Setup: The application seamlessly works with the existing 
-- 'applications' table without needing any manual migrations:
-- 
-- applicant_name: Target person's name
-- applied_position: Target person's role/post (e.g., President, Lead, Chai In-charge)
-- registration_number: ANON-xxx
-- department: 'Science Society Fun Activity'
-- semester: 'Fun 2026'
-- answers: JSON containing { "type": "society_comment", "target_name", "target_role", "comment", "vibe", "created_at" }

-- ====================================================================
-- 2. (OPTIONAL) Dedicated Table for Society Comments
-- If you wish to maintain a separate table in the future:
-- ====================================================================

CREATE TABLE IF NOT EXISTS society_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    target_name TEXT NOT NULL,
    target_role TEXT DEFAULT 'Society Member',
    comment TEXT NOT NULL,
    vibe TEXT DEFAULT 'general'
);

-- Enable RLS
ALTER TABLE society_comments ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous insert
CREATE POLICY "Allow public comment insert" ON society_comments
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Allow authenticated admin to read comments
CREATE POLICY "Allow authenticated read comments" ON society_comments
    FOR SELECT 
    TO authenticated
    USING (true);

-- Allow authenticated admin to delete comments
CREATE POLICY "Allow authenticated delete comments" ON society_comments
    FOR DELETE 
    TO authenticated
    USING (true);

-- ====================================================================
-- Admin Credentials in Supabase Auth:
-- Email / Admin ID: PAFSS26 (resolves to pafss26@society.com)
-- Password: register
-- ====================================================================
