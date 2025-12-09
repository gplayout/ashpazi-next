-- Blog Posts Table for SEO Articles
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    title_fa TEXT,
    content TEXT NOT NULL, -- Markdown or HTML
    content_fa TEXT,
    excerpt TEXT,
    excerpt_fa TEXT,
    category TEXT,
    tags TEXT[],
    featured_image TEXT,
    author TEXT DEFAULT 'Zaffaron Team',
    status TEXT DEFAULT 'draft', -- 'draft', 'published'
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Posts Table for Generated Content
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id BIGINT REFERENCES recipes(id),
    platform TEXT, -- 'twitter', 'instagram', 'facebook'
    content TEXT NOT NULL,
    content_fa TEXT,
    image_url TEXT,
    hashtags TEXT[],
    status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'posted'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
