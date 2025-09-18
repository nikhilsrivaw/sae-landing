import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database service functions
export const supabaseService = {
  // Upload image to Supabase Storage
  async uploadPosterImage(file, eventName) {
    console.log('🗂️ Starting image upload:', { fileName: file.name, size: file.size, type: file.type });

    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${eventName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`
    const filePath = `posters/${fileName}`

    console.log('📁 Upload path:', filePath);

    const { data, error } = await supabase.storage
      .from('hot-events')
      .upload(filePath, file)

    if (error) {
      console.error('❌ Storage upload error:', {
        message: error.message,
        details: error,
        filePath,
        bucketName: 'hot-events'
      });
      throw new Error(`Image upload failed: ${error.message}`);
    }

    console.log('📤 Upload successful:', data);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('hot-events')
      .getPublicUrl(filePath)

    console.log('🔗 Public URL generated:', urlData.publicUrl);

    return {
      path: filePath,
      url: urlData.publicUrl
    }
  },

  // Delete image from Supabase Storage
  async deletePosterImage(imagePath) {
    if (!imagePath) return

    const { error } = await supabase.storage
      .from('hot-events')
      .remove([imagePath])

    if (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  },

  // Hot Events operations
  async getHotEvents() {
    const { data, error } = await supabase
      .from('hot_events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching hot events:', error)
      throw error
    }
    return data
  },

  async createHotEvent(eventData) {
    console.log('💾 Inserting event data:', eventData);

    const insertData = {
      name: eventData.name,
      description: eventData.description,
      instagram_reel: eventData.instagram_reel || null,
      poster_image_url: eventData.poster_image_url || null,
      poster_image_path: eventData.poster_image_path || null,
      show_on_homepage: eventData.show_on_homepage || false,
      created_at: new Date().toISOString()
    };

    console.log('📝 Final insert data:', insertData);

    const { data, error } = await supabase
      .from('hot_events')
      .insert([insertData])
      .select()

    if (error) {
      console.error('❌ Database insert error:', {
        message: error.message,
        details: error,
        hint: error.hint,
        code: error.code,
        insertData
      });
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('✅ Event created in database:', data);
    return data[0]
  },

  async updateHotEvent(id, eventData) {
    const { data, error } = await supabase
      .from('hot_events')
      .update(eventData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating hot event:', error)
      throw error
    }
    return data[0]
  },

  async deleteHotEvent(id) {
    // First get the event to find the image path
    const { data: event } = await supabase
      .from('hot_events')
      .select('poster_image_path')
      .eq('id', id)
      .single()

    // Delete the image from storage if it exists
    if (event?.poster_image_path) {
      await this.deletePosterImage(event.poster_image_path)
    }

    // Delete the event record
    const { error } = await supabase
      .from('hot_events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting hot event:', error)
      throw error
    }
  },

  // Legacy Events operations (keeping for compatibility)
  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching events:', error)
      throw error
    }
    return data
  },

  async createEvent(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        name: eventData.name,
        description: eventData.description,
        image: eventData.image,
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      console.error('Error creating event:', error)
      throw error
    }
    return data[0]
  },

  async deleteEvent(id) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  },

  // Teams operations
  async getTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching teams:', error)
      throw error
    }
    return data
  },

  async createTeam(teamData) {
    const { data, error } = await supabase
      .from('teams')
      .insert([{
        name: teamData.name,
        division: teamData.division,
        leader: teamData.leader,
        members: teamData.members,
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      console.error('Error creating team:', error)
      throw error
    }
    return data[0]
  },

  async updateTeam(id, teamData) {
    const { data, error } = await supabase
      .from('teams')
      .update(teamData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating team:', error)
      throw error
    }
    return data[0]
  },

  async deleteTeam(id) {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting team:', error)
      throw error
    }
  },

  // Points operations
  async getPoints() {
    const { data, error } = await supabase
      .from('points')
      .select('*')
      .order('points', { ascending: false })

    if (error) {
      console.error('Error fetching points:', error)
      throw error
    }
    return data
  },

  async createPoints(pointsData) {
    const { data, error } = await supabase
      .from('points')
      .insert([{
        team: pointsData.team,
        event: pointsData.event,
        points: pointsData.points,
        position: pointsData.position,
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      console.error('Error creating points entry:', error)
      throw error
    }
    return data[0]
  },

  async updatePoints(id, pointsData) {
    const { data, error } = await supabase
      .from('points')
      .update(pointsData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating points:', error)
      throw error
    }
    return data[0]
  },

  async deletePoints(id) {
    const { error } = await supabase
      .from('points')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting points entry:', error)
      throw error
    }
  },

  // Team Registrations operations
  async uploadPaymentScreenshot(file, teamName) {
    console.log('📸 Starting payment screenshot upload:', { fileName: file.name, size: file.size, type: file.type });

    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${teamName.replace(/[^a-zA-Z0-9]/g, '_')}_payment_${Date.now()}.${fileExt}`
    const filePath = `payments/${fileName}`

    console.log('📁 Upload path:', filePath);

    const { data, error } = await supabase.storage
      .from('hot-events')
      .upload(filePath, file)

    if (error) {
      console.error('❌ Payment screenshot upload error:', {
        message: error.message,
        details: error,
        filePath,
        bucketName: 'team-registrations'
      });
      throw new Error(`Payment screenshot upload failed: ${error.message}`);
    }

    console.log('📤 Payment screenshot upload successful:', data);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('hot-events')
      .getPublicUrl(filePath)

    console.log('🔗 Payment screenshot URL generated:', urlData.publicUrl);

    return {
      path: filePath,
      url: urlData.publicUrl
    }
  },

  async createTeamRegistration(registrationData) {
    console.log('💾 Inserting team registration data:', registrationData);

    const insertData = {
      user_id: registrationData.userId, // Link to authenticated user
      team_name: registrationData.teamName,
      leader_name: registrationData.leaderName,
      leader_roll: registrationData.leaderRoll,
      leader_branch: registrationData.leaderBranch,
      member1_name: registrationData.member1Name || null,
      member1_roll: registrationData.member1Roll || null,
      member1_branch: registrationData.member1Branch || null,
      member2_name: registrationData.member2Name || null,
      member2_roll: registrationData.member2Roll || null,
      member2_branch: registrationData.member2Branch || null,
      member3_name: registrationData.member3Name || null,
      member3_roll: registrationData.member3Roll || null,
      member3_branch: registrationData.member3Branch || null,
      member4_name: registrationData.member4Name || null,
      member4_roll: registrationData.member4Roll || null,
      member4_branch: registrationData.member4Branch || null,
      payment_screenshot_url: registrationData.payment_screenshot_url || null,
      payment_screenshot_path: registrationData.payment_screenshot_path || null,
      registration_status: 'pending',
      created_at: new Date().toISOString()
    };

    console.log('📝 Final registration insert data:', insertData);

    const { data, error } = await supabase
      .from('team_registrations')
      .insert([insertData])
      .select()

    if (error) {
      console.error('❌ Team registration database insert error:', {
        message: error.message,
        details: error,
        hint: error.hint,
        code: error.code,
        insertData
      });
      throw new Error(`Registration database error: ${error.message}`);
    }

    console.log('✅ Team registration created in database:', data);
    return data[0]
  },

  async getTeamRegistrations() {
    const { data, error } = await supabase
      .from('team_registrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching team registrations:', error)
      throw error
    }
    return data
  },

  async updateRegistrationStatus(id, status) {
    const { data, error } = await supabase
      .from('team_registrations')
      .update({ registration_status: status, payment_verified: status === 'verified' })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating registration status:', error)
      throw error
    }
    return data[0]
  },

  async deleteTeamRegistration(id) {
    // First get the registration to find the payment screenshot path
    const { data: registration } = await supabase
      .from('team_registrations')
      .select('payment_screenshot_path')
      .eq('id', id)
      .single()

    // Delete the payment screenshot from storage if it exists
    if (registration?.payment_screenshot_path) {
      await supabase.storage
        .from('hot-events')
        .remove([registration.payment_screenshot_path])
    }

    // Delete the registration record
    const { error } = await supabase
      .from('team_registrations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting team registration:', error)
      throw error
    }
  },

  async getRegistrationByApplicationNumber(applicationNumber) {
    const { data, error } = await supabase
      .from('team_registrations')
      .select('*')
      .eq('application_number', applicationNumber)
      .single()

    if (error) {
      console.error('Error fetching registration by application number:', error)
      throw error
    }
    return data
  },

  async getUserRegistration(userId) {
    console.log('🔍 Fetching registration for user:', userId);

    const { data, error } = await supabase
      .from('team_registrations')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No registration found
        console.log('📋 No registration found for user:', userId);
        return null;
      }
      console.error('Error fetching user registration:', error)
      throw error
    }

    console.log('✅ Registration found for user:', data);
    return data
  },

  // User Authentication operations
  async hashPassword(password) {
    // Simple hash function for demo - in production use bcrypt or similar
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'sae_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async createUser(userData) {
    console.log('👤 Creating new user account:', { email: userData.email, fullName: userData.fullName });

    try {
      // Hash the password
      const passwordHash = await this.hashPassword(userData.password);

      const insertData = {
        email: userData.email.toLowerCase(),
        password_hash: passwordHash,
        full_name: userData.fullName,
        is_active: true,
        created_at: new Date().toISOString()
      };

      console.log('📝 Inserting user data:', { ...insertData, password_hash: '[HIDDEN]' });

      const { data, error } = await supabase
        .from('app_users')
        .insert([insertData])
        .select('id, email, full_name, created_at')

      if (error) {
        console.error('❌ User creation error:', error);
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Email already exists');
        }
        throw new Error(`Account creation failed: ${error.message}`);
      }

      console.log('✅ User created successfully:', data[0]);
      return data[0];
    } catch (error) {
      console.error('❌ Create user failed:', error);
      throw error;
    }
  },

  async authenticateUser(email, password) {
    console.log('🔐 Authenticating user:', { email });

    try {
      // Hash the provided password
      const passwordHash = await this.hashPassword(password);

      const { data, error } = await supabase
        .from('app_users')
        .select('id, email, full_name, is_active, last_login')
        .eq('email', email.toLowerCase())
        .eq('password_hash', passwordHash)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('❌ Authentication error:', error);
        throw new Error('Invalid email or password');
      }

      if (!data) {
        throw new Error('Invalid email or password');
      }

      // Update last login time
      await supabase
        .from('app_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);

      console.log('✅ User authenticated successfully:', { id: data.id, email: data.email });
      return data;
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }
  },

  async getUserById(userId) {
    const { data, error } = await supabase
      .from('app_users')
      .select('id, email, full_name, last_login, created_at')
      .eq('id', userId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching user by ID:', error)
      throw error
    }
    return data
  },

  async updateUserProfile(userId, updates) {
    const allowedUpdates = ['full_name'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const { data, error } = await supabase
      .from('app_users')
      .update(filteredUpdates)
      .eq('id', userId)
      .select('id, email, full_name, last_login, created_at')

    if (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
    return data[0]
  }
}