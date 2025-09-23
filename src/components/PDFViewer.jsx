import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

const PDFViewer = ({ pdfUrl, isOpen, onClose, title = "PDF Document" }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  const styles = {
    container: {
      fontFamily: '"Inter", "Segoe UI", "Arial", sans-serif',
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
      maxWidth: window.innerWidth < 768 ? '95vw' : '1400px',
      width: '100%',
      margin: '0 auto',
      padding: window.innerWidth < 768 ? '20px' : '40px',
      paddingBottom: window.innerWidth < 768 ? '60px' : '80px',
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
      marginBottom: '25px',
      position: 'relative',
      zIndex: 2
    },
    logoSection: {
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)',
      color: '#fff',
      padding: '12px 24px',
      margin: '0 auto 20px',
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
    title: {
      fontFamily: '"Poppins", "Inter", sans-serif',
      fontSize: window.innerWidth < 768 ? '24px' : '36px',
      fontWeight: '700',
      color: '#1a1a1a',
      textTransform: 'uppercase',
      letterSpacing: window.innerWidth < 768 ? '1.5px' : '3px',
      margin: window.innerWidth < 768 ? '15px 0' : '20px 0',
      textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
      lineHeight: '1.2',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    subtitle: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '15px',
      color: '#555',
      margin: '12px 0',
      fontWeight: '500',
      fontStyle: 'italic'
    },
    controlsContainer: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: '4px solid #444',
      margin: '0 0 20px 0',
      padding: '15px 20px',
      position: 'relative',
      boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px',
      zIndex: 2
    },
    controlButton: {
      fontFamily: '"Poppins", sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      color: '#fff',
      background: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #374151 100%)',
      border: '2px solid #4b5563',
      borderRadius: '8px',
      padding: '8px 16px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(75, 85, 99, 0.3)',
      textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    downloadButton: {
      fontFamily: '"Poppins", sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      color: '#fff',
      background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #059669 100%)',
      border: '2px solid #10b981',
      borderRadius: '8px',
      padding: '8px 16px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    zoomDisplay: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '14px',
      color: '#374151',
      fontWeight: '600',
      padding: '8px 12px',
      background: 'rgba(243, 244, 246, 0.8)',
      border: '2px solid #d1d5db',
      borderRadius: '6px'
    },
    pdfContainer: {
      background: 'rgba(255, 255, 255, 0.95)',
      border: '4px solid #444',
      padding: '20px',
      position: 'relative',
      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
      height: window.innerWidth < 768 ? '500px' : '700px',
      overflow: 'auto',
      zIndex: 2,
      marginBottom: '30px',
      borderRadius: '8px'
    },
    pdfFrame: {
      width: '100%',
      height: window.innerWidth < 768 ? '800px' : '1200px',
      border: '2px solid #ddd',
      borderRadius: '4px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      background: '#fff',
      transition: 'transform 0.3s ease',
      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
      transformOrigin: 'center top'
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
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm overflow-y-auto pdf-viewer-main"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#6366f1 #1f2937'
      }}
    >
      <style>{`
        /* Main Container Scrollbar */
        .pdf-viewer-main::-webkit-scrollbar {
          width: 18px !important;
          background: rgba(31, 41, 55, 0.9) !important;
          border-radius: 9px !important;
        }

        .pdf-viewer-main::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.8) !important;
          border-radius: 9px !important;
          margin: 4px !important;
          border: 1px solid rgba(55, 65, 81, 0.6) !important;
        }

        .pdf-viewer-main::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1 0%, #4f46e5 25%, #4338ca 50%, #3730a3 75%, #312e81 100%) !important;
          border-radius: 7px !important;
          border: 2px solid rgba(255, 255, 255, 0.1) !important;
          transition: all 0.3s ease !important;
        }

        .pdf-viewer-main::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #7c3aed 0%, #6d28d9 25%, #5b21b6 50%, #4c1d95 75%, #3c1674 100%) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          transform: scaleX(1.1) !important;
        }

        /* Hide PDF Container Scrollbar */
        .pdf-content-container::-webkit-scrollbar {
          display: none !important;
        }

        .pdf-content-container {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        /* Force main scrollbar visibility */
        .pdf-viewer-main {
          scrollbar-width: thin !important;
          scrollbar-color: #6366f1 #1f2937 !important;
        }
      `}</style>
      <div className="min-h-screen flex items-start justify-center py-4 px-4">
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[10000] text-white bg-black/50 hover:bg-black/70 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold transition-all duration-300"
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
            <h1 style={styles.title}>📋 {title}</h1>
            <div style={styles.subtitle}>
              OFFICIAL DOCUMENT VIEWER - SAE COLLEGIATE CLUB ARCHIVES
            </div>
          </div>

          {/* Controls */}
          <div style={styles.controlsContainer}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={zoomOut}
                style={styles.controlButton}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #4b5563 0%, #6b7280 50%, #4b5563 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #374151 100%)';
                  e.target.style.transform = 'translateY(0)';
                }}
                title="Zoom Out"
              >
                <ZoomOut size={16} />
                ZOOM OUT
              </button>

              <div style={styles.zoomDisplay}>{zoom}%</div>

              <button
                onClick={zoomIn}
                style={styles.controlButton}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #4b5563 0%, #6b7280 50%, #4b5563 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #374151 100%)';
                  e.target.style.transform = 'translateY(0)';
                }}
                title="Zoom In"
              >
                <ZoomIn size={16} />
                ZOOM IN
              </button>

              <button
                onClick={rotate}
                style={styles.controlButton}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #4b5563 0%, #6b7280 50%, #4b5563 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #374151 100%)';
                  e.target.style.transform = 'translateY(0)';
                }}
                title="Rotate"
              >
                <RotateCw size={16} />
                ROTATE
              </button>
            </div>

            <button
              onClick={handleDownload}
              style={styles.downloadButton}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #047857 0%, #059669 50%, #047857 100%)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #059669 0%, #10b981 50%, #059669 100%)';
                e.target.style.transform = 'translateY(0)';
              }}
              title="Download PDF"
            >
              <Download size={16} />
              DOWNLOAD
            </button>
          </div>


          {/* PDF Content */}
          <div
            style={styles.pdfContainer}
            className="pdf-content-container"
          >
            {/* Document label */}
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '20px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)',
              color: '#fff',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '4px',
              zIndex: 3,
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '0.5px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              boxShadow: '0 2px 6px rgba(30, 64, 175, 0.3)'
            }}>
              📄 OFFICIAL DOCUMENT
            </div>

            {/* PDF iframe */}
            <iframe
              src={pdfUrl}
              style={styles.pdfFrame}
              title={title}
            />

            {/* Corner tape effects */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '30px',
              width: '40px',
              height: '20px',
              background: 'linear-gradient(45deg, rgba(255,255,255,0.8) 0%, rgba(240,240,240,0.9) 100%)',
              border: '1px solid rgba(200,200,200,0.6)',
              borderRadius: '2px',
              transform: 'rotate(15deg)',
              zIndex: 3,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}></div>

            <div style={{
              position: 'absolute',
              bottom: '15px',
              left: '25px',
              width: '35px',
              height: '18px',
              background: 'linear-gradient(45deg, rgba(255,255,255,0.8) 0%, rgba(240,240,240,0.9) 100%)',
              border: '1px solid rgba(200,200,200,0.6)',
              borderRadius: '2px',
              transform: 'rotate(-10deg)',
              zIndex: 3,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}></div>
          </div>

          <button
            onClick={onClose}
            style={styles.closeButton}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            CLOSE DOCUMENT
          </button>
        </div>
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};

export default PDFViewer;