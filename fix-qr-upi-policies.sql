-- Fix RLS Policies for QR & UPI Settings
-- Run this if you already created the table and need to fix the policies

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.qr_upi_settings;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.qr_upi_settings;

-- Create new policies that allow public access (since we use custom auth)
CREATE POLICY "Allow public insert" ON public.qr_upi_settings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.qr_upi_settings
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON public.qr_upi_settings
    FOR DELETE USING (true);

-- Verify policies are correct
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'qr_upi_settings';