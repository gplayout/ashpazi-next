
-- HARDENING PHASE 3: INFRASTRUCTURE & SAFETY
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Create 'chefs' table (Digital Storefront Core)
CREATE TABLE IF NOT EXISTS chefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    location_label TEXT NOT NULL DEFAULT 'Tehran, Iran', -- Geo Transparency
    contact_method TEXT NOT NULL CHECK (contact_method IN ('whatsapp', 'sms', 'email')),
    contact_number TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create 'analytics_events' table (The "Audit Log")
-- Replaces 'grep' with immutable DB records for Lead Cap calculation.
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- e.g., 'lead_click'
    chef_id UUID REFERENCES chefs(id),
    recipe_id UUID, -- No FK to avoid migration locks, just store ID
    visitor_id TEXT, -- Fingerprint or Anon ID
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Seed "Chef Maryam" (The First Pilot Chef)
INSERT INTO chefs (name, slug, bio, profile_image_url, location_label, contact_method, contact_number)
VALUES (
    'Maryam Banu', 
    'maryam-banu', 
    'Expert in traditional Persian stews. Cooking with love for 20 years.',
    'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop',
    'Tehran, District 1',
    'whatsapp',
    '989120000000' -- Dummy number for MVP
) ON CONFLICT (slug) DO NOTHING;

-- 4. Enable RLS (Security Hardening)
ALTER TABLE chefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow Public Read for Chefs
CREATE POLICY "Public Read Chefs" ON chefs FOR SELECT USING (true);

-- Allow Public Insert for Analytics (Log Events)
CREATE POLICY "Public Log Events" ON analytics_events FOR INSERT WITH CHECK (true);
