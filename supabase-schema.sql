-- ====================================================================
-- SUPABASE & POSTGRESQL PRODUCTION SCHEMA & ROW LEVEL SECURITY (RLS)
-- Portfolio & Admin Studio
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE project_category AS ENUM (
  'ui-ux',
  'website-design',
  'web-dev',
  'email-copywriting',
  'ai-automation'
);

-- 3. PROFILES TABLE (Portfolio Owner Profile)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name TEXT NOT NULL,
  headline JSONB NOT NULL DEFAULT '{"en": "", "bn": ""}',
  biography JSONB NOT NULL DEFAULT '{"en": "", "bn": ""}',
  profile_photo TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{}',
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL DEFAULT '',
  social_links JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_order INT NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT true,
  icon TEXT NOT NULL DEFAULT 'Code',
  title JSONB NOT NULL DEFAULT '{"en": "", "bn": ""}',
  description JSONB NOT NULL DEFAULT '{"en": "", "bn": ""}',
  features JSONB NOT NULL DEFAULT '{"en": [], "bn": []}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  category project_category NOT NULL,
  is_concept BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  views INT NOT NULL DEFAULT 0,
  title JSONB NOT NULL DEFAULT '{"en": "", "bn": ""}',
  short_description JSONB NOT NULL DEFAULT '{"en": "", "bn": ""}',
  full_case_study JSONB NOT NULL DEFAULT '{"en": "", "bn": ""}',
  challenge JSONB NOT NULL DEFAULT '{"en": "", "bn": ""}',
  solution JSONB NOT NULL DEFAULT '{"en": "", "bn": ""}',
  tools TEXT[] NOT NULL DEFAULT '{}',
  cover_image TEXT NOT NULL,
  gallery_images TEXT[] NOT NULL DEFAULT '{}',
  demo_url TEXT NOT NULL DEFAULT '',
  source_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SITE SETTINGS TABLE (Single row configuration)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hero_headline JSONB NOT NULL,
  hero_subtitle JSONB NOT NULL,
  hero_cta_primary JSONB NOT NULL,
  hero_cta_secondary JSONB NOT NULL,
  about_headline JSONB NOT NULL,
  about_bio JSONB NOT NULL,
  process_steps JSONB NOT NULL DEFAULT '[]',
  footer_text JSONB NOT NULL,
  seo_title JSONB NOT NULL,
  seo_description JSONB NOT NULL,
  is_maintenance BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CONTACT INQUIRIES TABLE (Strictly Private)
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT NOT NULL DEFAULT 'General Inquiry',
  subject TEXT NOT NULL DEFAULT 'New Project',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Helper function: Check if current authenticated user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
-- Public can READ profile
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- Only authenticated admin can UPDATE profile
CREATE POLICY "Only admin can update profile"
ON public.profiles FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2. Services Policies
-- Public can only READ published services
CREATE POLICY "Public can view published services"
ON public.services FOR SELECT
USING (is_published = true OR public.is_admin());

-- Only admin can INSERT, UPDATE, DELETE services
CREATE POLICY "Admin full access to services"
ON public.services FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. Projects Policies
-- Public can ONLY read published projects; Admin can read all (including drafts)
CREATE POLICY "Public can view published projects only"
ON public.projects FOR SELECT
USING (is_published = true OR public.is_admin());

-- Only admin can CREATE, UPDATE, DELETE projects
CREATE POLICY "Admin full access to projects"
ON public.projects FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. Site Settings Policies
-- Public can READ site settings
CREATE POLICY "Public can read site settings"
ON public.site_settings FOR SELECT
USING (true);

-- Only admin can UPDATE site settings
CREATE POLICY "Admin can update site settings"
ON public.site_settings FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Contact Inquiries Policies (STRICT PRIVACY ENFORCEMENT)
-- Anyone (public anonymous visitor) can SUBMIT an inquiry
CREATE POLICY "Public can insert inquiries"
ON public.contact_inquiries FOR INSERT
WITH CHECK (
  length(trim(name)) >= 2 AND
  length(trim(email)) >= 5 AND
  length(trim(message)) >= 5
);

-- Public visitors CANNOT read inquiries! Only admin can SELECT
CREATE POLICY "Only admin can view inquiries"
ON public.contact_inquiries FOR SELECT
USING (public.is_admin());

-- Only admin can UPDATE (mark as read) or DELETE inquiries
CREATE POLICY "Only admin can update inquiries"
ON public.contact_inquiries FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Only admin can delete inquiries"
ON public.contact_inquiries FOR DELETE
USING (public.is_admin());

-- 6. Storage Bucket Security Policies (for Supabase Storage)
-- Assuming a storage bucket named 'portfolio-assets':
-- - Public can download/view images
-- - Only authenticated admin can upload/delete images
