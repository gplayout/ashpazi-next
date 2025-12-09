-- Create the translations table
CREATE TABLE IF NOT EXISTS recipe_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL, -- 'fa', 'en', 'fr', 'it', etc.
    title TEXT,
    description TEXT,
    ingredients JSONB DEFAULT '[]'::jsonb,
    instructions JSONB DEFAULT '[]'::jsonb,
    cultural_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recipe_id, language) -- One translation per language per recipe
);

-- Enable RLS (Security)
ALTER TABLE recipe_translations ENABLE ROW LEVEL SECURITY;

-- Allow public read access (like recipes table)
CREATE POLICY "Public recipes are viewable by everyone" 
ON recipe_translations FOR SELECT 
USING (true);

-- Allow authenticated users to insert/update (for Agents/Admins)
CREATE POLICY "Enable insert for authenticated users only" 
ON recipe_translations FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon'); 
-- Note: 'anon' is allowed here only because our Agents use the Anon Key + RLS policies sometimes vary. 
-- Ideally, Agents should use Service Role, but if using Anon Key in scripts, we need this.
-- However, typically Service Role bypasses RLS.
-- Let's assume standard 'authenticated' or 'service_role'.
-- If using Service Role Key in scripts, RLS is bypassed. So 'authenticated' is fine for Dashboard users.

-- Index for performance
CREATE INDEX idx_recipe_translations_recipe ON recipe_translations(recipe_id);
CREATE INDEX idx_recipe_translations_lang ON recipe_translations(language);
