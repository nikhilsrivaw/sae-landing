-- QR & UPI Settings Table Schema
-- Run this in Supabase SQL Editor

-- Create the qr_upi_settings table
CREATE TABLE IF NOT EXISTS public.qr_upi_settings (
    id BIGSERIAL PRIMARY KEY,
    qr_code_url TEXT,
    upi_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.qr_upi_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for the table
-- Allow public read access (so registration form can fetch settings)
CREATE POLICY "Allow public read access" ON public.qr_upi_settings
    FOR SELECT USING (true);

-- Allow public insert/update/delete (since we're using custom auth, not Supabase auth)
CREATE POLICY "Allow public insert" ON public.qr_upi_settings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.qr_upi_settings
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON public.qr_upi_settings
    FOR DELETE USING (true);

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_qr_upi_settings_updated_at ON public.qr_upi_settings(updated_at DESC);

-- Add a comment to the table
COMMENT ON TABLE public.qr_upi_settings IS 'Stores QR code image URL and UPI ID for payment collection in registration forms';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.qr_upi_settings TO authenticated;
GRANT SELECT ON public.qr_upi_settings TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.qr_upi_settings_id_seq TO authenticated;