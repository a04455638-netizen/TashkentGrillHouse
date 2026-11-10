-- REVIEWED FOR INITIAL INSTALLATION ON AN EMPTY public SCHEMA.
-- This script creates database structures and enables RLS; it does NOT configure Vercel functions.
-- Restaurant contact details, hours, and example menu prices are unverified.
-- All sample menu items and customer booking/order toggles remain disabled.
-- Run only against the intended Supabase project after reviewing project and backups.
BEGIN;

-- ====================================================================
-- TASHKENT GRILL HOUSE — PRODUCTION DATABASE SCHEMA MIGRATION 001
-- PostgreSQL 15+ / Supabase
-- Hardened, Concurrency-Safe, Non-Destructive, and Idempotent
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ====================================================================
-- 2. Restaurant Settings Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial restaurant configuration with clearly marked verification status
INSERT INTO public.restaurant_settings (key, value, description) VALUES
('restaurant_info', '{
    "name": "Tashkent Grill House",
    "address": "1995 Springbrook Square Dr #107, Naperville, IL 60564",
    "phone": "+1 (630) 000-0000 [PENDING_RESTAURANT_CONFIRMATION: Temporary reservation hotline]",
    "email": "info@tashkentgrillhouse.com [PENDING_DOMAIN_SETUP]",
    "timezone": "America/Chicago",
    "instagram": "https://www.instagram.com/tashkentgrillhouse.chicago/"
}', 'General contact information (verification pending official opening)'),
('business_status', '{
    "is_preopening": true,
    "bookings_enabled": false,
    "orders_enabled": false,
    "preopening_notice_ru": "Открытие в Нейпервилле этой осенью. Следите за датой в Instagram @tashkentgrillhouse.chicago.",
    "preopening_notice_en": "Opening in Naperville this fall. Follow @tashkentgrillhouse.chicago for the date."
}', 'Pre-opening and booking/ordering operational toggles'),
('booking_rules', '{
    "slot_duration_minutes": 120,
    "min_guests": 1,
    "max_guests": 12,
    "advance_booking_days": 30,
    "cancellation_window_hours": 2
}', 'Table reservation rules and capacity limits'),
('order_rules', '{
    "pickup_enabled": true,
    "delivery_enabled": false,
    "min_pickup_time_minutes": 30,
    "tax_rate_percent": 8.75
}', 'Online food ordering rules')
ON CONFLICT (key) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = now();

-- ====================================================================
-- 3. Opening Hours & Exceptions
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.opening_hours (
    id SERIAL PRIMARY KEY,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday...
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (day_of_week)
);

INSERT INTO public.opening_hours (day_of_week, open_time, close_time, is_closed) VALUES
(0, '12:00', '22:00', false),
(1, '12:00', '22:00', false),
(2, '12:00', '22:00', false),
(3, '12:00', '22:00', false),
(4, '12:00', '23:00', false),
(5, '12:00', '23:00', false),
(6, '12:00', '23:00', false)
ON CONFLICT (day_of_week) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.availability_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exception_date DATE NOT NULL UNIQUE,
    is_closed BOOLEAN NOT NULL DEFAULT true,
    custom_open_time TIME,
    custom_close_time TIME,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 4. User Profiles Table (Linked to auth.users)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'manager', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ====================================================================
-- 5. Customer Addresses
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Home',
    street_address TEXT NOT NULL,
    apt_suite TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'IL',
    postal_code TEXT NOT NULL,
    delivery_instructions TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cust_addr_user ON public.customer_addresses(user_id);

-- ====================================================================
-- 6. Menu Categories
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name_ru TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ru TEXT,
    description_en TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.menu_categories (slug, name_ru, name_en, sort_order) VALUES
('plov', 'Плов', 'Plov', 10),
('grill', 'Шашлык и гриль', 'Shashlik & Grill', 20),
('soups', 'Супы и лагман', 'Soups & Lagman', 30),
('bakery', 'Выпечка и хлеб', 'Bakery & Breads', 40),
('salads', 'Салаты и закуски', 'Salads & Starters', 50),
('drinks', 'Напитки и чай', 'Beverages & Tea', 60)
ON CONFLICT (slug) DO NOTHING;

-- ====================================================================
-- 7. Menu Items & Secondary Images
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE RESTRICT,
    slug TEXT UNIQUE NOT NULL,
    name_ru TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ru TEXT,
    description_en TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    tags TEXT[] NOT NULL DEFAULT '{}',
    allergens TEXT[] NOT NULL DEFAULT '{}',
    calories INT,
    weight_grams INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_cat ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_avail ON public.menu_items(is_available);

CREATE TABLE IF NOT EXISTS public.menu_item_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    alt_text TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial menu items matching the preview reference
-- [NOTE: Sample prices are UNVERIFIED and all seeded items are kept unavailable until approved.]
-- All INSERTs use is_available=false to prevent accepting purchases with sample prices.
DO $$
DECLARE
    plov_cat UUID;
    grill_cat UUID;
    soups_cat UUID;
    bakery_cat UUID;
BEGIN
    SELECT id INTO plov_cat FROM public.menu_categories WHERE slug = 'plov';
    SELECT id INTO grill_cat FROM public.menu_categories WHERE slug = 'grill';
    SELECT id INTO soups_cat FROM public.menu_categories WHERE slug = 'soups';
    SELECT id INTO bakery_cat FROM public.menu_categories WHERE slug = 'bakery';

    IF plov_cat IS NOT NULL THEN
        INSERT INTO public.menu_items (category_id, slug, name_ru, name_en, description_ru, description_en, price, image_url, is_featured, sort_order, is_available)
        VALUES
        (plov_cat, 'tashkent-plov', 'Ташкентский плов', 'Tashkent Plov',
         'Традиционный праздничный плов: длиннозёрный рис, нежная баранина и говядина, жёлтая и оранжевая морковь, нут, изюм, чеснок, перепелиные яйца и казы.',
         'Signature festive Uzbek plov: long-grain rice, tender lamb and beef, yellow and orange carrots, chickpeas, raisins, garlic, quail eggs, and kazy. [Preview estimate]',
         22.00, '/img/dishes/plov-1100.webp', true, 1, false)
        ON CONFLICT (slug) DO NOTHING;
    END IF;

    IF soups_cat IS NOT NULL THEN
        INSERT INTO public.menu_items (category_id, slug, name_ru, name_en, description_ru, description_en, price, image_url, is_featured, sort_order, is_available)
        VALUES
        (soups_cat, 'lagman', 'Лагман по-уйгурски', 'Uighur Lagman',
         'Тянутая вручную лапша, сочная говядина, сладкий перец, сельдерей, томаты и пряный наваристый соус Сай.',
         'Hand-pulled fresh noodles with tender beef, bell peppers, celery, tomatoes, and aromatic spicy Sai gravy. [Preview estimate]',
         18.50, '/img/dishes/lagman-1100.webp', true, 2, false)
        ON CONFLICT (slug) DO NOTHING;
    END IF;

    IF grill_cat IS NOT NULL THEN
        INSERT INTO public.menu_items (category_id, slug, name_ru, name_en, description_ru, description_en, price, image_url, is_featured, sort_order, is_available)
        VALUES
        (grill_cat, 'shashlik-assorted', 'Шашлык на углях', 'Charcoal Shashlik',
         'Мякоть баранины и сочная говядина, маринованные в горных травах и обжаренные на открытых берёзовых углях с маринованным луком.',
         'Tender cuts of lamb and beef, marinated in mountain spices and charcoal-grilled over open coals, served with sumac-marinated onions. [Preview estimate]',
         24.00, '/img/dishes/shashlik-1100.webp', true, 3, false)
        ON CONFLICT (slug) DO NOTHING;
    END IF;

    IF bakery_cat IS NOT NULL THEN
        INSERT INTO public.menu_items (category_id, slug, name_ru, name_en, description_ru, description_en, price, image_url, is_featured, sort_order, is_available)
        VALUES
        (bakery_cat, 'khachapuri-adjarian', 'Хачапури по-аджарски', 'Adjarian Khachapuri',
         'Хрустящая лодочка из воздушного теста с сыром сулугуни, фермерским яичным желтком и кусочком сливочного масла.',
         'Freshly baked canoe-shaped bread filled with melted suluguni cheese, organic egg yolk, and butter. [Preview estimate]',
         16.00, '/img/dishes/khachapuri-1100.webp', true, 4, false),

        (bakery_cat, 'samsa-tandyr', 'Самса тандырная', 'Tandyr Samsa',
         'Слоёное хрустящее тесто, начинка из рублёной баранины и лука с кумином, выпекается на стенках раскалённого тандыра.',
         'Crispy multi-layered pastry stuffed with hand-chopped spiced lamb, onions, and cumin, baked in traditional clay tandyr. [Preview estimate]',
         6.50, '/img/dishes/samsa-1100.webp', true, 5, false),

        (bakery_cat, 'uzbek-non', 'Узбекская лепёшка', 'Uzbek Tandyr Non',
         'Пышный лепёшечный хлеб с узорчатым центром (чекич) и золотистой кунжутной корочкой, прямо из тандыра.',
         'Traditional Uzbek round flatbread with stamped patterned center and golden sesame crust, baked fresh in the clay oven. [Preview estimate]',
         4.50, '/img/dishes/non-1100.webp', true, 6, false)
        ON CONFLICT (slug) DO NOTHING;
    END IF;
END $$;

-- ====================================================================
-- 8. Restaurant Tables
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number TEXT UNIQUE NOT NULL,
    capacity_min INT NOT NULL DEFAULT 1,
    capacity_max INT NOT NULL DEFAULT 4,
    zone TEXT NOT NULL DEFAULT 'main_hall' CHECK (zone IN ('main_hall', 'terrace', 'private_lounge', 'window')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.restaurant_tables (table_number, capacity_min, capacity_max, zone, description) VALUES
('T-01', 1, 2, 'window', 'Window table with natural lighting'),
('T-02', 1, 2, 'window', 'Window table with natural lighting'),
('T-03', 2, 4, 'main_hall', 'Main cobalt hall velvet booth'),
('T-04', 2, 4, 'main_hall', 'Main cobalt hall velvet booth'),
('T-05', 2, 4, 'main_hall', 'Central walnut table'),
('T-06', 4, 6, 'main_hall', 'Spacious family dining table'),
('T-07', 4, 6, 'main_hall', 'Spacious family dining table'),
('T-08', 6, 10, 'private_lounge', 'Private lagan feast lounge with Uzbek tapestries')
ON CONFLICT (table_number) DO NOTHING;

-- ====================================================================
-- 9. Reservations with Transactional Exclusion Constraint
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    table_id UUID NOT NULL REFERENCES public.restaurant_tables(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    guest_count INT NOT NULL CHECK (guest_count > 0),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    reservation_period TSTZRANGE NOT NULL DEFAULT tstzrange(now(), now() + interval '2 hours', '[)'),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
    special_requests TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_valid_period CHECK (end_time > start_time)
);

-- Idempotently ensure the GiST exclusion constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'no_overlapping_reservations'
    ) THEN
        ALTER TABLE public.reservations
        ADD CONSTRAINT no_overlapping_reservations
        EXCLUDE USING gist (
            table_id WITH =,
            reservation_period WITH &&
        ) WHERE (status IN ('pending', 'confirmed', 'seated'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reservations_start ON public.reservations(start_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_code ON public.reservations(booking_code);

-- Automatically compute and synchronize reservation_period from start_time and end_time
CREATE OR REPLACE FUNCTION public.sync_reservation_period()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
        IF NEW.end_time <= NEW.start_time THEN
            RAISE EXCEPTION 'Reservation end_time (%) must be strictly after start_time (%)', NEW.end_time, NEW.start_time;
        END IF;
        NEW.reservation_period := tstzrange(NEW.start_time, NEW.end_time, '[)');
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_sync_reservation_period ON public.reservations;
CREATE TRIGGER trg_sync_reservation_period
BEFORE INSERT OR UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.sync_reservation_period();

-- ====================================================================
-- 10. Reservation Status History
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.reservation_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 11. Orders & Order Items
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_type TEXT NOT NULL CHECK (order_type IN ('pickup', 'delivery', 'dine_in')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address JSONB,
    scheduled_time TIMESTAMPTZ,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tip_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    special_instructions TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_num ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- ====================================================================
-- 12. Payments Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash_on_pickup', 'card_on_pickup', 'stripe', 'awaiting_configuration')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')),
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    transaction_reference TEXT,
    provider_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 13. Customer Reviews
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 14. Notifications Log Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel TEXT NOT NULL CHECK (channel IN ('telegram', 'email', 'sms')),
    recipient TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    attempts INT NOT NULL DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ
);

-- ====================================================================
-- 15. Admin Audit Logs
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 16. SECURITY FUNCTIONS & ROLE ESCALATION PREVENTION
-- ====================================================================

-- Secure Helper function: is current user an admin or manager?
-- Uses SECURITY DEFINER with strict search_path to prevent hijacking
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Privilege Escalation Blocker Trigger
-- Strictly prevents users from altering their own or other users' roles
-- unless the caller is already an admin or manager, or running as service_role (auth.uid() IS NULL)
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF auth.uid() IS NOT NULL AND NOT public.is_admin_or_manager() THEN
            RAISE EXCEPTION 'Access Denied: You cannot modify user role or elevate privileges.';
        END IF;
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- ====================================================================
-- 17. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- Public Read Policies (Anonymous / Authenticated)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view settings" ON public.restaurant_settings;
CREATE POLICY "Public can view settings" ON public.restaurant_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view hours" ON public.opening_hours;
CREATE POLICY "Public can view hours" ON public.opening_hours FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view exceptions" ON public.availability_exceptions;
CREATE POLICY "Public can view exceptions" ON public.availability_exceptions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view active menu categories" ON public.menu_categories;
CREATE POLICY "Public can view active menu categories" ON public.menu_categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view available menu items" ON public.menu_items;
CREATE POLICY "Public can view available menu items" ON public.menu_items FOR SELECT USING (is_available = true);

DROP POLICY IF EXISTS "Public can view menu images" ON public.menu_item_images;
CREATE POLICY "Public can view menu images" ON public.menu_item_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view active tables" ON public.restaurant_tables;
CREATE POLICY "Public can view active tables" ON public.restaurant_tables FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = true);

-- --------------------------------------------------------------------
-- Admin Management for Catalog & Settings
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins manage settings" ON public.restaurant_settings;
CREATE POLICY "Admins manage settings" ON public.restaurant_settings FOR ALL USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "Admins manage hours" ON public.opening_hours;
CREATE POLICY "Admins manage hours" ON public.opening_hours FOR ALL USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "Admins manage exceptions" ON public.availability_exceptions;
CREATE POLICY "Admins manage exceptions" ON public.availability_exceptions FOR ALL USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "Admins manage categories" ON public.menu_categories;
CREATE POLICY "Admins manage categories" ON public.menu_categories FOR ALL USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "Admins manage menu items" ON public.menu_items;
CREATE POLICY "Admins manage menu items" ON public.menu_items FOR ALL USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "Admins manage menu images" ON public.menu_item_images;
CREATE POLICY "Admins manage menu images" ON public.menu_item_images FOR ALL USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "Admins manage tables" ON public.restaurant_tables;
CREATE POLICY "Admins manage tables" ON public.restaurant_tables FOR ALL USING (public.is_admin_or_manager());

-- --------------------------------------------------------------------
-- User Profiles (Secure Role Protection)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
-- Do not query profiles from this profile policy: that causes RLS recursion.
-- The BEFORE UPDATE trigger below prevents non-admin role changes.
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view and manage all profiles" ON public.profiles;
CREATE POLICY "Admins can view and manage all profiles" ON public.profiles FOR ALL USING (public.is_admin_or_manager());

-- --------------------------------------------------------------------
-- Customer Addresses
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users view own addresses" ON public.customer_addresses;
CREATE POLICY "Users view own addresses" ON public.customer_addresses FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_manager());

DROP POLICY IF EXISTS "Users insert own addresses" ON public.customer_addresses;
CREATE POLICY "Users insert own addresses" ON public.customer_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own addresses" ON public.customer_addresses;
CREATE POLICY "Users update own addresses" ON public.customer_addresses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own addresses" ON public.customer_addresses;
CREATE POLICY "Users delete own addresses" ON public.customer_addresses FOR DELETE USING (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- Reservations (RESTRICTED: No Direct Public Inserts)
-- All bookings must be routed through Server-Side API using Service Role Key
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can create a reservation" ON public.reservations;
DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;
CREATE POLICY "Users can view own reservations" ON public.reservations FOR SELECT USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR public.is_admin_or_manager()
);

DROP POLICY IF EXISTS "Admins manage all reservations" ON public.reservations;
CREATE POLICY "Admins manage all reservations" ON public.reservations FOR ALL USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "Admins manage reservation history" ON public.reservation_status_history;
CREATE POLICY "Admins manage reservation history" ON public.reservation_status_history FOR ALL USING (public.is_admin_or_manager());

-- --------------------------------------------------------------------
-- Orders & Order Items (RESTRICTED: No Direct Public Inserts)
-- All orders must be routed through Server-Side API using Service Role Key
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR public.is_admin_or_manager()
);

DROP POLICY IF EXISTS "Admins manage all orders" ON public.orders;
CREATE POLICY "Admins manage all orders" ON public.orders FOR ALL USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "Users and admins view order items" ON public.order_items;
CREATE POLICY "Users and admins view order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin_or_manager())
    )
);

DROP POLICY IF EXISTS "Admins manage order items" ON public.order_items;
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL USING (public.is_admin_or_manager());

-- --------------------------------------------------------------------
-- Payments
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users view own payments" ON public.payments;
CREATE POLICY "Users view own payments" ON public.payments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = payments.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin_or_manager())
    )
);

DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL USING (public.is_admin_or_manager());

-- --------------------------------------------------------------------
-- Reviews
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users submit review" ON public.reviews;
CREATE POLICY "Authenticated users submit review" ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = user_id AND is_approved = false
);

DROP POLICY IF EXISTS "Admins manage reviews" ON public.reviews;
CREATE POLICY "Admins manage reviews" ON public.reviews FOR ALL USING (public.is_admin_or_manager());

-- --------------------------------------------------------------------
-- Audit Logs & Notifications (Admin / Service Role Only)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin audit logs viewable only by admins" ON public.admin_audit_logs;
CREATE POLICY "Admin audit logs viewable only by admins" ON public.admin_audit_logs FOR ALL USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "Notifications viewable only by admins" ON public.notifications;
CREATE POLICY "Notifications viewable only by admins" ON public.notifications FOR ALL USING (public.is_admin_or_manager());

-- ====================================================================
-- END OF MIGRATION 001
-- ====================================================================

COMMIT;
