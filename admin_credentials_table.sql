-- Create admin_credentials table for SAE admin authentication
CREATE TABLE IF NOT EXISTS admin_credentials (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_credentials_username ON admin_credentials(username);

-- Insert default admin credentials (username: admin, password: sae2024)
-- Note: The password_hash is generated using the simpleHash function in the code
INSERT INTO admin_credentials (username, password_hash, is_active)
VALUES ('admin', '35bb3dfb', true)
ON CONFLICT (username) DO NOTHING;

-- Grant permissions (adjust as needed for your RLS policies)
-- ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;