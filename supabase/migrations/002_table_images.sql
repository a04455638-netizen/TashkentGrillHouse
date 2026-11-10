-- ====================================================================
-- TASHKENT GRILL HOUSE — MIGRATION 002: TABLE IMAGES & VISUAL GALLERY
-- Safe, Non-Destructive, Additive Only
-- Does not alter existing reservations, orders, or table UUIDs
-- ====================================================================

-- 1. Add image columns directly to restaurant_tables for primary display
ALTER TABLE public.restaurant_tables
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_alt TEXT,
ADD COLUMN IF NOT EXISTS image_type TEXT NOT NULL DEFAULT 'illustration' CHECK (image_type IN ('photo', 'illustration')),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2. Create separate table_images mapping table for multi-image gallery support
CREATE TABLE IF NOT EXISTS public.restaurant_table_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES public.restaurant_tables(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    display_order INT NOT NULL DEFAULT 0,
    image_type TEXT NOT NULL DEFAULT 'illustration' CHECK (image_type IN ('photo', 'illustration')),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_table_images_tab ON public.restaurant_table_images(table_id);

-- 3. Row Level Security for Table Images
ALTER TABLE public.restaurant_table_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view table images" ON public.restaurant_table_images;
CREATE POLICY "Public can view table images" ON public.restaurant_table_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage table images" ON public.restaurant_table_images;
CREATE POLICY "Admins can manage table images" ON public.restaurant_table_images FOR ALL USING (public.is_admin_or_manager());

-- 4. Seed initial default image mappings for all 8 tables (illustrative conceptual renders)
UPDATE public.restaurant_tables SET
    image_url = '/img/tables/table-t01.jpg',
    image_alt = 'Table T-01: Intimate window seating for 1-2 guests with natural light',
    image_type = 'illustration'
WHERE table_number = 'T-01';

UPDATE public.restaurant_tables SET
    image_url = '/img/tables/table-t02.jpg',
    image_alt = 'Table T-02: Window dining table for 1-2 guests with evening ambient glow',
    image_type = 'illustration'
WHERE table_number = 'T-02';

UPDATE public.restaurant_tables SET
    image_url = '/img/tables/table-t03.jpg',
    image_alt = 'Table T-03: Cobalt velvet booth for 2-4 guests near carved archway',
    image_type = 'illustration'
WHERE table_number = 'T-03';

UPDATE public.restaurant_tables SET
    image_url = '/img/tables/table-t04.jpg',
    image_alt = 'Table T-04: Central dining booth for 2-4 guests with amber lighting',
    image_type = 'illustration'
WHERE table_number = 'T-04';

UPDATE public.restaurant_tables SET
    image_url = '/img/tables/table-t05.jpg',
    image_alt = 'Table T-05: Handcrafted walnut table for 2-4 guests in the main hall',
    image_type = 'illustration'
WHERE table_number = 'T-05';

UPDATE public.restaurant_tables SET
    image_url = '/img/tables/table-t06.jpg',
    image_alt = 'Table T-06: Spacious family dining table for 4-6 guests with traditional tea service',
    image_type = 'illustration'
WHERE table_number = 'T-06';

UPDATE public.restaurant_tables SET
    image_url = '/img/tables/table-t07.jpg',
    image_alt = 'Table T-07: Family table for 4-6 guests beside Uzbek Suzani silk tapestry',
    image_type = 'illustration'
WHERE table_number = 'T-07';

UPDATE public.restaurant_tables SET
    image_url = '/img/tables/table-t08.jpg',
    image_alt = 'Table T-08: VIP Private Lagan Feast Lounge for 6-10 guests',
    image_type = 'illustration'
WHERE table_number = 'T-08';
