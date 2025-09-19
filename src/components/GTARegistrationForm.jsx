import React, { useState } from 'react';
import { supabaseService } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const GTARegistrationForm = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    leaderRoll: '',
    leaderBranch: '',
    member1Name: '',
    member1Roll: '',
    member1Branch: '',
    member2Name: '',
    member2Roll: '',
    member2Branch: '',
    member3Name: '',
    member3Roll: '',
    member3Branch: '',
    member4Name: '',
    member4Roll: '',
    member4Branch: '',
    paymentScreenshot: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [showStatusCheck, setShowStatusCheck] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const branches = [
    'Computer Science (CSE)',
    'Electronics (ECE)',
    'Mechanical (ME)',
    'Civil (CE)',
    'Electrical (EE)',
    'Information Technology (IT)',
    'Chemical Engineering',
    'Biotechnology',
    'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, paymentScreenshot: 'ONLY IMAGE FILES ALLOWED' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, paymentScreenshot: 'FILE TOO LARGE (MAX 5MB)' }));
        return;
      }

      setFormData(prev => ({ ...prev, paymentScreenshot: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);

      // Clear errors
      if (errors.paymentScreenshot) {
        setErrors(prev => ({ ...prev, paymentScreenshot: '' }));
      }
    }
  };

  const checkRegistrationStatus = async () => {
    if (!isAuthenticated || !user?.id) {
      setSubmissionError('You must be signed in to check registration status');
      return;
    }

    setStatusLoading(true);
    setSubmissionError('');

    try {
      const registration = await supabaseService.getUserRegistration(user.id);
      if (registration) {
        setRegistrationStatus(registration);
      } else {
        setSubmissionError('No registration found for your account');
        setRegistrationStatus(null);
      }
    } catch (err) {
      console.error('Registration status error:', err);
      setSubmissionError('Error checking registration status');
      setRegistrationStatus(null);
    } finally {
      setStatusLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['teamName', 'leaderName', 'leaderRoll', 'leaderBranch'];

    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'REQUIRED FIELD';
      }
    });

    // Validate payment screenshot
    if (!formData.paymentScreenshot) {
      newErrors.paymentScreenshot = 'PAYMENT PROOF REQUIRED';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Check if user is authenticated
    if (!isAuthenticated || !user?.id) {
      setSubmissionError('You must be signed in to submit a registration');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');

    try {
      // First, upload the payment screenshot
      console.log('🚀 Starting team registration process...');
      let paymentData = {};

      if (formData.paymentScreenshot) {
        console.log('📸 Uploading payment screenshot...');
        const uploadResult = await supabaseService.uploadPaymentScreenshot(
          formData.paymentScreenshot,
          formData.teamName
        );

        paymentData = {
          payment_screenshot_url: uploadResult.url,
          payment_screenshot_path: uploadResult.path
        };
        console.log('✅ Payment screenshot uploaded successfully');
      }

      // Prepare registration data
      const registrationData = {
        userId: user.id, // Link to authenticated user
        ...formData,
        ...paymentData
      };

      // Remove the file object as it's not needed for database storage
      delete registrationData.paymentScreenshot;

      console.log('💾 Saving registration to database...');

      // Save to database
      const result = await supabaseService.createTeamRegistration(registrationData);

      console.log('✅ Registration saved successfully:', result);

      // Show success message
      setShowSuccess(true);

      // Reset form
      setFormData({
        teamName: '', leaderName: '', leaderRoll: '', leaderBranch: '',
        member1Name: '', member1Roll: '', member1Branch: '',
        member2Name: '', member2Roll: '', member2Branch: '',
        member3Name: '', member3Roll: '', member3Branch: '',
        member4Name: '', member4Roll: '', member4Branch: '',
        paymentScreenshot: null
      });
      setPreviewImage(null);
      setErrors({});

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);

    } catch (error) {
      console.error('❌ Registration submission failed:', error);
      setSubmissionError(`Registration failed: ${error.message}`);
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
      maxWidth: '850px',
      margin: '20px auto',
      padding: '40px',
      color: '#222',
      minHeight: '800px',
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
      fontSize: '42px',
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
    formSection: {
      marginBottom: '25px',
      position: 'relative',
      zIndex: 2
    },
    sectionTitle: {
      fontFamily: '"Impact", sans-serif',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#2a2a2a',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '15px',
      borderBottom: '2px solid #444',
      paddingBottom: '5px'
    },
    inputGroup: {
      marginBottom: '20px'
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
      padding: '8px 5px',
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
    inputFocus: {
      borderBottom: '2px solid #ff9900'
    },
    inputError: {
      borderBottom: '2px wavy #cc0000',
      background: 'rgba(204, 0, 0, 0.05)'
    },
    select: {
      width: '100%',
      padding: '8px 5px',
      fontSize: '14px',
      fontFamily: '"Courier New", monospace',
      fontWeight: 'bold',
      color: '#222',
      background: 'transparent',
      border: 'none',
      borderBottom: '2px dotted #444',
      borderRadius: '0',
      outline: 'none',
      appearance: 'none',
      cursor: 'pointer'
    },
    memberGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '20px',
      marginTop: '15px'
    },
    memberBox: {
      border: '2px solid #666',
      padding: '15px',
      background: 'rgba(255, 255, 255, 0.3)',
      position: 'relative'
    },
    memberTitle: {
      fontFamily: '"Impact", sans-serif',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#2a2a2a',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '10px',
      textAlign: 'center',
      background: '#f4f1e8',
      padding: '5px',
      border: '1px solid #888'
    },
    submitButton: {
      fontFamily: '"Impact", sans-serif',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#fff',
      background: 'linear-gradient(45deg, #8B0000 0%, #A0522D 50%, #8B0000 100%)',
      border: '4px solid #2a2a2a',
      padding: '15px 40px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      display: 'block',
      margin: '30px auto 0',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
      position: 'relative',
      overflow: 'hidden'
    },
    submitButtonHover: {
      background: 'linear-gradient(45deg, #A0522D 0%, #CD853F 50%, #A0522D 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
    },
    smallPrint: {
      fontSize: '7px',
      color: '#666',
      lineHeight: '1.2',
      marginTop: '30px',
      padding: '10px',
      border: '1px solid #ccc',
      background: 'rgba(255, 255, 255, 0.5)',
      fontFamily: '"Times New Roman", serif',
      position: 'relative',
      zIndex: 2
    },
    errorText: {
      color: '#cc0000',
      fontSize: '11px',
      fontWeight: 'bold',
      marginTop: '3px',
      fontFamily: '"Courier New", monospace',
      textTransform: 'uppercase'
    },
    paymentSection: {
      border: '3px solid #8B0000',
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.1)',
      position: 'relative',
      marginTop: '25px'
    },
    paymentTitle: {
      fontFamily: '"Impact", sans-serif',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#8B0000',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      marginBottom: '15px',
      textAlign: 'center',
      background: '#f4f1e8',
      padding: '10px',
      border: '2px solid #8B0000',
      textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
    },
    paymentAmount: {
      fontFamily: '"Impact", sans-serif',
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#8B0000',
      textAlign: 'center',
      margin: '15px 0',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      letterSpacing: '3px'
    },
    fileUpload: {
      position: 'relative',
      marginTop: '15px'
    },
    fileInput: {
      position: 'absolute',
      opacity: 0,
      width: '100%',
      height: '100%',
      cursor: 'pointer'
    },
    fileLabel: {
      display: 'block',
      padding: '15px',
      background: 'linear-gradient(45deg, #666 0%, #888 50%, #666 100%)',
      color: '#fff',
      fontFamily: '"Impact", sans-serif',
      fontSize: '16px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      textAlign: 'center',
      border: '3px solid #2a2a2a',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
    },
    fileLabelHover: {
      background: 'linear-gradient(45deg, #888 0%, #aaa 50%, #888 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
    },
    preview: {
      marginTop: '15px',
      textAlign: 'center'
    },
    previewImage: {
      maxWidth: '300px',
      maxHeight: '200px',
      border: '3px solid #2a2a2a',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
    },
    paymentInfo: {
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      color: '#444',
      margin: '10px 0',
      fontWeight: 'bold',
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.5)',
      padding: '10px',
      border: '1px solid #888'
    },
    successMessage: {
      background: 'linear-gradient(45deg, #006400 0%, #228B22 50%, #006400 100%)',
      color: '#fff',
      padding: '20px',
      margin: '20px 0',
      border: '3px solid #2a2a2a',
      fontFamily: '"Impact", sans-serif',
      fontSize: '18px',
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
      fontSize: '16px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      textAlign: 'center',
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
    },
    statusCheckSection: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '2px solid #666',
      padding: '20px',
      marginBottom: '25px',
      position: 'relative'
    },
    statusCheckTitle: {
      fontFamily: '"Impact", sans-serif',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#2a2a2a',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '15px',
      textAlign: 'center',
      background: '#f4f1e8',
      padding: '8px',
      border: '2px solid #666'
    },
    statusCheckForm: {
      display: 'flex',
      gap: '15px',
      alignItems: 'end',
      marginBottom: '15px'
    },
    statusInput: {
      flex: 1,
      padding: '8px 5px',
      fontSize: '14px',
      fontFamily: '"Courier New", monospace',
      fontWeight: 'bold',
      color: '#222',
      background: 'transparent',
      border: 'none',
      borderBottom: '2px dotted #444',
      borderRadius: '0',
      outline: 'none'
    },
    statusButton: {
      fontFamily: '"Impact", sans-serif',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#fff',
      background: 'linear-gradient(45deg, #666 0%, #888 50%, #666 100%)',
      border: '3px solid #2a2a2a',
      padding: '8px 15px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    statusResult: {
      background: 'rgba(255, 255, 255, 0.5)',
      padding: '15px',
      border: '1px solid #888',
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: '#333'
    },
    toggleButton: {
      fontFamily: '"Impact", sans-serif',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#fff',
      background: 'linear-gradient(45deg, #4a90e2 0%, #357abd 50%, #4a90e2 100%)',
      border: '3px solid #2a2a2a',
      padding: '10px 20px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      margin: '0 auto 20px',
      display: 'block'
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
        <h1 style={styles.title}>EVENT REGISTRATION</h1>
        <div style={styles.subtitle}>
          LIFEINVADER WEB FORM PRINT-OUT - AUTOMOTIVE ENGINEERING CREW
        </div>
      </div>

      {/* Authentication Check */}
      {!isAuthenticated && (
        <div style={{
          background: 'linear-gradient(45deg, #ff6b6b 0%, #ee5a5a 50%, #ff6b6b 100%)',
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
          boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 2
        }}>
          ⚠️ YOU MUST BE SIGNED IN TO REGISTER
          <br/>
          <span style={{ fontSize: '14px', fontFamily: '"Courier New", monospace' }}>
            Please sign in using the button at the top of the page
          </span>
        </div>
      )}

      {/* Status Check Toggle */}
      <button
        type="button"
        onClick={() => setShowStatusCheck(!showStatusCheck)}
        style={styles.toggleButton}
      >
        {showStatusCheck ? 'NEW REGISTRATION' : 'ALREADY SUBMITTED? CHECK STATUS'}
      </button>

      {/* Status Check Section */}
      {showStatusCheck && (
        <div style={styles.statusCheckSection}>
          <div style={styles.statusCheckTitle}>Check Registration Status</div>

          {isAuthenticated ? (
            <div style={styles.statusCheckForm}>
              <div style={{
                fontFamily: '"Courier New", monospace',
                fontSize: '14px',
                color: '#444',
                marginBottom: '15px',
                fontWeight: 'bold'
              }}>
                Checking registration status for: <span style={{color: '#006400'}}>{user?.email}</span>
              </div>
              <button
                type="button"
                onClick={checkRegistrationStatus}
                disabled={statusLoading}
                style={styles.statusButton}
              >
                {statusLoading ? 'CHECKING...' : 'CHECK MY REGISTRATION STATUS'}
              </button>
            </div>
          ) : (
            <div style={{
              fontFamily: '"Courier New", monospace',
              fontSize: '14px',
              color: '#cc0000',
              fontWeight: 'bold',
              textAlign: 'center',
              padding: '20px'
            }}>
              ⚠️ YOU MUST BE SIGNED IN TO CHECK REGISTRATION STATUS
            </div>
          )}

          {registrationStatus && (
            <div style={styles.statusResult}>
              <strong>Team:</strong> {registrationStatus.team_name}<br/>
              <strong>Leader:</strong> {registrationStatus.leader_name}<br/>
              <strong>Email:</strong> {user?.email}<br/>
              <strong>Status:</strong> <span style={{
                color: registrationStatus.registration_status === 'verified' ? '#006400' :
                       registrationStatus.registration_status === 'rejected' ? '#cc0000' : '#ff8800',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {registrationStatus.registration_status === 'verified' ? '✅ VERIFIED - SEE YOU SOON!' :
                 registrationStatus.registration_status === 'rejected' ? '❌ REJECTED' :
                 '⏳ UNDER REVIEW'}
              </span><br/>
              <strong>Submitted:</strong> {new Date(registrationStatus.created_at).toLocaleDateString()}<br/>
              <strong>Payment Verified:</strong> {registrationStatus.payment_verified ? '✅ Yes' : '❌ Pending'}
            </div>
          )}
        </div>
      )}

      {!showStatusCheck && (
        <form onSubmit={handleSubmit}>
          {/* Success Message */}
          {showSuccess && (
            <div style={styles.successMessage}>
              ✅ REGISTRATION SUCCESSFUL! YOUR FORM IS UNDER REVIEW.
              <br/>
              YOU WILL BE NOTIFIED ONCE VERIFIED.
              <br/>
              <span style={{fontSize: '14px', fontFamily: '"Courier New", monospace'}}>
                USE "CHECK STATUS" TO VIEW YOUR REGISTRATION STATUS
              </span>
            </div>
          )}

          {/* Error Message */}
          {submissionError && (
            <div style={styles.errorMessage}>
              ❌ {submissionError}
            </div>
          )}

        {/* Team Information */}
        <div style={styles.formSection}>
          <div style={styles.sectionTitle}>Team Information</div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Team Name *</label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) => handleInputChange('teamName', e.target.value)}
              style={{
                ...styles.input,
                ...(errors.teamName && styles.inputError)
              }}
              onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
              onBlur={(e) => e.target.style.borderBottom = errors.teamName ? '2px wavy #cc0000' : '2px dotted #444'}
              required
            />
            {errors.teamName && <div style={styles.errorText}>{errors.teamName}</div>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Team Leader Name *</label>
            <input
              type="text"
              value={formData.leaderName}
              onChange={(e) => handleInputChange('leaderName', e.target.value)}
              style={{
                ...styles.input,
                ...(errors.leaderName && styles.inputError)
              }}
              onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
              onBlur={(e) => e.target.style.borderBottom = errors.leaderName ? '2px wavy #cc0000' : '2px dotted #444'}
              required
            />
            {errors.leaderName && <div style={styles.errorText}>{errors.leaderName}</div>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Leader Roll Number *</label>
            <input
              type="text"
              value={formData.leaderRoll}
              onChange={(e) => handleInputChange('leaderRoll', e.target.value)}
              style={{
                ...styles.input,
                ...(errors.leaderRoll && styles.inputError)
              }}
              onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
              onBlur={(e) => e.target.style.borderBottom = errors.leaderRoll ? '2px wavy #cc0000' : '2px dotted #444'}
              required
            />
            {errors.leaderRoll && <div style={styles.errorText}>{errors.leaderRoll}</div>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Leader Branch *</label>
            <select
              value={formData.leaderBranch}
              onChange={(e) => handleInputChange('leaderBranch', e.target.value)}
              style={{
                ...styles.select,
                ...(errors.leaderBranch && styles.inputError)
              }}
              onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
              onBlur={(e) => e.target.style.borderBottom = errors.leaderBranch ? '2px wavy #cc0000' : '2px dotted #444'}
              required
            >
              <option value="">SELECT BRANCH</option>
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            {errors.leaderBranch && <div style={styles.errorText}>{errors.leaderBranch}</div>}
          </div>
        </div>

        {/* Team Members */}
        <div style={styles.formSection}>
          <div style={styles.sectionTitle}>Team Members (Optional)</div>
          <div style={styles.memberGrid}>
            {[1, 2, 3, 4].map((memberNum) => (
              <div key={memberNum} style={styles.memberBox}>
                <div style={styles.memberTitle}>Member {memberNum}</div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    type="text"
                    value={formData[`member${memberNum}Name`]}
                    onChange={(e) => handleInputChange(`member${memberNum}Name`, e.target.value)}
                    style={styles.input}
                    onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
                    onBlur={(e) => e.target.style.borderBottom = '2px dotted #444'}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Roll Number</label>
                  <input
                    type="text"
                    value={formData[`member${memberNum}Roll`]}
                    onChange={(e) => handleInputChange(`member${memberNum}Roll`, e.target.value)}
                    style={styles.input}
                    onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
                    onBlur={(e) => e.target.style.borderBottom = '2px dotted #444'}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Branch</label>
                  <select
                    value={formData[`member${memberNum}Branch`]}
                    onChange={(e) => handleInputChange(`member${memberNum}Branch`, e.target.value)}
                    style={styles.select}
                    onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
                    onBlur={(e) => e.target.style.borderBottom = '2px dotted #444'}
                  >
                    <option value="">SELECT BRANCH</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Section */}
        <div style={styles.paymentSection}>
          <div style={styles.paymentTitle}>REGISTRATION FEE PAYMENT</div>

          <div style={styles.paymentAmount}>₹4,000</div>

          <div style={styles.paymentInfo}>
            PAYMENT MUST BE MADE BEFORE REGISTRATION COMPLETION.<br/>
            UPI ID: sae@losantos
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Upload Payment Screenshot *</label>
            <div style={styles.fileUpload}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={styles.fileInput}
                id="paymentScreenshot"
              />
              <label
                htmlFor="paymentScreenshot"
                style={styles.fileLabel}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.fileLabelHover)}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(45deg, #666 0%, #888 50%, #666 100%)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {formData.paymentScreenshot ?
                  `UPLOADED: ${formData.paymentScreenshot.name}` :
                  'ATTACH PAYMENT PROOF'
                }
              </label>
            </div>

            {previewImage && (
              <div style={styles.preview}>
                <img
                  src={previewImage}
                  alt="Payment Screenshot Preview"
                  style={styles.previewImage}
                />
              </div>
            )}

            {errors.paymentScreenshot && (
              <div style={styles.errorText}>{errors.paymentScreenshot}</div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={styles.submitButton}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              Object.assign(e.target.style, styles.submitButtonHover);
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
          {isSubmitting ? 'PROCESSING...' : 'REGISTER TEAM'}
        </button>

        {/* Small Print */}
        <div style={styles.smallPrint}>
          <strong>TERMS & CONDITIONS:</strong> By submitting this form, you waive all rights to not be shot, stabbed,
          or run over during team activities. Participants may be subject to police harassment, random vehicle theft,
          and spontaneous gang warfare. Not responsible for lost limbs, stolen vehicles, or emotional trauma from
          repeated deaths. Team members acknowledge that Los Santos is a dangerous place and agree to respawn at
          nearest hospital upon expiration. Vehicle insurance not included. May contain traces of explosive materials.
          Side effects may include: reckless driving, increased aggression, and compulsive urge to steal motorcycles.
          This form was printed on recycled police reports. Los Santos County Sheriff's Department is not liable for
          any damages, physical or psychological, resulting from participation in automotive engineering activities
          within city limits. All team members must pass background check (criminal history preferred).
          Registration fee payable in cash, stolen goods, or equivalent street credibility.
        </div>
        </form>
      )}

      {/* Error Message for Status Check */}
      {showStatusCheck && submissionError && (
        <div style={styles.errorMessage}>
          ❌ {submissionError}
        </div>
      )}

    </div>
  );
};

export default GTARegistrationForm;