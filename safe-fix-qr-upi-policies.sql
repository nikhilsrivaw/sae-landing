-- Safe Fix for QR & UPI Settings RLS Policies
-- This version handles existing policies properly

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Allow public read access" ON public.qr_upi_settings;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.qr_upi_settings;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.qr_upi_settings;
DROP POLICY IF EXISTS "Allow public insert" ON public.qr_upi_settings;
DROP POLICY IF EXISTS "Allow public update" ON public.qr_upi_settings;
DROP POLICY IF EXISTS "Allow public delete" ON public.qr_upi_settings;

-- Create fresh policies that allow public access (since we use custom auth)
CREATE POLICY "Allow public read access" ON public.qr_upi_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON public.qr_upi_settings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.qr_upi_settings
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON public.qr_upi_settings
    FOR DELETE USING (true);

-- Verify all policies are correct
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'qr_upi_settings'
ORDER BY policyname;