import React, { useState } from 'react';
import { supabaseService } from '../lib/supabase';

const GTASignin = ({ onSwitchToSignup, onSigninSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submissionError, setSubmissionError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    dateOfBirth: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotPasswordErrors, setForgotPasswordErrors] = useState({});
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: verify, 2: reset
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['email', 'password'];

    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'REQUIRED FIELD';
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'INVALID EMAIL FORMAT';
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

      // Authenticate user with database
      const authenticatedUser = await supabaseService.authenticateUser(
        formData.email,
        formData.password
      );


      // Reset form
      setFormData({
        email: '',
        password: ''
      });
      setErrors({});

      // Call success callback with authenticated user data
      if (onSigninSuccess) {
        onSigninSuccess(authenticatedUser);
      }

    } catch (error) {
      console.error('Signin failed:', error);
      setSubmissionError(`Login failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordInputChange = (field, value) => {
    setForgotPasswordData(prev => ({ ...prev, [field]: value }));
    if (forgotPasswordErrors[field]) {
      setForgotPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForgotPasswordStep1 = () => {
    const newErrors = {};
    if (!forgotPasswordData.email.trim()) {
      newErrors.email = 'REQUIRED FIELD';
    } else if (!/\S+@\S+\.\S+/.test(forgotPasswordData.email)) {
      newErrors.email = 'INVALID EMAIL FORMAT';
    }
    if (!forgotPasswordData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'REQUIRED FIELD';
    }
    setForgotPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotPasswordStep2 = () => {
    const newErrors = {};
    if (!forgotPasswordData.newPassword.trim()) {
      newErrors.newPassword = 'REQUIRED FIELD';
    } else if (forgotPasswordData.newPassword.length < 6) {
      newErrors.newPassword = 'PASSWORD TOO SHORT (MIN 6 CHARS)';
    }
    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      newErrors.confirmPassword = 'PASSWORDS DO NOT MATCH';
    }
    setForgotPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyUser = async () => {
    if (!validateForgotPasswordStep1()) return;

    setIsResettingPassword(true);
    try {
      const isVerified = await supabaseService.verifyUserForPasswordReset(
        forgotPasswordData.email,
        forgotPasswordData.dateOfBirth
      );

      if (isVerified) {
        setForgotPasswordStep(2);
        setForgotPasswordErrors({});
      } else {
        setForgotPasswordErrors({ verify: 'EMAIL AND DATE OF BIRTH DO NOT MATCH' });
      }
    } catch (error) {
      console.error('User verification failed:', error);
      setForgotPasswordErrors({ verify: 'VERIFICATION FAILED. PLEASE TRY AGAIN.' });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateForgotPasswordStep2()) return;

    setIsResettingPassword(true);
    try {
      await supabaseService.resetPassword(
        forgotPasswordData.email,
        forgotPasswordData.newPassword
      );

      // Success - close modal and show success message
      setShowForgotPassword(false);
      setForgotPasswordStep(1);
      setForgotPasswordData({
        email: '',
        dateOfBirth: '',
        newPassword: '',
        confirmPassword: ''
      });
      setForgotPasswordErrors({});
      setSubmissionError('Password reset successful! Please sign in with your new password.');
    } catch (error) {
      console.error('Password reset failed:', error);
      setForgotPasswordErrors({ reset: 'PASSWORD RESET FAILED. PLEASE TRY AGAIN.' });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep(1);
    setForgotPasswordData({
      email: '',
      dateOfBirth: '',
      newPassword: '',
      confirmPassword: ''
    });
    setForgotPasswordErrors({});
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
      minHeight: '500px',
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
      marginBottom: '25px',
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
      background: 'linear-gradient(45deg, #4a90e2 0%, #357abd 50%, #4a90e2 100%)',
      border: '4px solid #2a2a2a',
      padding: '15px 40px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      display: 'block',
      margin: '40px auto 20px',
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
    },
    forgotPassword: {
      fontFamily: '"Courier New", monospace',
      fontSize: '11px',
      color: '#888',
      textAlign: 'center',
      marginBottom: '20px',
      fontStyle: 'italic'
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
        <h1 style={styles.title}>CITIZEN LOGIN</h1>
        <div style={styles.subtitle}>
          LIFEINVADER WEB FORM PRINT-OUT - RETURNING CITIZEN ACCESS
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Error Message */}
        {submissionError && (
          <div style={styles.errorMessage}>
            ❌ {submissionError}
          </div>
        )}

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

        <div style={styles.forgotPassword}>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontFamily: '"Courier New", monospace',
              fontSize: '11px',
              fontStyle: 'italic'
            }}
          >
            Forgot Password? Click here to reset
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={styles.submitButton}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.target.style.background = 'linear-gradient(45deg, #5ba0f2 0%, #4a90e2 50%, #357abd 100%)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.target.style.background = 'linear-gradient(45deg, #4a90e2 0%, #357abd 50%, #4a90e2 100%)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
            }
          }}
        >
          {isSubmitting ? 'ACCESSING ACCOUNT...' : 'SIGN IN'}
        </button>

        {/* Switch to Sign Up */}
        <button
          type="button"
          onClick={onSwitchToSignup}
          style={styles.switchButton}
        >
          Don't have an account? CREATE ACCOUNT
        </button>
      </form>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            ...styles.container,
            maxWidth: '500px',
            minHeight: 'auto',
            position: 'relative'
          }}>
            {/* Close button */}
            <button
              onClick={closeForgotPasswordModal}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#cc0000',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>

            {/* Paper texture overlay */}
            <div style={styles.paperTexture}></div>
            <div style={styles.stains}></div>
            <div style={styles.stains2}></div>
            <div style={styles.stapleLeft}></div>
            <div style={styles.stapleRight}></div>

            <div style={styles.header}>
              <div style={styles.logoSection}>
                LOS SANTOS COUNTY SHERIFF'S DEPARTMENT
              </div>
              <h1 style={{...styles.title, fontSize: '28px'}}>PASSWORD RESET</h1>
              <div style={styles.subtitle}>
                {forgotPasswordStep === 1 ? 'VERIFY IDENTITY' : 'SET NEW PASSWORD'}
              </div>
            </div>

            {forgotPasswordStep === 1 ? (
              <div>
                {/* Error Messages */}
                {forgotPasswordErrors.verify && (
                  <div style={styles.errorMessage}>
                    ❌ {forgotPasswordErrors.verify}
                  </div>
                )}

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address *</label>
                  <input
                    type="email"
                    value={forgotPasswordData.email}
                    onChange={(e) => handleForgotPasswordInputChange('email', e.target.value)}
                    style={{
                      ...styles.input,
                      ...(forgotPasswordErrors.email && { borderBottom: '2px wavy #cc0000', background: 'rgba(204, 0, 0, 0.05)' })
                    }}
                    onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
                    onBlur={(e) => e.target.style.borderBottom = forgotPasswordErrors.email ? '2px wavy #cc0000' : '2px dotted #444'}
                    required
                  />
                  {forgotPasswordErrors.email && <div style={styles.errorText}>{forgotPasswordErrors.email}</div>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Date of Birth *</label>
                  <input
                    type="date"
                    value={forgotPasswordData.dateOfBirth}
                    onChange={(e) => handleForgotPasswordInputChange('dateOfBirth', e.target.value)}
                    style={{
                      ...styles.input,
                      ...(forgotPasswordErrors.dateOfBirth && { borderBottom: '2px wavy #cc0000', background: 'rgba(204, 0, 0, 0.05)' })
                    }}
                    onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
                    onBlur={(e) => e.target.style.borderBottom = forgotPasswordErrors.dateOfBirth ? '2px wavy #cc0000' : '2px dotted #444'}
                    required
                  />
                  {forgotPasswordErrors.dateOfBirth && <div style={styles.errorText}>{forgotPasswordErrors.dateOfBirth}</div>}
                </div>

                <button
                  onClick={handleVerifyUser}
                  disabled={isResettingPassword}
                  style={{
                    ...styles.submitButton,
                    background: 'linear-gradient(45deg, #8B0000 0%, #A0522D 50%, #8B0000 100%)'
                  }}
                >
                  {isResettingPassword ? 'VERIFYING...' : 'VERIFY IDENTITY'}
                </button>
              </div>
            ) : (
              <div>
                {/* Error Messages */}
                {forgotPasswordErrors.reset && (
                  <div style={styles.errorMessage}>
                    ❌ {forgotPasswordErrors.reset}
                  </div>
                )}

                <div style={styles.inputGroup}>
                  <label style={styles.label}>New Password *</label>
                  <input
                    type="password"
                    value={forgotPasswordData.newPassword}
                    onChange={(e) => handleForgotPasswordInputChange('newPassword', e.target.value)}
                    style={{
                      ...styles.input,
                      ...(forgotPasswordErrors.newPassword && { borderBottom: '2px wavy #cc0000', background: 'rgba(204, 0, 0, 0.05)' })
                    }}
                    onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
                    onBlur={(e) => e.target.style.borderBottom = forgotPasswordErrors.newPassword ? '2px wavy #cc0000' : '2px dotted #444'}
                    required
                  />
                  {forgotPasswordErrors.newPassword && <div style={styles.errorText}>{forgotPasswordErrors.newPassword}</div>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirm New Password *</label>
                  <input
                    type="password"
                    value={forgotPasswordData.confirmPassword}
                    onChange={(e) => handleForgotPasswordInputChange('confirmPassword', e.target.value)}
                    style={{
                      ...styles.input,
                      ...(forgotPasswordErrors.confirmPassword && { borderBottom: '2px wavy #cc0000', background: 'rgba(204, 0, 0, 0.05)' })
                    }}
                    onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
                    onBlur={(e) => e.target.style.borderBottom = forgotPasswordErrors.confirmPassword ? '2px wavy #cc0000' : '2px dotted #444'}
                    required
                  />
                  {forgotPasswordErrors.confirmPassword && <div style={styles.errorText}>{forgotPasswordErrors.confirmPassword}</div>}
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={isResettingPassword}
                  style={{
                    ...styles.submitButton,
                    background: 'linear-gradient(45deg, #006400 0%, #228B22 50%, #006400 100%)'
                  }}
                >
                  {isResettingPassword ? 'RESETTING...' : 'RESET PASSWORD'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GTASignin;