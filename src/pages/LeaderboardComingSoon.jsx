import React from 'react';
import { useNavigate } from 'react-router-dom';

const LeaderboardComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Ultra premium backdrop with animated particles */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black backdrop-blur-lg">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/10 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Content container */}
      <div className="relative w-full max-w-4xl animate-scaleIn">
        <div className="bg-gradient-to-b from-black via-gray-950 to-black border-3 border-gray-700 shadow-2xl overflow-hidden rounded-[2rem] backdrop-blur-2xl relative">

          {/* Animated border gradient */}
          <div className="absolute inset-0 rounded-[2rem] p-1 bg-gradient-to-r from-gray-600 via-white/30 to-gray-600 animate-borderSpin">
            <div className="w-full h-full bg-black rounded-[1.8rem]" />
          </div>

          {/* Header */}
          <div className="relative bg-gradient-to-r from-black via-gray-950 to-black text-white border-b-3 border-gray-700 overflow-hidden">
            {/* Animated top accent line */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer" />

            {/* Dynamic background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-pulse" />
            </div>

            <div className="relative px-12 py-16 text-center">
              <button
                onClick={() => navigate('/')}
                className="absolute top-10 right-12 text-gray-400 hover:text-white text-5xl w-16 h-16 flex items-center justify-center hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 rounded-2xl transition-all duration-500 hover:rotate-90 group border border-gray-700 hover:border-gray-500"
              >
                <span className="transform transition-all duration-500 group-hover:scale-125 font-light">×</span>
              </button>

              <div className="mb-8">
                <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-gray-900/90 rounded-2xl text-sm font-black text-gray-200 border-2 border-gray-600 backdrop-blur-lg tracking-[0.3em] shadow-2xl">
                  <svg className="w-6 h-6 mr-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  LEADERBOARD
                </div>
              </div>

              <h1 className="text-6xl font-black mb-6 tracking-tight text-white leading-none animate-textGlow">
                COMING SOON
              </h1>
              <p className="text-2xl text-gray-200 font-light tracking-[0.1em] leading-relaxed">
                The leaderboard will be available shortly
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-20 bg-gradient-to-b from-black via-gray-950 to-black relative">
            <div className="bg-gradient-to-br from-gray-950/80 via-gray-900/60 to-gray-950/80 border-3 border-gray-700 rounded-[2rem] p-12 space-y-8 shadow-2xl backdrop-blur-lg hover:shadow-gray-800/50 transition-shadow duration-500">

              {/* Coming Soon Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-3 border-gray-600 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-300 animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Message */}
              <div className="text-center space-y-6 px-4">
                <p className="text-3xl font-bold text-gray-200 tracking-wide">
                  Stay Tuned!
                </p>
                <p className="text-xl text-gray-300 font-medium leading-relaxed max-w-2xl mx-auto">
                  The leaderboard will be live during the events
                </p>
              </div>

              {/* Action Button */}
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => navigate('/')}
                  className="px-12 py-5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white text-lg font-bold rounded-2xl border-2 border-gray-600 hover:border-gray-500 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-gray-800/50 tracking-wider"
                >
                  BACK TO HOME
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardComingSoon;
