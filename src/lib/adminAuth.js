import { supabase } from './supabase';

// Simple hash function for password comparison (for demo - use bcrypt in production)
const simpleHash = (password, salt = 'SAE_ADMIN_SALT') => {
  let hash = 0;
  const str = password + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

// Fixed admin credentials (change these as needed)
const FIXED_ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'sae2024'
};

// Admin authentication service
export const adminAuthService = {
  // Debug function to check credentials and database
  async debugAuth() {
    console.log('🔍 Debug: Fixed credentials:', FIXED_ADMIN_CREDENTIALS);
    console.log('🔍 Debug: Expected hash:', simpleHash(FIXED_ADMIN_CREDENTIALS.password));

    try {
      const tableExists = await this.checkTableExists();
      console.log('🔍 Debug: Table exists:', tableExists);

      if (tableExists) {
        const { data, error } = await supabase
          .from('admin_credentials')
          .select('*');
        console.log('🔍 Debug: All admin records:', data, error);
      }
    } catch (error) {
      console.error('🔍 Debug error:', error);
    }
  },
  // Initialize admin credentials in database with fixed credentials
  async initializeAdminCredentials() {
    try {
      console.log('🔧 Initializing fixed admin credentials...');

      // Check if table exists first
      const tableExists = await this.checkTableExists();
      console.log('🔧 Table exists:', tableExists);

      if (!tableExists) {
        return {
          success: false,
          error: 'Admin credentials table does not exist. Please run the SQL schema in Supabase SQL Editor first.'
        };
      }

      // Check if admin already exists
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admin_credentials')
        .select('id, username, password_hash')
        .eq('username', FIXED_ADMIN_CREDENTIALS.username)
        .single();

      if (existingAdmin) {
        console.log('✅ Admin credentials already exist in database');
        return { success: true, message: 'Admin already exists' };
      }

      // Hash the password
      const passwordHash = simpleHash(FIXED_ADMIN_CREDENTIALS.password);
      console.log('🔧 Creating new admin with hash:', passwordHash);

      // Insert admin credentials
      const { data, error } = await supabase
        .from('admin_credentials')
        .insert([
          {
            username: FIXED_ADMIN_CREDENTIALS.username,
            password_hash: passwordHash,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating admin credentials:', error);
        throw error;
      }

      console.log('✅ Fixed admin credentials initialized successfully');
      return {
        success: true,
        message: 'Admin credentials created successfully',
        adminId: data.id
      };

    } catch (error) {
      console.error('Error initializing admin credentials:', error);
      return {
        success: false,
        error: error.message || 'Failed to initialize admin credentials'
      };
    }
  },
  // Check if admin_credentials table exists
  async checkTableExists() {
    try {
      const { error } = await supabase
        .from('admin_credentials')
        .select('id')
        .limit(1);

      // If no error, table exists
      return !error;
    } catch (error) {
      console.log('🔍 Table check error:', error);
      // Table doesn't exist
      return false;
    }
  },

  // Simple authentication without database (fallback)
  authenticateDirectly(username, password) {
    console.log('🔒 Direct authentication check');
    console.log('Provided username:', username);
    console.log('Expected username:', FIXED_ADMIN_CREDENTIALS.username);
    console.log('Provided password:', password);
    console.log('Expected password:', FIXED_ADMIN_CREDENTIALS.password);

    return username === FIXED_ADMIN_CREDENTIALS.username &&
           password === FIXED_ADMIN_CREDENTIALS.password;
  },

  // Login admin user
  async login(username, password) {
    try {
      console.log('🔐 Starting admin login process...');
      console.log('📧 Username:', username);
      console.log('🔑 Password:', password);

      // Debug the authentication
      await this.debugAuth();

      if (!username || !password) {
        return { success: false, error: 'Username and password are required' };
      }

      // Try direct authentication first (fallback for when database isn't set up)
      const directAuthSuccess = this.authenticateDirectly(username, password);

      if (directAuthSuccess) {
        console.log('✅ Direct authentication successful');

        // Store admin session in localStorage
        const adminSession = {
          id: 'admin-direct',
          username: username,
          loginTime: new Date().toISOString(),
          isAuthenticated: true
        };

        localStorage.setItem('sae_admin_session', JSON.stringify(adminSession));

        return {
          success: true,
          adminData: {
            id: 'admin-direct',
            username: username,
            lastLogin: new Date().toISOString(),
            isAuthenticated: true
          }
        };
      }

      // If direct auth fails, try database authentication
      const initResult = await this.initializeAdminCredentials();
      console.log('🔧 Init result:', initResult);

      if (!initResult.success) {
        console.log('❌ Database initialization failed, direct auth already failed');
        return { success: false, error: 'Invalid credentials' };
      }

      // Hash the provided password
      const passwordHash = simpleHash(password);
      console.log('🔒 Attempting database authentication');

      // Check credentials against database
      const { data: adminData, error } = await supabase
        .from('admin_credentials')
        .select('*')
        .eq('username', username.trim())
        .eq('password_hash', passwordHash)
        .eq('is_active', true)
        .single();

      if (error || !adminData) {
        console.log('❌ Database authentication failed');
        return { success: false, error: 'Invalid credentials' };
      }

      console.log('✅ Database authentication successful');

      // Update last login time
      await supabase
        .from('admin_credentials')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminData.id);

      // Store admin session in localStorage
      const adminSession = {
        id: adminData.id,
        username: adminData.username,
        loginTime: new Date().toISOString(),
        isAuthenticated: true
      };

      localStorage.setItem('sae_admin_session', JSON.stringify(adminSession));

      return {
        success: true,
        adminData: {
          id: adminData.id,
          username: adminData.username,
          lastLogin: adminData.last_login,
          isAuthenticated: true
        }
      };

    } catch (error) {
      console.error('Admin login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  },

  // Check if admin is currently authenticated
  isAuthenticated() {
    try {
      const session = localStorage.getItem('sae_admin_session');
      if (!session) return false;

      const adminSession = JSON.parse(session);

      // Check if session is valid (not older than 24 hours)
      const loginTime = new Date(adminSession.loginTime);
      const now = new Date();
      const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        this.logout();
        return false;
      }

      return adminSession.isAuthenticated === true;
    } catch (error) {
      console.error('Error checking admin authentication:', error);
      this.logout();
      return false;
    }
  },

  // Get current admin data
  getCurrentAdmin() {
    try {
      const session = localStorage.getItem('sae_admin_session');
      if (!session) return null;

      const adminSession = JSON.parse(session);

      if (this.isAuthenticated()) {
        return {
          id: adminSession.id,
          username: adminSession.username,
          loginTime: adminSession.loginTime,
          isAuthenticated: true
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting current admin:', error);
      return null;
    }
  },

  // Logout admin
  logout() {
    try {
      localStorage.removeItem('sae_admin_session');
      return { success: true };
    } catch (error) {
      console.error('Error during admin logout:', error);
      return { success: false, error: 'Logout failed' };
    }
  },

  // Verify admin session (for route protection)
  async verifySession() {
    if (!this.isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }

    const currentAdmin = this.getCurrentAdmin();
    if (!currentAdmin) {
      return { success: false, error: 'Invalid session' };
    }

    return {
      success: true,
      adminData: currentAdmin
    };
  },

  // Change admin password (optional feature)
  async changePassword(currentPassword, newPassword) {
    try {
      const currentAdmin = this.getCurrentAdmin();
      if (!currentAdmin) {
        return { success: false, error: 'Not authenticated' };
      }

      // Verify current password
      const currentPasswordHash = simpleHash(currentPassword);

      const { data: adminData, error: verifyError } = await supabase
        .from('admin_credentials')
        .select('password_hash')
        .eq('id', currentAdmin.id)
        .single();

      if (verifyError || !adminData) {
        return { success: false, error: 'Failed to verify current password' };
      }

      if (adminData.password_hash !== currentPasswordHash) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Update password
      const newPasswordHash = simpleHash(newPassword);

      const { error: updateError } = await supabase
        .from('admin_credentials')
        .update({
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentAdmin.id);

      if (updateError) {
        return { success: false, error: 'Failed to update password' };
      }

      return { success: true, message: 'Password updated successfully' };

    } catch (error) {
      console.error('Error changing admin password:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }
};

// Export for use in other components
export default adminAuthService;