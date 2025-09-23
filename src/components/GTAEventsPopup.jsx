import React, { useState, useEffect } from 'react';
import { supabaseService } from '../lib/supabase';
import PDFViewer from './PDFViewer';

const GTAEventsPopup = ({ onClose }) => {
  const [hotEvents, setHotEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPDFViewer, setShowPDFViewer] = useState(false);

  useEffect(() => {
    fetchHotEvents();
  }, []);

  const fetchHotEvents = async () => {
    try {
      setIsLoading(true);
      setError('');
      const events = await supabaseService.getHotEvents();
      setHotEvents(events || []);
    } catch (error) {
      console.error('Error fetching hot events:', error);
      setError(`Error loading events: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      fontFamily: '"Inter", "Segoe UI", "Arial", sans-serif',
      background: `
        linear-gradient(145deg, #f4f1e8 0%, #ede8d8 25%, #f0ebe0 50%, #e8e3d3 75%, #f2ede5 100%),
        radial-gradient(circle at 20% 30%, rgba(139, 125, 107, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(160, 145, 125, 0.08) 0%, transparent 50%)
      `,
      border: window.innerWidth < 768 ? '4px solid #2a2a2a' : '8px solid #2a2a2a',
      borderRadius: '0',
      boxShadow: `
        inset 0 0 50px rgba(0,0,0,0.1),
        0 0 0 2px #444,
        0 8px 32px rgba(0,0,0,0.3)
      `,
      position: 'relative',
      maxWidth: window.innerWidth < 768 ? '98vw' : '1400px',
      width: '100%',
      margin: '0 auto',
      padding: window.innerWidth < 768 ? '15px' : '40px',
      paddingBottom: window.innerWidth < 768 ? '50px' : '80px',
      color: '#222',
      minHeight: 'auto',
      maxHeight: 'none',
      overflow: 'visible'
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
      fontFamily: '"Poppins", "Inter", sans-serif',
      fontSize: window.innerWidth < 768 ? '24px' : '36px',
      fontWeight: '700',
      color: '#1a1a1a',
      textTransform: 'uppercase',
      letterSpacing: window.innerWidth < 768 ? '1.5px' : '3px',
      margin: window.innerWidth < 768 ? '15px 0' : '25px 0',
      textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
      lineHeight: '1.2',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    logoSection: {
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)',
      color: '#fff',
      padding: '12px 24px',
      margin: '0 auto 25px',
      width: 'fit-content',
      fontFamily: '"Poppins", sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      letterSpacing: '1.5px',
      border: '2px solid #1e40af',
      borderRadius: '8px',
      textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
      boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)'
    },
    subtitle: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '15px',
      color: '#555',
      margin: '12px 0',
      fontWeight: '500',
      fontStyle: 'italic'
    },
    eventsContainer: {
      position: 'relative',
      zIndex: 2,
      paddingRight: '15px',
      marginBottom: '30px'
    },
    eventCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: '4px solid #444',
      margin: window.innerWidth < 768 ? '15px 0' : '25px 0',
      padding: window.innerWidth < 768 ? '15px' : '30px',
      position: 'relative',
      boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
      display: window.innerWidth < 768 ? 'flex' : 'grid',
      flexDirection: window.innerWidth < 768 ? 'column' : undefined,
      gridTemplateColumns: window.innerWidth < 768 ? undefined : '1fr 300px',
      gap: window.innerWidth < 768 ? '15px' : '25px',
      alignItems: 'start'
    },
    eventCardSingle: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: '4px solid #444',
      margin: window.innerWidth < 768 ? '15px 0' : '25px 0',
      padding: window.innerWidth < 768 ? '15px' : '30px',
      position: 'relative',
      boxShadow: '0 6px 15px rgba(0,0,0,0.3)'
    },
    eventTitle: {
      fontFamily: '"Poppins", sans-serif',
      fontSize: window.innerWidth < 768 ? '20px' : '28px',
      fontWeight: '700',
      color: '#1e40af',
      textTransform: 'uppercase',
      letterSpacing: window.innerWidth < 768 ? '1px' : '2px',
      marginBottom: window.innerWidth < 768 ? '12px' : '18px',
      textShadow: '2px 2px 8px rgba(30, 64, 175, 0.3)',
      gridColumn: window.innerWidth < 768 ? undefined : '1 / -1',
      borderBottom: '3px solid #3b82f6',
      paddingBottom: '8px'
    },
    eventContent: {
      display: 'flex',
      flexDirection: 'column'
    },
    eventDescription: {
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      fontSize: '16px',
      color: '#374151',
      lineHeight: '1.8',
      marginBottom: '24px',
      textAlign: 'justify',
      fontWeight: '400'
    },
    eventImage: {
      width: '100%',
      height: window.innerWidth < 768 ? '300px' : '400px',
      objectFit: 'cover',
      border: '3px solid #666',
      marginBottom: '15px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
    },
    eventImageContainer: {
      display: 'flex',
      flexDirection: 'column'
    },
    eventMeta: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '13px',
      color: '#6b7280',
      fontWeight: '500',
      marginTop: '12px',
      fontStyle: 'italic'
    },
    eventDetail: {
      fontFamily: '"Poppins", sans-serif',
      fontSize: '14px',
      color: '#1f2937',
      margin: '12px 0',
      padding: '12px 16px',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(30, 64, 175, 0.12) 100%)',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontWeight: '600',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    reelLink: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '14px',
      color: '#3b82f6',
      textDecoration: 'none',
      wordBreak: 'break-all',
      fontWeight: '500',
      borderBottom: '2px solid transparent',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    closeButton: {
      fontFamily: '"Poppins", sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      color: '#fff',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
      border: '2px solid #dc2626',
      borderRadius: '12px',
      padding: '14px 32px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      display: 'block',
      margin: '30px auto 0',
      transition: 'all 0.3s ease',
      boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
      textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
      position: 'relative',
      zIndex: 2
    },
    loadingContainer: {
      textAlign: 'center',
      margin: '60px 0',
      position: 'relative',
      zIndex: 2
    },
    loadingText: {
      fontFamily: '"Poppins", sans-serif',
      fontSize: '20px',
      color: '#1a1a1a',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      marginBottom: '30px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
    },
    loadingBar: {
      width: '300px',
      height: '8px',
      background: '#e5e7eb',
      border: '2px solid #374151',
      borderRadius: '4px',
      margin: '0 auto 20px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
    },
    loadingBarFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)',
      borderRadius: '2px',
      animation: 'loadingPulse 2s ease-in-out infinite',
      boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
    },
    loadingDots: {
      fontSize: '24px',
      color: '#3b82f6',
      animation: 'loadingDots 1.5s infinite'
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 20px'
    },
    errorText: {
      textAlign: 'center',
      fontFamily: '"Poppins", sans-serif',
      fontSize: '16px',
      color: '#ef4444',
      fontWeight: '600',
      margin: '24px 0',
      position: 'relative',
      zIndex: 2
    },
    noEventsText: {
      textAlign: 'center',
      fontFamily: '"Poppins", sans-serif',
      fontSize: '18px',
      color: '#6b7280',
      fontWeight: '500',
      margin: '40px 0',
      position: 'relative',
      zIndex: 2
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes loadingPulse {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }

          @keyframes loadingDots {
            0%, 80%, 100% {
              opacity: 0.3;
              transform: scale(0.8);
            }
            40% {
              opacity: 1;
              transform: scale(1.2);
            }
          }

          /* Mobile scrollbar styling */
          @media (max-width: 768px) {
            .mobile-scroll::-webkit-scrollbar {
              width: 6px;
            }
            .mobile-scroll::-webkit-scrollbar-track {
              background: rgba(0,0,0,0.1);
            }
            .mobile-scroll::-webkit-scrollbar-thumb {
              background: rgba(59, 130, 246, 0.5);
              border-radius: 3px;
            }
          }
        `}
      </style>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto mobile-scroll">
      <div className="min-h-screen flex items-start justify-center py-2 md:py-4 px-2 md:px-4">
        <button
          onClick={onClose}
          className="fixed top-2 right-2 md:top-4 md:right-4 z-[10000] text-white bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-xl font-bold transition-all duration-300"
        >
          ×
        </button>

        <div style={styles.container}>
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
            <h1 style={styles.title}>ALL HOT EVENTS</h1>
            <div style={styles.subtitle}>
              LIFEINVADER WEB FORM PRINT-OUT - AUTOMOTIVE EVENTS ARCHIVE
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <div style={styles.loadingText}>
                📋 LOADING EVENTS FROM DATABASE
              </div>
              <div style={styles.loadingBar}>
                <div style={styles.loadingBarFill}></div>
              </div>
              <div style={styles.loadingDots}>
                ●●●
              </div>
            </div>
          ) : error ? (
            <div style={styles.errorText}>
              ❌ {error}
            </div>
          ) : hotEvents.length === 0 ? (
            <div style={styles.noEventsText}>
              📝 NO EVENTS FOUND IN SYSTEM
            </div>
          ) : (
            <div style={styles.eventsContainer}>
              {hotEvents.map((event, index) => (
                <div
                  key={event.id || index}
                  style={event.poster_image_url ? styles.eventCard : styles.eventCardSingle}
                >
                  <div style={styles.eventTitle}>
                    🏁 {event.name}
                  </div>

                  <div style={styles.eventContent}>
                    <div style={styles.eventDetail}>
                      <strong>📋 EVENT DESCRIPTION:</strong>
                    </div>
                    <div style={styles.eventDescription}>
                      {event.description || 'No description provided for this event.'}
                    </div>

                    {event.instagram_reel && (
                      <>
                        <div style={styles.eventDetail}>
                          <strong>📱 INSTAGRAM REEL LINK:</strong>
                        </div>
                        <div style={styles.eventDescription}>
                          <a
                            href={event.instagram_reel}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.reelLink}
                            onMouseEnter={(e) => {
                              e.target.style.color = '#1d4ed8';
                              e.target.style.borderBottom = '2px solid #1d4ed8';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = '#3b82f6';
                              e.target.style.borderBottom = '2px solid transparent';
                            }}
                          >
                            {event.instagram_reel}
                          </a>
                        </div>
                      </>
                    )}

                    <div style={styles.eventDetail}>
                      <strong>📊 EVENT STATUS:</strong>
                    </div>
                    <div style={styles.eventDescription}>
                      {event.show_on_homepage ? '⭐ FEATURED ON HOMEPAGE' : '📝 ARCHIVED EVENT'}
                      | 🗓️ Submitted: {new Date(event.created_at).toLocaleDateString()}
                      | 🕒 {new Date(event.created_at).toLocaleTimeString()}
                    </div>

                    {event.created_at && (
                      <>
                        <div style={styles.eventDetail}>
                          <strong>📅 SUBMISSION DETAILS:</strong>
                        </div>
                        <div style={styles.eventDescription}>
                          <strong>Date:</strong> {new Date(event.created_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          <br/>
                          <strong>Time:</strong> {new Date(event.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                          <br/>
                          <strong>Event ID:</strong> #{event.id || 'N/A'}
                        </div>
                      </>
                    )}
                  </div>

                  {event.poster_image_url && (
                    <div style={styles.eventImageContainer}>
                      <div style={styles.eventDetail}>
                        <strong>🖼️ EVENT POSTER:</strong>
                      </div>
                      <img
                        src={event.poster_image_url}
                        alt={event.name}
                        style={styles.eventImage}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{
                        ...styles.eventDescription,
                        display: 'none',
                        color: '#cc0000',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>
                        ❌ POSTER IMAGE FAILED TO LOAD
                      </div>
                      <div style={styles.eventMeta}>
                        🔗 <a
                          href={event.poster_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.reelLink}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#1d4ed8';
                            e.target.style.borderBottom = '2px solid #1d4ed8';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#3b82f6';
                            e.target.style.borderBottom = '2px solid transparent';
                          }}
                        >
                          View Full Size Image
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Buttons Container */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: window.innerWidth < 768 ? '15px' : '20px',
            marginTop: window.innerWidth < 768 ? '20px' : '30px',
            flexWrap: 'wrap',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            alignItems: 'center'
          }}>
            {/* Rule Book Button */}
            <button
              onClick={() => setShowPDFViewer(true)}
              style={{
                ...styles.closeButton,
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)',
                border: '2px solid #3b82f6',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                width: window.innerWidth < 768 ? '100%' : 'auto',
                padding: window.innerWidth < 768 ? '16px 32px' : '14px 32px',
                fontSize: window.innerWidth < 768 ? '14px' : '16px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              📋 OPEN RULE BOOK →
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                ...styles.closeButton,
                width: window.innerWidth < 768 ? '100%' : 'auto',
                padding: window.innerWidth < 768 ? '16px 32px' : '14px 32px',
                fontSize: window.innerWidth < 768 ? '14px' : '16px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              CLOSE ARCHIVE
            </button>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {showPDFViewer && (
        <PDFViewer
          pdfUrl="/sae-rulebook.pdf"
          isOpen={showPDFViewer}
          onClose={() => setShowPDFViewer(false)}
          title="SAE Rule Book"
        />
      )}
      </div>
    </>
  );
};

export default GTAEventsPopup;