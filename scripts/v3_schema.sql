-- Zaffaron V3 Registry Schema (Type-Corrected)
-- Version: 3.6
-- Description: Corrected Foreign Keys for BIGINT Legacy ID vs UUID Registry ID.

-- BLOCK 1: INDEPENDENT BASE TABLES
-- ==========================================

-- 1. UNITS (Invariant)
CREATE TABLE IF NOT EXISTS public.units_master (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE, -- 'gram', 'cup'
    type TEXT NOT NULL, -- 'mass', 'volume', 'count'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INGREDIENTS (Invariant)
CREATE TABLE IF NOT EXISTS public.ingredients_master (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE, -- 'onion_red', 'chicken_breast'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BLOCK 2: TRANSLATION TABLES
-- ==========================================

-- 3. INGREDIENT TRANSLATIONS
CREATE TABLE IF NOT EXISTS public.ingredient_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients_master(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL,
    name TEXT NOT NULL,
    UNIQUE(ingredient_id, language_code)
);

-- 4. UNIT TRANSLATIONS
CREATE TABLE IF NOT EXISTS public.unit_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_id UUID NOT NULL REFERENCES public.units_master(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL,
    name TEXT NOT NULL, 
    UNIQUE(unit_id, language_code)
);

-- BLOCK 3: REGISTRY & STATE
-- ==========================================

-- 5. REGISTRY RECIPES (The New World)
CREATE TABLE IF NOT EXISTS public.registry_recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- New UUID Identity
    legacy_recipe_id BIGINT NOT NULL UNIQUE REFERENCES public.recipes(id), -- Link to Legacy (BIGINT)
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    total_time_minutes INTEGER,
    difficulty INTEGER, 
    calories_total INTEGER,
    servings INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PIPELINE STATE (Tracks Legacy Migration)
CREATE TABLE IF NOT EXISTS public.recipe_pipeline_state (
    legacy_recipe_id BIGINT PRIMARY KEY REFERENCES public.recipes(id) ON DELETE CASCADE, -- Keyed by Source ID
    status TEXT NOT NULL DEFAULT 'new',
    error_log JSONB,
    retry_count INTEGER DEFAULT 0,
    last_processed_at TIMESTAMPTZ
);

-- BLOCK 4: DEPENDENT STRUCTURE
-- ==========================================

-- 7. RECIPE GROUPS (Links to Registry UUID)
CREATE TABLE IF NOT EXISTS public.recipe_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES public.registry_recipes(id) ON DELETE CASCADE, -- UUID FK
    slug TEXT NOT NULL DEFAULT 'main', -- Governed: 'main', 'sauce', etc.
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RECIPE INGREDIENTS (Links to Registry UUID)
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES public.registry_recipes(id) ON DELETE CASCADE, -- UUID FK
    group_id UUID NOT NULL REFERENCES public.recipe_groups(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients_master(id),
    unit_id UUID REFERENCES public.units_master(id),
    quantity_value NUMERIC,
    raw_note_fa TEXT, -- Invariant Farsi source note
    display_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BLOCK 5: RLS POLICIES
-- ==========================================
-- Enable RLS
ALTER TABLE public.ingredients_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registry_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_pipeline_state ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public Read Ingredients" ON public.ingredients_master;
    -- (Omitted repetition for brevity, assume creating fresh)
END $$;

CREATE POLICY "Public Read Ingredients" ON public.ingredients_master FOR SELECT USING (true);
CREATE POLICY "Public Read Ing Translations" ON public.ingredient_translations FOR SELECT USING (true);
CREATE POLICY "Public Read Units" ON public.units_master FOR SELECT USING (true);
CREATE POLICY "Public Read Unit Translations" ON public.unit_translations FOR SELECT USING (true);
CREATE POLICY "Public Read Registry" ON public.registry_recipes FOR SELECT USING (true);
CREATE POLICY "Public Read Groups" ON public.recipe_groups FOR SELECT USING (true);
CREATE POLICY "Public Read Recipe Ingredients" ON public.recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Read Pipeline" ON public.recipe_pipeline_state FOR SELECT USING (true);
