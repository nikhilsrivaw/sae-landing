import React, { useState, useEffect } from 'react';
import { supabaseService } from '../lib/supabase';

const GTAEventsPopup = ({ onClose }) => {
  const [hotEvents, setHotEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
      maxWidth: '1200px',
      width: '95vw',
      margin: '10px auto',
      padding: window.innerWidth < 768 ? '20px' : '50px',
      color: '#222',
      minHeight: window.innerWidth < 768 ? 'auto' : '800px',
      maxHeight: '90vh',
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
      fontSize: window.innerWidth < 768 ? '20px' : '32px',
      fontWeight: '900',
      color: '#1a1a1a',
      textTransform: 'uppercase',
      letterSpacing: window.innerWidth < 768 ? '1px' : '2px',
      margin: window.innerWidth < 768 ? '10px 0' : '20px 0',
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
    eventsContainer: {
      position: 'relative',
      zIndex: 2,
      maxHeight: '600px',
      overflowY: 'auto',
      paddingRight: '15px'
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
      fontFamily: '"Impact", sans-serif',
      fontSize: window.innerWidth < 768 ? '18px' : '24px',
      fontWeight: 'bold',
      color: '#1a1a1a',
      textTransform: 'uppercase',
      letterSpacing: window.innerWidth < 768 ? '1px' : '2px',
      marginBottom: window.innerWidth < 768 ? '10px' : '15px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      gridColumn: window.innerWidth < 768 ? undefined : '1 / -1'
    },
    eventContent: {
      display: 'flex',
      flexDirection: 'column'
    },
    eventDescription: {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#333',
      lineHeight: '1.7',
      marginBottom: '20px',
      textAlign: 'justify'
    },
    eventImage: {
      width: '100%',
      height: window.innerWidth < 768 ? '200px' : '250px',
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
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      color: '#666',
      fontWeight: 'bold',
      marginTop: '10px'
    },
    eventDetail: {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: '#444',
      margin: '8px 0',
      padding: '8px',
      background: 'rgba(0,0,0,0.05)',
      border: '1px solid #ccc'
    },
    reelLink: {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: '#0066cc',
      textDecoration: 'underline',
      wordBreak: 'break-all'
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
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
      position: 'relative',
      zIndex: 2
    },
    loadingText: {
      textAlign: 'center',
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: '#666',
      fontWeight: 'bold',
      margin: '40px 0',
      position: 'relative',
      zIndex: 2
    },
    errorText: {
      textAlign: 'center',
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#cc0000',
      fontWeight: 'bold',
      margin: '20px 0',
      position: 'relative',
      zIndex: 2
    },
    noEventsText: {
      textAlign: 'center',
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: '#666',
      fontWeight: 'bold',
      margin: '40px 0',
      position: 'relative',
      zIndex: 2
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
            <div style={styles.loadingText}>
              📋 LOADING EVENTS FROM DATABASE...
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
                        🔗 <a href={event.poster_image_url} target="_blank" rel="noopener noreferrer" style={styles.reelLink}>
                          View Full Size Image
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
            CLOSE ARCHIVE
          </button>
        </div>
      </div>
    </div>
  );
};

export default GTAEventsPopup;