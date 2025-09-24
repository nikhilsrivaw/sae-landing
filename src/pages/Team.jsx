import React, { useEffect, useState, useRef } from "react";
import HomeButton from '../components/HomeButton';
import LoadingScreen from "../components/LoadingScreen";
import logo from "../assets/logoSAE.png";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Linkedin, Mail } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);
//import LoadingScreen from "../components/LoadingScreen";

// --- Member Card Component ---
const MemberCard = ({
  photo = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=240&fit=crop&crop=face",
  name = "John Doe",
  post = "Senior Developer",
  branch = "Technology",
  instagram = "@johndoe",
  linkedin = "linkedin.com/in/johndoe",
  email = "john.doe@company.com",
  disableHover = false
}) => {
  return (
    <div className="w-72 h-100 cursor-pointer my-6" style={{ perspective: '1000px' }}>
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateY(0deg)',
        }}
        onMouseEnter={(e) => {
          if (!disableHover) {
            e.currentTarget.style.transform = 'rotateY(180deg)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disableHover) {
            e.currentTarget.style.transform = 'rotateY(0deg)';
          }
        }}
      >
        {/* Front Side */}
        <div
          className="absolute w-full h-full bg-black/20 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-400"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="h-full flex flex-col">
            {/* Photo Section */}
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-62 h-64 rounded-xl overflow-hidden shadow-xl">
                <img
                  src={photo}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Info Section */}
            <div className="p-4 bg-black/30">
              <p className="text-black">.</p>
              <h3 className="text-xl font-bold text-white mt-4 text-center">{name}</h3>
              <p className="text-yellow-400 font-semibold text-center text-sm mb-1">{post}</p>
              <p className="text-black">.</p>
            </div>
          </div>
        </div>
        {/* Back Side */}
        <div
          className="absolute w-full h-full bg-black/50 rounded-2xl shadow-lg flex flex-col justify-center items-center text-white p-8"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="text-center mb-8">
            <p className="text-indigo-200 font-medium mb-1">{post}</p>
            <h3 className="text-2xl font-bold mb-2">{name}</h3>
            <p className="text-indigo-300 text-sm">{branch}</p>
          </div>
          <div className="flex justify-center space-x-4">
            {/* LinkedIn */}
            <a
              href={`https://${linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-black bg-opacity-20 rounded-full backdrop-blur-sm hover:bg-opacity-40 transition-all duration-300 hover:scale-110"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-6 h-6 text-white" />
            </a>
            {/* Instagram */}
            <a
              href={`https://instagram.com/${instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-black bg-opacity-20 rounded-full backdrop-blur-sm hover:bg-opacity-40 transition-all duration-300 hover:scale-110"
              title="Instagram Profile"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- End of Member Card Component ---

const Team = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("PostHolders");
  const containerRef = useRef(null);

  const teamMembers = {
    "Faculty": [
      {
        photo: "https://github.com/adityatrymail/images/blob/main/IMGFaculty279.jpg?raw=true",
        name: "Dr. Sanjay Mishra",
        post: (
          <>
            Professor <br/> HEAD
          </>
        ),
        branch: "Mechanical Engineering Dept.",
        
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/faculty.JPG?raw=true",
        name: "Dr. Dheerandra Singh",
        post: (
          <>
            Assistant Professor <br/> Faculty Advisor SAE
          </>
        ),
        branch: "Mechanical Engineering Dept.",
        
        
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/IMGFaculty467.jpeg?raw=true",
        name: "Dr. Rabesh Kumar Singh",
        post: (
          <>
            Assistant Professor <br/> Faculty Advisor SAE
          </>
        ),
        branch: "Mechanical Engineering Dept.",
        
      }
    ],
    "PostHolders": [
      {
        photo: "https://github.com/adityatrymail/images/blob/main/509267843_18366214711182222_5950869176448722328_n.webp?raw=true",
        name: "Abhinav Pratap Singh",
        post: "ChairPerson",
        branch: "Mechanical Engineering",
        instagram: "@abhinavsingh2535",
        linkedin: "linkedin.com/in/abhinav-pratap-singh-257a38258?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        email: "abhinavpratapsingh010@gmail.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/503610562_18366214720182222_1166049392477191456_n.webp?raw=true",
        name: "Ansh Shukla",
        post: "Vice-Chairperson",
        branch: "Mechanical Engineering",
        instagram: "@anshshukla1303",
        linkedin: "linkedin.com/in/ansh-shukla-557542263?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        email: "anshshukla0001@gmail.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/509671913_18366214729182222_6618237273431321811_n.webp?raw=true",
        name: "Ayush Kumar Singh",
        post: " Vice-Chairperson",
        branch: "Electrical Engineering",
        instagram: "@artistically_an_engineer",
        linkedin: "linkedin.com/in/ayush-singh-5a846b258",
        email: "abhinavpratapsingh010@gmail.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/502428989_18366214738182222_1447720130898628642_n.webp?raw=true",
        name: "Ashutosh Pandey",
        post: "Treasurer",
        branch: "Mechanical Engineering",
        instagram: "@ashupandey_17",
        linkedin: "linkedin.com/in/ashutoshpandey17?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        email: "anshshukla0001@gmail.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/510454993_18366214747182222_1729852300193434664_n.webp?raw=true",
        name: "Gurdeepak Singh",
        post: "Department Realted Activities",
        branch: "Mechanical Engineering",
        instagram: "@",
        linkedin: "linkedin.com/in/",
        email: "michael.chen@sae.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/510970593_18366214756182222_7024520359907112317_n.webp?raw=true",
        name: "Soumya Upadhyay",
        post: "Event Coordinator",
        branch: "Mechanical Engineering",
        instagram: "@saumya.u0_0",
        linkedin: "linkedin.com/in/saumya-upadhyay-959a44284?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        email: "emily.white@sae.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/502590993_18366214765182222_1705422065660774165_n.webp?raw=true",
        name: "Kushagra Omar",
        post: "Event Coordinator",
        branch: "Electronics and Communication Engineering",
        instagram: "@kushagra.omar",
        linkedin: "linkedin.com/in/kushagraomar3355?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        email: "abhinavpratapsingh010@gmail.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/509822376_18366214774182222_3707088430854833010_n.webp?raw=true",
        name: "Kanishka Singh",
        post: "Event Coordinator",
        branch: "Civil Engineering",
        instagram: "@",
        linkedin: "linkedin.com/in/",
        email: "anshshukla0001@gmail.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/503561373_18366214792182222_6160885537959171358_n.webp?raw=true",
        name: "Sarthak Saran",
        post: "Event Coordinator",
        branch: "Mechanical Engineering",
        instagram: "@",
        linkedin: "linkedin.com/in/sarthak-saran-79ba09297?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        email: "abhinavpratapsingh010@gmail.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/502515564_18366214783182222_5215676298109051213_n.webp?raw=true",
        name: "Yashdeep Singh",
        post: "Event Coordinator",
        branch: "Mechanical Engineering",
        instagram: "@mr.singh_2513",
        linkedin: "linkedin.com/in/yashdeep-singh-ys3107?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        email: "anshshukla0001@gmail.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/510966395_18366214801182222_3582309624416468768_n.webp?raw=true",
        name: "Harshit Soni",
        post: "BAJA Head",
        branch: "Mechanical Engineering",
        instagram: "@harshit192345",
        linkedin: "linkedin.com/in/harshit-soni-90826b263?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        email: "michael.chen@sae.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/503679362_18366214810182222_7936151716845163287_n.webp?raw=true",
        name: "Vaibhav Pandey",
        post: "Supra Head",
        branch: "Mechanical Engineering",
        instagram: "@vaibhav__7225?igsh=MXF4MHM0bzhydmY2Zw==",
        linkedin: "linkedin.com/in/vaibhav-pandey-06164228a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        email: "emily.white@sae.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/503628103_18366214828182222_8451549945534516546_n.webp?raw=true",
        name: "Aman Kumar Singh",
        post: "AeroModelling - Head",
        branch: "Mechanical Engineering",
        instagram: "@",
        linkedin: "linkedin.com/in/",
        email: "anshshukla0001@gmail.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/503657631_18366214825182222_7007872649636598833_n.webp?raw=true",
        name: "Shruti Singh",
        post: "Digital SubCouncil - Head",
        branch: "Chemical Engineering",
        instagram: "@_shruti13__",
        linkedin: "linkedin.com/in/shruti-singh-9a330427b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        email: "abhinavpratapsingh010@gmail.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/509750097_18366214837182222_8820114174661689485_n.webp?raw=true",
        name: "Hariom Pandey",
        post: "Media and Photography",
        branch: "Mechanical Engineering",
        instagram: "@_hariompandey07",
        linkedin: "linkedin.com/in/hariom-pandey-53131a289/",
        email: "anshshukla0001@gmail.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/503503798_18366214846182222_3153373366668890807_n.webp?raw=true",
        name: "Shivam",
        post: "Media and Photography",
        branch: "Mechanical Engineering",
        instagram: "@shiva.mkv_",
        linkedin: "linkedin.com/in/shivamyadav-editor?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
        email: "michael.chen@sae.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/509163427_18366214855182222_8313802691031269367_n.webp?raw=true",
        name: "Alankrit Gupta",
        post: "Sponsorship and Alumni Coordinator",
        branch: "Mechanical Engineering",
        instagram: "@alankr.it",
        linkedin: "linkedin.com/in/alankrit-gupta-b22b1621a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        email: "emily.white@sae.com"
      },
      {
        photo: "https://github.com/adityatrymail/images/blob/main/509970045_18366214864182222_5589549005614486698_n.webp?raw=true",
        name: "Shweta Singh",
        post: "Sponsorship and Alumni Coordinator",
        branch: "Mechanical Engineering",
        instagram: "@shwetaaaa_aaa",
        linkedin: "linkedin.com/in/shweta-singh-2636b1257?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        email: "emily.white@sae.com"
      }
    ]
  };

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
    <>
      {/* Fixed Background Layer */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/background3.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#000'
        }}
      ></div>

      {/* Scrollable Content Layer */}
      <div
        className="main-container relative w-full min-h-screen z-10"
        ref={containerRef}
        style={{
          backgroundColor: 'transparent'
        }}
      >
      {/* Header Section */}
      <div className="header-section">
        <div className="header-top">
          <HomeButton />
          <img src={logo} alt="SAE Logo" className="sae-logo-header mt-4" />
        </div>
        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black"
          style={fancyTextStyle}
        >
          The C R E W
        </h1>
        <p className="subtitle">SOCIETY OF AUTOMOTIVE ENGINEERS Collegiate Club</p>
        {/* ⭐ Star Animation */}
        <div className="flex justify-center items-center mt-5">
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
      {/* Team Content & Tabs */}
      <div className="team-content" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <div className="flex justify-center" style={{marginTop: '1.5rem', marginBottom: '2rem' }}>
          <div className="rounded-full bg-black/60 backdrop-blur border border-white/10 flex" style={{ padding: '0.5rem' }}>
            <button
              onClick={() => setActiveTab("Faculty")}
              className={`text-sm sm:text-base transition-colors ${
                activeTab === "Faculty"
                  ? "bg-yellow-400 rounded-full text-black font-semibold shadow"
                  : "text-white hover:text-yellow-300"
              }`}
              style={{ padding: '0.75rem 1.5rem' }}
            >
              Faculty
            </button>
            <button
              onClick={() => setActiveTab("PostHolders")}
              className={`text-sm sm:text-base transition-colors ${
                activeTab === "PostHolders"
                  ? "bg-yellow-400 rounded-full text-black font-semibold shadow"
                  : "text-white hover:text-yellow-300"
              }`}
              style={{ padding: '0.75rem 1.5rem' }}
            >
              PostHolders
            </button>
          </div>
        </div>
        {/* Cards Section */}
        <div className="mt-16 bg-transparent w-full rounded-lg p-4" style={{ marginTop: '4rem' }}>
          <div className="text-center text-white/90 mb-8" style={{ marginBottom: '2rem' }}>
            
          </div>
          <div className="flex flex-wrap justify-center" style={{ gap: '2rem' }}>
            {teamMembers[activeTab].map((member, index) => (
              <MemberCard key={index} {...member} disableHover={activeTab === "Faculty"} />
            ))}
          </div>
          {/* Bottom spacing */}
          <div style={{ height: '4rem', marginBottom: '2rem' }}></div>
        </div>

        
      </div>
      {/* Styles */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Chalet+Comprime&display=swap");

        .main-container {
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
        }

        .header-top {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .sae-logo-header {
          margin-top: 10px;
          width: 90px;
        }

        .subtitle {
          font-size: 0.6em;
          color: #aaa;
          margin-top: 8px;
        }

        .team-content {
          max-width: 1200px;
          width: 100%;
          margin-top:-10px
        }
      `}</style>
      </div>
    </>
  );
};

export default Team;