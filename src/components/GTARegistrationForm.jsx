import React, { useState, useEffect } from 'react';
import { supabaseService } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const GTARegistrationForm = ({ onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    leaderRoll: '',
    leaderBranch: '',
    leaderPhone: '',
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
  const [currentStep, setCurrentStep] = useState(1);
  const [stepTwoEnabled, setStepTwoEnabled] = useState(false);

  // Bank details state
  const [bankDetails, setBankDetails] = useState(null);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(true);

  const branches = [
    'Computer Science (CSE)',
    'Electronics (ECE)',
    'ECE-IoT',
    'Mechanical (ME)',
    'Civil (CE)',
    'Electrical (EE)',
    'Information Technology (IT)',
    'Chemical Engineering',
    'BBA',
    'B.Pharma',
    'Other'
  ];

  // Load bank details and check registration status on component mount
  useEffect(() => {
    const loadBankDetails = async () => {
      try {
        const details = await supabaseService.getBankDetails();
        setBankDetails(details);
      } catch (err) {
        console.error('Error loading bank details:', err);
        // Don't show error to user, just log it - form will show fallback message
      } finally {
        setBankDetailsLoading(false);
      }
    };

    const checkUserRegistrationStep = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const registration = await supabaseService.getUserRegistration(user.id);
          if (registration) {
            setRegistrationStatus(registration);
            // Determine which step user should be on
            if (registration.registration_status === 'pending' && !registration.payment_screenshot_url) {
              if (registration.step_2_enabled) {
                setCurrentStep(2); // User completed step 1, step 2 enabled, needs payment
                setStepTwoEnabled(true);
              } else {
                setCurrentStep(1); // Stay on step 1 until admin enables step 2
                setStepTwoEnabled(false);
              }
            } else if (registration.registration_status === 'pending' && registration.payment_screenshot_url) {
              setCurrentStep(3); // User completed payment, awaiting verification
            } else if (registration.registration_status === 'verified') {
              setCurrentStep(3); // User is fully verified
            }
          }
        } catch (err) {
          console.error('Error checking registration step:', err);
        }
      }
    };

    loadBankDetails();
    checkUserRegistrationStep();
  }, [isAuthenticated, user]);

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
    const requiredFields = ['teamName', 'leaderName', 'leaderRoll', 'leaderBranch', 'leaderPhone'];

    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'REQUIRED FIELD';
      }
    });

    // Phone number validation
    if (formData.leaderPhone && !/^[0-9]{10}$/.test(formData.leaderPhone)) {
      newErrors.leaderPhone = 'PHONE NUMBER MUST BE 10 DIGITS';
    }

    // Require at least Member 1 (minimum team size = 2)
    if (!formData.member1Name.trim()) {
      newErrors.member1Name = 'AT LEAST 1 TEAM MEMBER REQUIRED';
    }
    if (!formData.member1Roll.trim()) {
      newErrors.member1Roll = 'REQUIRED FIELD';
    }
    if (!formData.member1Branch.trim()) {
      newErrors.member1Branch = 'REQUIRED FIELD';
    }

    // Validate payment screenshot
    if (!formData.paymentScreenshot) {
      newErrors.paymentScreenshot = 'PAYMENT PROOF REQUIRED';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    const step1Fields = ['teamName', 'leaderName', 'leaderRoll', 'leaderBranch', 'leaderPhone'];
    const step1Errors = {};

    step1Fields.forEach(field => {
      if (!formData[field].trim()) {
        step1Errors[field] = 'REQUIRED FIELD';
      }
    });

    // Phone number validation
    if (formData.leaderPhone && !/^[0-9]{10}$/.test(formData.leaderPhone)) {
      step1Errors.leaderPhone = 'PHONE NUMBER MUST BE 10 DIGITS';
    }

    // Require at least Member 1 (minimum team size = 2)
    if (!formData.member1Name.trim()) {
      step1Errors.member1Name = 'AT LEAST 1 TEAM MEMBER REQUIRED';
    }
    if (!formData.member1Roll.trim()) {
      step1Errors.member1Roll = 'REQUIRED FIELD';
    }
    if (!formData.member1Branch.trim()) {
      step1Errors.member1Branch = 'REQUIRED FIELD';
    }

    setErrors(step1Errors);
    if (Object.keys(step1Errors).length > 0) return;

    if (!isAuthenticated || !user?.id) {
      setSubmissionError('You must be signed in to submit a registration');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');

    try {
      // Save step 1 data (team info only)
      const registrationData = {
        userId: user.id,
        teamName: formData.teamName,
        leaderName: formData.leaderName,
        leaderRoll: formData.leaderRoll,
        leaderBranch: formData.leaderBranch,
        leaderPhone: formData.leaderPhone,
        member1Name: formData.member1Name || null,
        member1Roll: formData.member1Roll || null,
        member1Branch: formData.member1Branch || null,
        member2Name: formData.member2Name || null,
        member2Roll: formData.member2Roll || null,
        member2Branch: formData.member2Branch || null,
        member3Name: formData.member3Name || null,
        member3Roll: formData.member3Roll || null,
        member3Branch: formData.member3Branch || null,
        member4Name: formData.member4Name || null,
        member4Roll: formData.member4Roll || null,
        member4Branch: formData.member4Branch || null,
        // No payment data in step 1
        payment_screenshot_url: null,
        payment_screenshot_path: null
      };

      const result = await supabaseService.createTeamRegistration(registrationData);
      setRegistrationStatus(result);
      // Stay on step 1 until admin enables step 2
      setCurrentStep(1);
      setStepTwoEnabled(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

    } catch (error) {
      console.error('Step 1 registration failed:', error);
      setSubmissionError(`Registration failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!formData.paymentScreenshot) {
      setErrors({paymentScreenshot: 'PAYMENT PROOF REQUIRED'});
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');

    try {
      // Upload payment screenshot
      const uploadResult = await supabaseService.uploadPaymentScreenshot(
        formData.paymentScreenshot,
        registrationStatus.team_name
      );

      // Update registration with payment info
      await supabaseService.updateTeamRegistrationPayment(registrationStatus.id, {
        payment_screenshot_url: uploadResult.url,
        payment_screenshot_path: uploadResult.path
      });

      // Update local state
      setRegistrationStatus({
        ...registrationStatus,
        payment_screenshot_url: uploadResult.url,
        payment_screenshot_path: uploadResult.path
      });

      setCurrentStep(3);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

    } catch (error) {
      console.error('Payment submission failed:', error);
      setSubmissionError(`Payment submission failed: ${error.message}`);
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
      border: window.innerWidth < 768 ? '3px solid #2a2a2a' : '8px solid #2a2a2a',
      borderRadius: '0',
      boxShadow: window.innerWidth < 768 ?
        'inset 0 0 30px rgba(0,0,0,0.08), 0 0 0 1px #444, 0 4px 16px rgba(0,0,0,0.2)' :
        'inset 0 0 50px rgba(0,0,0,0.1), 0 0 0 2px #444, 0 8px 32px rgba(0,0,0,0.3)',
      position: 'relative',
      maxWidth: window.innerWidth < 768 ? '100vw' : '850px',
      width: window.innerWidth < 768 ? '100%' : 'auto',
      margin: window.innerWidth < 768 ? '0' : '20px auto',
      padding: window.innerWidth < 768 ? '15px 10px' : '40px',
      color: '#222',
      minHeight: window.innerWidth < 768 ? 'auto' : '800px',
      overflow: window.innerWidth < 768 ? 'visible' : 'hidden'
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
      fontSize: window.innerWidth < 768 ? '20px' : window.innerWidth < 1024 ? '32px' : '42px',
      fontWeight: '900',
      color: '#1a1a1a',
      textTransform: 'uppercase',
      letterSpacing: window.innerWidth < 768 ? '0.5px' : window.innerWidth < 1024 ? '2px' : '3px',
      margin: window.innerWidth < 768 ? '10px 0' : '20px 0',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      lineHeight: window.innerWidth < 768 ? '1.2' : '1.1',
      textAlign: 'center',
      wordWrap: 'break-word'
    },
    logoSection: {
      background: 'linear-gradient(90deg, #2a2a2a 0%, #444 50%, #2a2a2a 100%)',
      color: '#fff',
      padding: window.innerWidth < 768 ? '6px 12px' : '8px 20px',
      margin: '0 auto 20px',
      width: 'fit-content',
      maxWidth: window.innerWidth < 768 ? '90%' : 'auto',
      fontFamily: '"Impact", sans-serif',
      fontSize: window.innerWidth < 768 ? '12px' : '16px',
      fontWeight: 'bold',
      letterSpacing: window.innerWidth < 768 ? '1px' : '2px',
      border: window.innerWidth < 768 ? '2px solid #1a1a1a' : '3px solid #1a1a1a',
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
      textAlign: 'center',
      lineHeight: '1.2'
    },
    subtitle: {
      fontFamily: '"Courier New", monospace',
      fontSize: window.innerWidth < 768 ? '11px' : '14px',
      color: '#444',
      margin: '10px 0',
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: '1.4',
      padding: window.innerWidth < 768 ? '0 5px' : '0'
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
      marginBottom: window.innerWidth < 768 ? '15px' : '20px'
    },
    label: {
      display: 'block',
      fontFamily: '"Courier New", monospace',
      fontSize: window.innerWidth < 768 ? '12px' : '13px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: window.innerWidth < 768 ? '8px' : '5px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      width: '100%',
      padding: window.innerWidth < 768 ? '14px 8px' : '8px 5px',
      fontSize: window.innerWidth < 768 ? '16px' : '14px',
      fontFamily: '"Courier New", monospace',
      fontWeight: 'bold',
      color: '#222',
      background: 'transparent',
      border: 'none',
      borderBottom: window.innerWidth < 768 ? '2px solid #666' : '2px dotted #444',
      borderRadius: '0',
      outline: 'none',
      transition: 'border-bottom 0.3s ease',
      lineHeight: '1.4',
      boxSizing: 'border-box'
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
      padding: window.innerWidth < 768 ? '14px 8px' : '8px 5px',
      fontSize: window.innerWidth < 768 ? '16px' : '14px',
      fontFamily: '"Courier New", monospace',
      fontWeight: 'bold',
      color: '#222',
      background: 'transparent',
      border: 'none',
      borderBottom: window.innerWidth < 768 ? '2px solid #666' : '2px dotted #444',
      borderRadius: '0',
      outline: 'none',
      appearance: 'none',
      cursor: 'pointer',
      boxSizing: 'border-box'
    },
    memberGrid: {
      display: 'grid',
      gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: window.innerWidth < 768 ? '15px' : '20px',
      marginTop: '15px'
    },
    memberBox: {
      border: window.innerWidth < 768 ? '2px solid #666' : '2px solid #666',
      padding: window.innerWidth < 768 ? '12px' : '15px',
      background: 'rgba(255, 255, 255, 0.3)',
      position: 'relative'
    },
    memberTitle: {
      fontFamily: '"Impact", sans-serif',
      fontSize: window.innerWidth < 768 ? '13px' : '14px',
      fontWeight: 'bold',
      color: '#2a2a2a',
      textTransform: 'uppercase',
      letterSpacing: window.innerWidth < 768 ? '0.5px' : '1px',
      marginBottom: window.innerWidth < 768 ? '8px' : '10px',
      textAlign: 'center',
      background: '#f4f1e8',
      padding: window.innerWidth < 768 ? '4px' : '5px',
      border: '1px solid #888'
    },
    submitButton: {
      fontFamily: '"Impact", sans-serif',
      fontSize: window.innerWidth < 768 ? '16px' : '24px',
      fontWeight: 'bold',
      color: '#fff',
      background: 'linear-gradient(45deg, #8B0000 0%, #A0522D 50%, #8B0000 100%)',
      border: window.innerWidth < 768 ? '3px solid #2a2a2a' : '4px solid #2a2a2a',
      padding: window.innerWidth < 768 ? '14px 20px' : '15px 40px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: window.innerWidth < 768 ? '0.5px' : '2px',
      display: 'block',
      margin: '30px auto 0',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
      position: 'relative',
      overflow: 'hidden',
      width: window.innerWidth < 768 ? 'calc(100% - 20px)' : 'auto',
      maxWidth: window.innerWidth < 768 ? '300px' : 'auto',
      lineHeight: '1.4',
      textAlign: 'center'
    },
    submitButtonHover: {
      background: 'linear-gradient(45deg, #A0522D 0%, #CD853F 50%, #A0522D 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
    },
    smallPrint: {
      fontSize: window.innerWidth < 768 ? '8px' : '7px',
      color: '#666',
      lineHeight: window.innerWidth < 768 ? '1.3' : '1.2',
      marginTop: window.innerWidth < 768 ? '25px' : '30px',
      padding: window.innerWidth < 768 ? '8px' : '10px',
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
      border: window.innerWidth < 768 ? '2px solid #8B0000' : '3px solid #8B0000',
      padding: window.innerWidth < 768 ? '15px' : '20px',
      background: 'rgba(255, 255, 255, 0.1)',
      position: 'relative',
      marginTop: window.innerWidth < 768 ? '20px' : '25px'
    },
    paymentTitle: {
      fontFamily: '"Impact", sans-serif',
      fontSize: window.innerWidth < 768 ? '16px' : '20px',
      fontWeight: 'bold',
      color: '#8B0000',
      textTransform: 'uppercase',
      letterSpacing: window.innerWidth < 768 ? '1px' : '2px',
      marginBottom: window.innerWidth < 768 ? '12px' : '15px',
      textAlign: 'center',
      background: '#f4f1e8',
      padding: window.innerWidth < 768 ? '8px' : '10px',
      border: window.innerWidth < 768 ? '2px solid #8B0000' : '2px solid #8B0000',
      textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
      lineHeight: '1.3'
    },
    paymentAmount: {
      fontFamily: '"Impact", sans-serif',
      fontSize: window.innerWidth < 768 ? '24px' : '32px',
      fontWeight: 'bold',
      color: '#8B0000',
      textAlign: 'center',
      margin: window.innerWidth < 768 ? '12px 0' : '15px 0',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      letterSpacing: window.innerWidth < 768 ? '2px' : '3px'
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
      maxWidth: window.innerWidth < 768 ? '100%' : '300px',
      maxHeight: window.innerWidth < 768 ? '150px' : '200px',
      border: window.innerWidth < 768 ? '2px solid #2a2a2a' : '3px solid #2a2a2a',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      width: window.innerWidth < 768 ? 'auto' : 'auto'
    },
    paymentInfo: {
      fontFamily: '"Courier New", monospace',
      fontSize: window.innerWidth < 768 ? '11px' : '12px',
      color: '#444',
      margin: '10px 0',
      fontWeight: 'bold',
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.5)',
      padding: window.innerWidth < 768 ? '8px' : '10px',
      border: '1px solid #888',
      lineHeight: '1.4'
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
      fontSize: window.innerWidth < 768 ? '13px' : '14px',
      fontWeight: 'bold',
      color: '#fff',
      background: 'linear-gradient(45deg, #4a90e2 0%, #357abd 50%, #4a90e2 100%)',
      border: window.innerWidth < 768 ? '2px solid #2a2a2a' : '3px solid #2a2a2a',
      padding: window.innerWidth < 768 ? '12px 16px' : '10px 20px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: window.innerWidth < 768 ? '0.5px' : '1px',
      margin: '0 auto 20px',
      display: 'block',
      width: window.innerWidth < 768 ? 'calc(100% - 20px)' : 'auto',
      maxWidth: window.innerWidth < 768 ? '280px' : 'auto',
      textAlign: 'center'
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
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: window.innerWidth < 768 ? '10px' : '15px',
              right: window.innerWidth < 768 ? '10px' : '15px',
              background: 'rgba(139, 0, 0, 0.8)',
              border: '2px solid #fff',
              color: '#fff',
              width: window.innerWidth < 768 ? '35px' : '40px',
              height: window.innerWidth < 768 ? '35px' : '40px',
              borderRadius: '50%',
              fontSize: window.innerWidth < 768 ? '18px' : '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              fontFamily: '"Impact", sans-serif',
              zIndex: 10,
              lineHeight: '1'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(139, 0, 0, 1)';
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(139, 0, 0, 0.8)';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
            title="Close Registration Form"
          >
            ×
          </button>
        )}

        <div style={styles.logoSection}>
          LOS SANTOS COUNTY SHERIFF'S DEPARTMENT
        </div>
        <h1 style={styles.title}>EVENT REGISTRATION</h1>
        <div style={styles.subtitle}>
          LIFEINVADER WEB FORM PRINT-OUT - AUTOMOTIVE ENGINEERING CREW
        </div>

        {/* Step Progress Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: window.innerWidth < 768 ? '0.5rem' : '1rem',
          margin: '20px 0',
          padding: window.innerWidth < 768 ? '12px 8px' : '15px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: window.innerWidth < 768 ? '2px solid #8B0000' : '2px solid #8B0000',
          borderRadius: '8px',
          flexWrap: window.innerWidth < 768 ? 'wrap' : 'nowrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: currentStep >= 1 ? '#006400' : '#666',
            fontWeight: 'bold',
            fontSize: window.innerWidth < 768 ? '11px' : '14px',
            flexShrink: 0
          }}>
            <span style={{
              display: 'inline-block',
              width: window.innerWidth < 768 ? '20px' : '24px',
              height: window.innerWidth < 768 ? '20px' : '24px',
              borderRadius: '50%',
              background: currentStep >= 1 ? '#006400' : '#666',
              color: 'white',
              textAlign: 'center',
              lineHeight: window.innerWidth < 768 ? '20px' : '24px',
              marginRight: window.innerWidth < 768 ? '6px' : '8px',
              fontSize: window.innerWidth < 768 ? '10px' : '12px'
            }}>1</span>
            {window.innerWidth < 768 ? 'TEAM' : 'TEAM REGISTRATION'}
          </div>

          <div style={{
            width: window.innerWidth < 768 ? '20px' : '30px',
            height: '2px',
            background: currentStep >= 2 ? '#006400' : '#666'
          }}></div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: currentStep >= 2 ? '#006400' : '#666',
            fontWeight: 'bold',
            fontSize: window.innerWidth < 768 ? '11px' : '14px',
            flexShrink: 0
          }}>
            <span style={{
              display: 'inline-block',
              width: window.innerWidth < 768 ? '20px' : '24px',
              height: window.innerWidth < 768 ? '20px' : '24px',
              borderRadius: '50%',
              background: currentStep >= 2 ? '#006400' : '#666',
              color: 'white',
              textAlign: 'center',
              lineHeight: window.innerWidth < 768 ? '20px' : '24px',
              marginRight: window.innerWidth < 768 ? '6px' : '8px',
              fontSize: window.innerWidth < 768 ? '10px' : '12px'
            }}>2</span>
            PAYMENT
          </div>

          <div style={{
            width: window.innerWidth < 768 ? '20px' : '30px',
            height: '2px',
            background: currentStep >= 3 ? '#006400' : '#666'
          }}></div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: currentStep >= 3 ? '#006400' : '#666',
            fontWeight: 'bold',
            fontSize: window.innerWidth < 768 ? '11px' : '14px',
            flexShrink: 0
          }}>
            <span style={{
              display: 'inline-block',
              width: window.innerWidth < 768 ? '20px' : '24px',
              height: window.innerWidth < 768 ? '20px' : '24px',
              borderRadius: '50%',
              background: currentStep >= 3 ? '#006400' : '#666',
              color: 'white',
              textAlign: 'center',
              lineHeight: window.innerWidth < 768 ? '20px' : '24px',
              marginRight: window.innerWidth < 768 ? '6px' : '8px',
              fontSize: window.innerWidth < 768 ? '10px' : '12px'
            }}>3</span>
            {window.innerWidth < 768 ? 'VERIFY' : 'VERIFICATION'}
          </div>
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
        <div>
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

        {/* STEP 1: Team Registration */}
        {currentStep === 1 && !registrationStatus && (
          <form onSubmit={handleStep1Submit}>
            <div style={{
              ...styles.paymentSection,
              borderColor: '#006400',
              marginBottom: '25px'
            }}>
              <div style={{
                ...styles.paymentTitle,
                color: '#006400',
                borderColor: '#006400'
              }}>STEP 1: TEAM REGISTRATION</div>

              <div style={{
                ...styles.paymentInfo,
                color: '#006400'
              }}>
                Complete your team information to proceed to payment.
              </div>
            </div>

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

          <div style={styles.inputGroup}>
            <label style={styles.label}>Leader Phone Number *</label>
            <input
              type="tel"
              value={formData.leaderPhone}
              onChange={(e) => handleInputChange('leaderPhone', e.target.value)}
              style={{
                ...styles.input,
                ...(errors.leaderPhone && styles.inputError)
              }}
              onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
              onBlur={(e) => e.target.style.borderBottom = errors.leaderPhone ? '2px wavy #cc0000' : '2px dotted #444'}
              placeholder="Enter 10-digit phone number"
              required
            />
            {errors.leaderPhone && <div style={styles.errorText}>{errors.leaderPhone}</div>}
          </div>
        </div>

            {/* Team Members */}
            <div style={styles.formSection}>
              <div style={styles.sectionTitle}>Team Members (Minimum 1 Required)</div>
              <div style={styles.memberGrid}>
                {[1, 2, 3, 4].map((memberNum) => (
                  <div key={memberNum} style={styles.memberBox}>
                    <div style={styles.memberTitle}>
                      Member {memberNum}{memberNum === 1 ? ' *' : ''}
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        Full Name{memberNum === 1 ? ' *' : ''}
                      </label>
                      <input
                        type="text"
                        value={formData[`member${memberNum}Name`]}
                        onChange={(e) => handleInputChange(`member${memberNum}Name`, e.target.value)}
                        style={{
                          ...styles.input,
                          ...(errors[`member${memberNum}Name`] && styles.inputError)
                        }}
                        onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
                        onBlur={(e) => e.target.style.borderBottom = errors[`member${memberNum}Name`] ? '2px wavy #cc0000' : '2px dotted #444'}
                        required={memberNum === 1}
                      />
                      {errors[`member${memberNum}Name`] && <div style={styles.errorText}>{errors[`member${memberNum}Name`]}</div>}
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        Roll Number{memberNum === 1 ? ' *' : ''}
                      </label>
                      <input
                        type="text"
                        value={formData[`member${memberNum}Roll`]}
                        onChange={(e) => handleInputChange(`member${memberNum}Roll`, e.target.value)}
                        style={{
                          ...styles.input,
                          ...(errors[`member${memberNum}Roll`] && styles.inputError)
                        }}
                        onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
                        onBlur={(e) => e.target.style.borderBottom = errors[`member${memberNum}Roll`] ? '2px wavy #cc0000' : '2px dotted #444'}
                        required={memberNum === 1}
                      />
                      {errors[`member${memberNum}Roll`] && <div style={styles.errorText}>{errors[`member${memberNum}Roll`]}</div>}
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>
                        Branch{memberNum === 1 ? ' *' : ''}
                      </label>
                      <select
                        value={formData[`member${memberNum}Branch`]}
                        onChange={(e) => handleInputChange(`member${memberNum}Branch`, e.target.value)}
                        style={{
                          ...styles.select,
                          ...(errors[`member${memberNum}Branch`] && styles.inputError)
                        }}
                        onFocus={(e) => e.target.style.borderBottom = '2px solid #ff9900'}
                        onBlur={(e) => e.target.style.borderBottom = errors[`member${memberNum}Branch`] ? '2px wavy #cc0000' : '2px dotted #444'}
                        required={memberNum === 1}
                      >
                        <option value="">SELECT BRANCH</option>
                        {branches.map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                      {errors[`member${memberNum}Branch`] && <div style={styles.errorText}>{errors[`member${memberNum}Branch`]}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button for Step 1 */}
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
              {isSubmitting ? 'REGISTERING TEAM...' : 'COMPLETE STEP 1 - REGISTER TEAM'}
            </button>
          </form>
        )}

        {/* Step 1 Completed - Waiting for Step 2 */}
        {currentStep === 1 && registrationStatus && !stepTwoEnabled && (
          <div>
            <div style={{
              ...styles.paymentSection,
              borderColor: '#ff8800',
              marginBottom: '25px'
            }}>
              <div style={{
                ...styles.paymentTitle,
                color: '#ff8800',
                borderColor: '#ff8800'
              }}>STEP 1 COMPLETED ✅</div>

              <div style={{
                ...styles.paymentInfo,
                color: '#ff8800'
              }}>
                Your team registration has been submitted successfully!<br/>
                Step 2 (Payment) will be available soon. We will notify you when payment is enabled.
              </div>
            </div>

            {/* WhatsApp Group Section */}
            <div style={{
              border: window.innerWidth < 768 ? '2px solid #666' : '3px solid #8B0000',
              padding: window.innerWidth < 768 ? '15px' : '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              position: 'relative',
              marginTop: window.innerWidth < 768 ? '20px' : '25px',
              marginBottom: '25px'
            }}>
              <div style={{
                fontFamily: '"Impact", sans-serif',
                fontSize: window.innerWidth < 768 ? '16px' : '18px',
                fontWeight: 'bold',
                color: '#2a2a2a',
                textTransform: 'uppercase',
                letterSpacing: window.innerWidth < 768 ? '1px' : '2px',
                marginBottom: window.innerWidth < 768 ? '12px' : '15px',
                textAlign: 'center',
                background: '#f4f1e8',
                padding: window.innerWidth < 768 ? '8px' : '10px',
                border: window.innerWidth < 768 ? '2px solid #8B0000' : '2px solid #8B0000',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                lineHeight: '1.3'
              }}>
                📱 COMMUNITY ACCESS
              </div>

              <div style={{
                fontFamily: '"Courier New", monospace',
                fontSize: window.innerWidth < 768 ? '11px' : '12px',
                color: '#444',
                margin: '10px 0',
                fontWeight: 'bold',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.5)',
                padding: window.innerWidth < 768 ? '8px' : '10px',
                border: '1px solid #888',
                lineHeight: '1.4'
              }}>
                CONNECT WITH OTHER CREWS AND RECEIVE OFFICIAL UPDATES
              </div>

              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <a
                  href="https://chat.whatsapp.com/IpaTpzKbKuVEnCnB81DvQV"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: '"Impact", sans-serif',
                    fontSize: window.innerWidth < 768 ? '14px' : '16px',
                    fontWeight: 'bold',
                    color: '#fff',
                    background: 'linear-gradient(45deg, #006400 0%, #228B22 50%, #006400 100%)',
                    border: window.innerWidth < 768 ? '3px solid #2a2a2a' : '4px solid #2a2a2a',
                    padding: window.innerWidth < 768 ? '12px 18px' : '15px 25px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: window.innerWidth < 768 ? '0.5px' : '1px',
                    display: 'inline-block',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    textDecoration: 'none',
                    borderRadius: '0'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(45deg, #228B22 0%, #32CD32 50%, #228B22 100%)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(45deg, #006400 0%, #228B22 50%, #006400 100%)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
                  }}
                >
                  📱 JOIN WHATSAPP GROUP
                </a>
              </div>
            </div>

            {/* Show completed team info */}
            <div style={{
              ...styles.formSection,
              background: 'rgba(0, 100, 0, 0.1)',
              padding: '20px',
              border: '2px solid #006400',
              marginBottom: '25px'
            }}>
              <div style={{...styles.sectionTitle, color: '#006400'}}>✅ Your Team Information</div>
              <div style={{...styles.paymentInfo, color: '#006400'}}>
                <strong>Team:</strong> {registrationStatus.team_name}<br/>
                <strong>Leader:</strong> {registrationStatus.leader_name} ({registrationStatus.leader_roll})<br/>
                <strong>Branch:</strong> {registrationStatus.leader_branch}<br/>
                <strong>Status:</strong> ⏳ Waiting for Step 2 to be enabled
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Payment */}
        {currentStep === 2 && registrationStatus && (
          <form onSubmit={handleStep2Submit}>
            <div style={{
              ...styles.paymentSection,
              borderColor: '#ff8800',
              marginBottom: '25px'
            }}>
              <div style={{
                ...styles.paymentTitle,
                color: '#ff8800',
                borderColor: '#ff8800'
              }}>STEP 2: PAYMENT</div>

              <div style={{
                ...styles.paymentInfo,
                color: '#ff8800'
              }}>
                Team registration completed! Now proceed with payment to complete your registration.
              </div>
            </div>

            {/* Show completed team info */}
            <div style={{
              ...styles.formSection,
              background: 'rgba(0, 100, 0, 0.1)',
              padding: '20px',
              border: '2px solid #006400',
              marginBottom: '25px'
            }}>
              <div style={{...styles.sectionTitle, color: '#006400'}}>✅ STEP 1 COMPLETED - Team Information</div>
              <div style={{...styles.paymentInfo, color: '#006400'}}>
                <strong>Team:</strong> {registrationStatus.team_name}<br/>
                <strong>Leader:</strong> {registrationStatus.leader_name} ({registrationStatus.leader_roll})<br/>
                <strong>Branch:</strong> {registrationStatus.leader_branch}
              </div>
            </div>

            {/* Payment Section */}
            <div style={styles.paymentSection}>
              <div style={styles.paymentTitle}>REGISTRATION FEE PAYMENT</div>

          <div style={styles.paymentAmount}>₹3,000</div>

          <div style={styles.paymentInfo}>
            PAYMENT MUST BE MADE BEFORE REGISTRATION COMPLETION.<br/>
            Transfer to the bank account details below.
          </div>

          {/* Bank Details Section */}
          <div style={{
            margin: window.innerWidth < 768 ? '15px 0' : '20px 0',
            padding: window.innerWidth < 768 ? '15px' : '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: window.innerWidth < 768 ? '2px solid #8B0000' : '3px solid #8B0000',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{
              fontFamily: '"Impact", sans-serif',
              fontSize: window.innerWidth < 768 ? '14px' : '16px',
              fontWeight: 'bold',
              color: '#8B0000',
              textTransform: 'uppercase',
              letterSpacing: window.innerWidth < 768 ? '0.5px' : '1px',
              marginBottom: window.innerWidth < 768 ? '12px' : '15px'
            }}>
              🏦 BANK ACCOUNT DETAILS
            </div>

            {bankDetailsLoading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#666',
                fontFamily: '"Courier New", monospace'
              }}>
                ⏳ LOADING BANK DETAILS...
              </div>
            ) : bankDetails ? (
              <div>
                <div style={{
                  marginBottom: '20px',
                  padding: '15px',
                  background: '#f8f8f8',
                  border: '2px solid #ddd',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '5px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: '"Impact", sans-serif'
                  }}>
                    ACCOUNT NUMBER
                  </div>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#000',
                    fontFamily: '"Courier New", monospace',
                    letterSpacing: '2px'
                  }}>
                    {bankDetails.account_number}
                  </div>
                </div>

                <div style={{
                  marginBottom: '15px',
                  padding: '15px',
                  background: '#f8f8f8',
                  border: '2px solid #ddd',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '5px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: '"Impact", sans-serif'
                  }}>
                    IFSC CODE
                  </div>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#000',
                    fontFamily: '"Courier New", monospace',
                    letterSpacing: '2px'
                  }}>
                    {bankDetails.ifsc_code}
                  </div>
                </div>

                <div style={{
                  marginBottom: '15px',
                  padding: '15px',
                  background: '#f8f8f8',
                  border: '2px solid #ddd',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '5px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: '"Impact", sans-serif'
                  }}>
                    ACCOUNT HOLDER NAME
                  </div>
                  <div style={{
                    fontSize: window.innerWidth < 768 ? '18px' : '22px',
                    fontWeight: 'bold',
                    color: '#000',
                    fontFamily: '"Courier New", monospace',
                    letterSpacing: window.innerWidth < 768 ? '1px' : '2px'
                  }}>
                    SAE COLLEGIATE CLUB MMMUT
                  </div>
                </div>

                <div style={{
                  marginBottom: '15px',
                  padding: '15px',
                  background: '#f8f8f8',
                  border: '2px solid #ddd',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '5px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: '"Impact", sans-serif'
                  }}>
                    ACCOUNT TYPE
                  </div>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#000',
                    fontFamily: '"Courier New", monospace',
                    letterSpacing: '2px'
                  }}>
                    CURRENT ACCOUNT
                  </div>
                </div>

                <div style={{
                  fontSize: '12px',
                  color: '#444',
                  fontWeight: 'bold',
                  marginTop: '15px',
                  fontFamily: '"Courier New", monospace'
                }}>
                  Transfer ₹3,000 to the above account and upload payment screenshot
                </div>

                <div style={{
                  fontSize: window.innerWidth < 768 ? '13px' : '14px',
                  color: '#8B0000',
                  fontWeight: 'bold',
                  marginTop: '12px',
                  padding: window.innerWidth < 768 ? '10px' : '12px',
                  background: 'rgba(139, 0, 0, 0.1)',
                  border: '2px solid #8B0000',
                  borderRadius: '6px',
                  fontFamily: '"Courier New", monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  textAlign: 'center',
                  lineHeight: '1.5'
                }}>
                  ⚠️ IMPORTANT: TRANSACTION ID MUST BE CLEARLY VISIBLE IN PAYMENT SCREENSHOT OR IT WILL NOT BE CONSIDERED VALID
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#666',
                fontFamily: '"Courier New", monospace',
                textAlign: 'center',
                lineHeight: '1.4'
              }}>
                ❌ BANK DETAILS NOT AVAILABLE<br/>CONTACT ADMIN
              </div>
            )}
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

            {/* Submit Button for Step 2 */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.submitButton,
                background: 'linear-gradient(45deg, #ff8800 0%, #ff6600 50%, #ff8800 100%)'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.background = 'linear-gradient(45deg, #ff6600 0%, #ff4400 50%, #ff6600 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.background = 'linear-gradient(45deg, #ff8800 0%, #ff6600 50%, #ff8800 100%)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
                }
              }}
            >
              {isSubmitting ? 'PROCESSING PAYMENT...' : 'COMPLETE STEP 2 - SUBMIT PAYMENT'}
            </button>

            {/* WhatsApp Group Section for Step 2 */}
            <div style={{
              border: window.innerWidth < 768 ? '2px solid #666' : '3px solid #8B0000',
              padding: window.innerWidth < 768 ? '15px' : '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              position: 'relative',
              marginTop: window.innerWidth < 768 ? '20px' : '25px',
              marginBottom: '25px'
            }}>
              <div style={{
                fontFamily: '"Impact", sans-serif',
                fontSize: window.innerWidth < 768 ? '16px' : '18px',
                fontWeight: 'bold',
                color: '#2a2a2a',
                textTransform: 'uppercase',
                letterSpacing: window.innerWidth < 768 ? '1px' : '2px',
                marginBottom: window.innerWidth < 768 ? '12px' : '15px',
                textAlign: 'center',
                background: '#f4f1e8',
                padding: window.innerWidth < 768 ? '8px' : '10px',
                border: window.innerWidth < 768 ? '2px solid #8B0000' : '2px solid #8B0000',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                lineHeight: '1.3'
              }}>
                📱 COMMUNITY ACCESS
              </div>

              <div style={{
                fontFamily: '"Courier New", monospace',
                fontSize: window.innerWidth < 768 ? '11px' : '12px',
                color: '#444',
                margin: '10px 0',
                fontWeight: 'bold',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.5)',
                padding: window.innerWidth < 768 ? '8px' : '10px',
                border: '1px solid #888',
                lineHeight: '1.4'
              }}>
                IN CASE YOU FORGOT TO JOIN THE GROUP - CONNECT WITH OTHER CREWS
              </div>

              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <a
                  href="https://chat.whatsapp.com/IpaTpzKbKuVEnCnB81DvQV"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: '"Impact", sans-serif',
                    fontSize: window.innerWidth < 768 ? '14px' : '16px',
                    fontWeight: 'bold',
                    color: '#fff',
                    background: 'linear-gradient(45deg, #006400 0%, #228B22 50%, #006400 100%)',
                    border: window.innerWidth < 768 ? '3px solid #2a2a2a' : '4px solid #2a2a2a',
                    padding: window.innerWidth < 768 ? '12px 18px' : '15px 25px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: window.innerWidth < 768 ? '0.5px' : '1px',
                    display: 'inline-block',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    textDecoration: 'none',
                    borderRadius: '0'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(45deg, #228B22 0%, #32CD32 50%, #228B22 100%)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(45deg, #006400 0%, #228B22 50%, #006400 100())';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
                  }}
                >
                  📱 JOIN WHATSAPP GROUP
                </a>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3: Verification Status */}
        {currentStep === 3 && registrationStatus && (
          <div>
            <div style={{
              ...styles.paymentSection,
              borderColor: registrationStatus.registration_status === 'verified' ? '#006400' : '#666',
              marginBottom: '25px'
            }}>
              <div style={{
                ...styles.paymentTitle,
                color: registrationStatus.registration_status === 'verified' ? '#006400' : '#666',
                borderColor: registrationStatus.registration_status === 'verified' ? '#006400' : '#666'
              }}>STEP 3: VERIFICATION</div>

              <div style={{
                ...styles.paymentInfo,
                color: registrationStatus.registration_status === 'verified' ? '#006400' : '#666'
              }}>
                {registrationStatus.registration_status === 'verified'
                  ? '🎉 Congratulations! Your registration is verified and complete.'
                  : '⏳ Your registration is under review. You will be notified once verified.'}
              </div>
            </div>

            {/* Show completed registration details */}
            <div style={{
              ...styles.formSection,
              background: registrationStatus.registration_status === 'verified'
                ? 'rgba(0, 100, 0, 0.1)' : 'rgba(255, 140, 0, 0.1)',
              padding: '20px',
              border: `2px solid ${registrationStatus.registration_status === 'verified' ? '#006400' : '#ff8800'}`,
              marginBottom: '25px'
            }}>
              <div style={{
                ...styles.sectionTitle,
                color: registrationStatus.registration_status === 'verified' ? '#006400' : '#ff8800'
              }}>📋 REGISTRATION SUMMARY</div>

              <div style={{...styles.paymentInfo, color: '#333', textAlign: 'left'}}>
                <strong>Team Name:</strong> {registrationStatus.team_name}<br/>
                <strong>Leader:</strong> {registrationStatus.leader_name}<br/>
                <strong>Roll Number:</strong> {registrationStatus.leader_roll}<br/>
                <strong>Branch:</strong> {registrationStatus.leader_branch}<br/>
                <strong>Registration Status:</strong> <span style={{
                  color: registrationStatus.registration_status === 'verified' ? '#006400' :
                         registrationStatus.registration_status === 'rejected' ? '#cc0000' : '#ff8800',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {registrationStatus.registration_status === 'verified' ? '✅ VERIFIED' :
                   registrationStatus.registration_status === 'rejected' ? '❌ REJECTED' :
                   '⏳ PENDING VERIFICATION'}
                </span><br/>
                <strong>Payment Status:</strong> <span style={{
                  color: registrationStatus.payment_screenshot_url ? '#006400' : '#cc0000',
                  fontWeight: 'bold'
                }}>
                  {registrationStatus.payment_screenshot_url ? '✅ SUBMITTED' : '❌ NOT SUBMITTED'}
                </span><br/>
                <strong>Submitted Date:</strong> {new Date(registrationStatus.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        {/* Small Print - Show only in Step 1 */}
        {currentStep === 1 && (
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
        )}
        </div>
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