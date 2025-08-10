import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Import only the main background for production
import background1 from '../assets/background (2).webp'; // Trevor with palm trees - MAIN HERO
// Other backgrounds removed for performance optimization

// Import division logos
import bajaLogo from '../../logo/baja (1).webp';
import supraLogo from '../../logo/supra.webp';
import aeroLogo from '../../logo/aero (1) (1).webp';
import discoLogo from '../../logo/disco (1).webp';

const Hero = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const backgroundRef = useRef(null);
  const loadingRef = useRef(null);
  const hudRef = useRef(null);
  const mapRef = useRef(null);
  const pointerRef = useRef(null);
  const tooltipRef = useRef(null);
  const saeLetterS = useRef(null);
  const saeLetterA = useRef(null);
  const saeLetterE = useRef(null);
  const saeDefinitions = useRef(null);
  const starLineRef = useRef(null);
  const fullTextRef = useRef(null);
  
  
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const saeMaskRef = useRef(null);
  const audioRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false); // Will be set to true once audio starts
  const [audioReady, setAudioReady] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [showIntroPopup, setShowIntroPopup] = useState(false);
  const popupRef = useRef(null);
  const smoothScrollRef = useRef(null);
  
  // Memoized handlers for better performance
  const openIntroPopup = useCallback(() => {
    setShowIntroPopup(true);
  }, []);
  
  const closeIntroPopup = useCallback(() => {
    setShowIntroPopup(false);
  }, []);
  
  // Complete scroll isolation for popup with GSAP smooth scroll
  useEffect(() => {
    if (showIntroPopup && popupRef.current) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Add class and prevent all background scrolling
      document.body.classList.add('popup-no-scroll');
      document.body.style.top = `-${scrollY}px`;
      
      // Create inner scrollable content wrapper
      const scrollContent = popupRef.current.firstElementChild;
      if (!scrollContent) return;
      
      // Initialize GSAP smooth scrolling variables
      let currentY = 0;
      let targetY = 0;
      let ease = 0.08; // Smoother easing
      let velocity = 0;
      let isScrolling = false;
      
      const smoothScroll = () => {
        // Calculate smooth easing with momentum
        const distance = targetY - currentY;
        
        if (Math.abs(distance) > 0.1) {
          currentY += distance * ease;
          velocity = distance * ease;
          
          // Apply transform to scroll content, not popup container
          if (scrollContent) {
            scrollContent.style.transform = `translateY(${-currentY}px)`;
            scrollContent.style.willChange = 'transform';
          }
          
          smoothScrollRef.current = requestAnimationFrame(smoothScroll);
        } else {
          isScrolling = false;
          if (scrollContent) {
            scrollContent.style.willChange = 'auto';
          }
        }
      };
      
      // Handle wheel events with GSAP
      const handleWheel = (e) => {
        if (popupRef.current?.contains(e.target)) {
          e.preventDefault();
          e.stopPropagation();
          
          // Improved scroll calculation
          const delta = e.deltaY;
          const scrollSpeed = 1.5; // Responsive speed
          targetY += delta * scrollSpeed;
          
          // Calculate boundaries correctly
          const containerHeight = popupRef.current.clientHeight;
          const contentHeight = scrollContent?.scrollHeight || 0;
          const maxScroll = Math.max(0, contentHeight - containerHeight);
          
          // Apply boundaries
          targetY = Math.max(0, Math.min(targetY, maxScroll));
          
          // Start smooth scrolling
          if (!isScrolling) {
            isScrolling = true;
            smoothScroll();
          }
        }
      };
      
      // Handle touch events with improved momentum
      let touchStartY = 0;
      let lastTouchY = 0;
      let touchVelocity = 0;
      let lastTouchTime = 0;
      
      const handleTouchStart = (e) => {
        if (popupRef.current?.contains(e.target)) {
          touchStartY = e.touches[0].clientY;
          lastTouchY = touchStartY;
          touchVelocity = 0;
          lastTouchTime = Date.now();
        }
      };
      
      const handleTouchMove = (e) => {
        if (popupRef.current?.contains(e.target)) {
          e.preventDefault();
          
          const now = Date.now();
          const touchY = e.touches[0].clientY;
          const deltaY = lastTouchY - touchY;
          const deltaTime = now - lastTouchTime;
          
          // Calculate velocity for momentum
          touchVelocity = deltaTime > 0 ? deltaY / deltaTime : 0;
          
          targetY += deltaY;
          
          // Calculate boundaries
          const containerHeight = popupRef.current.clientHeight;
          const contentHeight = scrollContent?.scrollHeight || 0;
          const maxScroll = Math.max(0, contentHeight - containerHeight);
          
          // Apply boundaries with rubber band effect
          if (targetY < 0) {
            targetY = targetY * 0.3; // Rubber band at top
          } else if (targetY > maxScroll) {
            targetY = maxScroll + (targetY - maxScroll) * 0.3; // Rubber band at bottom
          }
          
          lastTouchY = touchY;
          lastTouchTime = now;
          
          if (!isScrolling) {
            isScrolling = true;
            smoothScroll();
          }
        }
      };
      
      const handleTouchEnd = (e) => {
        if (popupRef.current?.contains(e.target)) {
          // Add momentum based on touch velocity
          const momentum = touchVelocity * 300; // Momentum multiplier
          targetY += momentum;
          
          // Calculate final boundaries
          const containerHeight = popupRef.current.clientHeight;
          const contentHeight = scrollContent?.scrollHeight || 0;
          const maxScroll = Math.max(0, contentHeight - containerHeight);
          
          // Apply final boundaries
          targetY = Math.max(0, Math.min(targetY, maxScroll));
          
          if (!isScrolling) {
            isScrolling = true;
            smoothScroll();
          }
        }
      };
      
      // Add event listeners with proper options
      document.addEventListener('wheel', handleWheel, { passive: false });
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        // Cleanup
        document.body.classList.remove('popup-no-scroll');
        document.body.style.top = '';
        
        // Remove event listeners
        document.removeEventListener('wheel', handleWheel);
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        
        // Cancel animation frame
        if (smoothScrollRef.current) {
          cancelAnimationFrame(smoothScrollRef.current);
          smoothScrollRef.current = null;
        }
        
        // Reset transforms
        if (scrollContent) {
          scrollContent.style.transform = '';
          scrollContent.style.willChange = 'auto';
        }
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [showIntroPopup]);


  // Debug: Log background imports on component mount


  // Force unmuted audio to play immediately when site loads
  useEffect(() => {
    const forceAudioStart = async () => {
      if (audioRef.current) {
        try {
          // Force unmute and set volume
          audioRef.current.muted = false;
          audioRef.current.volume = 0.8;
          audioRef.current.currentTime = 0;
          
          // Force play immediately
          await audioRef.current.play();
          console.log("🎵 FORCED Audio started successfully on site load");
          setIsAudioPlaying(true);
          setUserHasInteracted(true);
        } catch (e) {
          console.log("⚠️ Initial autoplay failed:", e.message);
          
          // Immediate retry with different approach
          setTimeout(async () => {
            try {
              if (audioRef.current) {
                audioRef.current.load(); // Reload audio
                audioRef.current.muted = false;
                audioRef.current.volume = 0.8;
                await audioRef.current.play();
                console.log("🎵 FORCED Audio started on immediate retry");
                setIsAudioPlaying(true);
                setUserHasInteracted(true);
              }
            } catch (retryError) {
              console.log("⚠️ Immediate retry failed, setting up interaction triggers");
              
              // Set up interaction triggers as last resort
              const forceAudioOnInteraction = async () => {
                try {
                  if (audioRef.current && !isAudioPlaying) {
                    audioRef.current.muted = false;
                    audioRef.current.volume = 0.8;
                    await audioRef.current.play();
                    console.log("🎵 FORCED Audio started after ANY interaction");
                    setIsAudioPlaying(true);
                    setUserHasInteracted(true);
                  }
                } catch (err) {
                  console.log("Audio completely blocked:", err.message);
                }
              };
              
              // Add listeners for ANY user interaction
              document.addEventListener('click', forceAudioOnInteraction, { once: true });
              document.addEventListener('touchstart', forceAudioOnInteraction, { once: true });
              document.addEventListener('keydown', forceAudioOnInteraction, { once: true });
              document.addEventListener('scroll', forceAudioOnInteraction, { once: true });
              document.addEventListener('mousemove', forceAudioOnInteraction, { once: true });
            }
          }, 50);
        }
      }
    };

    // Try multiple times when component mounts
    if (audioReady) {
      forceAudioStart();
      
      // Additional attempts at different intervals
      setTimeout(forceAudioStart, 500);
      setTimeout(forceAudioStart, 1000);
      setTimeout(forceAudioStart, 2000);
    }
  }, [audioReady]);

  // Additional effect to force audio on component mount
  useEffect(() => {
    const immediateAudioStart = async () => {
      if (audioRef.current) {
        try {
          audioRef.current.muted = false;
          audioRef.current.volume = 0.8;
          await audioRef.current.play();
          console.log("🎵 IMMEDIATE Audio started on component mount");
          setIsAudioPlaying(true);
        } catch (e) {
          console.log("Immediate mount audio failed:", e.message);
        }
      }
    };

    // Try immediately when component mounts
    immediateAudioStart();
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const background = backgroundRef.current;
    const loading = loadingRef.current;
    const hud = hudRef.current;

    // Debug: Log the background image path

    // Preload the main background image
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
    };
    img.onerror = () => {
      setImageLoaded(false);
    };
    img.src = background1;


    // GTA V Style Loading Screen - Much faster
    let loadingTl;
    try {
      loadingTl = gsap.timeline({
        onComplete: () => {
          setTimeout(() => setIsLoading(false), 200);
        }
      });
    } catch (error) {
      // Fallback if GSAP fails
      setTimeout(() => setIsLoading(false), 100);
      return;
    }

    // Show content immediately
    if (imageLoaded) {
      try {
        loadingTl
          .to(".loading-bar-fill", { 
            width: "100%", 
            duration: 1.5,
            ease: "power2.inOut"
          })
          .to(".loading-text", {
            opacity: 0.6,
            duration: 0.2,
            repeat: 2,
            yoyo: true
          }, "-=1")
          .to(loading, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut"
          });
      } catch (error) {
        // Fallback if animation fails
        setTimeout(() => setIsLoading(false), 100);
      }
    } else {
      // Skip loading if image fails to load
      setTimeout(() => setIsLoading(false), 100);
    }

    // SAE TEXT MASK REVEAL ANIMATION - EXACTLY LIKE GTA VI
    if (saeMaskRef.current && !showMainContent) {
      try {
        const saeMaskTl = gsap.timeline({
          onComplete: () => {
            setShowMainContent(true);
          }
        });

        // Start SLOW then ACCELERATE - no waiting, smooth transition
        saeMaskTl
          .set(".sae-mask-group", { 
            rotation: 0,
            scale: 1,
            opacity: 1,
            transformOrigin: "center center"
          })
          // Animation starts - no audio logic here
          .call(() => {
            console.log("🎭 Mask animation starting");
          })
          .to(".sae-mask-group", {
            rotation: window.innerWidth < 640 ? 3 : 5, // Less rotation on mobile
            duration: window.innerWidth < 640 ? 2.0 : 2.5, // Faster on mobile
            ease: "power1.easeIn", // Slow start
            onComplete: function() {
              console.log("🔄 First rotation complete");
              // Audio control enabled after animation completes
            }
          })
          .to(".sae-mask-group", {
            scale: window.innerWidth < 640 ? 15 : 25, // Less scale on mobile for smoother animation
            duration: window.innerWidth < 640 ? 1.2 : 1.5, // Slightly faster on mobile
            ease: "power3.easeOut", // Fast finish
            transformOrigin: "center center",
            onUpdate: function() {
              if (this.progress() >= 0.3) {
                setShowMainContent(true);
              }
            },
            onComplete: function() {
              console.log("📈 Scale animation complete");
            }
          }, "-=0.5") // Minimal overlap for seamless transition
          // Add final massive expansion that fills entire screen including mobile
          .to(".sae-mask-group", {
            scale: window.innerWidth < 640 ? 45 : 60, // Massive scale to completely cover mobile screens
            duration: 0.6,
            ease: "power2.easeIn",
            transformOrigin: "center center",
            onComplete: function() {
              console.log("🎯 Final massive expansion complete - full screen covered");
            }
          }, "-=0.2")
          .to(".sae-mask-group", {
            opacity: 0,
            duration: 0.4,
            ease: "power2.easeOut",
            onComplete: function() {
              console.log("✅ Mask animation fully complete");
              setShowMainContent(true);
            }
          }, "-=0.2");

        return () => {
          saeMaskTl.kill();
        };
      } catch (error) {
        console.error("❌ Mask animation failed:", error);
        // Fallback if mask animation fails
        setShowMainContent(true);
      }
    }

    // Don't run main animations until SAE mask reveal is complete
    if (!showMainContent) return;

    // COMPLEX HERO ANIMATION SEQUENCE AS REQUESTED
    // Initial setup - EVERYTHING COMPLETELY HIDDEN except what we want to animate
    
    // HIDE ALL BACKGROUND IMAGES FIRST
    gsap.set(backgroundRef.current, { opacity: 0 });
    gsap.set('img[src*="background"]', { opacity: 0 });
    gsap.set('[style*="backgroundImage"]', { opacity: 0 });
    
    // HIDE ALL ELEMENTS - use proper refs instead of CSS selectors (with null checks)
    const elementsToHide = [title, subtitle, hud, mapRef.current, saeDefinitions.current, starLineRef.current, fullTextRef.current].filter(Boolean);
    if (elementsToHide.length > 0) {
      gsap.set(elementsToHide, { opacity: 0 });
    }
    // Set initial positions correctly for hero elements
    if (hud) gsap.set(hud, { opacity: 0, x: -100 });
    if (mapRef.current) gsap.set(mapRef.current, { opacity: 0, scale: 0.8, y: 100 });
    // Hide bottom fade with more specific targeting
    gsap.set('.absolute.bottom-0.left-0.w-full.h-32', { opacity: 0 }); // Bottom fade
    
    // Position SAE letters IN CENTER with SAME ENLARGED scale for compression
    if (saeLetterS.current) gsap.set(saeLetterS.current, { opacity: 0, x: 0, y: 0, scale: 6.0 });
    if (saeLetterA.current) gsap.set(saeLetterA.current, { opacity: 0, x: 0, y: 0, scale: 6.0 });
    if (saeLetterE.current) gsap.set(saeLetterE.current, { opacity: 0, x: 0, y: 0, scale: 6.0 });

    // Create the master timeline - IMMEDIATE START
    const masterTl = gsap.timeline({ 
      delay: 0,
      onComplete: () => {},
      onInterrupt: () => {},
      onReverseComplete: () => {}
    });

    // ===========================================
    // STEP 1: MINIMAL BLACK SCREEN - NO WAITING
    // ===========================================
    masterTl.set(heroRef.current, { 
      backgroundColor: '#000000',
      opacity: 1 
    })
    .addLabel("blackScreen")

    // ===========================================
    // STEP 2: SAE LETTERS COMPRESS FROM HIGHLY ENLARGED TO CENTER
    // ===========================================
    
    // GTA VI Style: Each letter compresses with individual timing and effects
    .to(saeLetterS.current, {
      duration: 0.8,
      opacity: 1,
      scale: 1,
      rotation: 360,
      ease: "back.out(1.7)"
    }, "+=0.3")
    .to(saeLetterA.current, {
      duration: 0.8,
      opacity: 1,
      scale: 1,
      rotation: -360,
      ease: "back.out(1.7)"
    }, "-=0.6")
    .to(saeLetterE.current, {
      duration: 0.8,
      opacity: 1,
      scale: 1,
      rotation: 360,
      ease: "back.out(1.7)"
    }, "-=0.6")
    .addLabel("compression")

    // Add dynamic pulsing effect like GTA VI
    .to([saeLetterS.current, saeLetterA.current, saeLetterE.current], {
      duration: 0.3,
      scale: 1.1,
      ease: "power2.inOut",
      yoyo: true,
      repeat: 1
    }, "-=0.2")
    
    // Force final scale to be exactly 1 for all letters to ensure consistency
    .set([saeLetterS.current, saeLetterA.current, saeLetterE.current], {
      scale: 1
    })

    // ===========================================
    // STEP 3: IMMEDIATE TEXT AND BACKGROUND - NO WAITING
    // ===========================================
    
    // Show location text IMMEDIATELY after compression
    .to(fullTextRef.current, {
      duration: 0.6,
      opacity: 1,
      y: 0,
      ease: "power2.out"
    }, "-=0.3")
    
    // Add wanted-style stars IMMEDIATELY
    .to(starLineRef.current, {
      duration: 0.4,
      opacity: 1,
      scaleX: 1,
      ease: "back.out(1.7)"
    }, "-=0.4")
    
    // Quick star effect
    .to(starLineRef.current.querySelectorAll('span'), {
      duration: 0.4,
      scale: [1, 1.3, 1],
      rotation: 360,
      ease: "power2.inOut",
      stagger: 0.08
    }, "-=0.3")
    
    // Background fades in IMMEDIATELY - MUCH FASTER
    .to('img[src*="background"]', {
      duration: 0.8,
      opacity: 1,
      ease: "power2.out"
    }, "-=0.8")
    .to('[style*="backgroundImage"]', {
      duration: 0.8,
      opacity: 1,
      ease: "power2.out"
    }, "-=0.8")
    .to(backgroundRef.current, {
      duration: 0.8,
      opacity: 1,
      scale: 1,
      ease: "power2.out"
    }, "-=0.8")
    .addLabel("missionArea")

    // ===========================================
    // STEP 4: HUD ACTIVATION - MUCH FASTER, NO WAITING
    // ===========================================
    
    // Subtitle appears IMMEDIATELY with background
    .to(subtitle, {
      duration: 0.6,
      opacity: 1,
      y: 0,
      scale: 1,
      ease: "power2.out"
    }, "-=0.5")
    .addLabel("objective")

    // HUD elements boot up FAST
    .to(hud, {
      duration: 0.5,
      opacity: 1,
      x: 0,
      ease: "power2.out"
    }, "-=0.3") // HUD
    
    // Minimap appears FAST
    .to(mapRef.current, {
      duration: 0.5,
      opacity: 1,
      scale: 1,
      y: 0,
      ease: "power2.out"
    }, "-=0.4") // Minimap
    
    // Bottom fade FAST
    .to('.absolute.bottom-0.left-0.w-full.h-32', {
      duration: 0.4,
      opacity: 1,
      ease: "power2.out"
    }, "-=0.3") // Bottom fade

    // Quick final star glow
    .to(starLineRef.current.querySelectorAll('span'), {
      duration: 0.5,
      scale: 1.15,
      textShadow: "0px 0px 8px #ffff00, 0px 0px 15px #ffff00",
      ease: "power2.inOut",
      stagger: 0.05
    }, "-=0.3")

    .addLabel("missionReady");


    // Pointer hover animation (with null check)
    if (pointerRef.current) {
      gsap.to(pointerRef.current, {
        y: -5,
        duration: 1.2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      });
    }

    // Radar sweep rotation DISABLED (static minimap)

    // Tooltip hover animations with GSAP
    const handleTooltipShow = () => {
      if (tooltipRef.current) {
        gsap.killTweensOf(tooltipRef.current);
        gsap.to(tooltipRef.current, {
          opacity: 1,
          scale: 1,
          y: -5,
          duration: 0.4,
          ease: "back.out(1.7)"
        });
        // Text typing effect
        const textElement = tooltipRef.current.querySelector('.typewriter-text');
        if (textElement) {
          gsap.set(textElement, { width: 0, overflow: 'hidden', display: 'inline-block' });
          gsap.to(textElement, { 
            width: 'auto', 
            duration: 1.2, 
            ease: "none", 
            delay: 0.3 
          });
        }
      }
    };

    const handleTooltipHide = () => {
      if (tooltipRef.current) {
        gsap.killTweensOf(tooltipRef.current);
        gsap.to(tooltipRef.current, {
          opacity: 0,
          scale: 0.8,
          y: 0,
          duration: 0.2,
          ease: "power2.inOut"
        });
      }
    };

    // Store functions for cleanup
    window.handleTooltipShow = handleTooltipShow;
    window.handleTooltipHide = handleTooltipHide;

    // Parallax scroll effect (with null checks)
    if (hero && background) {
      const parallaxTl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        }
      });

      parallaxTl.to(background, {
        y: -100,
        scale: 1.1,
        ease: "none"
      });
    }

    // REMOVED: No more jiggling mouse movement for SAE text - keep it simple and stable

    // REMOVED: No more mouse movement listener - keep SAE text stable

    // Removed complex interaction handlers - keep it simple

    // Store ref values for cleanup
    const starLineElement = starLineRef.current;
    
    return () => {
      // Proper cleanup to prevent crashes
      try {
        if (loadingTl) loadingTl.kill();
        if (masterTl) masterTl.kill(); 
        if (parallaxTl) parallaxTl.kill();
        
        // Kill any remaining star animations
        if (starLineElement) {
          gsap.killTweensOf(starLineElement.querySelectorAll('span'));
        }
        
        
        // No cleanup needed for simplified audio
      } catch (error) {
      }
    };
  }, [imageLoaded, showMainContent]);


  return (
    <>
      {/* GTA V Audio - FORCE UNMUTED AUTOPLAY */}
      <audio 
        ref={audioRef} 
        autoPlay
        loop
        preload="auto"
        muted={false}
        playsInline
        controls={false}
        className="hidden"
        volume={0.8}
        onCanPlay={async () => {
          console.log("✅ Audio can play - FORCING immediate start");
          setAudioReady(true);
          // Force play immediately when ready
          try {
            if (audioRef.current) {
              audioRef.current.muted = false;
              audioRef.current.volume = 0.8;
              await audioRef.current.play();
              console.log("🎵 FORCED play on canPlay event");
              setIsAudioPlaying(true);
            }
          } catch (e) {
            console.log("canPlay force failed:", e.message);
          }
        }}
        onCanPlayThrough={async () => {
          console.log("✅ Audio can play through - FORCING start");
          setAudioReady(true);
          // Force play when fully ready
          try {
            if (audioRef.current) {
              audioRef.current.muted = false;
              audioRef.current.volume = 0.8;
              await audioRef.current.play();
              console.log("🎵 FORCED play on canPlayThrough event");
              setIsAudioPlaying(true);
            }
          } catch (e) {
            console.log("canPlayThrough force failed:", e.message);
          }
        }}
        onLoadedData={async () => {
          console.log("✅ Audio loaded - FORCING start");
          setAudioReady(true);
          // Force play when loaded
          try {
            if (audioRef.current) {
              audioRef.current.muted = false;
              audioRef.current.volume = 0.8;
              await audioRef.current.play();
              console.log("🎵 FORCED play on loadedData event");
              setIsAudioPlaying(true);
            }
          } catch (e) {
            console.log("loadedData force failed:", e.message);
          }
        }}
        onLoadedMetadata={async () => {
          console.log("✅ Audio metadata loaded - FORCING start");
          setAudioReady(true);
          // Force play when metadata loaded
          try {
            if (audioRef.current) {
              audioRef.current.muted = false;
              audioRef.current.volume = 0.8;
              await audioRef.current.play();
              console.log("🎵 FORCED play on loadedMetadata event");
              setIsAudioPlaying(true);
            }
          } catch (e) {
            console.log("loadedMetadata force failed:", e.message);
          }
        }}
        onPlay={() => {
          console.log("▶️ Audio event: playing - SUCCESS!");
          setIsAudioPlaying(true);
        }}
        onPause={() => {
          console.log("⏸️ Audio event: paused");
          setIsAudioPlaying(false);
        }}
        onEnded={() => {
          console.log("🔄 Audio ended, will loop");
        }}
        onError={(e) => {
          console.log("❌ Audio error:", e);
        }}
      >
        <source src="/GTA-V-Welcome-to-Los-Santosx.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      

      {/* Authentic GTA V Loading Screen */}
      {isLoading && (
        <div 
          ref={loadingRef}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'
          }}
        >
          <div className="text-center max-w-2xl px-8">
            {/* GTA V Style Logo */}
            <div className="mb-12">
              <h1 className="text-8xl font-black tracking-wider mb-4"
                  style={{
                    fontFamily: 'Impact, Arial Black, sans-serif',
                    color: '#ffffff',
                    textShadow: '3px 3px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
                  }}>
                SAE
              </h1>
              <p className="text-2xl font-bold text-gray-300 tracking-widest"
                 style={{ fontFamily: 'Arial, sans-serif' }}>
                AUTO EMPIRE
              </p>
            </div>

            {/* Loading Bar */}
            <div className="mb-8">
              <div className="w-full h-2 bg-gray-800 rounded-full border border-gray-600">
                <div 
                  className="loading-bar-fill h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  style={{ width: '0%' }}
                ></div>
              </div>
            </div>

            {/* Loading Text */}
            <p className="loading-text text-gray-400 text-lg font-medium"
               style={{ fontFamily: 'Arial, sans-serif' }}>
              Loading Los Santos Auto Empire...
            </p>

            {/* Copyright */}
            <p className="text-gray-600 text-sm mt-8"
               style={{ fontFamily: 'Arial, sans-serif' }}>
              Society of Automotive Engineers © 2024
            </p>
          </div>
        </div>
      )}

      
      {/* SAE Text Mask Reveal Animation - Like GTA VI */}
      {!showMainContent && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
          <svg 
            ref={saeMaskRef}
            viewBox="0 0 1200 800" 
            className="w-full h-full max-w-full max-h-full"
            preserveAspectRatio="xMidYMid slice"
            style={{
              imageRendering: 'auto',
              shapeRendering: 'geometricPrecision',
              textRendering: 'geometricPrecision'
            }}
          >
            <defs>
              <mask id="saeMask">
                <rect width="100%" height="100%" fill="black" />
                <g className="sae-mask-group" style={{ transformOrigin: '50% 50%' }}>
                  <text
                    x="600"
                    y="400"
                    fontSize="240"
                    fontFamily="Impact, Arial Black, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontWeight="900"
                    letterSpacing="0.08em"
                    style={{
                      filter: 'none',
                      textShadow: 'none',
                      fontSmooth: 'always',
                      WebkitFontSmoothing: 'antialiased'
                    }}
                  >
                    SAE
                  </text>
                </g>
              </mask>
            </defs>
            
            <image
              href={typeof window !== 'undefined' && window.innerWidth < 640 ? '/mobile-bg (2).webp' : background1}
              width="100%"
              height="100%"
              mask="url(#saeMask)"
            />
          </svg>
        </div>
      )}

      {/* Main Hero Section */}
      <section 
        id="hero"
        ref={heroRef}
        className="relative h-screen overflow-hidden"
        style={{ 
          opacity: showMainContent ? 1 : 0,
          transition: 'opacity 0.1s ease-out'
        }}
      >
        {/* Desktop Background Image with Blur */}
        <img 
          src={background1} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover hidden sm:block"
          style={{
            filter: 'blur(2px)',
            transform: 'scale(1.05)',
            zIndex: 1
          }}
          onLoad={() => {
            setImageLoaded(true);
            setImageError(false);
          }}
          onError={(e) => {
            setImageError(true);
            setImageLoaded(false);
          }}
        />
        
        {/* Mobile Background Image */}
        <img 
          src="/mobile-bg (2).webp" 
          alt="Mobile Background" 
          className="absolute inset-0 w-full h-full object-cover block sm:hidden"
          style={{
            filter: 'blur(1px)',
            transform: 'scale(1.02)',
            zIndex: 1
          }}
        />
        
        {/* Fallback background if images fail */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: imageError ? 'none' : window.innerWidth >= 640 ? `url(${background1})` : 'url(/mobile-bg (2).webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            background: imageError ? 
              'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1a1a1a 50%, #2d2d2d 75%, #1a1a1a 100%)' : 
              '#2a2a2a',
            zIndex: 0
          }}
        ></div>
        {/* Animated Background Layer for Effects */}
        <div 
          ref={backgroundRef}
          className="absolute inset-0 w-full h-full"
          style={{
            opacity: 0,
            transform: 'scale(1.1)',
            zIndex: 2
          }}
        />

        {/* Subtle overlay to enhance readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 z-[5]" />

        {/* GTA 5 Style Audio Control - Center Top */}
        <div className="absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-30">
          <button
            className="audio-control-button group relative bg-black/90 border border-gray-600/50 text-white px-3 sm:px-5 py-2 rounded-full hover:bg-gray-900/95 hover:border-gray-500/70 transition-all duration-300 shadow-xl backdrop-blur-sm"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              console.log("🎵 Audio button clicked, current state:", {
                isAudioPlaying,
                paused: audioRef.current?.paused,
                currentTime: audioRef.current?.currentTime,
                volume: audioRef.current?.volume
              });
              
              if (!audioRef.current) {
                console.log("❌ No audio element found");
                return;
              }

              setUserHasInteracted(true);

              try {
                if (isAudioPlaying && !audioRef.current.paused) {
                  // Pause the audio
                  console.log("🔇 Button: Pausing audio");
                  audioRef.current.pause();
                  // State will be updated by onPause event
                } else {
                  // Play the audio
                  console.log("🔊 Button: Starting audio");
                  audioRef.current.muted = false;
                  audioRef.current.volume = 0.8;
                  
                  await audioRef.current.play();
                  console.log("✅ Button: Audio started successfully");
                  // State will be updated by onPlay event
                }
              } catch (e) {
                console.log("❌ Audio control failed:", e.message);
                setIsAudioPlaying(false);
              }
            }}
          >
            {/* Corner brackets for GTA 5 feel */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-gray-400/60 group-hover:border-gray-300/80 transition-colors duration-300"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-gray-400/60 group-hover:border-gray-300/80 transition-colors duration-300"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-gray-400/60 group-hover:border-gray-300/80 transition-colors duration-300"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-gray-400/60 group-hover:border-gray-300/80 transition-colors duration-300"></div>
            
            <div className="flex items-center space-x-3">
              {/* Audio icon with SVG */}
              <div className="w-4 h-4 transition-transform duration-300 group-hover:scale-110">
                {isAudioPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-300 group-hover:text-white transition-colors duration-300">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-300 group-hover:text-white transition-colors duration-300">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              
              {/* Button text */}
              <span className="text-gray-200 font-bold text-sm tracking-wider group-hover:text-white transition-colors duration-300 font-mono">
                {isAudioPlaying && !audioRef.current?.paused ? 'MUTE' : 'UNMUTE'}
              </span>
              
              {/* Status indicator */}
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isAudioPlaying && !audioRef.current?.paused
                  ? 'bg-green-500/80 animate-pulse' 
                  : 'bg-red-500/80'
              }`}></div>
            </div>
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-gray-400/5 via-gray-300/10 to-gray-400/5"></div>
          </button>
        </div>

        {/* SAE Engineering HUD */}
        <div 
          ref={hudRef}
          className="absolute top-6 left-6 z-20 opacity-0 group hidden sm:block"
          style={{ transform: 'translateX(-100px)' }}
        >
          <div className="relative w-72 h-32">
            
            {/* Rounded HUD frame */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-lg border border-gray-600/50 transition-all duration-500 group-hover:border-gray-500/70 rounded-xl"
            >
              {/* Wave pattern animation */}
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div 
                  className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
                  style={{
                    animation: 'slideRight 4s ease-in-out infinite'
                  }}
                ></div>
                <div 
                  className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400/30 to-transparent"
                  style={{
                    animation: 'slideLeft 5s ease-in-out infinite'
                  }}
                ></div>
              </div>
              
              <div className="p-4 h-full flex flex-col justify-between">
                
                {/* Header with logo */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* SAE Logo */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border border-gray-600 group-hover:border-gray-500 transition-colors duration-300 overflow-hidden bg-white/10">
                        <img 
                          src="/sae-logo.jpg" 
                          alt="SAE Logo" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback to text if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gray-700 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-gray-500 transition-colors duration-300" style={{display: 'none'}}>
                          <span className="text-gray-300 text-xs font-bold group-hover:text-white transition-colors duration-300">SAE</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-white font-bold text-sm">Society of Automotive Engineers</h3>
                      <p className="text-gray-400 text-xs">Chief Engineer</p>
                      <p className="text-gray-500 text-xs">MMMUT CHAPTER</p>
                    </div>
                  </div>
                  
                  {/* Realistic rolling wheel animation */}
                  <div className="relative w-8 h-8">
                    {/* Tire outer ring */}
                    <div 
                      className="w-8 h-8 border-2 border-gray-300 rounded-full relative bg-gray-800"
                      style={{
                        animation: 'wheelRoll 1.5s linear infinite'
                      }}
                    >
                      {/* Inner rim */}
                      <div className="absolute inset-1 border border-gray-400 rounded-full bg-gray-600">
                        {/* Wheel spokes - 5 spokes like real car wheel */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-0.5 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center" style={{transform: 'rotate(72deg)'}}>
                          <div className="w-2 h-0.5 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center" style={{transform: 'rotate(144deg)'}}>
                          <div className="w-2 h-0.5 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center" style={{transform: 'rotate(216deg)'}}>
                          <div className="w-2 h-0.5 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center" style={{transform: 'rotate(288deg)'}}>
                          <div className="w-2 h-0.5 bg-gray-300 rounded-full"></div>
                        </div>
                        {/* Center hub */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                      {/* Tire tread marks */}
                      <div className="absolute inset-0 rounded-full">
                        <div className="absolute top-0 left-1/2 w-0.5 h-1 bg-gray-400 rounded-full transform -translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-1/2 w-0.5 h-1 bg-gray-400 rounded-full transform -translate-x-1/2"></div>
                        <div className="absolute left-0 top-1/2 w-1 h-0.5 bg-gray-400 rounded-full transform -translate-y-1/2"></div>
                        <div className="absolute right-0 top-1/2 w-1 h-0.5 bg-gray-400 rounded-full transform -translate-y-1/2"></div>
                      </div>
                    </div>
                    {/* Ground shadow */}
                    <div className="absolute -bottom-1 left-1/2 w-6 h-0.5 bg-gray-600/40 rounded-full transform -translate-x-1/2 blur-sm"></div>
                  </div>
                </div>
                
                {/* Status bar */}
                <div className="flex items-center justify-between border-t border-gray-600/40 pt-3">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Budget</div>
                    <div className="text-green-400 font-mono text-sm font-bold">
                      ₹25.48L
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rating</div>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className="text-yellow-600/80 text-xs"
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
            
            {/* Subtle outer glow */}
            <div 
              className="absolute -inset-1 bg-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-md rounded-xl"
            ></div>
            
          </div>
        </div>
        
        {/* Custom keyframes for wave and wheel animations */}
        <style jsx>{`
          @keyframes slideRight {
            0% { transform: translateX(-100%); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateX(100%); opacity: 0; }
          }
          
          @keyframes slideLeft {
            0% { transform: translateX(100%); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateX(-100%); opacity: 0; }
          }
          
          @keyframes waveAround {
            0% { transform: rotate(0deg) scale(1); opacity: 0; }
            25% { opacity: 0.8; transform: rotate(90deg) scale(1.2); }
            50% { opacity: 1; transform: rotate(180deg) scale(1); }
            75% { opacity: 0.8; transform: rotate(270deg) scale(1.2); }
            100% { transform: rotate(360deg) scale(1); opacity: 0; }
          }
          
          @keyframes waveAroundVertical {
            0% { transform: rotate(0deg) scaleX(1); opacity: 0; }
            25% { opacity: 0.8; transform: rotate(45deg) scaleX(1.5); }
            50% { opacity: 1; transform: rotate(90deg) scaleX(1); }
            75% { opacity: 0.8; transform: rotate(135deg) scaleX(1.5); }
            100% { transform: rotate(180deg) scaleX(1); opacity: 0; }
          }
          
          @keyframes wheelRoll {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        {/* Main Content */}
        <div className="relative flex flex-col items-center justify-center h-full text-center px-4 z-20">
          
          {/* Animated SAE Title */}
          <div className="relative mb-8">
            {/* LARGE SAE Letters - RESPONSIVE SIZE */}
            <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-4 sm:mb-6">
              <span 
                ref={saeLetterS}
                className="font-black opacity-0 text-[8rem] sm:text-[12rem] leading-none tracking-[0.05em] skew-x-[-5deg]"
                style={{
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  color: '#ffffff',
                  textShadow: '4px 4px 0px #000000, -2px -2px 0px #333333, 2px -2px 0px #333333, -2px 2px 0px #333333',
                }}
              >
                S
              </span>
              <span 
                ref={saeLetterA}
                className="font-black opacity-0 text-[8rem] sm:text-[12rem] leading-none tracking-[0.05em] skew-x-[-5deg]"
                style={{
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  color: '#ffffff',
                  textShadow: '4px 4px 0px #000000, -2px -2px 0px #333333, 2px -2px 0px #333333, -2px 2px 0px #333333',
                }}
              >
                A
              </span>
              <span 
                ref={saeLetterE}
                className="font-black opacity-0 text-[8rem] sm:text-[12.5rem] leading-none tracking-[0.05em] skew-x-[-5deg]"
                style={{
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  color: '#ffffff',
                  textShadow: '4px 4px 0px #000000, -2px -2px 0px #333333, 2px -2px 0px #333333, -2px 2px 0px #333333',
                }}
              >
                E
              </span>
            </div>

            {/* Expanding Definitions */}
            <div 
              ref={saeDefinitions}
              className="absolute top-full left-1/2 transform -translate-x-1/2 text-center opacity-0 w-full"
            >
              <div className="definition-s opacity-0 transform translate-y-10 mb-2">
                <span className="text-2xl md:text-3xl font-bold tracking-[0.1em] skew-x-[-3deg]"
                      style={{ 
                        fontFamily: 'Impact, Arial Black, sans-serif', 
                        color: '#ffffff',
                        textShadow: '2px 2px 0px #000000, -1px -1px 0px #333333, 0px 0px 8px rgba(255,255,255,0.5)',
                      }}>
                  SOCIETY
                </span>
              </div>
              <div className="definition-a opacity-0 transform translate-y-10 mb-2">
                <span className="text-2xl md:text-3xl font-bold tracking-[0.1em] skew-x-[-3deg]"
                      style={{ 
                        fontFamily: 'Impact, Arial Black, sans-serif', 
                        color: '#ffffff',
                        textShadow: '2px 2px 0px #000000, -1px -1px 0px #333333, 0px 0px 8px rgba(255,255,255,0.5)',
                      }}>
                  AUTOMOTIVE
                </span>
              </div>
              <div className="definition-e opacity-0 transform translate-y-10">
                <span className="text-2xl md:text-3xl font-bold tracking-[0.1em] skew-x-[-3deg]"
                      style={{ 
                        fontFamily: 'Impact, Arial Black, sans-serif', 
                        color: '#ffffff',
                        textShadow: '2px 2px 0px #000000, -1px -1px 0px #333333, 0px 0px 8px rgba(255,255,255,0.5)',
                      }}>
                  ENGINEERS
                </span>
              </div>
            </div>

            {/* Full Text Below SAE */}
            <div 
              ref={fullTextRef}
              className="mb-6 opacity-0"
            >
              <h3 className="text-xl md:text-2xl font-bold tracking-wider skew-x-[-2deg]"
                  style={{
                    fontFamily: 'Impact, Arial Black, sans-serif',
                    color: '#ffffff',
                    textShadow: '2px 2px 0px #000000, -1px -1px 0px #333333, 0px 0px 8px rgba(255,255,255,0.4)',
                    letterSpacing: '0.1em',
                  }}>
                SOCIETY OF AUTOMOTIVE ENGINEERS
              </h3>
            </div>

            {/* Star Line Decoration */}
            <div 
              ref={starLineRef}
              className="flex justify-center items-center mt-4 opacity-0 transform scale-x-0"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl animate-pulse text-white" style={{ 
                  textShadow: '2px 2px 0px #000000, 0px 0px 6px rgba(255,255,255,0.6)'
                }}>★</span>
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
                <span className="text-3xl animate-pulse text-white" style={{ 
                  animationDelay: '0.3s',
                  textShadow: '2px 2px 0px #000000, 0px 0px 6px rgba(255,255,255,0.6)'
                }}>★</span>
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
                <span className="text-2xl animate-pulse text-white" style={{ 
                  animationDelay: '0.6s',
                  textShadow: '2px 2px 0px #000000, 0px 0px 6px rgba(255,255,255,0.6)'
                }}>★</span>
              </div>
            </div>

            {/* Hidden title for GSAP reference */}
            <h1 ref={titleRef} className="opacity-0 absolute">SAE</h1>
          </div>
          
          {/* Clean Subtitle */}
          <h2 
            ref={subtitleRef}
            className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-widest mb-6 sm:mb-8 opacity-0 transform translate-y-8"
            style={{
              fontFamily: 'Arial, sans-serif',
              color: '#ffffff',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            }}
          >
            AUTO EMPIRE
          </h2>
          
          {/* Description */}
          <p className="text-base sm:text-xl md:text-2xl text-white mb-8 sm:mb-12 max-w-4xl leading-relaxed font-medium px-4 sm:px-0"
             style={{ 
               textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
               fontFamily: 'Arial, sans-serif'
             }}>
            Welcome to Los Santos' most elite automotive engineering crew. 
            Where cutting-edge technology meets street racing culture in the neon-soaked nights of Vice City.
          </p>
          
        </div>


        {/* REAL GTA 5 MINIMAP - SATELLITE VIEW (NOT RADAR!) */}
        <div 
          ref={mapRef}
          className="absolute bottom-20 sm:bottom-6 left-2 sm:left-6 z-20 opacity-0 transform translate-y-24 scale-75"
        >
          {/* TRANSPARENT RECTANGULAR MINIMAP CONTAINER */}
          <div className="w-40 sm:w-64 h-28 sm:h-48 relative overflow-hidden rounded-lg sm:rounded-xl border-2 border-white/20 bg-black/30 backdrop-blur-lg"
               style={{
                 boxShadow: `
                   0 0 30px rgba(0, 0, 0, 0.7),
                   inset 0 0 12px rgba(0, 0, 0, 0.4)
                 `,
               }}>
            
            {/* REAL GTA 5 MINIMAP - EXACT REPLICA */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
                  <svg viewBox="0 0 256 192" xmlns="http://www.w3.org/2000/svg">
                    <!-- DARK SATELLITE BASE -->
                    <rect width="256" height="192" fill="#1a1a1a"/>
                    
                    <!-- WATER AREAS - VERY DARK -->
                    <rect x="0" y="0" width="256" height="85" fill="#0f0f0f"/>
                    <path d="M0,85 Q60,75 120,80 Q180,85 256,75 L256,0 L0,0 Z" fill="#0f0f0f"/>
                    
                    <!-- LAND MASS - DARK GRAY -->
                    <path d="M0,85 Q60,75 120,80 Q180,85 256,75 L256,192 L0,192 Z" fill="#2a2a2a"/>
                    
                    <!-- URBAN AREAS - DARKER CONCRETE -->
                    <rect x="100" y="110" width="50" height="40" fill="#333333" opacity="0.8"/>
                    <rect x="75" y="135" width="35" height="30" fill="#333333" opacity="0.7"/>
                    
                    <!-- HIGHWAYS - GRAY WITH WHITE LINES -->
                    <g>
                      <!-- Main intersection roads -->
                      <rect x="70" y="117" width="120" height="6" fill="#444444"/>
                      <rect x="125" y="60" width="6" height="110" fill="#444444"/>
                      
                      <!-- White road markings -->
                      <line x1="75" y1="120" x2="185" y2="120" stroke="white" stroke-width="1"/>
                      <line x1="128" y1="65" x2="128" y2="165" stroke="white" stroke-width="1"/>
                      
                      <!-- Additional roads -->
                      <rect x="40" y="147" width="160" height="4" fill="#444444"/>
                      <line x1="45" y1="149" x2="195" y2="149" stroke="white" stroke-width="0.5"/>
                      
                      <rect x="95" y="85" width="4" height="60" fill="#444444"/>
                      <line x1="97" y1="90" x2="97" y2="140" stroke="white" stroke-width="0.5"/>
                    </g>
                    
                    <!-- HIGHWAY OVERPASS -->
                    <rect x="122" y="115" width="12" height="10" fill="#555555" rx="1"/>
                    
                    <!-- AIRPORT AREA -->
                    <rect x="35" y="160" width="55" height="25" fill="#2a2a2a"/>
                    <rect x="45" y="170" width="35" height="3" fill="#444444"/>
                    <line x1="50" y1="171.5" x2="75" y2="171.5" stroke="white" stroke-width="1"/>
                    
                    <!-- VEGETATION/HILLS - SUBTLE -->
                    <ellipse cx="110" cy="85" rx="25" ry="15" fill="#252525" opacity="0.6"/>
                    <ellipse cx="180" cy="95" rx="30" ry="20" fill="#252525" opacity="0.5"/>
                    
                  </svg>
                `)}")`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                filter: 'brightness(0.6) contrast(1.2) saturate(0.7)'
              }}
            ></div>
            
            {/* GTA 5 AUTHENTIC UI ELEMENTS */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Simple Compass - Just like reference */}
              <div className="absolute bottom-4 left-4 w-6 h-6 bg-green-600 flex items-center justify-center text-white text-xs font-bold border border-black shadow-[0_0_0_1px_rgba(255,255,255,0.8)]">
                N
              </div>
              
              {/* Map icons in bottom right - like reference */}
              <div className="absolute bottom-4 right-4 w-6 h-6 bg-blue-600 flex items-center justify-center text-white text-xs font-bold border border-black shadow-[0_0_0_1px_rgba(255,255,255,0.8)]">
                📱
              </div>
              
              {/* NO GRID LINES - Clean like real GTA 5 */}
            </div>
            
            {/* PLAYER POSITION - WHITE TRIANGLE */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
              <div className="w-0 h-0"
                   style={{
                     borderLeft: '8px solid transparent',
                     borderRight: '8px solid transparent', 
                     borderBottom: '16px solid #ffffff',
                     filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 1)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.9))',
                     transform: 'rotate(0deg)'
                   }}></div>
            </div>
            
            {/* AUTHENTIC GTA 5 BLIPS - EXACT STYLE */}
            
            {/* SAE HQ - YELLOW BLIP (Mission/Important) */}
            <div 
              ref={pointerRef}
              className="absolute cursor-pointer z-20 top-[62%] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              onMouseEnter={() => {
                if (window.handleTooltipShow) window.handleTooltipShow();
              }}
              onMouseLeave={() => {
                if (window.handleTooltipHide) window.handleTooltipHide();
              }}
            >
              <div className="w-3 h-3 bg-yellow-400 rounded-full border border-black shadow-[0_0_0_1px_rgba(255,255,255,0.8)] relative">
                <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-black">S</div>
              </div>
            </div>
            
            {/* RED BLIP - Race/Challenge */}
            <div className="absolute top-[45%] left-[58%] w-2.5 h-2.5 bg-red-500 rounded-full border border-black shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
                 title="Street Race"></div>
            
            {/* GREEN BLIP - Shop/Service */}
            <div className="absolute top-[70%] left-[55%] w-2.5 h-2.5 bg-green-500 rounded-full border border-black shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
                 title="Mod Shop"></div>
            
            {/* BLUE BLIP - Special Location */}
            <div className="absolute top-[55%] left-[45%] w-2.5 h-2.5 bg-blue-500 rounded-full border border-black shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
                 title="Garage"></div>
                 
            {/* PINK BLIP - Custom/Unique */}
            <div className="absolute top-[65%] left-[42%] w-2.5 h-2.5 bg-pink-500 rounded-full border border-black shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
                 title="Benny's"></div>
                 
            {/* WHITE BLIP - Misc Location */}
            <div className="absolute top-[40%] left-[75%] w-2 h-2 bg-white rounded-full border border-black shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
                 title="Airfield"></div>
            
          </div>
          
          {/* REMOVED - No hover text on minimap */}
          
          {/* SAE HQ TOOLTIP - ONLY SHOWS ON SAE HQ HOVER */}
          <div 
            ref={tooltipRef}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg border border-white/30 whitespace-nowrap text-sm font-medium opacity-0 scale-0 transition-all duration-300 pointer-events-none z-50"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-yellow-400 text-lg">🏛️</span>
              <span className="font-bold tracking-wide">MADAN MOHAN MALVIYA UNIVERSITY OF TECHNOLOGY</span>
            </div>
          </div>
        </div>


        {/* Bottom Right Learn More Button - GTA Style */}
        <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 z-30">
          <button
            onClick={openIntroPopup}
            className="group relative bg-black/90 border border-gray-600/50 text-white px-4 sm:px-6 py-3 sm:py-3 rounded-lg hover:bg-gray-900/95 hover:border-gray-500/70 transition-all duration-300 shadow-2xl backdrop-blur-sm min-h-[48px] min-w-[48px] flex items-center justify-center"
          >
            {/* Corner brackets for GTA 5 feel - Show on all devices */}
            <div className="absolute -top-1 -left-1 w-2 h-2 sm:w-3 sm:h-3 border-t-2 border-l-2 border-gray-400/60 group-hover:border-gray-300/80 transition-colors duration-300"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 border-t-2 border-r-2 border-gray-400/60 group-hover:border-gray-300/80 transition-colors duration-300"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 sm:w-3 sm:h-3 border-b-2 border-l-2 border-gray-400/60 group-hover:border-gray-300/80 transition-colors duration-300"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 border-b-2 border-r-2 border-gray-400/60 group-hover:border-gray-300/80 transition-colors duration-300"></div>
            
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              {/* Mobile: Better styled content */}
              <div className="block sm:hidden">
                <div className="flex items-center space-x-2">
                  {/* Info Icon for mobile */}
                  <div className="w-4 h-4 transition-transform duration-300 group-hover:scale-110">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-300 group-hover:text-white transition-colors duration-300">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  
                  {/* Mobile text */}
                  <span className="text-white font-bold text-sm tracking-wide group-hover:text-white transition-colors duration-300 font-mono">
                    INFO
                  </span>
                  
                  {/* Arrow for mobile */}
                  <div className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white group-hover:text-gray-200 transition-colors duration-300">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Desktop: Full button content */}
              <div className="hidden sm:flex items-center space-x-3">
                {/* Info Icon */}
                <div className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-300 group-hover:text-white transition-colors duration-300">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                
                {/* Button text */}
                <div className="flex flex-col items-start">
                  <span className="text-white font-bold text-sm tracking-wider group-hover:text-white transition-colors duration-300 font-mono">
                    LEARN MORE
                  </span>
                  <span className="text-gray-400 text-xs font-mono tracking-wide group-hover:text-gray-300 transition-colors duration-300">
                    PRESS TO CONTINUE
                  </span>
                </div>
                
                {/* Animated arrow */}
                <div className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400 group-hover:text-white transition-colors duration-300">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-gray-400/5 via-gray-300/10 to-gray-400/5"></div>
          </button>
        </div>

        {/* Bottom fade to black for smooth transition */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
        
        {/* SAE Brand Story Experience */}
        {showIntroPopup && (
          <div 
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeIntroPopup();
              }
            }}
          >
            {/* Immersive Story Container */}
            <div 
              className="relative w-full max-w-6xl h-[90vh] bg-black overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeIntroPopup}
                className="absolute top-6 right-6 z-50 text-white/60 hover:text-white transition-colors duration-300"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Scrollable Content Container */}
              <div 
                ref={popupRef}
                className="h-full overflow-hidden relative"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {/* Inner scrollable content */}
                <div className="w-full">
                {/* Hero Section */}
                <div className="relative h-screen flex items-center justify-center px-4 sm:px-6 md:px-12">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)`,
                    }}></div>
                  </div>
                  
                  <div className="text-center max-w-4xl relative">
                    <div className="mb-8">
                      <div className="text-white/40 text-xs sm:text-sm font-mono tracking-[0.2em] sm:tracking-[0.3em] mb-4">EST. MMMUT CHAPTER</div>
                      <h1 className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-thin tracking-tight mb-6 leading-none px-2 sm:px-0">
                        SOCIETY OF
                        <br />
                        <span className="font-black">AUTOMOTIVE</span>
                        <br />
                        ENGINEERS
                      </h1>
                      <div className="w-16 sm:w-24 h-px bg-white mx-auto mb-6 sm:mb-8"></div>
                      <p className="text-white/80 text-sm sm:text-base lg:text-xl leading-relaxed max-w-2xl mx-auto px-4 sm:px-0">
                        Where engineering vision meets automotive reality. We don't just build machines—
                        <span className="text-white font-medium"> we craft the future of mobility.</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Our Philosophy */}
                <div className="px-4 sm:px-8 md:px-12 py-12 sm:py-16 md:py-24">
                  <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
                      <div>
                        <div className="text-white/40 text-xs sm:text-sm font-mono tracking-wider mb-4">OUR PHILOSOPHY</div>
                        <h2 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-thin mb-6 sm:mb-8 leading-tight px-2 sm:px-0">
                          Engineering Excellence
                          <br />
                          <span className="font-black">Through Innovation</span>
                        </h2>
                        <p className="text-white/70 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8 px-2 sm:px-0">
                          At SAE MMMUT, we believe that true engineering mastery comes from pushing boundaries. 
                          Every project, every competition, every innovation is a step toward reshaping what's possible 
                          in automotive and aerospace engineering.
                        </p>
                        <div className="space-y-3 sm:space-y-4">
                          {[
                            'Hands-on learning that transcends textbooks',
                            'Competition-driven excellence',
                            'Industry collaboration and mentorship',
                            'Innovation through research and development'
                          ].map((item, i) => (
                            <div key={i} className="flex items-center space-x-3 sm:space-x-4 px-2 sm:px-0">
                              <div className="w-1.5 sm:w-2 h-px bg-white"></div>
                              <span className="text-white/80 text-sm sm:text-base">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="relative px-2 sm:px-0">
                        <div className="aspect-square bg-gray-900/30 border border-white/10 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-white/20 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-thin mb-2 sm:mb-4">SAE</div>
                            <div className="text-white/60 text-xs sm:text-sm tracking-[0.2em]">ENGINEERING LEGACY</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Four Chambers - Cinematic Reveal */}
                <div className="py-12 sm:py-16 md:py-24 px-4 sm:px-8 md:px-12">
                  <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16 md:mb-20">
                      <div className="text-white/40 text-xs sm:text-sm font-mono tracking-wider mb-4">SPECIALIZED DIVISIONS</div>
                      <h2 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-5xl font-thin mb-8 leading-tight px-4 sm:px-0">
                        Four Pillars of
                        <br />
                        <span className="font-black">Engineering Excellence</span>
                      </h2>
                      <div className="w-32 h-px bg-white mx-auto"></div>
                    </div>

                    <div className="space-y-12 sm:space-y-16 md:space-y-24">
                      {[
                        {
                          name: 'BAJA',
                          tagline: 'Conquer Every Terrain',
                          description: 'Where rugged engineering meets unforgiving landscapes. Our BAJA division masters the art of all-terrain vehicle design, pushing suspension dynamics and engine optimization to their absolute limits.',
                          expertise: ['Suspension Architecture', 'Powertrain Optimization', 'Durability Engineering', 'Competition Racing'],
                          number: '01',
                          logo: bajaLogo
                        },
                        {
                          name: 'SUPRA',
                          tagline: 'Speed Redefined',
                          description: 'Precision engineering at 200+ mph. SUPRA division focuses on formula racing excellence, where aerodynamics, weight distribution, and performance tuning create championship-winning machines.',
                          expertise: ['Aerodynamic Design', 'Performance Tuning', 'Chassis Engineering', 'Race Strategy'],
                          number: '02',
                          logo: supraLogo
                        },
                        {
                          name: 'AERO',
                          tagline: 'Mastering Flight',
                          description: 'Beyond the horizon lies infinite possibility. Our Aerospace division pioneers flight technology, from unmanned systems to advanced propulsion, pushing the boundaries of what can soar.',
                          expertise: ['Aircraft Design', 'Propulsion Systems', 'Flight Dynamics', 'Autonomous Flight'],
                          number: '03',
                          logo: aeroLogo
                        },
                        {
                          name: 'DISCO',
                          tagline: 'Digital Revolution',
                          description: 'The future is intelligent. DISCO division integrates cutting-edge digital solutions, IoT systems, and autonomous technologies that make vehicles smarter than ever imagined.',
                          expertise: ['IoT Integration', 'Autonomous Systems', 'Smart Manufacturing', 'Digital Innovation'],
                          number: '04',
                          logo: discoLogo
                        }
                      ].map((division, i) => (
                        <div key={i} className="group">
                          <div className={`grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-16 items-center ${i % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                            <div className={`px-2 sm:px-0 ${i % 2 === 1 ? 'md:col-start-2' : ''}`}>
                              <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6 mb-3 sm:mb-4 md:mb-6">
                                <div className="text-white/20 text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-thin">{division.number}</div>
                                <div>
                                  <h3 className="text-white text-base sm:text-lg md:text-xl lg:text-3xl font-black tracking-wide">{division.name}</h3>
                                  <div className="text-white/60 text-xs sm:text-sm md:text-base lg:text-lg italic">{division.tagline}</div>
                                </div>
                              </div>
                              <p className="text-white/70 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6 md:mb-8">
                                {division.description}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                                {division.expertise.map((skill, j) => (
                                  <div key={j} className="text-white/50 text-xs sm:text-sm border-l-2 border-white/20 pl-2 sm:pl-3 md:pl-4">
                                    {skill}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className={i % 2 === 1 ? 'md:col-start-1' : ''}>
                              <div className="aspect-[4/3] bg-gray-900/20 border border-white/10 overflow-hidden group-hover:border-white/30 transition-all duration-500">
                                <img 
                                  src={division.logo} 
                                  alt={`${division.name} Division`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* GTA 5 Wanted Level Stars */}
                <div className="relative px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-24 border-t border-white/10 overflow-hidden">
                  {/* Gritty Background Elements */}
                  <div className="absolute inset-0">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute opacity-5"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          transform: `rotate(${Math.random() * 360}deg)`,
                        }}
                      >
                        <div className="text-white text-xs select-none font-mono">
                          {['MMMUT', 'SAE', 'AUTO', 'TECH'][Math.floor(Math.random() * 4)]}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Slow Drifting Stars - GTA Style */}
                  <div className="absolute inset-0">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={`drift-${i}`}
                        className="absolute text-white/10 select-none"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animation: `gtaDrift ${10 + Math.random() * 10}s linear infinite`,
                          animationDelay: `${Math.random() * 5}s`,
                          fontSize: `${12 + Math.random() * 8}px`
                        }}
                      >
                        ★
                      </div>
                    ))}
                  </div>

                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      {/* GTA 5 Wanted Level Style Stars */}
                      <div className="flex items-center justify-center space-x-1 sm:space-x-2 md:space-x-4 mb-3 sm:mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="text-white font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl select-none opacity-60 hover:opacity-100 transition-opacity duration-300"
                            style={{
                              fontFamily: 'Impact, Arial Black, sans-serif',
                              textShadow: '2px 2px 0px #000000, -1px -1px 0px #333333',
                              animation: `gtaFlicker ${2 + i * 0.5}s ease-in-out infinite alternate`,
                              animationDelay: `${i * 0.3}s`
                            }}
                          >
                            ★
                          </div>
                        ))}
                      </div>
                      <div className="text-white/40 text-xs sm:text-sm font-mono tracking-widest px-4 sm:px-0">
                        LOS SANTOS AUTO EMPIRE
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* Add CSS animations and styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideRight {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        /* Force body to never scroll when popup open */
        body.popup-no-scroll {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
        }
        
        /* Mobile viewport adjustments */
        @media (max-width: 640px) {
          body {
            overflow-x: hidden;
          }
          
          /* Prevent horizontal scroll on mobile */
          * {
            max-width: 100vw;
            box-sizing: border-box;
          }
          
          /* Better touch targets on mobile */
          button, a {
            min-height: 44px;
            min-width: 44px;
          }
        }
        
        /* Hide all scrollbars globally */
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          background: transparent !important;
        }
        
        /* Enhanced smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom smooth scrolling for popup */
        .popup-scroll {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          scroll-padding-top: 2rem;
          transform: translateZ(0);
          will-change: scroll-position;
        }
        
        /* Webkit smooth scrolling */
        .popup-scroll::-webkit-scrollbar {
          display: none;
        }
        
        .popup-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        /* New animations for enhanced popup */
        @keyframes backgroundShift {
          0% { transform: translate(0, 0); }
          25% { transform: translate(10px, -10px); }
          50% { transform: translate(-5px, 10px); }
          75% { transform: translate(-10px, -5px); }
          100% { transform: translate(0, 0); }
        }
        
        @keyframes objectivePulse {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
          }
          50% { 
            transform: scale(1.05); 
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.6);
          }
        }
        
        @keyframes missionTextReveal {
          0% { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes missionCardSlide {
          0% { 
            opacity: 0; 
            transform: translateY(30px) rotateX(15deg); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) rotateX(0deg); 
          }
        }
        
        @keyframes borderGlow {
          0%, 100% { 
            background-position: 0% 50%; 
          }
          50% { 
            background-position: 100% 50%; 
          }
        }
        
        @keyframes missionFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes missionSlideIn {
          0% { 
            opacity: 0; 
            transform: translateY(50px) scale(0.95); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        /* GTA 5 Style Animations */
        @keyframes gtaDrift {
          0% { 
            transform: translateX(-10px) translateY(0px); 
            opacity: 0.1;
          }
          50% { 
            opacity: 0.3;
          }
          100% { 
            transform: translateX(10px) translateY(-5px); 
            opacity: 0.1;
          }
        }
        
        @keyframes gtaFlicker {
          0% { 
            opacity: 0.6; 
            text-shadow: 2px 2px 0px #000000, -1px -1px 0px #333333;
          }
          50% { 
            opacity: 0.8; 
            text-shadow: 2px 2px 0px #000000, -1px -1px 0px #333333, 0px 0px 8px rgba(255,255,255,0.3);
          }
          100% { 
            opacity: 0.6; 
            text-shadow: 2px 2px 0px #000000, -1px -1px 0px #333333;
          }
        }
      `}</style>
    </>
  );
};

export default memo(Hero);