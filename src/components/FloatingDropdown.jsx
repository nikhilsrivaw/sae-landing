import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

const FloatingDropdown = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [hoverIntensity, setHoverIntensity] = useState(0);
  const [waveOffset, setWaveOffset] = useState(0);
  const [quantumField, setQuantumField] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const animationFrameRef = useRef(null);
  const timeRef = useRef(0);
  const dropdownRef = useRef(null);

  // Handle responsive screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // SMOOTH ANIMATION LOOP optimized for 60fps
  useEffect(() => {
    let lastTime = 0;
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;
    
    const animate = (currentTime) => {
      if (currentTime - lastTime >= frameTime) {
        timeRef.current += 0.005; // Very smooth transitions
        setWaveOffset(prev => prev + 0.003);
        setQuantumField(prev => Math.max(0, prev * 0.995)); // Very gentle decay
        lastTime = currentTime;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate(0);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // BUTTERY SMOOTH mouse tracking
  const handleMouseMove = useCallback((e) => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      // Smooth interpolated mouse position
      setMousePos(prev => ({
        x: prev.x + (x - prev.x) * 0.1,
        y: prev.y + (y - prev.y) * 0.1
      }));
      
      // Smooth intensity calculation
      const centerX = 0.5;
      const centerY = 0.5;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const targetIntensity = Math.max(0, Math.min(1, 1 - distance * 1.2));
      
      setHoverIntensity(prev => prev + (targetIntensity - prev) * 0.05);
      
      // Smooth quantum field updates
      const velocity = Math.min(Math.sqrt(e.movementX ** 2 + e.movementY ** 2) / 30, 1);
      setQuantumField(prev => Math.min(1, prev + velocity * 0.02));
    }
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDropdownOpen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsDropdownOpen(false);
        setIsAnimating(false);
      }, isMobile ? 250 : 400);
    } else {
      setIsDropdownOpen(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), isMobile ? 300 : 600);
    }
  };

  const menuItems = [
    { name: 'SPONSORS', href: '/sponsors' },
    { name: 'TEAM', href: '/team' },
    { name: '4 CHAMBERS', href: '/chambers' },
    { name: 'GLIMPSE', href: '/glimpse' },
    { name: 'CREATORS', href: '/creators' },
    { name: 'EVENTS', href: '/events' },
  ];

  return (
    <div 
      ref={dropdownRef}
      className="fixed z-[100000]"
      style={{ 
        top: isMobile ? '10px' : '20px',
        right: isMobile ? '10px' : '20px'
      }}
      onMouseMove={handleMouseMove}
    >
      {/* ELEGANT SVG Button */}
      <button
        onClick={toggleDropdown}
        className={`group relative ${isMobile ? 'w-10 h-10' : 'w-12 h-12'} flex items-center justify-center transition-all duration-300 hover:scale-110`}
        style={{
          background: `
            linear-gradient(145deg, 
              rgba(35, 30, 25, 0.95) 0%,
              rgba(25, 22, 18, 0.98) 50%,
              rgba(20, 20, 35, 0.99) 70%,
              rgba(12, 12, 22, 1) 100%
            )
          `,
          border: '2px solid rgba(0, 255, 255, 0.4)',
          borderRadius: '6px',
          boxShadow: `
            inset 0 2px 0 rgba(255, 255, 255, 0.08),
            inset 0 -2px 0 rgba(0, 0, 0, 0.9),
            0 4px 12px rgba(0, 0, 0, 0.7),
            0 1px 3px rgba(0, 0, 0, 0.8)
          `,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'auto'
        }}
      >
        {/* Three dots SVG */}
        <svg 
          className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-white group-hover:text-cyan-300 transition-colors duration-300`}
          fill="currentColor" 
          viewBox="0 0 24 24"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.3))',
            transform: isDropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'all 0.3s ease-out',
            pointerEvents: 'none'
          }}
        >
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {/* BEAUTIFUL DIVINE Dropdown Menu */}
      {isDropdownOpen && (
        <div 
          className={`absolute top-full right-0 ${isMobile ? 'mt-2' : 'mt-4'} ${isMobile ? 'w-[280px] max-w-[calc(100vw-20px)]' : 'w-72'} origin-top-right transform transition-all ${isMobile ? 'duration-300' : 'duration-600'} ${isMobile ? 'ease-[cubic-bezier(0.34,1.56,0.64,1)]' : 'ease-out'} z-[10000] ${isAnimating && !isDropdownOpen ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}
          style={{
            background: isMobile ? `
              linear-gradient(145deg,
                rgba(60, 55, 50, 0.98) 0%,
                rgba(45, 40, 35, 0.99) 25%,
                rgba(35, 30, 25, 0.995) 50%,
                rgba(25, 22, 18, 0.998) 75%,
                rgba(15, 12, 8, 1) 100%
              )
            ` : `
              conic-gradient(from ${timeRef.current * 45}deg at 50% 50%,
                rgba(220, 200, 150, 0.12) 0deg,
                rgba(180, 140, 100, 0.10) 60deg,
                rgba(160, 130, 90, 0.11) 120deg,
                rgba(200, 170, 120, 0.09) 180deg,
                rgba(190, 150, 110, 0.10) 240deg,
                rgba(170, 130, 95, 0.11) 300deg,
                rgba(220, 200, 150, 0.12) 360deg
              ),
              radial-gradient(ellipse at 30% 20%, 
                rgba(60, 55, 50, 0.98) 0%,
                rgba(45, 40, 35, 0.99) 25%,
                rgba(35, 30, 25, 0.995) 50%,
                rgba(25, 22, 18, 0.998) 75%,
                rgba(15, 12, 8, 1) 100%
              ),
              linear-gradient(${135 + timeRef.current * 20}deg, 
                rgba(200, 180, 140, 0.06) 0%,
                transparent 25%,
                rgba(170, 150, 120, 0.04) 50%,
                transparent 75%,
                rgba(190, 160, 130, 0.05) 100%
              )
            `,
            border: isMobile ? '2px solid rgba(220, 200, 150, 0.4)' : '3px solid transparent',
            borderImage: isMobile ? 'none' : `conic-gradient(from ${timeRef.current * 60}deg at 50% 50%, 
              rgba(220, 200, 150, 0.5) 0deg,
              rgba(180, 140, 100, 0.45) 72deg,
              rgba(200, 170, 120, 0.48) 144deg,
              rgba(190, 150, 110, 0.42) 216deg,
              rgba(170, 130, 95, 0.46) 288deg,
              rgba(220, 200, 150, 0.5) 360deg
            ) 1`,
            borderRadius: isMobile ? '12px' : '16px',
            boxShadow: `
              0 30px 100px rgba(0, 0, 0, 0.98),
              0 0 80px rgba(220, 200, 150, 0.2),
              0 0 60px rgba(180, 140, 100, 0.15),
              0 0 40px rgba(200, 170, 120, 0.12),
              0 0 150px rgba(0, 0, 0, 0.95),
              inset 0 3px 0 rgba(255, 255, 255, 0.15),
              inset 0 -3px 0 rgba(0, 0, 0, 0.9),
              inset 0 0 50px rgba(220, 200, 150, 0.04),
              0 0 0 1px rgba(255, 255, 255, 0.12)
            `,
            backdropFilter: isMobile ? 'blur(20px) saturate(180%)' : `blur(40px) saturate(300%) contrast(150%) brightness(110%)`,
            filter: `drop-shadow(0 0 30px rgba(220, 200, 150, 0.25)) drop-shadow(0 0 60px rgba(180, 140, 100, 0.15))`,
            pointerEvents: 'auto'
          }}
        >
          {/* BEAUTIFUL Holographic Corner System - Simplified for mobile */}
          {!isMobile && (
            <div className="absolute -top-2 -left-2 w-6 h-6">
              <div 
                className="w-full h-full border-t-3 border-l-3 shadow-lg"
                style={{
                  borderColor: 'rgba(220, 200, 150, 0.8)',
                  boxShadow: '0 0 10px rgba(220, 200, 150, 0.6)',
                  filter: 'drop-shadow(0 0 15px rgba(220, 200, 150, 0.6))',
                  animation: 'holoCorner 4s ease-in-out infinite'
                }}
              ></div>
              <div className="absolute top-1 left-1 w-2 h-2 blur-sm animate-pulse" style={{backgroundColor: 'rgba(220, 200, 150, 0.4)'}}></div>
            </div>
          )}
          
          {!isMobile && (
            <>
              <div className="absolute -top-2 -right-2 w-6 h-6">
                <div 
                  className="w-full h-full border-t-3 border-r-3 shadow-lg"
                  style={{
                    borderColor: 'rgba(180, 140, 100, 0.8)',
                    boxShadow: '0 0 10px rgba(180, 140, 100, 0.6)',
                    filter: 'drop-shadow(0 0 15px rgba(180, 140, 100, 0.6))',
                    animation: 'holoCorner 4.2s ease-in-out infinite'
                  }}
                ></div>
                <div className="absolute top-1 right-1 w-2 h-2 blur-sm animate-pulse" style={{backgroundColor: 'rgba(180, 140, 100, 0.4)'}}></div>
              </div>
              
              <div className="absolute -bottom-2 -left-2 w-6 h-6">
                <div 
                  className="w-full h-full border-b-3 border-l-3 shadow-lg"
                  style={{
                    borderColor: 'rgba(200, 170, 120, 0.8)',
                    boxShadow: '0 0 10px rgba(200, 170, 120, 0.6)',
                    filter: 'drop-shadow(0 0 15px rgba(200, 170, 120, 0.6))',
                    animation: 'holoCorner 3.8s ease-in-out infinite'
                  }}
                ></div>
                <div className="absolute bottom-1 left-1 w-2 h-2 blur-sm animate-pulse" style={{backgroundColor: 'rgba(200, 170, 120, 0.4)'}}></div>
              </div>
              
              <div className="absolute -bottom-2 -right-2 w-6 h-6">
                <div 
                  className="w-full h-full border-b-3 border-r-3 shadow-lg"
                  style={{
                    borderColor: 'rgba(190, 150, 110, 0.8)',
                    boxShadow: '0 0 10px rgba(190, 150, 110, 0.6)',
                    filter: 'drop-shadow(0 0 15px rgba(190, 150, 110, 0.6))',
                    animation: 'holoCorner 4.5s ease-in-out infinite'
                  }}
                ></div>
                <div className="absolute bottom-1 right-1 w-2 h-2 blur-sm animate-pulse" style={{backgroundColor: 'rgba(190, 150, 110, 0.4)'}}></div>
              </div>
            </>
          )}
          
          {/* Quantum Energy Streams - Simplified for mobile */}
          {!isMobile && (
            <>
              <div 
                className="absolute -top-1 left-6 right-6 h-1 blur-sm"
                style={{
                  background: 'linear-gradient(to right, transparent, rgba(220, 200, 150, 0.7), transparent)',
                  animation: 'quantumStream 2s ease-in-out infinite'
                }}
              ></div>
              
              <div 
                className="absolute -bottom-1 left-6 right-6 h-1 blur-sm"
                style={{
                  background: 'linear-gradient(to right, transparent, rgba(180, 140, 100, 0.7), transparent)',
                  animation: 'quantumStream 2.5s ease-in-out infinite reverse'
                }}
              ></div>
              
              <div 
                className="absolute -left-1 top-6 bottom-6 w-1 blur-sm"
                style={{
                  background: 'linear-gradient(to bottom, transparent, rgba(200, 170, 120, 0.7), transparent)',
                  animation: 'quantumStream 3s ease-in-out infinite'
                }}
              ></div>
              
              <div 
                className="absolute -right-1 top-6 bottom-6 w-1 blur-sm"
                style={{
                  background: 'linear-gradient(to bottom, transparent, rgba(190, 150, 110, 0.7), transparent)',
                  animation: 'quantumStream 2.8s ease-in-out infinite reverse'
                }}
              ></div>
            </>
          )}
          
          {/* Central Holographic Field - Simplified for mobile */}
          {!isMobile && (
            <div 
              className="absolute inset-2 opacity-20 pointer-events-none"
              style={{
                background: `conic-gradient(from ${timeRef.current * 90}deg at 50% 50%,
                  rgba(0, 255, 255, 0.3) 0deg,
                  rgba(255, 0, 255, 0.2) 120deg,
                  rgba(255, 255, 0, 0.25) 240deg,
                  rgba(0, 255, 255, 0.3) 360deg
                )`,
                borderRadius: '12px',
                filter: 'blur(8px)',
                animation: 'quantumField 5s linear infinite'
              }}
            ></div>
          )}
          
          {/* Quantum Field Background - Simplified for mobile */}
          {!isMobile && (
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                background: `
                  repeating-conic-gradient(from ${timeRef.current * 30}deg at 50% 50%,
                    rgba(220, 200, 150, 0.08) 0deg,
                    transparent 45deg,
                    rgba(180, 140, 100, 0.06) 90deg,
                    transparent 135deg,
                    rgba(200, 170, 120, 0.07) 180deg,
                    transparent 225deg,
                    rgba(190, 150, 110, 0.05) 270deg,
                    transparent 315deg,
                    rgba(220, 200, 150, 0.08) 360deg
                  )
                `,
                borderRadius: '12px',
                filter: 'blur(20px)'
              }}
            ></div>
          )}

          {/* ROTATING GEOMETRIC SHAPE - Simplified for mobile */}
          {!isMobile && (
            <div 
              className="absolute inset-4 opacity-50 pointer-events-none"
              style={{
                transform: `rotate(${timeRef.current * 150}deg) scale(${1 + Math.sin(timeRef.current * 20) * 0.1})`,
                transformOrigin: 'center center',
                zIndex: 1
              }}
            >
            {/* Main Hexagonal Shape */}
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  conic-gradient(from ${timeRef.current * 600}deg at 50% 50%,
                    rgba(220, 200, 150, 0.7) 0deg,
                    transparent 60deg,
                    rgba(180, 140, 100, 0.6) 120deg,
                    transparent 180deg,
                    rgba(200, 170, 120, 0.65) 240deg,
                    transparent 300deg,
                    rgba(220, 200, 150, 0.7) 360deg
                  )
                `,
                clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                filter: 'blur(2px)'
              }}
            />
            
            {/* Inner Triangle */}
            <div 
              className="absolute top-1/2 left-1/2 w-20 h-20"
              style={{
                transform: `translate(-50%, -50%) rotate(${-timeRef.current * 450}deg)`,
                background: `
                  conic-gradient(from ${timeRef.current * 1200}deg,
                    rgba(190, 150, 110, 0.8) 0deg,
                    transparent 120deg,
                    rgba(170, 130, 95, 0.7) 240deg,
                    transparent 360deg
                  )
                `,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                filter: 'blur(1px)'
              }}
            />
            
            {/* Outer Ring */}
            <div 
              className="absolute inset-2 border opacity-60"
              style={{
                borderColor: `rgba(220, 200, 150, 0.8)`,
                borderWidth: '3px',
                borderRadius: '50%',
                borderStyle: 'dashed',
                borderSpacing: '4px',
                transform: `rotate(${timeRef.current * -250}deg)`,
                filter: 'drop-shadow(0 0 8px rgba(220, 200, 150, 0.5))'
              }}
            />
            
            {/* Diamond Shapes */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-4 h-4"
                style={{
                  transform: `
                    translate(-50%, -50%) 
                    rotate(${angle + timeRef.current * 300}deg) 
                    translateY(-40px) 
                    rotate(${timeRef.current * 600}deg)
                  `,
                  background: `rgba(${180 + i * 10}, ${140 + i * 8}, ${100 + i * 6}, 1)`,
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                  filter: `blur(0.5px) drop-shadow(0 0 5px rgba(${180 + i * 10}, ${140 + i * 8}, ${100 + i * 6}, 0.6))`
                }}
              />
            ))}
            
            {/* Central Pulse */}
            <div 
              className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full"
              style={{
                transform: `translate(-50%, -50%) scale(${1 + Math.sin(timeRef.current * 80) * 0.5})`,
                background: `
                  radial-gradient(circle,
                    rgba(220, 200, 150, 1) 0%,
                    rgba(200, 170, 120, 0.8) 50%,
                    rgba(180, 140, 100, 0.4) 80%,
                    transparent 100%
                  )
                `,
                boxShadow: `
                  0 0 20px rgba(220, 200, 150, 1),
                  0 0 40px rgba(220, 200, 150, 0.8),
                  0 0 60px rgba(220, 200, 150, 0.6)
                `,
                filter: 'blur(1px)'
              }}
            />
            </div>
          )}

          {/* BEAUTIFUL Menu Items Container */}
          <div className={`relative ${isMobile ? 'px-3 py-4' : 'px-4 py-6'}`} style={{ zIndex: 10 }}>
            {menuItems.map((item, index) => {
              const colors = [
                { 
                  primary: [220, 200, 150], 
                  secondary: [200, 180, 130], 
                  name: 'GOLDEN CLASSIC',
                  icon: '◈',
                  particle: '⬟'
                },
                { 
                  primary: [180, 140, 100], 
                  secondary: [160, 120, 80], 
                  name: 'BRONZE ELITE',
                  icon: '◉',
                  particle: '⬢'
                },
                { 
                  primary: [200, 170, 120], 
                  secondary: [180, 150, 100], 
                  name: 'COPPER LUXURY',
                  icon: '◎',
                  particle: '⬡'
                },
                { 
                  primary: [190, 150, 110], 
                  secondary: [170, 130, 90], 
                  name: 'AMBER PRESTIGE',
                  icon: '◐',
                  particle: '⬠'
                },
                { 
                  primary: [170, 130, 95], 
                  secondary: [150, 110, 75], 
                  name: 'BRASS PREMIUM',
                  icon: '◑',
                  particle: '⬟'
                },
                { 
                  primary: [160, 130, 90], 
                  secondary: [140, 110, 70], 
                  name: 'BRONZE LEGACY',
                  icon: '◒',
                  particle: '⬟'
                }
              ];
              const color = colors[index % colors.length];
              
              return (
                <div
                  key={item.name}
                  className={`relative ${isMobile ? 'mb-2' : 'mb-3'} last:mb-0 group cursor-pointer ${isMobile ? 'active:scale-95' : ''} transition-transform duration-200`}
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDropdownOpen(false);
                    navigate(item.href);
                  }}
                  onMouseEnter={(e) => {
                    const card = e.currentTarget;
                    if (gsap && !isMobile) {
                      // Main card animation - target the menu-card specifically
                      const menuCard = card.querySelector('.menu-card');
                      if (menuCard) {
                        gsap.to(menuCard, {
                          scale: 1.05,
                          y: -8,
                          rotateX: 5,
                          rotateY: 2,
                          duration: 0.5,
                          ease: "power2.out"
                        });
                      }
                      
                      // Hologram effect
                      const hologram = card.querySelector('.hologram');
                      if (hologram) {
                        gsap.to(hologram, {
                          opacity: 0.8,
                          scale: 1.2,
                          duration: 0.6,
                          ease: "power2.out"
                        });
                      }
                      
                      // Icon container rotation
                      const iconContainer = card.querySelector('.menu-icon');
                      if (iconContainer) {
                        gsap.to(iconContainer, {
                          rotation: 12,
                          scale: 1.15,
                          duration: 0.6,
                          ease: "back.out(1.7)"
                        });
                      }
                      
                      // Icon symbol rotation
                      const iconSymbol = card.querySelector('.icon-symbol');
                      if (iconSymbol) {
                        gsap.to(iconSymbol, {
                          rotation: -360,
                          scale: 1.2,
                          duration: 0.8,
                          ease: "back.out(1.7)"
                        });
                      }
                      
                      // Text glow enhancement
                      const titleText = card.querySelector('.menu-title');
                      const subtitleText = card.querySelector('.menu-subtitle');
                      if (titleText) {
                        gsap.to(titleText, {
                          scale: 1.08,
                          duration: 0.4,
                          ease: "power2.out"
                        });
                      }
                      if (subtitleText) {
                        gsap.to(subtitleText, {
                          scale: 1.05,
                          opacity: 1,
                          duration: 0.4,
                          ease: "power2.out"
                        });
                      }
                      
                      // Particle burst effect
                      const particles = card.querySelectorAll('.particle');
                      particles.forEach((particle, i) => {
                        gsap.to(particle, {
                          scale: 1.8,
                          rotation: (Math.random() - 0.5) * 720,
                          x: (Math.random() - 0.5) * 20,
                          y: (Math.random() - 0.5) * 20,
                          duration: 0.6,
                          delay: i * 0.05,
                          ease: "back.out(1.7)"
                        });
                      });
                      
                      // Corner brackets animation
                      const brackets = card.querySelectorAll('.corner-bracket');
                      brackets.forEach((bracket, i) => {
                        gsap.to(bracket, {
                          scale: 1.5,
                          duration: 0.4,
                          delay: i * 0.05,
                          ease: "back.out(1.7)"
                        });
                      });
                      
                      // Status indicator enhancement
                      const statusDot = card.querySelector('.status-indicator');
                      if (statusDot) {
                        gsap.to(statusDot, {
                          scale: 1.3,
                          duration: 0.5,
                          ease: "back.out(1.7)"
                        });
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget;
                    if (gsap && !isMobile) {
                      // Reset main card
                      const menuCard = card.querySelector('.menu-card');
                      if (menuCard) {
                        gsap.to(menuCard, {
                          scale: 1,
                          y: 0,
                          rotateX: 0,
                          rotateY: 0,
                          duration: 0.6,
                          ease: "power3.out"
                        });
                      }
                      
                      // Reset hologram
                      const hologram = card.querySelector('.hologram');
                      if (hologram) {
                        gsap.to(hologram, {
                          opacity: 0,
                          scale: 1,
                          duration: 0.5,
                          ease: "power2.out"
                        });
                      }
                      
                      // Reset icon container
                      const iconContainer = card.querySelector('.menu-icon');
                      if (iconContainer) {
                        gsap.to(iconContainer, {
                          rotation: 0,
                          scale: 1,
                          duration: 0.6,
                          ease: "power2.out"
                        });
                      }
                      
                      // Reset icon symbol
                      const iconSymbol = card.querySelector('.icon-symbol');
                      if (iconSymbol) {
                        gsap.to(iconSymbol, {
                          rotation: 0,
                          scale: 1,
                          duration: 0.6,
                          ease: "power2.out"
                        });
                      }
                      
                      // Reset text
                      const titleText = card.querySelector('.menu-title');
                      const subtitleText = card.querySelector('.menu-subtitle');
                      if (titleText) {
                        gsap.to(titleText, {
                          scale: 1,
                          duration: 0.5,
                          ease: "power2.out"
                        });
                      }
                      if (subtitleText) {
                        gsap.to(subtitleText, {
                          scale: 1,
                          opacity: 0.8,
                          duration: 0.5,
                          ease: "power2.out"
                        });
                      }
                      
                      // Reset particles
                      const particles = card.querySelectorAll('.particle');
                      particles.forEach((particle, i) => {
                        gsap.to(particle, {
                          scale: 1,
                          rotation: 0,
                          x: 0,
                          y: 0,
                          duration: 0.5,
                          delay: i * 0.02,
                          ease: "power2.out"
                        });
                      });
                      
                      // Reset corner brackets
                      const brackets = card.querySelectorAll('.corner-bracket');
                      brackets.forEach((bracket, i) => {
                        gsap.to(bracket, {
                          scale: 1,
                          duration: 0.4,
                          delay: i * 0.02,
                          ease: "power2.out"
                        });
                      });
                      
                      // Reset status indicator
                      const statusDot = card.querySelector('.status-indicator');
                      if (statusDot) {
                        gsap.to(statusDot, {
                          scale: 1,
                          duration: 0.4,
                          ease: "power2.out"
                        });
                      }
                    }
                  }}
                >
                  {/* Floating Particles */}
                  <div className="absolute -top-2 -left-2 text-xs opacity-60 particle animate-pulse" style={{ color: `rgb(${color.primary.join(',')})`, pointerEvents: 'none' }}>
                    {color.particle}
                  </div>
                  <div className="absolute -top-1 -right-3 text-xs opacity-40 particle animate-pulse" style={{ color: `rgb(${color.secondary.join(',')})`, pointerEvents: 'none' }}>
                    {color.particle}
                  </div>
                  <div className="absolute -bottom-2 -right-2 text-xs opacity-50 particle animate-pulse" style={{ color: `rgb(${color.primary.join(',')})`, pointerEvents: 'none' }}>
                    {color.particle}
                  </div>
                  
                  {/* Holographic Aura */}
                  <div 
                    className="absolute inset-0 hologram opacity-0 blur-sm"
                    style={{
                      background: `radial-gradient(ellipse at center, 
                        rgba(${color.primary.join(',')}, 0.3) 0%,
                        rgba(${color.secondary.join(',')}, 0.2) 50%,
                        transparent 100%
                      )`,
                      borderRadius: '12px',
                      transform: 'scale(1.1)'
                    }}
                  />

                  {/* Main Menu Card */}
                  <div 
                    className={`menu-card relative ${isMobile ? 'px-4 py-3' : 'px-6 py-4'} overflow-hidden cursor-pointer ${isMobile ? 'rounded-lg' : 'rounded-xl'}`}
                    style={{
                      background: isMobile ? `
                        linear-gradient(145deg, 
                          rgba(${Math.floor(70 + index * 6)}, ${Math.floor(70 + index * 4)}, ${Math.floor(90 + index * 5)}, 0.9) 0%,
                          rgba(${Math.floor(50 + index * 4)}, ${Math.floor(50 + index * 3)}, ${Math.floor(70 + index * 4)}, 0.95) 50%,
                          rgba(${Math.floor(30 + index * 3)}, ${Math.floor(30 + index * 3)}, ${Math.floor(50 + index * 3)}, 1) 100%
                        )
                      ` : `
                        linear-gradient(145deg, 
                          rgba(${Math.floor(70 + index * 6)}, ${Math.floor(70 + index * 4)}, ${Math.floor(90 + index * 5)}, 0.9) 0%,
                          rgba(${Math.floor(50 + index * 4)}, ${Math.floor(50 + index * 3)}, ${Math.floor(70 + index * 4)}, 0.95) 50%,
                          rgba(${Math.floor(30 + index * 3)}, ${Math.floor(30 + index * 3)}, ${Math.floor(50 + index * 3)}, 1) 100%
                        ),
                        conic-gradient(from ${index * 72 + timeRef.current * 80}deg at 80% 20%,
                          rgba(${color.primary.join(',')}, 0.12) 0deg,
                          transparent 120deg,
                          rgba(${color.secondary.join(',')}, 0.08) 240deg,
                          transparent 360deg
                        )
                      `,
                      border: '2px solid transparent',
                      borderImage: `linear-gradient(135deg, 
                        rgba(${color.primary.join(',')}, 0.4) 0%,
                        rgba(${color.secondary.join(',')}, 0.3) 100%
                      ) 1`,
                      boxShadow: `
                        0 8px 32px rgba(0, 0, 0, 0.6),
                        0 0 20px rgba(${color.primary.join(',')}, 0.15),
                        0 0 40px rgba(${color.secondary.join(',')}, 0.1),
                        inset 0 2px 0 rgba(255, 255, 255, 0.1),
                        inset 0 -2px 0 rgba(0, 0, 0, 0.8)
                      `,
                      backdropFilter: 'blur(15px) saturate(150%)',
                      transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
                    }}
                  >
                    {/* Corner Brackets */}
                    {[
                      { pos: 'top-left', size: 4 },
                      { pos: 'top-right', size: 4 },
                      { pos: 'bottom-left', size: 4 },
                      { pos: 'bottom-right', size: 4 }
                    ].map(({ pos, size }, i) => (
                      <div 
                        key={pos}
                        className={`absolute ${pos.includes('top') ? 'top-2' : 'bottom-2'} ${pos.includes('left') ? 'left-2' : 'right-2'} w-${size} h-${size} transition-all duration-300 corner-bracket`}
                        style={{ 
                          borderTop: pos.includes('top') ? `2px solid rgba(${color.primary.join(',')}, 0.7)` : 'none',
                          borderBottom: pos.includes('bottom') ? `2px solid rgba(${color.primary.join(',')}, 0.7)` : 'none',
                          borderLeft: pos.includes('left') ? `2px solid rgba(${color.secondary.join(',')}, 0.7)` : 'none',
                          borderRight: pos.includes('right') ? `2px solid rgba(${color.secondary.join(',')}, 0.7)` : 'none',
                          filter: `drop-shadow(0 0 8px rgba(${color.primary.join(',')}, 0.5))`
                        }}
                      />
                    ))}
                    
                    {/* Main Content */}
                    <div className="flex items-center relative z-10">
                      {/* Icon */}
                      <div 
                        className={`${isMobile ? 'w-10 h-10 mr-3' : 'w-12 h-12 mr-4'} flex items-center justify-center rounded-lg transition-all duration-400 menu-icon`}
                        style={{
                          background: `conic-gradient(from ${timeRef.current * 100}deg,
                            rgba(${color.primary.join(',')}, 0.3) 0deg,
                            rgba(${color.secondary.join(',')}, 0.2) 180deg,
                            rgba(${color.primary.join(',')}, 0.3) 360deg
                          )`,
                          border: `1px solid rgba(${color.primary.join(',')}, 0.4)`,
                          boxShadow: `0 0 15px rgba(${color.primary.join(',')}, 0.3)`
                        }}
                      >
                        <span 
                          className={`${isMobile ? 'text-xl' : 'text-2xl'} transition-all duration-500 icon-symbol`}
                          style={{ 
                            color: `rgb(${color.primary.join(',')})`,
                            filter: `drop-shadow(0 0 10px rgba(${color.primary.join(',')}, 0.8))`
                          }}
                        >
                          {color.icon}
                        </span>
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1">
                        <div 
                          className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-1 transition-all duration-300 menu-title`}
                          style={{ 
                            color: `rgb(${color.primary.join(',')})`,
                            textShadow: `0 0 15px rgba(${color.primary.join(',')}, 0.6)`,
                            fontFamily: 'Orbitron, monospace',
                            letterSpacing: '1px'
                          }}
                        >
                          {item.name}
                        </div>
                        <div 
                          className="text-xs font-mono opacity-80 menu-subtitle"
                          style={{ 
                            color: `rgba(${color.secondary.join(',')}, 0.9)`,
                            textShadow: `0 0 10px rgba(${color.secondary.join(',')}, 0.4)`
                          }}
                        >
                          {color.name}
                        </div>
                      </div>
                      
                      {/* Status Indicator */}
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-3 h-3 rounded-full animate-pulse status-indicator"
                          style={{
                            background: `conic-gradient(from ${timeRef.current * 200}deg,
                              rgba(${color.primary.join(',')}, 1) 0deg,
                              rgba(${color.secondary.join(',')}, 0.8) 180deg,
                              rgba(${color.primary.join(',')}, 1) 360deg
                            )`,
                            boxShadow: `0 0 15px rgba(${color.primary.join(',')}, 0.8)`
                          }}
                        />
                        <div 
                          className="text-xs mt-1 font-mono"
                          style={{ 
                            color: `rgba(${color.primary.join(',')}, 0.7)`,
                            textShadow: `0 0 8px rgba(${color.primary.join(',')}, 0.4)`
                          }}
                        >
                          ACTIVE
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingDropdown;