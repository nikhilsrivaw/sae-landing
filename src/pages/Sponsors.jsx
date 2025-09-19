// src/pages/Sponsors.jsx

import React, { useEffect, useState, useRef } from "react";
import HomeButton from "../components/HomeButton";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logo from "../assets/logoSAE.png";
import chamberBackground from "../assets/chamberBackground.jpg";
import MiniMap from "../components/MiniMap";
import LoadingScreen from "../components/LoadingScreen";

// Sponsor Logos Imports
import sponsorLogo1 from "../assets/sponsorLogo1.png";
import sponsorLogo2 from "../assets/logoSAE.png";
import sponsorLogo3 from "../assets/sponsorLogo3.png";
import sponsorLogo4 from "../assets/loading.png";
import sponsorLogo5 from "../assets/Loadingpage.png";
import sponsorLogo6 from "../assets/discoLogo.png";

gsap.registerPlugin(ScrollTrigger);

const sponsorLogos = {
  sponsor1: sponsorLogo1,
  sponsor2: sponsorLogo2,
  sponsor3: sponsorLogo3,
  sponsor4: sponsorLogo4,
  sponsor5: sponsorLogo5,
  sponsor6: sponsorLogo6,
};

const sponsorsData = [
  // Big Sponsors Section
  { name: "SPONSOR COMPANY 1", category: "PLATINUM SPONSOR", logo: sponsorLogos.sponsor1, link: "#", tagline: "Leading the future of technology.", type: "big" },
  { name: "SPONSOR COMPANY 2", category: "GOLD SPONSOR", logo: sponsorLogos.sponsor2, link: "#", tagline: "Innovating with excellence.", type: "big" },
  { name: "SPONSOR COMPANY 6", category: "GOLD SPONSOR", logo: sponsorLogos.sponsor6, link: "#", tagline: "Powering the next generation.", type: "big" },
  { name: "SPONSOR COMPANY 6", category: "GOLD SPONSOR", logo: sponsorLogos.sponsor6, link: "#", tagline: "Powering the next generation.", type: "big" },
  { name: "SPONSOR COMPANY 6", category: "GOLD SPONSOR", logo: sponsorLogos.sponsor6, link: "#", tagline: "Powering the next generation.", type: "big" },
  { name: "SPONSOR COMPANY 6", category: "GOLD SPONSOR", logo: sponsorLogos.sponsor6, link: "#", tagline: "Powering the next generation.", type: "big" },
  { name: "SPONSOR COMPANY 6", category: "GOLD SPONSOR", logo: sponsorLogos.sponsor6, link: "#", tagline: "Powering the next generation.", type: "big" },
  { name: "SPONSOR COMPANY 6", category: "GOLD SPONSOR", logo: sponsorLogos.sponsor6, link: "#", tagline: "Powering the next generation.", type: "big" },

  // Small Sponsors Section
  { name: "SPONSOR COMPANY 3", category: "SILVER SPONSOR", logo: sponsorLogos.sponsor3, link: "#", tagline: "Building a better tomorrow.", type: "small" },
  { name: "SPONSOR COMPANY 4", category: "BRONZE SPONSOR", logo: sponsorLogos.sponsor4, link: "#", tagline: "Supporting education and growth.", type: "small" },
  { name: "SPONSOR COMPANY 5", category: "BRONZE SPONSOR", logo: sponsorLogos.sponsor5, link: "#", tagline: "Creating the future, together.", type: "small" },
  { name: "SPONSOR COMPANY 5", category: "BRONZE SPONSOR", logo: sponsorLogos.sponsor5, link: "#", tagline: "Creating the future, together.", type: "small" },
  { name: "SPONSOR COMPANY 5", category: "BRONZE SPONSOR", logo: sponsorLogos.sponsor5, link: "#", tagline: "Creating the future, together.", type: "small" },
  { name: "SPONSOR COMPANY 5", category: "BRONZE SPONSOR", logo: sponsorLogos.sponsor5, link: "#", tagline: "Creating the future, together.", type: "small" },
  { name: "SPONSOR COMPANY 5", category: "BRONZE SPONSOR", logo: sponsorLogos.sponsor5, link: "#", tagline: "Creating the future, together.", type: "small" },
  { name: "SPONSOR COMPANY 5", category: "BRONZE SPONSOR", logo: sponsorLogos.sponsor5, link: "#", tagline: "Creating the future, together.", type: "small" },
];



// const sponsorsData = [
//   // Big Sponsors Section
//   {
//     name: "SPONSOR COMPANY 1",
//     category: "PLATINUM SPONSOR",
//     logo: sponsorLogos.sponsor1,
//     link: "#",
//     tagline: "Leading the future of technology.",
//     type: "big",
//     size: "large", // Add this property
//   },
//   {
//     name: "SPONSOR COMPANY 2",
//     category: "GOLD SPONSOR",
//     logo: sponsorLogos.sponsor2,
//     link: "#",
//     tagline: "Innovating with excellence.",
//     type: "big",
//     size: "large", // Add this property
//   },
//   // Small Sponsors Section
//   {
//     name: "SPONSOR COMPANY 3",
//     category: "SILVER SPONSOR",
//     logo: sponsorLogos.sponsor3,
//     link: "#",
//     tagline: "Building a better tomorrow.",
//     type: "small",
//     size: "small", // Add this property
//   },
//   {
//     name: "SPONSOR COMPANY 4",
//     category: "BRONZE SPONSOR",
//     logo: sponsorLogos.sponsor4,
//     link: "#",
//     tagline: "Supporting education and growth.",
//     type: "small",
//     size: "small", // Add this property
//   },
//   // ... continue for all sponsors
// ];

const Sponsors = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef(null);

  useEffect(() => {
    // ... (Loading animation logic remains the same)
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

  useEffect(() => {
    // ... (Page load animation logic remains the same)
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

  // Filter the sponsors into two groups
  const bigSponsors = sponsorsData.filter(sponsor => sponsor.type === 'big');
  const smallSponsors = sponsorsData.filter(sponsor => sponsor.type === 'small');

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

  const sectionHeadingStyle = {
    fontFamily: 'Impact, "Arial Black", sans-serif',
    color: "#fdd835",
    textShadow: "2px 2px 0px #000",
    fontWeight: "900",
    letterSpacing: "1px",
    margin: "40px 0 20px 0",
    textAlign: "center",
    textTransform: "uppercase"
  };

  const renderSponsorCards = (sponsors) => (
    <div className="chamber-grid">
      {sponsors.map((sponsor, index) => (
        <a
          key={index}
          href={sponsor.link}
          className="chamber-card"
          style={{
            backgroundImage: `url(${sponsor.logo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="card-content">
            <div className="text-section"> 
              {/* <h2 className="text-2xl sm:text-3xl font-black" style={fancyTextStyle}>
                {sponsor.name}
              </h2> */}
              {/* <p>{sponsor.tagline}</p> */}
             </div>
            
            <button className="learn-more-btn group relative">
              <div className="corner top-left"></div>
              <div className="corner top-right"></div>
              <div className="corner bottom-left"></div>
              <div className="corner bottom-right"></div>
              <div className="flex flex-col items-start">
                <span className="text-white font-bold text-xs tracking-wider">
                  {sponsor.category}
                </span>
                <span className="text-gray-400 text-[0.6rem] font-mono tracking-wide group-hover:text-gray-200">
                  VIEW DETAILS
                </span>
              </div>
            </button>
          </div>
        </a>
      ))}
    </div>
  );

     

//   const renderSponsorCards = (sponsors) => (
//   <div className="chamber-grid">
//     {sponsors.map((sponsor, index) => (
//       <a
//         key={index}
//         href={sponsor.link}
//         // Conditionally apply the card size class
//         className={`chamber-card ${sponsor.size === 'large' ? 'chamber-card-large' : 'chamber-card-small'}`}
//         style={{
//           backgroundImage: `url(${chamberBackground})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         <div className="card-content">
//           <div className="text-section">
//             <h2 className="text-2xl sm:text-3xl font-black" style={fancyTextStyle}>
//               {sponsor.name}
//             </h2>
//             <p>{sponsor.tagline}</p>
//           </div>
//           <div className="flex-1 flex justify-center items-center">
//             <img
//               src={sponsor.logo}
//               alt={`${sponsor.name} Logo`}
//               className="sponsor-logo"
//             />
//           </div>
//           <button className="learn-more-btn group relative">
//             {/* ... button corners and text */}
//           </button>
//         </div>
//       </a>
//     ))}
//   </div>
// );


  return (
    <div className="main-container" ref={containerRef}>
      <MiniMap />
      {/* Header section remains the same */}
      <div className="header-section">
        <div className="header-top">
          <HomeButton />
          <img src={logo} alt="SAE Logo" className="sae-logo-header" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black" style={fancyTextStyle}>
          OUR SPONSORS
        </h1>
        <p className="subtitle">SOCIETY OF AUTOMOTIVE ENGINEERS</p>
        <div className="flex justify-center items-center mt-4">
          <div className="flex items-center space-x-3">
            <span
              className="text-2xl animate-pulse text-white"
              style={{ textShadow: "0px 0px 8px yellow, 0px 0px 15px yellow", transform: "rotate(360deg) scale(1.15)" }}
            >
              ★
            </span>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
            <span
              className="text-3xl animate-pulse text-white"
              style={{ animationDelay: "0.3s", textShadow: "0px 0px 8px yellow, 0px 0px 15px yellow", transform: "rotate(360deg) scale(1.15)" }}
            >
              ★
            </span>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
            <span
              className="text-2xl animate-pulse text-white"
              style={{ animationDelay: "0.6s", textShadow: "0px 0px 8px yellow, 0px 0px 15px yellow", transform: "rotate(360deg) scale(1.15)" }}
            >
              ★
            </span>
          </div>
        </div>
      </div>
        


         {/* Why Sponsor Us Section */}
      <div className="why-sponsor-section">
        <h2 style={sectionHeadingStyle}>Our Sponsors</h2>
        <div className="why-sponsor-content">
         <p>SAE Collegiate Club, MMMUT Chapter has always been looking forward to new partnerships that can support and ameliorate our projects. 
          </p>
          <p>Besides increasing brand awareness through various events, partnering with us also brings you in contact with young and motivated potential employees.
            </p>
            <p>
               Our team members have the experience of building a complete car while encompassing aspects like designing, manufacturing, testing and marketing.</p>
        </div>
      </div>

      {/* <div className="sponsors-description-section">
        <p style={paragraphStyle}>
          SAE Collegiate Club, MMMUT Chapter has always been looking forward to new partnerships that can support and ameliorate our projects. Besides increasing brand awareness through various events, partnering with us also brings you in contact with young and motivated potential employees. Our team members have the experience of building a complete car while encompassing corporate like designing, manufacturing, testing and presenting it at a national level. Our projects require a great deal of resources which could only be made available through the support of our beloved sponsors.
        </p>
      </div> */}
      
      {/*Container for the new sections */}
      <div className="sponsors-content-container">
        <h1 style={sectionHeadingStyle}>Big Sponsors</h1>
        {renderSponsorCards(bigSponsors)}

        <h3 style={sectionHeadingStyle}>Small Sponsors</h3>
        {renderSponsorCards(smallSponsors)}
      </div>



      {/* Why Sponsor Us Section */}
      <div className="why-sponsor-section">
        <h2 style={sectionHeadingStyle}>WHY SPONSOR US!</h2>
        <div className="why-sponsor-content">
          <p>
            SAE Collegiate Club jointly hosts <strong>‘TechSrijan’</strong>, which is one of 
            the largest fests in Eastern UP.
          </p>
          <p>
            We attract a crowd of <strong>3000+</strong> people annually. Our multitudes of 
            events receive enormous participation.
          </p>
          <p>
            Students from SAE Collegiate Club MMMUT Chapter have consistently represented 
            the university in various competitions and achieved great results.
          </p>
          <p>
            SAE Collegiate Club has been supported by many renowned organisations in its 
            endeavours. We have fulfilled our sponsors’ expectations, which has strengthened 
            our long-term relations.
          </p>
        </div>
      </div>


      {/* // In your main return block: */}
{/* 
<div className="sponsors-content-container">
  <h2 style={sectionHeadingStyle}>Big Sponsors</h2>
  {The 'chamber-grid' here will use the default 2-column layout }
  <div className="chamber-grid"> 
    {bigSponsors.map((sponsor, index) => (
      <a
        key={index}
        href={sponsor.link}
        className={`chamber-card chamber-card-large`} // Use the large card class directly
        style={{
          backgroundImage: `url(${chamberBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        { ... card content }
      </a>
    ))}
  </div>

  <h2 style={sectionHeadingStyle}>Small Sponsors</h2>
  { A new class for the small sponsors grid to make it denser }
  <div className="chamber-grid chamber-grid-small"> 
    {smallSponsors.map((sponsor, index) => (
      <a
        key={index}
        href={sponsor.link}
        className={`chamber-card chamber-card-small`} // Use the small card class directly
        style={{
          backgroundImage: `url(${chamberBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        { ... card content }
      </a>
    ))}
  </div>
</div> */}

      {/*Why Sponsor Us Section */}
       {/* <div className="why-sponsor-section">
        <h2 style={sectionHeadingStyle}>Why Sponsor Us?</h2>
        <p style={paragraphStyle}>
          Partnering with SAE Collegiate Club, MMMUT offers a unique opportunity to connect with bright, innovative engineering talent. Your brand gains visibility across various national competitions, college events, and our digital platforms, reaching a highly engaged and technically inclined audience. Sponsorship directly contributes to the development of cutting-edge automotive projects, fostering practical skills and innovation among students. It's an investment in the future of engineering and a chance to recruit passionate, skilled individuals who are ready to make an impact in the automotive industry. Join us in driving innovation and shaping the engineers of tomorrow!
        </p>
      </div> */}

      {/* The rest of the styles remain the same */}
      <style jsx>{`
        /* ... (Existing styles from the previous response) */
        @import url("https://fonts.googleapis.com/css2?family=Chalet+Comprime&display=swap");

        .main-container {
          background: url(${chamberBackground}) no-repeat center center fixed;
          background-size: cover;
          color: #f4f2feff;
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

        .sponsors-description-section,
        .why-sponsor-section {
          width: 100%;
          max-width: 800px; /* Match the grid width */
          margin-top: 30px; /* Space between sections */
          text-align: center;
          z-index: 1; /* Ensure it's above the background */
        }

        .sponsors-content-container {
          max-width: 1050px;
          width: 100%;
          z-index: 0;
        }

        .chamber-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 25px;
          width: 100%;
          margin-bottom: 40px;
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
          flex-direction: column;
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
          flex-grow: 1;
        }

        .text-section {
          margin-bottom: 28px;
          transform: translateY(-20%);
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

        .sponsor-logo {
          max-width: 80%;
          max-height: 80px;
          object-fit: contain;
          filter: grayscale(100%) brightness(150%);
          transition: filter 0.3s ease-in-out;
        }

        .chamber-card:hover .sponsor-logo {
          filter: grayscale(0%) brightness(100%);
        }

  
.why-sponsor-section {
  max-width: 900px;
  margin: 50px auto;
  padding: 20px;
  text-align: center;
  background: rgba(0,0,0,0.4);
  border-radius: 10px;
  border: 1px solid #fdd83533;
}

.why-sponsor-section h2 {
  margin-bottom: 20px;
}

.why-sponsor-content p {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.6;
  margin-bottom: 15px;
  text-transform: uppercase;
  color: #fff;
}


      

// //         .chamber-card-large {
// //   grid-column: span 0; /* Make the card span across two columns */
// //   aspect-ratio: 16 / 9; /* Maintain the same aspect ratio */
// //   /* You can add more styling here, like a more pronounced glow */
// //   box-shadow: 0 0 15px rgba(253, 216, 53, 0.6);
// // }

// // .chamber-card-large .card-content {
// //   justify-content: center; /* Center content vertically for a cleaner look */
// //   text-align: center;
// // }

// // .chamber-card-large .text-section {
// //   transform: translateY(0); /* Remove the upward shift for better centering */
// // }

// // /* Small card for small sponsors */
// // .chamber-card-small {
// //   /* No changes needed, as the default .chamber-card already works for a small size */
// //   /* But you can add specific styles if you want, e.g., a smaller glow */
// // }

// // /* Make the grid for small sponsors a bit denser */
// // .chamber-grid-small {
// //   grid-template-columns: repeat(3, 1fr); /* Example: 3 columns for small cards */
// }

/*removing the scrollbar*/


/* Styling for WebKit-based browsers (Chrome, Safari, Edge) */
::-webkit-scrollbar {
  width: 8px;
  background-color: transparent; /* Makes the scrollbar track transparent */
}

::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2); /* A semi-transparent white thumb */
  border-radius: 4px; /* Rounded corners for a sleek look */
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.4); /* Brighter on hover */
}

/* Styling for Firefox */
html {
  scrollbar-width: thin; /* "auto" or "thin" */
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent; /* thumb color track color */
}


      `}</style>
    </div>
  );
};

export default Sponsors;