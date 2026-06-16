-- Table 1: Your Live Dashboard Sequence
CREATE TABLE resume_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    custom_title VARCHAR(255),
    score INTEGER NOT NULL,
    strengths TEXT,
    missing TEXT,
    improvements TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table 2: Your Trash Bin Routing
CREATE TABLE resume_history_deleted (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_id UUID NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    custom_title VARCHAR(255),
    score INTEGER NOT NULL,
    strengths TEXT,
    missing TEXT,
    improvements TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- For the sake of this prototype MVP application, we temporarily disable internal complex Row Level Security 
-- so our raw Client Application can bypass Clerk JWT mapping.
ALTER TABLE resume_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE resume_history_deleted DISABLE ROW LEVEL SECURITY;
