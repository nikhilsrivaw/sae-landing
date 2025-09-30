# 🧩 SAE-3 Components Reference Guide

## 📋 Table of Contents
1. [Core Components](#core-components)
2. [Page Components](#page-components)
3. [Authentication Components](#authentication-components)
4. [Form Components](#form-components)
5. [UI Components](#ui-components)
6. [Context Providers](#context-providers)

---

## 🔑 Core Components

### `App.jsx` - Main Application Router
**Purpose**: Root component handling routing and global providers
**Key Features**:
- React Router with lazy loading for all pages
- ErrorBoundary wrapper for crash protection
- AuthProvider context for authentication state
- FloatingDropdown navigation system
- Loading fallback with GTA-style spinner

**Routes**:
```javascript
/ → Home (Hero section)
/sponsors → Sponsors page
/team → Team showcase
/creators → Project creators
/leaderboard → Burnout Leaderboard (LeaderboardNew)
/admin → Admin dashboard
/* → Redirect to Home
```

### `FloatingDropdown.jsx` - Navigation System
**Purpose**: Advanced dropdown menu with quantum-style animations
**Key Features**:
- GSAP-powered animations with 60fps optimization
- Holographic corner system with energy streams
- Mobile-responsive with backdrop overlay
- Modal detection (hides when modals open)
- Rotating geometric shapes and particle effects

**Navigation Items**:
- SPONSORS → `/sponsors`
- TEAM → `/team`
- CREATORS → `/creators`
- LEADERBOARD → `/leaderboard`
- (Events and Chambers commented out)

---

## 📱 Page Components

### `Home.jsx` - Landing Page Controller
**Purpose**: Simple wrapper for the Hero section
**Features**:
- Direct Hero component import
- Commented out state management (for future expansion)

### `AdminNew.jsx` - Complete Admin Dashboard
**Purpose**: Full-featured admin panel for system management
**Key Features**:
- **Authentication**: Admin login system with session management
- **Event Management**: CRUD operations for hot events
- **Registration Management**: 3-step approval workflow
- **Payment Settings**: QR code + UPI configuration
- **Bank Details**: Account information management
- **Mobile Responsive**: Adaptive sidebar and layouts

**Admin Sections**:
1. Dashboard - Statistics and quick actions
2. Hot Events - Event creation and management
3. Team Registrations - Multi-step approval system
4. QR & UPI Settings - Payment configuration
5. Bank Details - Account information
6. Analytics - Coming soon
7. Settings - Coming soon

### `LeaderboardNew.jsx` - Premium Championship Leaderboard
**Purpose**: Professional SAE Championship leaderboard with premium styling
**Key Features**:
- **Premium Dark Theme**: Professional esports-style interface
- **Unified Grid Layout**: All teams displayed consistently without special podium
- **Advanced Search & Filtering**: Real-time search with status filters
- **Pagination System**: Organized team browsing with 10 teams per page
- **Team Analytics**: Detailed popup with team information on click
- **Responsive Design**: Mobile-optimized layouts and interactions

**Core Functionality**:
- **Data Management**: Mock data generation for 46 teams
- **Search System**: Team name, leader, roll number, branch filtering
- **Status Filtering**: All, verified, pending team status options
- **Rank Styling**: Position-based color coding and styling
- **Real-time Updates**: Current time display and data refresh

**Design Elements**:
- **Title**: "BURNOUT LEADERBOARD" with championship styling
- **Color Scheme**: Deep navy backgrounds with SAE crimson accents
- **Typography**: Bold championship fonts with gradient effects
- **Cards**: Glassmorphism design with hover animations
- **Status Indicators**: Verified badges with green gradient styling

**State Management**:
```javascript
- isLoading, leaderboardData, filteredData
- currentTime, currentPage, searchTerm, statusFilter
- selectedTeamForAnalysis, showAnalysisPopup
```

**Recent Changes** (Sept 29, 2025):
- **Simplified Interface**: Removed complex 3D podium display
- **Performance Optimization**: Eliminated resource-intensive animations
- **Unified Experience**: All teams receive equal visual treatment
- **Mobile Enhancement**: Improved performance on mobile devices

### `Hero.jsx` - Main Landing Section (32k+ lines)
**Purpose**: Massive hero section with complex GTA-style animations
**Key Features**:
- **GSAP Animations**: ScrollTrigger, timeline animations
- **Interactive Elements**: Start button, minimap, tooltips
- **Background Management**: Multiple backgrounds with loading
- **Registration Integration**: Form popup management
- **Authentication Flow**: Sign in/up modal handling
- **Hot Events**: Dynamic event loading and display

**State Management**:
```javascript
- isLoading, imageLoaded, imageError
- showMainContent, experienceStarted
- showRegistrationForm, showAuth, showEventsPopup
- hotEvents, userRegistration
- showPDFViewer, showMobileRegistrationDisclaimer
```

---

## 🔐 Authentication Components

### `GTAAuth.jsx` - Authentication Wrapper
**Purpose**: Modal wrapper managing sign in/up flow
**Features**:
- Mode switching between signin/signup
- Success callback handling
- Modal backdrop with blur effect
- Close button with hover effects

### `GTASignin.jsx` - Sign In Component
**Purpose**: User authentication form
**Features**:
- Email/password validation
- Custom styling matching GTA theme
- Switch to signup option
- Error handling and feedback

### `GTASignup.jsx` - Sign Up Component
**Purpose**: User registration form
**Features**:
- Full name, email, password, date of birth
- Password confirmation validation
- Account creation with Supabase
- Auto-switch to signin after success

### `AdminLogin.jsx` - Admin Authentication
**Purpose**: Secure admin panel access
**Features**:
- Environment variable credentials
- Session management
- GTA-styled login form
- Cancel/redirect functionality
- **UPDATED**: Removed default credentials display for security

---

## 📝 Form Components

### `GTARegistrationForm.jsx` - 3-Step Registration System
**Purpose**: Complete team registration with payment processing
**File Size**: 1,610 lines - Most complex component

**Step 1 - Team Registration**:
- Team name, leader details
- Up to 4 optional team members
- Branch selection from predefined list
- Phone number validation (10 digits)
- Form persistence across steps

**Step 2 - Payment Processing**:
- Bank account details display (dynamic from admin)
- Account holder name: "SAE COLLEGIATE CLUB MMMUT"
- Account type: "CURRENT ACCOUNT"
- Payment screenshot upload with validation
- Transaction ID visibility requirement
- File validation (type, size, dimensions)

**Step 3 - Verification Status**:
- Registration summary display
- Status tracking (pending/verified/rejected)
- Payment verification status
- Complete team member details

**Design Features**:
- **Paper Document Style**: Authentic typewriter aesthetic
- **Stains and Staples**: Visual paper effects
- **Mobile Responsive**: Specialized mobile layouts
- **Form Validation**: Real-time error display
- **Status Checking**: Existing registration lookup
- **NEW: WhatsApp Integration**: Community group access after Steps 1 & 2

### `RegistrationStatus.jsx` - Status Checking
**Purpose**: Allow users to check their registration status
**Features**:
- Application number lookup
- Status display with color coding
- Registration details summary

---

## 🎨 UI Components

### `LoadingScreen.jsx` - GTA Loading Animation
**Purpose**: Authentic GTA-style loading screen
**Features**:
- Spinning loader with GTA colors
- Loading text animation
- Background styling matching theme

### `MiniMap.jsx` - Interactive Map Component
**Purpose**: GTA-style minimap with blips
**Features**:
- Interactive hotspots
- Location markers
- Tooltip system
- Responsive scaling

### `PDFViewer.jsx` - Document Viewer
**Purpose**: Display PDF documents in modal
**Features**:
- Modal overlay system
- Document embedding
- Close functionality

### `GTAEventsPopup.jsx` - Events Display Modal
**Purpose**: Show hot events in popup format
**Features**:
- Event grid layout
- Image display with fallbacks
- Instagram link integration
- Responsive design

### `ErrorBoundary.jsx` - Error Handling
**Purpose**: Catch and display React errors gracefully
**Features**:
- Error state management
- User-friendly error messages
- Component crash protection

### `HomeButton.jsx` - Navigation Helper
**Purpose**: Return to home functionality
**Features**:
- Consistent styling
- Hover effects
- Router navigation

---

## 🌐 Context Providers

### `AuthContext.jsx` - Authentication State
**Purpose**: Global authentication state management
**Features**:
- User state management
- Login/logout functionality
- localStorage persistence
- Authentication status tracking

**Provided Values**:
```javascript
{
  user,           // Current user object
  isAuthenticated, // Boolean auth status
  isLoading,      // Loading state
  login,          // Login function
  logout          // Logout function
}
```

**Usage Pattern**:
```javascript
import { useAuth } from '../contexts/AuthContext';
const { user, isAuthenticated, login, logout } = useAuth();
```

---

## 🛠 Service Layer

### `supabase.js` - Database Service Layer
**Purpose**: Complete backend API abstraction
**Key Services**:

**File Operations**:
- `uploadPosterImage()` - Event poster uploads
- `uploadPaymentScreenshot()` - Payment proof uploads
- `uploadQrCodeImage()` - QR code uploads
- `deletePosterImage()` - Storage cleanup

**Event Management**:
- `getHotEvents()` - Fetch all events
- `createHotEvent()` - Create new event
- `updateHotEvent()` - Update existing event
- `deleteHotEvent()` - Remove event

**Registration Management**:
- `createTeamRegistration()` - Step 1 registration
- `getTeamRegistrations()` - Admin fetch all
- `getUserRegistration()` - User's registration
- `updateRegistrationStatus()` - Admin approval
- `enableStep2ForTeam()` - Payment step activation

**User Authentication**:
- `createUser()` - Account creation
- `authenticateUser()` - Login verification
- `hashPassword()` - Security utility
- `getUserById()` - Profile fetching

**Payment Settings**:
- `saveQrUpiSettings()` - Payment configuration
- `getQrUpiSettings()` - Fetch payment details
- `saveBankDetails()` - Account information
- `getBankDetails()` - Account retrieval

### `adminAuth.js` - Admin Authentication Service
**Purpose**: Secure admin panel access
**Features**:
- Environment variable validation
- Session management
- Access token generation
- Verification utilities

---

## 📱 Component Usage Patterns

### Standard Component Structure
```javascript
import React, { useState, useEffect } from 'react';
import { ComponentDependencies } from './path';

const ComponentName = ({ props }) => {
  // State management
  const [state, setState] = useState(initialValue);

  // Effects
  useEffect(() => {
    // Component logic
  }, [dependencies]);

  // Event handlers
  const handleEvent = () => {
    // Event logic
  };

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

### Authentication Protected Component
```javascript
import { useAuth } from '../contexts/AuthContext';

const ProtectedComponent = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return <div>Protected content</div>;
};
```

### Form Component with Validation
```javascript
const FormComponent = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation and submission
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

---

*This reference guide provides comprehensive documentation of all components in the SAE-3 project for easy maintenance and future development.*