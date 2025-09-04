import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeButton = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [time, setTime] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const animationFrameRef = useRef(null);

  // Handle responsive screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smooth animation loop - Mobile optimized
  useEffect(() => {
    const animate = () => {
      setTime(prev => prev + (isMobile ? 0.004 : 0.008)); // Slower on mobile
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    navigate('/');
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group fixed ${isMobile ? 'top-4 left-4' : 'top-6 left-6'} z-50 transition-all duration-500 hover:scale-110`}
      style={{
        width: isMobile ? '38px' : '45px',
        height: isMobile ? '38px' : '45px',
        background: isMobile ? `
          linear-gradient(145deg, 
            rgba(220, 200, 150, ${0.15 + (isHovered ? 0.05 : 0)}) 0%,
            rgba(180, 140, 100, ${0.12 + (isHovered ? 0.04 : 0)}) 50%,
            rgba(200, 170, 120, ${0.13 + (isHovered ? 0.05 : 0)}) 100%
          ),
        ` : `
          conic-gradient(from ${time * 100}deg at 50% 50%,
            rgba(220, 200, 150, ${0.15 + (isHovered ? 0.1 : 0)}) 0deg,
            rgba(180, 140, 100, ${0.12 + (isHovered ? 0.08 : 0)}) 72deg,
            rgba(200, 170, 120, ${0.13 + (isHovered ? 0.09 : 0)}) 144deg,
            rgba(190, 150, 110, ${0.11 + (isHovered ? 0.07 : 0)}) 216deg,
            rgba(170, 130, 95, ${0.14 + (isHovered ? 0.08 : 0)}) 288deg,
            rgba(220, 200, 150, ${0.15 + (isHovered ? 0.1 : 0)}) 360deg
          ),
          radial-gradient(ellipse at center, 
            rgba(60, 55, 50, 0.95) 0%,
            rgba(45, 40, 35, 0.97) 25%,
            rgba(35, 30, 25, 0.98) 50%,
            rgba(25, 22, 18, 0.99) 75%,
            rgba(15, 12, 8, 1) 100%
          )
        `,
        border: '3px solid transparent',
        borderImage: isMobile ? `
          linear-gradient(135deg,
            rgba(220, 200, 150, ${0.4 + (isHovered ? 0.1 : 0)}) 0deg,
            rgba(180, 140, 100, ${0.35 + (isHovered ? 0.08 : 0)}) 100deg
          ) 1
        ` : `conic-gradient(from ${time * 80}deg at 50% 50%, 
          rgba(220, 200, 150, ${0.6 + (isHovered ? 0.2 : 0)}) 0deg,
          rgba(180, 140, 100, ${0.5 + (isHovered ? 0.15 : 0)}) 72deg,
          rgba(200, 170, 120, ${0.55 + (isHovered ? 0.18 : 0)}) 144deg,
          rgba(190, 150, 110, ${0.48 + (isHovered ? 0.16 : 0)}) 216deg,
          rgba(170, 130, 95, ${0.52 + (isHovered ? 0.17 : 0)}) 288deg,
          rgba(220, 200, 150, ${0.6 + (isHovered ? 0.2 : 0)}) 360deg
        ) 1`,
        borderRadius: isMobile ? '10px' : '14px',
        boxShadow: `
          0 10px 40px rgba(0, 0, 0, 0.8),
          0 0 30px rgba(220, 200, 150, ${0.2 + (isHovered ? 0.15 : 0)}),
          0 0 50px rgba(180, 140, 100, ${0.15 + (isHovered ? 0.1 : 0)}),
          0 0 70px rgba(200, 170, 120, ${0.12 + (isHovered ? 0.08 : 0)}),
          inset 0 2px 0 rgba(255, 255, 255, ${0.12 + (isHovered ? 0.08 : 0)}),
          inset 0 -2px 0 rgba(0, 0, 0, 0.9)
        `,
        backdropFilter: `blur(${25 + (isHovered ? 15 : 0)}px) saturate(${200 + (isHovered ? 100 : 0)}%)`,
        filter: `
          drop-shadow(0 0 20px rgba(220, 200, 150, ${0.3 + (isHovered ? 0.2 : 0)}))
          brightness(${1.1 + (isHovered ? 0.2 : 0)})
        `,
        cursor: 'pointer',
        transform: isMobile ? `
          ${isHovered ? 'scale(1.05)' : 'scale(1)'}
        ` : `
          perspective(1000px) 
          rotateX(${Math.sin(time * 50) * 2}deg) 
          rotateY(${Math.sin(time * 40) * 1.5}deg)
          ${isHovered ? 'scale(1.1)' : 'scale(1)'}
        `
      }}
    >
      {/* Corner Brackets */}
      {[
        { pos: 'top-left', colors: [220, 200, 150] },
        { pos: 'top-right', colors: [180, 140, 100] },
        { pos: 'bottom-left', colors: [200, 170, 120] },
        { pos: 'bottom-right', colors: [190, 150, 110] }
      ].map(({ pos, colors }, i) => (
        <div 
          key={pos}
          className={`absolute ${pos.includes('top') ? '-top-1' : '-bottom-1'} ${pos.includes('left') ? '-left-1' : '-right-1'} ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} transition-all duration-300 ${isHovered ? 'scale-150' : 'scale-100'}`}
          style={{ 
            borderTop: pos.includes('top') ? `2px solid rgba(${colors.join(',')}, ${0.8 + Math.sin(time * 200 + i * 50) * 0.1})` : 'none',
            borderBottom: pos.includes('bottom') ? `2px solid rgba(${colors.join(',')}, ${0.8 + Math.sin(time * 200 + i * 50) * 0.1})` : 'none',
            borderLeft: pos.includes('left') ? `2px solid rgba(${colors.join(',')}, ${0.8 + Math.sin(time * 200 + i * 50) * 0.1})` : 'none',
            borderRight: pos.includes('right') ? `2px solid rgba(${colors.join(',')}, ${0.8 + Math.sin(time * 200 + i * 50) * 0.1})` : 'none',
            filter: `drop-shadow(0 0 8px rgba(${colors.join(',')}, 0.6))`,
            animation: `holoCorner ${3 + i * 0.2}s ease-in-out infinite`
          }}
        />
      ))}


      {/* Main Home Icon */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Icon Background Glow */}
        <div 
          className={`absolute ${isMobile ? 'w-5 h-5' : 'w-6 h-6'} rounded-lg transition-all duration-500`}
          style={{
            background: `
              conic-gradient(from ${time * 120}deg,
                rgba(220, 200, 150, ${0.3 + (isHovered ? 0.2 : 0)}) 0deg,
                rgba(180, 140, 100, ${0.25 + (isHovered ? 0.15 : 0)}) 180deg,
                rgba(220, 200, 150, ${0.3 + (isHovered ? 0.2 : 0)}) 360deg
              )
            `,
            boxShadow: `
              0 0 20px rgba(220, 200, 150, ${0.4 + (isHovered ? 0.3 : 0)}),
              0 0 40px rgba(180, 140, 100, ${0.2 + (isHovered ? 0.2 : 0)})
            `,
            filter: `blur(${isHovered ? 2 : 1}px)`,
            transform: `rotate(${time * 30}deg) scale(${isHovered ? 1.2 : 1})`
          }}
        />
        
        {/* Home SVG Icon */}
        <svg 
          className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} relative z-10 transition-all duration-500 group-hover:scale-110`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          style={{
            color: `rgba(220, 200, 150, ${0.9 + (isHovered ? 0.1 : 0)})`,
            filter: `
              drop-shadow(0 0 10px rgba(220, 200, 150, ${0.8 + (isHovered ? 0.4 : 0)}))
              drop-shadow(0 0 20px rgba(180, 140, 100, ${0.4 + (isHovered ? 0.3 : 0)}))
              hue-rotate(${time * 10}deg)
            `,
            strokeWidth: isHovered ? '2.5' : '2',
            transform: `rotate(${isHovered ? time * 60 : 0}deg)`
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m3 12 2-2m0 0 7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11 2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
        </svg>
      </div>

      {/* Hover Text - Desktop Only */}
      {isHovered && !isMobile && (
        <div 
          className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-lg pointer-events-none whitespace-nowrap"
          style={{
            background: `
              linear-gradient(145deg, 
                rgba(35, 30, 25, 0.95) 0%,
                rgba(25, 22, 18, 0.98) 50%,
                rgba(15, 12, 8, 1) 100%
              )
            `,
            border: '1px solid rgba(220, 200, 150, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <span 
            className="text-sm font-medium"
            style={{ 
              color: 'rgba(220, 200, 150, 0.9)',
              textShadow: '0 0 10px rgba(220, 200, 150, 0.5)',
              fontFamily: 'Orbitron, monospace'
            }}
          >
            HOME
          </span>
        </div>
      )}
    </button>
  );
};

export default HomeButton;