// src/pages/Chambers.jsx

import React, { useEffect, useState, useRef } from "react";
import HomeButton from "../components/HomeButton";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logo from "../assets/logoSAE.png";
import chamberBackground from "../assets/chamberBackground.jpg";
import discoImg from "../assets/Disco.jpg";
import bajaImg from "../assets/baja.jpg";
import aeroImg from "../assets/aeroModelling.jpg";
import supraImg from "../assets/supra.jpg";
import MiniMap from "../components/MiniMap";
import LoadingScreen from "../components/LoadingScreen";

// ✅ Chamber Logos Import
import discoLogo from "../assets/discoLogo.png";
import bajaLogo from "../assets/bajaLogo.png";
import aeroLogo from "../assets/aeroLogo.png";
import supraLogo from "../assets/supraLogo.png";

gsap.registerPlugin(ScrollTrigger);

const chamberImages = {
  disco: discoImg,
  baja: bajaImg,
  aero: aeroImg,
  supra: supraImg,
};

const chamberLogos = {
  disco: discoLogo,
  baja: bajaLogo,
  aero: aeroLogo,
  supra: supraLogo,
};

const Chambers = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef(null);

  useEffect(() => {
    let interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // ✅ Page load animation
  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, filter: "blur(10px)", scale: 0.98 },
        {
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
        }
      );
    }
  }, [loading]);

  const chambersData = [
    {
      title: "DISCO",
      tagline: "Digital Sub-Council",
      backgroundImage: chamberImages.disco,
      logo: chamberLogos.disco,
      link: "#",
    },
    {
      title: "BAJA",
      tagline: "OFF-ROAD RACING & EXPLORATION",
      backgroundImage: chamberImages.baja,
      logo: chamberLogos.baja,
      link: "#",
    },
    {
      title: "AERO MODELLING",
      tagline: "FLIGHT DRONES & INNOVATION",
      backgroundImage: chamberImages.aero,
      logo: chamberLogos.aero,
      link: "#",
    },
    {
      title: "SUPRA",
      tagline: "SUPER RACING ASSOCIATION",
      backgroundImage: chamberImages.supra,
      logo: chamberLogos.supra,
      link: "#",
    },
  ];

  if (loading) {
    return <LoadingScreen progress={progress} isLoading={loading} />;
  }

  const fancyTextStyle = {
    fontFamily: 'Impact, "Arial Black", sans-serif',
    color: "#fff",
    textShadow: "4px 4px 0px #000, -2px -2px 0px #333",
    fontWeight: "900",
    letterSpacing: "2px",
  };

  return (
    <div className="main-container" ref={containerRef}>
      <MiniMap />

      {/* Header */}
      <div className="header-section">
        <div className="header-top">
          <HomeButton />
          <img src={logo} alt="SAE Logo" className="sae-logo-header" />
        </div>

        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black"
          style={fancyTextStyle}
        >
          CHAMBER ACCESS
        </h1>
        <p className="subtitle">SOCIETY OF AUTOMOTIVE ENGINEERS</p>

        {/* ⭐ Star Animation */}
        <div className="flex justify-center items-center mt-4">
          <div className="flex items-center space-x-3">
            <span
              className="text-2xl animate-pulse text-white"
              style={{
                textShadow: "0px 0px 8px yellow, 0px 0px 15px yellow",
                transform: "rotate(360deg) scale(1.15)",
              }}
            >
              ★
            </span>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
            <span
              className="text-3xl animate-pulse text-white"
              style={{
                animationDelay: "0.3s",
                textShadow: "0px 0px 8px yellow, 0px 0px 15px yellow",
                transform: "rotate(360deg) scale(1.15)",
              }}
            >
              ★
            </span>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
            <span
              className="text-2xl animate-pulse text-white"
              style={{
                animationDelay: "0.6s",
                textShadow: "0px 0px 8px yellow, 0px 0px 15px yellow",
                transform: "rotate(360deg) scale(1.15)",
              }}
            >
              ★
            </span>
          </div>
        </div>
      </div>

      {/* Chambers Grid */}
      <div className="chamber-grid">
        {chambersData.map((chamber, index) => (
          <a
            key={index}
            href={chamber.link}
            className="chamber-card"
            style={{ backgroundImage: `url(${chamber.backgroundImage})` }}
          >
            <div className="card-content">
              {/* ✅ Heading & Tagline shifted more upward */}
              <div className="text-section">
                <h2
                  className="text-3xl sm:text-4xl font-black"
                  style={fancyTextStyle}
                >
                  {chamber.title}
                </h2>
                <p>{chamber.tagline}</p>
              </div>

              {/* ✅ Logo bottom-left */}
              <img
                src={chamber.logo}
                alt={`${chamber.title} Logo`}
                className="absolute bottom-2 left-2 w-10 h-10 opacity-90"
              />

              <button className="learn-more-btn group relative">
                <div className="corner top-left"></div>
                <div className="corner top-right"></div>
                <div className="corner bottom-left"></div>
                <div className="corner bottom-right"></div>

                <div className="flex flex-col items-start">
                  <span className="text-white font-bold text-xs tracking-wider">
                    LEARN MORE
                  </span>
                  <span className="text-gray-400 text-[0.6rem] font-mono tracking-wide group-hover:text-gray-200">
                    PRESS TO CONTINUE
                  </span>
                </div>
              </button>
            </div>
          </a>
        ))}
      </div>

      {/* Styles */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Chalet+Comprime&display=swap");

        .main-container {
          background: url(${chamberBackground}) no-repeat center center fixed;
          background-size: cover;
          color: #fff;
          font-family: "Chalet Comprime", Arial, sans-serif;
          min-height: 100vh;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .header-section {
          text-align: center;
          margin-bottom: 20px;
        }

        .header-top {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .sae-logo-header {
          width: 60px;
        }

        .subtitle {
          font-size: 0.6em;
          color: #aaa;
          margin-top: 8px;
        }

        .chamber-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
          max-width: 800px;
          width: 100%;
          z-index: 1;
        }

        .chamber-card {
          background-color: rgba(0, 0, 0, 0.7);
          border: 1px solid #333;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          text-decoration: none;
          color: #fff;
          aspect-ratio: 16 / 9;
          background-size: cover;
          background-position: center;
          transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out,
            border-color 0.3s ease-in-out;
          cursor: pointer;
          display: flex;
          align-items: flex-end;
          width: 100%;
        }

        .chamber-card:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 5px 12px rgba(253, 216, 53, 0.45);
          border-color: #fdd835;
        }

        .card-content {
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.9) 0%,
            rgba(0, 0, 0, 0) 100%
          );
          padding: 12px;
          width: 100%;
          box-sizing: border-box;
          text-align: left;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .text-section {
          margin-bottom: 28px;
          transform: translateY(-20%); /* ✅ Heading + tagline aur upar shift */
        }

        .chamber-card p {
          font-size: 0.55em;
          color: #ccc;
          margin-top: 4px;
        }

        .learn-more-btn {
          position: absolute;
          bottom: 4px;
          right: 4px;
          background: rgba(0, 0, 0, 0.85);
          padding: 4px 8px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 3px;
          text-align: left;
          overflow: hidden;
          transition: all 0.3s ease;
          transform: scale(0.9);
        }

        .learn-more-btn:hover {
          border-color: #fdd835;
          background: rgba(0, 0, 0, 0.95);
          transform: scale(1);
        }

        .learn-more-btn span {
          font-size: 0.7rem;
        }

        .learn-more-btn span:last-child {
          font-size: 0.55rem;
        }

        .corner {
          position: absolute;
          width: 6px;
          height: 6px;
          border: 1px solid rgba(200, 200, 200, 0.6);
        }

        .top-left {
          top: -2px;
          left: -2px;
          border-right: none;
          border-bottom: none;
        }
        .top-right {
          top: -2px;
          right: -2px;
          border-left: none;
          border-bottom: none;
        }
        .bottom-left {
          bottom: -2px;
          left: -2px;
          border-right: none;
          border-top: none;
        }
        .bottom-right {
          bottom: -2px;
          right: -2px;
          border-left: none;
          border-top: none;
        }
      `}</style>
    </div>
  );
};

export default Chambers;
