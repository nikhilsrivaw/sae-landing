import React, { useState } from 'react';
import { adminAuthService } from '../lib/adminAuth';

const AdminLogin = ({ onLoginSuccess, onCancel }) => {
  console.log('🔐 AdminLogin component mounted');

  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await adminAuthService.login(credentials.username, credentials.password);

      if (result.success) {
        onLoginSuccess(result.adminData);
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '20px',
        padding: '2.5rem',
        minWidth: '400px',
        maxWidth: '500px',
        width: '90%'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '0.5rem'
          }}>Admin Access</h2>
          <p style={{ color: '#aaa', fontSize: '0.875rem' }}>Please enter your admin credentials</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Error Display */}
          {error && (
            <div style={{
              background: 'rgba(255, 71, 87, 0.1)',
              border: '1px solid #ff4757',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#ff4757',
              fontSize: '0.875rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Username Field */}
          <div>
            <label style={{ color: '#f0f0f0', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#2d2d2d',
                border: '2px solid #444',
                borderRadius: '12px',
                color: '#f0f0f0',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="Enter admin username"
              disabled={loading}
              autoComplete="username"
              autoFocus
            />
          </div>

          {/* Password Field */}
          <div>
            <label style={{ color: '#f0f0f0', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#2d2d2d',
                border: '2px solid #444',
                borderRadius: '12px',
                color: '#f0f0f0',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="Enter admin password"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                flex: 1,
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                border: '2px solid #444',
                background: '#2d2d2d',
                color: '#f0f0f0',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !credentials.username.trim() || !credentials.password.trim()}
              style={{
                flex: 1,
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              {loading ? 'Verifying...' : '🚀 Login'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #333'
        }}>
          <p style={{ color: '#888', fontSize: '0.75rem' }}>🔒 Secure admin authentication</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;