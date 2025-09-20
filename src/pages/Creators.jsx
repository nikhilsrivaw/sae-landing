import React, { useEffect, useState, useRef } from "react";
import HomeButton from "../components/HomeButton";
import LoadingScreen from "../components/LoadingScreen";
import logo from "../assets/logoSAE.png";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Instagram,
  Facebook,
  Linkedin,
  MessageCircle,
  Twitter,
  Mail,
} from "lucide-react";

const Creators = () => {
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

  const mentors = [
    {
      id: 1,
      name: "Nikhil Srivastava",
      branch: "Information Technology",
      post: "Senior TEAM LEAD",
      photo:
        "https://github.com/adityatrymail/images/blob/main/WhatsApp%20Image%202025-09-20%20at%2016.15.10_c7301d92.jpg?raw=true",
      socials: {
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com",
      },
    },
    {
      id: 2,
      name: "Anurag Singh",
      branch: "Mechanical Engineering",
      post: "Senior TEAM LEAD",
      photo:
        "https://github.com/adityatrymail/images/blob/main/WhatsApp%20Image%202025-09-20%20at%2014.56.56_5553c894.jpg?raw=true",
      socials: {
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com",
      },
    },
  ];

  const creators = [
    {
      id: 1,
      name: "Aditya Pratap Singh",
      branch: "Electronics and Communication Engineering",
      post: "Executive Member SAE",
      photo:
        "https://github.com/adityatrymail/images/blob/main/WhatsApp%20Image%202025-09-20%20at%2013.13.36_e05b9d58.jpg?raw=true",
      message:
        "Passionate about creating innovative web solutions that make a difference. I love turning complex problems into simple, beautiful designs.",
      socials: {
        instagram: "https://instagram.com/adityaprasingh",
        linkedin: "https://linkedin.com/in/adityaprasingh",
      },
    },
    {
      id: 2,
      name: "Divyansh Mishra",
      branch: "Electronics and Communication Engineering",
      post: "Executive Member SAE",
      photo:
        "https://github.com/adityatrymail/images/blob/main/WhatsApp%20Image%202025-09-20%20at%2011.31.57_50f18215.jpg?raw=true",
      message:
        "Curious and creative, always learning new skills, solving problems, and building smart solutions with a mix of logic and innovation.",
      socials: {
        instagram: "https://www.instagram.com/theodoredivyansh?igsh=MXYzMXBjbzZicnAybQ==",
        linkedin: "https://www.linkedin.com/in/divyansh-mishra-9972ab259/",
      },
    },
    {
      id: 3,
      name: "Ananya Yadav",
      branch: "Computer Science and Engineering ",
      post: "Executive Member SAE",
      photo:
        "https://github.com/adityatrymail/images/blob/main/WhatsApp%20Image%202025-09-20%20at%2011.30.35_bb93b420.jpg?raw=true",
      message:
        "Tech enthusiast with strong problem-solving skills and a knack for creating efficient solutions. I love designing, innovating, and building impactful projects that juniors find inspiring and motivating.",
      socials: {
        instagram: "https://youtube.com/@art_withananaya?si=AvjGpS9AoENh8s-Z",
        linkedin: "https://www.linkedin.com/in/ananya-yadav-50ba71327?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      },
    },
   
    {
      id: 4,
      name: "Ansh Mishra",
      branch: "Information Technology",
      post: "Executive Member SAE",
      photo:
        "https://github.com/adityatrymail/images/blob/main/WhatsApp%20Image%202025-09-20%20at%2013.11.04_5ac0d839.jpg?raw=true",
      message:
        "Dedicated to crafting efficient and reliable web solutions. I believe in combining logic with creativity to build tools that make a meaningful impact.",
      socials: {
        instagram: "https://www.instagram.com/ansh_mishra_0307?igsh=MWdoNG1nZjFsN2NrcA%3D%3D&utm_source=qr",
        linkedin: "http://linkedin.com/in/ansh-mishra-812484333",
      },
    },
    {
      id: 5,
      name: "Sarthak Jain",
      branch: "Information Technology",
      post: "Executive Member SAE",
      photo:
        "https://github.com/adityatrymail/images/blob/main/WhatsApp%20Image%202025-09-20%20at%2011.31.22_b9b33e23.jpg?raw=true",
      message:
        "Driven by curiosity and creativity, I enjoy crafting digital solutions that blend functionality with elegance. My goal is to make technology simple and impactful.",
      socials: {
        instagram: "https://www.instagram.com/sarthak047._?igsh=MWt2ZWxwY3Fla2Z4cQ%3D%3D&utm_source=qr",
        linkedin: "https://www.linkedin.com/in/sarthak-jain-615b76324?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
      },
    },
    {
      id: 6,
      name: "Nili Singh ",
      branch: "Information Technology",
      post: "Executive Member SAE",
      photo:
        "https://github.com/adityatrymail/images/blob/main/IMG-20250629-WA0259%20(1)%20(1)%20-%20Nili%20Singh.jpg?raw=true",
      message:
        "“Passionate about automotive innovation and teamwork, I love turning creative ideas into impactful projects that inspire learning and growth.”",
      socials: {
        instagram: "https://www.instagram.com/n_nili20?igsh=OWY4bnphZDZ6OTNm",
        linkedin: "https://www.linkedin.com/in/nili-singh-0a8b8a327?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        
      },
    },
    {
      id: 7,
      name: "Aditya Kumar ",
      branch: "Information Technology",
      post: "Executive Member SAE",
      photo:
        "https://github.com/adityatrymail/images/blob/main/WhatsApp%20Image%202025-09-20%20at%2014.29.57_aaeccccf.jpg?raw=true",
      message:
        "Driven by a commitment to quality, I enjoy transforming challenges into opportunities by finding effective solutions and fixing bugs.",
      socials: {
        instagram: "https://instagram.com/aadithexplorer",
        linkedin: "https://www.linkedin.com/in/aditya-kumar-278150273?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      },
    },
  ];

  const getSocialIcon = (platform) => {
    switch (platform) {
      case "instagram":
        return Instagram;
      case "facebook":
        return Facebook;
      case "linkedin":
        return Linkedin;
      case "whatsapp":
        return MessageCircle;
      case "twitter":
        return Twitter;
      case "email":
        return Mail;
      default:
        return Instagram;
    }
  };

  const getSocialColor = (platform) => {
    switch (platform) {
      case "instagram":
        return "text-pink-400 hover:text-pink-300";
      case "facebook":
        return "text-blue-400 hover:text-blue-300";
      case "linkedin":
        return "text-blue-500 hover:text-blue-400";
      case "whatsapp":
        return "text-green-400 hover:text-green-300";
      case "twitter":
        return "text-blue-300 hover:text-blue-200";
      case "email":
        return "text-gray-400 hover:text-gray-300";
      default:
        return "text-gray-400 hover:text-gray-300";
    }
  };

  return (
    <div
      className="main-container fixed top-0 left-0 w-full h-full bg-cover bg-center z-10 overflow-y-auto"
      ref={containerRef}
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
          The C R E A T O R S
        </h1>
        <p className="subtitle">
          SOCIETY OF AUTOMOTIVE ENGINEERS Collegiate Club
        </p>
        {/* Star Animation */}
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

      {/* Content Container with proper styling */}
      <div className="team-content">
        {/* Mentors Section */}
        <section className="max-w-6xl mx-auto px-4 mb-20 mentors-section" style={{ marginTop: "4rem" }}>
          <h2
            className="text-4xl font-bold text-center mentors-heading"
            style={{
              ...fancyTextStyle,
              fontSize: "2.5rem",
              letterSpacing: "1px",
              marginBottom: "4rem",
              display: "block",
            }}
          >
            DEVELOPERS TEAM HEAD
          </h2>
          <div className="mentors-content-wrapper" style={{ marginTop: "4rem" }}>
            <div className="mentors-container" style={{ 
              background: "rgba(0, 0, 0, 0.3)", 
              backdropFilter: "blur(1px)", 
              borderRadius: "1rem", 
              padding: "3rem",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
            {mentors.map((mentor, index) => (
              <div key={mentor.id}>
                <div
                  className={`flex items-center gap-12 p-12 rounded-2xl transition-all duration-300 group mentor-card ${
                    index % 2 === 1 ? "flex-row-reverse" : ""
                  }`}
                  style={{ 
                    background: "transparent", 
                    marginBottom: "1rem",
                    border: "none",
                    boxShadow: "none"
                  }}
                >
                <div className="flex-shrink-0">
                  <div className="w-56 h-64 overflow-hidden shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl border-4 border-white/20">
                    <img
                      src={mentor.photo}
                      alt={mentor.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>

                <div className={`flex-1 ${index % 2 === 1 ? 'text-right' : 'text-left'}`}>
                  <h3 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                    {mentor.name}
                  </h3>
                  <p className="text-xl text-yellow-400 font-semibold mb-3 drop-shadow-md">
                    {mentor.branch}
                  </p>
                  <p className="text-lg text-gray-300 mb-10 drop-shadow-md" style={{ marginBottom: "1rem" }}>
                    {mentor.post}
                  </p>

                  <div className={`flex gap-4 mb-10 ${index % 2 === 1 ? 'justify-end' : 'justify-start'}`} style={{ marginBottom: "1rem", marginLeft: "0.22rem" }}>
                    {Object.entries(mentor.socials).map(([platform, url]) => {
                      const IconComponent = getSocialIcon(platform);
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-3 scale-110 rounded-full w-9 transition-all duration-300 ${getSocialColor(
                            platform
                          )} transform hover:scale-160`}
                        >
                          <IconComponent size={22} />
                        </a>
                      );
                    })}
                  </div>

                  <p className={`text-md text-gray-200 leading-relaxed italic p-6 rounded-r-lg ${index % 2 === 1 ? 'pl-6 pr-6 text-right' : 'pl-6 pr-6 text-left'}`}>
                    "Leading the development team with passion and expertise in automotive engineering."
                  </p>
                </div>
                </div>
                {index < mentors.length - 1 && (
                  <div className="flex justify-center my-5">
                    <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>
        </section>

        {/* Creators Section */}
        <section className="max-w-6xl mx-auto px-4 mb-20 creators-section" style={{ marginTop: "4rem" }}>
          <h2
            className="text-4xl font-bold text-center creators-heading"
            style={{
              ...fancyTextStyle,
              fontSize: "2.5rem",
              letterSpacing: "1px",
              marginBottom: "4rem",
              display: "block",
            }}
          >
            CREATIVE DEVELOPERS TEAM
          </h2>
          <div className="creators-content-wrapper" style={{ marginTop: "4rem" }}>
            <div className="creators-container" style={{ 
              background: "rgba(0, 0, 0, 0.3)", 
              backdropFilter: "blur(1px)", 
              borderRadius: "1rem", 
              padding: "3rem",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
            {creators.map((creator, index) => (
              <div key={creator.id}>
                <div
                  className={`flex items-center gap-12 p-12 rounded-2xl transition-all duration-300 group creator-card ${
                    index % 2 === 1 ? "flex-row-reverse" : ""
                  }`}
                  style={{ 
                    background: "transparent", 
                    marginBottom: "1rem",
                    border: "none",
                    boxShadow: "none"
                  }}
                >
                <div className="flex-shrink-0">
                  <div className="w-56 h-64 overflow-hidden shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl border-4 border-white/20">
                    <img
                      src={creator.photo}
                      alt={creator.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>

                <div className={`flex-1 ${index % 2 === 1 ? 'text-right' : 'text-left'}`}>
                  <h3 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                    {creator.name}
                  </h3>
                  <p className="text-xl text-yellow-400 font-semibold mb-3 drop-shadow-md">
                    {creator.branch}
                  </p>
                  <p className="text-lg text-gray-300 mb-10 drop-shadow-md" style={{ marginBottom: "1rem" }}>
                    {creator.post}
                  </p>

                  <div className={`flex gap-4 mb-10 ${index % 2 === 1 ? 'justify-end' : 'justify-start'}`} style={{ marginBottom: "1rem", marginLeft: "0.22rem" }}>
                    {Object.entries(creator.socials).map(([platform, url]) => {
                      const IconComponent = getSocialIcon(platform);
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-3 scale-110 rounded-full w-9 transition-all duration-300 ${getSocialColor(
                            platform
                          )} transform hover:scale-160`}
                        >
                          <IconComponent size={22} />
                        </a>
                      );
                    })}
                  </div>

                  <p className={`text-md text-gray-200 leading-relaxed italic p-6 rounded-r-lg ${index % 2 === 1 ? 'pl-6 pr-6 text-right' : 'pl-6 pr-6 text-left'}`}>
                    "{creator.message}"
                  </p>
                </div>
                </div>
                {index < creators.length - 1 && (
                  <div className="flex justify-center my-5">
                    <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>
        </section>

        {/* Team Photo Section */}
        <section className="max-w-6xl mx-auto px-4 pb-20 team-section" style={{ marginTop: "4rem" }}>
          <h2
            className="text-4xl font-bold text-center team-heading"
            style={{
              ...fancyTextStyle,
              fontSize: "2.5rem",
              letterSpacing: "1px",
              marginBottom: "4rem",
              display: "block",
            }}
          >
            OUR AMAZING TEAM
          </h2>
          <div className="team-photo-wrapper" style={{ marginTop: "4rem" }}>
            <div className="relative group">
            <div className="rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-3xl border-4 border-white/20">
              <img
                src="https://github.com/adityatrymail/images/blob/main/WhatsApp%20Image%202025-09-20%20at%2014.54.27_958c1dee.jpg?raw=true"
                alt="Team Photo"
                className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                  Together We Create
                </h3>
                <p className="text-lg drop-shadow-md">
                  united by passion, driven by innovation, and committed to
                  excellence.
                </p>
              </div>
            </div>
            </div>
          </div>
        </section>
      </div>

      {/* Enhanced Styles */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Chalet+Comprime&display=swap");

        .main-container {
          background: url("https://github.com/adityatrymail/images/blob/main/Untitled-1.webp?raw=true")
            no-repeat center center fixed;
          background-size: cover;
          background-attachment: fixed;
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
          margin-top: 20px;
        }

        .mentor-card {
          backdrop-filter: blur(10px);
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px;
          transition: all 0.3s ease;
        }

        .mentor-card:hover {
          background: rgba(0, 0, 0, 0.3);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .creator-card {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        .creator-card:hover {
          background: transparent !important;
          transform: translateY(-3px);
          box-shadow: none !important;
        }

        .mentor-card {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        .mentor-card:hover {
          background: transparent !important;
          transform: translateY(-3px);
          box-shadow: none !important;
        }

        .creators-container {
          background: rgba(0, 0, 0, 0.3) !important;
          backdrop-filter: blur(10px) !important;
          border-radius: 1rem !important;
          padding: 2rem !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .creators-heading {
          margin-bottom: 4rem !important;
        }

        .creators-content-wrapper {
          margin-top: 4rem !important;
        }

        .mentors-heading {
          margin-bottom: 4rem !important;
        }

         .mentors-content-wrapper {
           margin-top: 4rem !important;
         }

         .mentors-container {
           background: rgba(0, 0, 0, 0.3) !important;
           backdrop-filter: blur(10px) !important;
           border-radius: 1rem !important;
           padding: 3rem !important;
           border: 1px solid rgba(255, 255, 255, 0.1) !important;
         }

         .mentors-section {
           margin-top: 4rem !important;
         }

         .mentor-card {
           margin-bottom: 2rem !important;
         }

         .mentor-card:last-child {
           margin-bottom: 0 !important;
         }

         .mentors-container .mentor-card {
           margin-bottom: 2.5rem !important;
           padding-top: 1rem !important;
         }

         .mentors-container .mentor-card:last-child {
           margin-bottom: 0 !important;
         }

        .creators-section {
          margin-top: 4rem !important;
        }

        .creator-card {
          margin-bottom: 2rem !important;
        }

        .creator-card:last-child {
          margin-bottom: 0 !important;
        }

        .creators-container .creator-card {
          margin-bottom: 2.5rem !important;
          padding-top: 1rem !important;
        }

        .creators-container .creator-card:last-child {
          margin-bottom: 0 !important;
        }

        .team-section {
          margin-top: 4rem !important;
          margin-bottom: 8rem !important;
        }

        .team-heading {
          margin-bottom: 4rem !important;
        }

        .team-photo-wrapper {
          margin-top: 4rem !important;
        }

        @media (max-width: 768px) {
          .creator-card.flex-row-reverse {
            flex-direction: column !important;
          }

          .creator-card {
            flex-direction: column;
            text-align: center;
          }

          .mentor-card.flex-row-reverse {
            flex-direction: column !important;
          }

          .mentor-card {
            flex-direction: column;
            text-align: center;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Creators;
