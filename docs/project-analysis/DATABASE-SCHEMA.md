# 🗄️ SAE-3 Database Schema & API Reference

## 📋 Database Overview

**Database Provider**: Supabase (PostgreSQL)
**Authentication**: Custom password-based system
**Storage**: Supabase Storage for file uploads
**Security**: Row Level Security (RLS) policies enabled

---

## 📊 Core Tables

### 1. `app_users` - User Authentication
```sql
CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Store user account information with encrypted passwords
**Key Features**:
- UUID primary key for security
- Unique email constraint
- SHA-256 password hashing with custom salt
- Soft delete with `is_active` flag
- Activity tracking with `last_login`

### 2. `team_registrations` - Team Registration System
```sql
CREATE TABLE team_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  team_name VARCHAR(255) NOT NULL,
  leader_name VARCHAR(255) NOT NULL,
  leader_roll VARCHAR(100) NOT NULL,
  leader_branch VARCHAR(255) NOT NULL,
  leader_phone VARCHAR(15),

  -- Team Members (Optional)
  member1_name VARCHAR(255),
  member1_roll VARCHAR(100),
  member1_branch VARCHAR(255),
  member2_name VARCHAR(255),
  member2_roll VARCHAR(100),
  member2_branch VARCHAR(255),
  member3_name VARCHAR(255),
  member3_roll VARCHAR(100),
  member3_branch VARCHAR(255),
  member4_name VARCHAR(255),
  member4_roll VARCHAR(100),
  member4_branch VARCHAR(255),

  -- Payment Information
  payment_screenshot_url TEXT,
  payment_screenshot_path TEXT,
  payment_verified BOOLEAN DEFAULT FALSE,

  -- Registration Status
  registration_status VARCHAR(20) DEFAULT 'pending',
  step_2_enabled BOOLEAN DEFAULT FALSE,
  application_number VARCHAR(50) UNIQUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Complete team registration with 3-step workflow
**Status Values**: `pending`, `verified`, `rejected`
**Step Flow**:
1. Team info submission → `step_2_enabled: false`
2. Admin enables payment → `step_2_enabled: true`
3. Payment upload → Admin verification → `registration_status: verified`

### 3. `hot_events` - Event Management
```sql
CREATE TABLE hot_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  poster_image_url TEXT,
  poster_image_path TEXT,
  instagram_reel TEXT,
  show_on_homepage BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Dynamic event content management
**Features**:
- Poster image storage integration
- Instagram reel links
- Homepage visibility toggle
- Full CRUD operations via admin panel

### 4. `qr_upi_settings` - Payment Configuration
```sql
CREATE TABLE qr_upi_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code_url TEXT NOT NULL,
  upi_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Dynamic payment method configuration
**Usage**: Single row table for current payment settings
**Admin Control**: Upload QR code image + set UPI ID

### 5. `bank_details` - Bank Account Information
```sql
CREATE TABLE bank_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_number VARCHAR(50) NOT NULL,
  ifsc_code VARCHAR(11) NOT NULL,
  is_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Bank account details for payment processing
**Static Fields**:
- Account Holder Name: "SAE COLLEGIATE CLUB MMMUT"
- Account Type: "CURRENT ACCOUNT"
**Dynamic Fields**: Account number, IFSC code (admin configurable)

---

## 🔒 Security Policies (RLS)

### User Authentication Policies
```sql
-- Users can only read their own data
CREATE POLICY "Users can read own data" ON app_users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON app_users
  FOR UPDATE USING (auth.uid() = id);
```

### Registration Policies
```sql
-- Users can create their own registrations
CREATE POLICY "Users can create registrations" ON team_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read their own registrations
CREATE POLICY "Users can read own registrations" ON team_registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all registrations
CREATE POLICY "Admins can read all registrations" ON team_registrations
  FOR SELECT USING (is_admin());
```

### Public Read Policies
```sql
-- Hot events are publicly readable
CREATE POLICY "Hot events are public" ON hot_events
  FOR SELECT USING (true);

-- Payment settings are publicly readable
CREATE POLICY "Payment settings public" ON qr_upi_settings
  FOR SELECT USING (true);
```

---

## 📁 Supabase Storage

### Storage Buckets

#### `hot-events` Bucket
**Purpose**: File storage for events and payments
**Contents**:
- `posters/` - Event poster images
- `payments/` - Payment screenshot uploads
- `qr-codes/` - QR code images

**File Naming Convention**:
```
posters/EventName_timestamp.extension
payments/TeamName_payment_timestamp.extension
qr-codes/qr_code_timestamp.extension
```

**Security Policies**:
```sql
-- Public read access for posters and QR codes
CREATE POLICY "Public read posters" ON storage.objects
  FOR SELECT USING (bucket_id = 'hot-events' AND storage.foldername(name)[1] = 'posters');

-- Admin write access for all folders
CREATE POLICY "Admin write access" ON storage.objects
  FOR INSERT WITH CHECK (is_admin());
```

---

## 🛠 API Service Layer

### Authentication Services

#### `createUser(userData)`
```javascript
const userData = {
  email: 'user@example.com',
  password: 'plaintext',
  fullName: 'User Name',
  dateOfBirth: '1999-01-01'
};
```
- Hashes password with SHA-256 + salt
- Creates user record in `app_users`
- Returns sanitized user object (no password)

#### `authenticateUser(email, password)`
- Hashes provided password
- Compares with stored hash
- Updates `last_login` timestamp
- Returns user object on success

#### `hashPassword(password)`
- Uses Web Crypto API
- Adds custom salt: `password + 'sae_salt_2024'`
- Returns hex-encoded SHA-256 hash

### Registration Services

#### `createTeamRegistration(registrationData)`
```javascript
const registrationData = {
  userId: 'uuid',
  teamName: 'Team Alpha',
  leaderName: 'John Doe',
  leaderRoll: '12345',
  leaderBranch: 'Computer Science (CSE)',
  leaderPhone: '9876543210',
  member1Name: 'Jane Doe', // Optional
  member1Roll: '12346',    // Optional
  member1Branch: 'ECE',    // Optional
  // ... up to member4
  payment_screenshot_url: null, // Added in Step 2
  payment_screenshot_path: null
};
```

#### `updateRegistrationStatus(id, status, enableStep2?)`
**Status Values**: `pending`, `verified`, `rejected`
**Admin Actions**:
- Enable Step 2: `enableStep2ForTeam(id)`
- Final verification: `updateRegistrationStatus(id, 'verified')`

### File Upload Services

#### `uploadPosterImage(file, eventName)`
- Validates file type (images only)
- Generates unique filename with timestamp
- Uploads to `hot-events/posters/` folder
- Returns `{ path, url }` object

#### `uploadPaymentScreenshot(file, teamName)`
- File validation (5MB max, image types)
- Stores in `hot-events/payments/` folder
- Links to team registration record

### Event Management Services

#### `createHotEvent(eventData)`
```javascript
const eventData = {
  name: 'BAJA Championship 2024',
  description: 'Annual off-road racing competition',
  instagram_reel: 'https://instagram.com/reel/xyz',
  poster_image_url: 'storage_url',
  poster_image_path: 'storage_path',
  show_on_homepage: true
};
```

#### `getHotEvents()`
- Fetches all events ordered by creation date
- Used for both public display and admin management

---

## 🔄 Database Migrations

### Available Migration Files
Located in `/src/schema/`:

1. **`database-setup.sql`** - Initial table creation
2. **`team-registrations-schema.sql`** - Registration table
3. **`hot-events-schema.sql`** - Events table
4. **`qr-upi-settings-schema.sql`** - Payment settings
5. **`users-auth-schema.sql`** - User authentication
6. **`add-leader-phone-migration.sql`** - Phone field addition
7. **`add-poster-column.sql`** - Poster fields for events
8. **`fix-storage-policies.sql`** - Storage security policies
9. **`update-application-number.sql`** - Application numbering

### Migration Execution Order
```sql
-- 1. Core tables
\i database-setup.sql

-- 2. Authentication
\i users-auth-schema.sql

-- 3. Registration system
\i team-registrations-schema.sql

-- 4. Events system
\i hot-events-schema.sql

-- 5. Payment system
\i qr-upi-settings-schema.sql

-- 6. Apply patches
\i add-leader-phone-migration.sql
\i add-poster-column.sql
\i fix-storage-policies.sql
```

---

## 📊 Data Relationships

```
app_users (1) ──────── (1) team_registrations
    │                        │
    │                        ├─ payment_screenshots (storage)
    │                        └─ registration workflow
    │
    └─ Authentication Context

hot_events (n) ──────── (n) poster_images (storage)
    │                        │
    ├─ homepage_visibility   └─ admin_management
    └─ instagram_integration

qr_upi_settings (1) ──── (1) qr_code_image (storage)
    │
    └─ payment_configuration

bank_details (1) ──────── registration_form_display
```

---

## 🧪 Testing Queries

### Check User Registration Status
```sql
SELECT
  tr.team_name,
  tr.leader_name,
  tr.registration_status,
  tr.payment_verified,
  tr.step_2_enabled,
  au.email
FROM team_registrations tr
JOIN app_users au ON tr.user_id = au.id
WHERE au.email = 'user@example.com';
```

### Get Homepage Events
```sql
SELECT name, description, poster_image_url, instagram_reel
FROM hot_events
WHERE show_on_homepage = true
ORDER BY created_at DESC;
```

### Payment Configuration Check
```sql
SELECT qr_code_url, upi_id FROM qr_upi_settings LIMIT 1;
SELECT account_number, ifsc_code FROM bank_details LIMIT 1;
```

---

*This schema documentation provides complete database structure and API reference for the SAE-3 project.*