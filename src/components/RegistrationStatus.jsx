import React, { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const RegistrationStatus = ({ onClose }) => {
  const { user } = useAuth();
  const [registration, setRegistration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchRegistrationStatus();
    }
  }, [user, fetchRegistrationStatus]);

  const fetchRegistrationStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const userRegistration = await supabaseService.getUserRegistration(user.id);
      setRegistration(userRegistration);
    } catch (error) {
      console.error('Error fetching registration status:', error);
      setError(`Error fetching status: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  const getStatusDisplay = () => {
    if (!registration) {
      return {
        status: 'NO REGISTRATION',
        message: 'You have not submitted a team registration yet.',
        color: '#666',
        backgroundColor: '#f5f5f5'
      };
    }

    switch (registration.registration_status) {
      case 'pending':
        return {
          status: 'UNDER REVIEW',
          message: 'Your registration is currently under review. Please wait for verification.',
          color: '#ff9900',
          backgroundColor: 'rgba(255, 153, 0, 0.1)'
        };
      case 'verified':
        return {
          status: 'VERIFIED',
          message: 'Congratulations! Your registration has been verified. See you soon!',
          color: '#006400',
          backgroundColor: 'rgba(0, 100, 0, 0.1)'
        };
      case 'rejected':
        return {
          status: 'REJECTED',
          message: 'Your registration was rejected. Please contact support for more information.',
          color: '#cc0000',
          backgroundColor: 'rgba(204, 0, 0, 0.1)'
        };
      default:
        return {
          status: 'UNKNOWN',
          message: 'Unknown registration status.',
          color: '#666',
          backgroundColor: '#f5f5f5'
        };
    }
  };

  const statusInfo = getStatusDisplay();

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
      minHeight: '400px',
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
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      position: 'relative',
      zIndex: 2
    },
    title: {
      fontFamily: '"Impact", "Arial Black", sans-serif',
      fontSize: '32px',
      fontWeight: '900',
      color: '#1a1a1a',
      textTransform: 'uppercase',
      letterSpacing: '2px',
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
    statusBox: {
      background: statusInfo.backgroundColor,
      border: `3px solid ${statusInfo.color}`,
      padding: '30px',
      margin: '20px 0',
      textAlign: 'center',
      position: 'relative',
      zIndex: 2
    },
    statusTitle: {
      fontFamily: '"Impact", sans-serif',
      fontSize: '28px',
      fontWeight: 'bold',
      color: statusInfo.color,
      textTransform: 'uppercase',
      letterSpacing: '3px',
      marginBottom: '15px',
      textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
    },
    statusMessage: {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#333',
      lineHeight: '1.6',
      fontWeight: 'bold'
    },
    registrationDetails: {
      background: 'rgba(255, 255, 255, 0.7)',
      border: '2px solid #666',
      padding: '20px',
      margin: '20px 0',
      position: 'relative',
      zIndex: 2
    },
    detailItem: {
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      margin: '8px 0',
      color: '#333'
    },
    closeButton: {
      fontFamily: '"Impact", sans-serif',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#fff',
      background: 'linear-gradient(45deg, #666 0%, #888 50%, #666 100%)',
      border: '3px solid #2a2a2a',
      padding: '12px 30px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      display: 'block',
      margin: '30px auto 0',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
    },
    loadingText: {
      textAlign: 'center',
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: '#666',
      fontWeight: 'bold',
      margin: '40px 0'
    },
    errorText: {
      textAlign: 'center',
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#cc0000',
      fontWeight: 'bold',
      margin: '20px 0'
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold transition-all duration-300"
        >
          ×
        </button>

        <div style={styles.container}>
          <div style={styles.paperTexture}></div>

          <div style={styles.header}>
            <div style={styles.logoSection}>
              LOS SANTOS COUNTY SHERIFF'S DEPARTMENT
            </div>
            <h1 style={styles.title}>REGISTRATION STATUS</h1>
          </div>

          {isLoading ? (
            <div style={styles.loadingText}>
              📋 CHECKING REGISTRATION STATUS...
            </div>
          ) : error ? (
            <div style={styles.errorText}>
              ❌ {error}
            </div>
          ) : (
            <>
              <div style={styles.statusBox}>
                <div style={styles.statusTitle}>
                  {statusInfo.status}
                </div>
                <div style={styles.statusMessage}>
                  {statusInfo.message}
                </div>
              </div>

              {registration && (
                <div style={styles.registrationDetails}>
                  <div style={styles.detailItem}>
                    <strong>TEAM NAME:</strong> {registration.team_name}
                  </div>
                  <div style={styles.detailItem}>
                    <strong>LEADER:</strong> {registration.leader_name}
                  </div>
                  <div style={styles.detailItem}>
                    <strong>SUBMITTED:</strong> {new Date(registration.created_at).toLocaleDateString()}
                  </div>
                  <div style={styles.detailItem}>
                    <strong>PAYMENT:</strong> {registration.payment_screenshot_url ? 'UPLOADED' : 'NOT UPLOADED'}
                  </div>
                </div>
              )}
            </>
          )}

          <button
            onClick={onClose}
            style={styles.closeButton}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(45deg, #888 0%, #aaa 50%, #888 100%)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(45deg, #666 0%, #888 50%, #666 100%)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationStatus;