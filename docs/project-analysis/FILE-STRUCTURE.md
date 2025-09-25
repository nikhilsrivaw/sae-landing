# 📁 SAE-3 Complete File Structure Reference

## 🗂️ Project Root Directory

```
C:\Users\nikhil\Desktop\sae-3\
├── 📁 .git/                     # Git version control
├── 📁 dist/                     # Production build output
├── 📁 docs/                     # Project documentation
│   └── 📁 project-analysis/     # Complete project analysis (NEW)
│       ├── 📄 PROJECT-OVERVIEW.md
│       ├── 📄 COMPONENTS-REFERENCE.md
│       ├── 📄 DATABASE-SCHEMA.md
│       └── 📄 FILE-STRUCTURE.md
├── 📁 node_modules/            # NPM dependencies
├── 📁 public/                  # Static public assets
├── 📁 src/                     # Source code (MAIN)
├── 📄 .env.local              # Environment variables
├── 📄 .gitignore              # Git ignore rules
├── 📄 CLAUDE.md               # Claude Code settings
├── 📄 eslint.config.js        # ESLint configuration
├── 📄 index.html              # Main HTML template
├── 📄 package.json            # NPM package configuration
├── 📄 package-lock.json       # NPM lock file
├── 📄 PRODUCTION-READY-CHECKLIST.md
├── 📄 README.md               # Project documentation
├── 📄 tailwind.config.js      # Tailwind CSS config
└── 📄 vite.config.js          # Vite build configuration
```

---

## 📱 Source Code Structure (`/src`)

```
src/
├── 📁 assets/                  # Static assets
│   ├── 📁 backgrounds/         # Background images
│   │   ├── 🖼️ background (1).webp    # Alternative backgrounds
│   │   ├── 🖼️ background (2).webp    # MAIN HERO BACKGROUND
│   │   ├── 🖼️ background (3).webp    # Additional backgrounds
│   │   ├── 🖼️ background (4).webp
│   │   └── 🖼️ background (5).webp
│   ├── 📁 images/              # UI images and icons
│   └── 📁 logos/               # Brand logos
├── 📁 components/              # Reusable React components
│   ├── ⚛️ AdminLogin.jsx             # Admin authentication
│   ├── ⚛️ ErrorBoundary.jsx          # Error handling wrapper
│   ├── ⚛️ FloatingDropdown.jsx       # Navigation menu
│   ├── ⚛️ GTAAuth.jsx               # Auth modal wrapper
│   ├── ⚛️ GTAEventsPopup.jsx        # Events display modal
│   ├── ⚛️ GTARegistrationForm.jsx   # 3-step registration (1,610 lines)
│   ├── ⚛️ GTASignin.jsx             # User sign in
│   ├── ⚛️ GTASignup.jsx             # User registration
│   ├── ⚛️ HomeButton.jsx            # Navigation helper
│   ├── ⚛️ LoadingScreen.jsx         # GTA-style loading
│   ├── ⚛️ MiniMap.jsx               # Interactive map
│   ├── ⚛️ PDFViewer.jsx             # Document viewer
│   └── ⚛️ RegistrationStatus.jsx    # Status checking
├── 📁 contexts/                # React context providers
│   └── ⚛️ AuthContext.jsx           # Authentication state
├── 📁 lib/                     # Utility libraries
│   ├── 🔧 adminAuth.js              # Admin authentication
│   └── 🔧 supabase.js               # Database service layer
├── 📁 pages/                   # Main application pages
│   ├── ⚛️ AdminNew.jsx              # Admin dashboard
│   ├── ⚛️ Chambers.jsx              # Chambers information
│   ├── ⚛️ Creators.jsx              # Project creators
│   ├── ⚛️ Events.jsx                # Events showcase
│   ├── ⚛️ Glimpse.jsx               # Project glimpse
│   ├── ⚛️ Home.jsx                  # Landing page controller
│   ├── ⚛️ Sponsors.jsx              # Sponsors showcase
│   └── ⚛️ Team.jsx                  # Team members
├── 📁 schema/                  # Database schemas and migrations
│   ├── 💾 add-leader-phone-migration.sql
│   ├── 💾 add-poster-column.sql
│   ├── 💾 bank-details-schema.sql
│   ├── 💾 database-setup.sql
│   ├── 💾 fix-storage-policies.sql
│   ├── 💾 hot-events-schema.sql
│   ├── 💾 qr-upi-settings-schema.sql
│   ├── 💾 safe-fix-qr-upi-policies.sql
│   ├── 💾 team-registrations-schema.sql
│   ├── 💾 update-application-number.sql
│   └── 💾 users-auth-schema.sql
├── 📁 sections/                # Page sections
│   └── ⚛️ Hero.jsx                  # Main hero section (32,000+ lines)
├── ⚛️ App.jsx                       # Root application component
├── 🎨 index.css                     # Global styles
└── ⚛️ main.jsx                      # React app entry point
```

---

## 📊 File Size Analysis

### 🔥 Largest Files (by lines of code)

1. **`src/sections/Hero.jsx`** - **32,000+ lines**
   - Massive hero section with complex animations
   - GSAP timeline animations and ScrollTrigger
   - Interactive elements, minimap, tooltips
   - Registration and authentication integration
   - Hot events management and display
   - Mobile optimization and responsive design

2. **`src/components/GTARegistrationForm.jsx`** - **1,610 lines**
   - 3-step registration workflow
   - Complex form validation and state management
   - Payment processing integration
   - GTA-styled paper document design
   - Mobile-responsive layouts

3. **`src/pages/AdminNew.jsx`** - **~800 lines**
   - Complete admin dashboard
   - Event management CRUD operations
   - Registration approval workflow
   - Payment settings configuration

4. **`src/lib/supabase.js`** - **~500 lines**
   - Complete database service layer
   - File upload handling
   - Authentication services
   - CRUD operations for all entities

### 📱 Component Categories

#### **Core Application (4 files)**
- `App.jsx` - Main router and providers
- `main.jsx` - React entry point
- `index.css` - Global styles
- `index.html` - HTML template

#### **Page Components (8 files)**
- Landing, admin, team, sponsors, events, creators, chambers, glimpse

#### **UI Components (13 files)**
- Registration form, authentication, navigation, loading, error handling

#### **Context & Services (3 files)**
- Authentication context, database service, admin auth

#### **Database Schema (11 files)**
- Table creation, migrations, security policies

---

## 🎨 Asset Organization

### **Images & Media**
```
assets/backgrounds/         # Hero section backgrounds (5 WebP images)
├── Background optimization for performance
├── WebP format for compression
└── Multiple options for variety

assets/images/             # UI graphics and icons
└── Component-specific images

assets/logos/              # Brand and sponsor logos
└── SVG format preferred for scalability
```

### **Static Assets (`/public`)**
```
public/
├── favicon.ico           # Browser tab icon
├── manifest.json         # PWA configuration
└── robots.txt           # SEO crawler instructions
```

---

## ⚙️ Configuration Files

### **Build & Development**
- **`vite.config.js`** - Vite bundler configuration
- **`package.json`** - NPM scripts and dependencies
- **`tailwind.config.js`** - Tailwind CSS customization
- **`eslint.config.js`** - Code linting rules

### **Environment & Security**
- **`.env.local`** - Environment variables (Supabase, admin credentials)
- **`.gitignore`** - Files excluded from version control
- **`CLAUDE.md`** - Claude Code IDE settings

### **Documentation**
- **`README.md`** - Project setup and overview
- **`PRODUCTION-READY-CHECKLIST.md`** - Deployment checklist
- **`docs/project-analysis/`** - Complete project documentation

---

## 📦 Dependencies Overview

### **Core Framework**
```json
{
  "react": "19.1.1",
  "react-dom": "19.1.1",
  "react-router-dom": "7.1.3"
}
```

### **Animation & UI**
```json
{
  "gsap": "3.13.0",           # Premium animations
  "framer-motion": "12.23.12", # Component animations
  "lucide-react": "0.544.0"   # Icons
}
```

### **Styling**
```json
{
  "tailwindcss": "4.1.11",    # Utility-first CSS
  "@tailwindcss/typography": "0.5.16"
}
```

### **Backend & Database**
```json
{
  "@supabase/supabase-js": "^2.39.0"  # Database client
}
```

### **Build Tools**
```json
{
  "vite": "7.1.0",            # Build tool
  "@vitejs/plugin-react": "5.1.1",
  "eslint": "9.19.0"          # Code linting
}
```

---

## 🚀 Build Output (`/dist`)

**Generated by**: `npm run build`

```
dist/
├── 📁 assets/               # Bundled and optimized assets
│   ├── 🎨 index-[hash].css    # Minified styles
│   ├── ⚛️ index-[hash].js     # Main application bundle
│   ├── ⚛️ vendor-[hash].js    # Third-party libraries
│   └── 🖼️ [images]           # Optimized images
├── 📄 index.html           # Production HTML
└── 📄 manifest.json        # PWA manifest
```

**Bundle Analysis**:
- **Main Bundle**: Application code with code splitting
- **Vendor Bundle**: React, GSAP, and other libraries
- **Asset Optimization**: WebP images, CSS minification
- **Cache Busting**: Hash-based filenames

---

## 🔍 Quick File Finder

### **Need to modify registration form?**
📍 `src/components/GTARegistrationForm.jsx`

### **Want to add new page?**
📍 Add to `src/pages/` → Update `src/App.jsx` routes

### **Database changes needed?**
📍 `src/schema/` for migrations → `src/lib/supabase.js` for API

### **Styling updates?**
📍 `src/index.css` for global → `tailwind.config.js` for theme

### **Admin panel modifications?**
📍 `src/pages/AdminNew.jsx`

### **Authentication changes?**
📍 `src/contexts/AuthContext.jsx` + `src/lib/supabase.js`

### **Hero section updates?**
📍 `src/sections/Hero.jsx` (warning: 32k+ lines!)

### **Environment variables?**
📍 `.env.local`

---

## 📈 Project Statistics

- **Total Files**: ~50 files
- **Lines of Code**: ~45,000+ lines
- **Components**: 21 React components
- **Pages**: 8 main pages
- **Database Tables**: 5 core tables
- **Storage Buckets**: 1 main bucket with 3 folders
- **API Endpoints**: 20+ service functions

---

*This file structure reference provides a complete roadmap for navigating and understanding the SAE-3 project codebase.*