import React, { useState } from 'react';
import { supabaseService } from '../lib/supabase';

const GTASignup = ({ onSwitchToSignin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['email', 'password', 'confirmPassword', 'fullName'];

    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'REQUIRED FIELD';
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'INVALID EMAIL FORMAT';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'PASSWORD TOO SHORT (MIN 6 CHARS)';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'PASSWORDS DO NOT MATCH';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmissionError('');

    try {

      // Create user account in database
      const userData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName
      };

      const newUser = await supabaseService.createUser(userData);

      setShowSuccess(true);

      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
      });
      setErrors({});

      // Hide success message and switch to signin after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onSwitchToSignin();
      }, 3000);

    } catch (error) {
      console.error('Signup failed:', error);
      setSubmissionError(`Account creation failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      fontFamily: '"Courier New", "American Typewriter", monospace',
      background: `
        linear-gradient(145deg, #f4f1e8 0%, #ede8d8 25%, #f0ebe0 50%, #e8e3d3 75%, #f2ede5 100%),
        radial-gradient(circle at 20% 30%, rgba(139, 125, 107, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(160, 145, 125, 0.08) 0%, transparent 50%)
      `,
      border: '8px solid #2a2a2a',
      borderRadius: '0',
      boxShadow: `
        inset 0 0 50px rgba(0,0,0,0.1),
        0 0 0 2px #444,
        0 8px 32px rgba(0,0,0,0.3)
      `,
      position: 'relative',
      maxWidth: '600px',
      margin: '20px auto',
      padding: '40px',
      color: '#222',
      minHeight: '600px',
      overflow: 'hidden'
    },
    paperTexture: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.15,
      background: `
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 1px,
          rgba(0,0,0,0.03) 1px,
          rgba(0,0,0,0.03) 2px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 1px,
          rgba(0,0,0,0.02) 1px,
          rgba(0,0,0,0.02) 2px
        )
      `,
      pointerEvents: 'none'
    },
    stains: {
      position: 'absolute',
      top: '15%',
      right: '10%',
      width: '80px',
      height: '60px',
      background: 'radial-gradient(ellipse, rgba(101, 67, 33, 0.1) 0%, transparent 70%)',
      borderRadius: '50%'
    },
    stains2: {
      position: 'absolute',
      bottom: '20%',
      left: '5%',
      width: '120px',
      height: '40px',
      background: 'radial-gradient(ellipse, rgba(139, 69, 19, 0.08) 0%, transparent 70%)',
      borderRadius: '50%'
    },
    stapleLeft: {
      position: 'absolute',
      top: '30px',
      left: '80px',
      width: '12px',
      height: '12px',
      background: 'linear-gradient(45deg, #333 0%, #555 50%, #333 100%)',
      borderRadius: '50%',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)'
    },
    stapleRight: {
      position: 'absolute',
      top: '30px',
      right: '80px',
      width: '12px',
      height: '12px',
      background: 'linear-gradient(45deg, #333 0%, #555 50%, #333 100%)',
      borderRadius: '50%',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      position: 'relative',
      zIndex: 2
    },
    title: {
      fontFamily: '"Impact", "Arial Black", sans-serif',
      fontSize: '36px',
      fontWeight: '900',
      color: '#1a1a1a',
      textTransform: 'uppercase',
      letterSpacing: '3px',
      margin: '20px 0',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      lineHeight: '1.1'
    },
    logoSection: {
      background: 'linear-gradient(90deg, #2a2a2a 0%, #444 50%, #2a2a2a 100%)',
      color: '#fff',
      padding: '8px 20px',
      margin: '0 auto 20px',
      width: 'fit-content',
      fontFamily: '"Impact", sans-serif',
      fontSize: '16px',
      fontWeight: 'bold',
      letterSpacing: '2px',
      border: '3px solid #1a1a1a',
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
    },
    subtitle: {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#444',
      margin: '10px 0',
      fontWeight: 'bold'
    },
    inputGroup: {
      marginBottom: '20px',
      position: 'relative',
      zIndex: 2
    },
    label: {
      display: 'block',
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '5px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      width: '100%',
      padding: '12px 5px',
      fontSize: '14px',
      fontFamily: '"Courier New", monospace',
      fontWeight: 'bold',
      color: '#222',
      background: 'transparent',
      border: 'none',
      borderBottom: '2px dotted #444',
      borderRadius: '0',
      outline: 'none',
      transition: 'border-bottom 0.3s ease',
      lineHeight: '1.4'
    },
    submitButton: {
      fontFamily: '"Impact", sans-serif',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#fff',
      background: 'linear-gradient(45deg, #8B0000 0%, #A0522D 50%, #8B0000 100%)',
      border: '4px solid #2a2a2a',
      padding: '15px 40px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      display: 'block',
      margin: '30px auto 20px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
      position: 'relative',
      overflow: 'hidden',
      width: '100%'
    },
    switchButton: {
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      color: '#666',
      background: 'transparent',
      border: 'none',
      textDecoration: 'underline',
      cursor: 'pointer',
      textAlign: 'center',
      display: 'block',
      margin: '0 auto',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    successMessage: {
      background: 'linear-gradient(45deg, #006400 0%, #228B22 50%, #006400 100%)',
      color: '#fff',
      padding: '20px',
      margin: '20px 0',
      border: '3px solid #2a2a2a',
      fontFamily: '"Impact", sans-serif',
      fontSize: '16px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      textAlign: 'center',
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
    },
    errorMessage: {
      background: 'linear-gradient(45deg, #cc0000 0%, #ff3333 50%, #cc0000 100%)',
      color: '#fff',
      padding: '15px',
      margin: '15px 0',
      border: '3px solid #2a2a2a',
      fontFamily: '"Impact", sans-serif',
      fontSize: '14px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      textAlign: 'center',
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
    },
    errorText: {
      color: '#cc0000',
      fontSize: '11px',
      fontWeight: 'bold',
      marginTop: '3px',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase'
    }
  };

  return (
    <div style={styles.container}>
      {/* Paper texture overlay */}
      <div style={styles.paperTexture}></div>

      {/* Stains */}
      <div style={styles.stains}></div>
      <div style={styles.stains2}></div>

      {/* Staples */}
      <div style={styles.stapleLeft}></div>
      <div style={styles.stapleRight}></div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoSection}>
          LOS SANTOS COUNTY SHERIFF'S DEPARTMENT
        </div>
        <h1 style={styles.title}>CITIZEN REGISTRATION</h1>
        <div style={styles.subtitle}>
          LIFEINVADER WEB FORM PRINT-OUT - NEW CITIZEN ACCOUNT
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Success Message */}
        {showSuccess && (
          <div style={styles.successMessage}>
            ✅ ACCOUNT CREATED SUCCESSFULLY!
            <br/>
            REDIRECTING TO SIGN IN...
          </div>
        )}

        {/* Error Message */}
        {submissionError && (
          <div style={styles.errorMessage}>
            ❌ {submissionError}
          </div>
        )}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name *</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            style={{
              ...styles.input,
              ...(errors.fullName && { borderBottom: '2px wavy #cc0000', background: 'rgba(204, 0, 0, 0.05)' })
            }}
            onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
            onBlur={(e) => e.target.style.borderBottom = errors.fullName ? '2px wavy #cc0000' : '2px dotted #444'}
            required
          />
          {errors.fullName && <div style={styles.errorText}>{errors.fullName}</div>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            style={{
              ...styles.input,
              ...(errors.email && { borderBottom: '2px wavy #cc0000', background: 'rgba(204, 0, 0, 0.05)' })
            }}
            onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
            onBlur={(e) => e.target.style.borderBottom = errors.email ? '2px wavy #cc0000' : '2px dotted #444'}
            required
          />
          {errors.email && <div style={styles.errorText}>{errors.email}</div>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password *</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            style={{
              ...styles.input,
              ...(errors.password && { borderBottom: '2px wavy #cc0000', background: 'rgba(204, 0, 0, 0.05)' })
            }}
            onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
            onBlur={(e) => e.target.style.borderBottom = errors.password ? '2px wavy #cc0000' : '2px dotted #444'}
            required
          />
          {errors.password && <div style={styles.errorText}>{errors.password}</div>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Confirm Password *</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            style={{
              ...styles.input,
              ...(errors.confirmPassword && { borderBottom: '2px wavy #cc0000', background: 'rgba(204, 0, 0, 0.05)' })
            }}
            onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
            onBlur={(e) => e.target.style.borderBottom = errors.confirmPassword ? '2px wavy #cc0000' : '2px dotted #444'}
            required
          />
          {errors.confirmPassword && <div style={styles.errorText}>{errors.confirmPassword}</div>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={styles.submitButton}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.target.style.background = 'linear-gradient(45deg, #A0522D 0%, #CD853F 50%, #A0522D 100%)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.target.style.background = 'linear-gradient(45deg, #8B0000 0%, #A0522D 50%, #8B0000 100%)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
            }
          }}
        >
          {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
        </button>

        {/* Switch to Sign In */}
        <button
          type="button"
          onClick={onSwitchToSignin}
          style={styles.switchButton}
        >
          Already have an account? SIGN IN
        </button>
      </form>
    </div>
  );
};

export default GTASignup;