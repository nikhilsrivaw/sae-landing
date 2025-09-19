import React, { useState, useEffect, useCallback } from 'react';

const RegistrationForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    leaderRoll: '',
    leaderBranch: '',
    member1Name: '',
    member1Roll: '',
    member1Branch: '',
    member2Name: '',
    member2Roll: '',
    member2Branch: '',
    member3Name: '',
    member3Roll: '',
    member3Branch: '',
    member4Name: '',
    member4Roll: '',
    member4Branch: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');
  const [mounted, setMounted] = useState(false);

  const branches = [
    'Computer Science (CSE)',
    'Electronics (ECE)',
    'Mechanical (ME)',
    'Civil (CE)',
    'Electrical (EE)',
    'Information Technology (IT)',
    'Chemical Engineering',
    'BBA',
    'B.Pharma',
    'Other'
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setMounted(true);
    } else {
      document.body.style.overflow = 'unset';
      setMounted(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['teamName', 'leaderName', 'leaderRoll', 'leaderBranch'];

    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const cleanedData = {};
    Object.keys(formData).forEach(key => {
      if (formData[key].trim()) {
        cleanedData[key] = formData[key].trim();
      }
    });

    setShowSuccess(true);
    setIsSubmitting(false);

    // Reset form
    setFormData({
      teamName: '', leaderName: '', leaderRoll: '', leaderBranch: '',
      member1Name: '', member1Roll: '', member1Branch: '',
      member2Name: '', member2Roll: '', member2Branch: '',
      member3Name: '', member3Roll: '', member3Branch: '',
      member4Name: '', member4Roll: '', member4Branch: ''
    });

    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleClose = useCallback(() => {
    setShowSuccess(false);
    setErrors({});
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const InputField = ({
    label,
    name,
    type = "text",
    placeholder,
    required = false,
    options = null,
    className = ""
  }) => {
    const hasError = errors[name];
    const isFocused = focusedField === name;

    return (
      <div className={`relative group ${className}`}>
        <label className="block text-xs font-black text-gray-200 mb-4 tracking-[0.2em] uppercase leading-relaxed">
          {label}
          {required && <span className="text-red-400 ml-2 text-sm">●</span>}
        </label>

        <div className="relative overflow-hidden rounded-xl">
          {options ? (
            <select
              value={formData[name]}
              onChange={(e) => handleInputChange(name, e.target.value)}
              onFocus={() => setFocusedField(name)}
              onBlur={() => setFocusedField('')}
              className={`
                w-full h-18 px-7 text-lg bg-gray-950/90 border-3 rounded-xl
                text-white font-semibold backdrop-blur-sm
                transition-all duration-500 ease-out
                focus:outline-none focus:bg-gray-900/80
                hover:border-gray-400 hover:bg-gray-900/60 hover:shadow-2xl hover:shadow-gray-500/20
                ${hasError
                  ? 'border-red-500 focus:border-red-400 shadow-2xl shadow-red-500/30 bg-red-950/20'
                  : isFocused
                    ? 'border-white bg-gray-900/80 shadow-2xl shadow-white/20 scale-[1.02]'
                    : 'border-gray-600'
                }
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01]'}
                appearance-none transform
              `}
              disabled={isSubmitting}
              required={required}
            >
              <option value="" className="bg-gray-950 text-gray-400 py-4">{placeholder}</option>
              {options.map(option => (
                <option key={option} value={option} className="bg-gray-950 text-white py-4 font-medium">
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={formData[name]}
              onChange={(e) => handleInputChange(name, e.target.value)}
              onFocus={() => setFocusedField(name)}
              onBlur={() => setFocusedField('')}
              placeholder={placeholder}
              className={`
                w-full h-18 px-7 text-lg bg-gray-950/90 border-3 rounded-xl
                text-white font-semibold backdrop-blur-sm
                transition-all duration-500 ease-out
                focus:outline-none focus:bg-gray-900/80
                hover:border-gray-400 hover:bg-gray-900/60 hover:shadow-2xl hover:shadow-gray-500/20
                placeholder:text-gray-500 placeholder:font-normal placeholder:italic
                ${hasError
                  ? 'border-red-500 focus:border-red-400 shadow-2xl shadow-red-500/30 bg-red-950/20'
                  : isFocused
                    ? 'border-white bg-gray-900/80 shadow-2xl shadow-white/20 scale-[1.02]'
                    : 'border-gray-600'
                }
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}
                transform
              `}
              disabled={isSubmitting}
              required={required}
            />
          )}

          {/* Animated focus ring */}
          <div className={`
            absolute inset-0 rounded-xl pointer-events-none
            transition-all duration-500 ease-out
            ${isFocused ? 'ring-4 ring-white/30 ring-offset-2 ring-offset-black' : ''}
          `} />

          {/* Custom dropdown arrow with animation */}
          {options && (
            <div className={`
              absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none
              transition-transform duration-300
              ${isFocused ? 'rotate-180 scale-110' : ''}
            `}>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}

          {/* Input highlight effect */}
          <div className={`
            absolute inset-0 rounded-xl pointer-events-none
            bg-gradient-to-r from-transparent via-white/5 to-transparent
            transform transition-transform duration-700
            ${isFocused ? 'translate-x-full' : '-translate-x-full'}
          `} />
        </div>

        {hasError && (
          <div className="mt-4 text-sm text-red-400 font-bold flex items-center animate-slideIn bg-red-950/30 p-3 rounded-lg border border-red-800/50">
            <svg className="w-5 h-5 mr-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors[name]}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${mounted ? 'animate-fadeIn' : ''}`}>
      {/* Ultra premium backdrop with animated particles */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black backdrop-blur-lg"
        onClick={handleClose}
      >
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

      {/* Form container with ultimate refinement */}
      <div className="relative w-full max-w-8xl max-h-[95vh] overflow-hidden animate-scaleIn">
        <div className="bg-gradient-to-b from-black via-gray-950 to-black border-3 border-gray-700 shadow-2xl overflow-hidden rounded-[2rem] backdrop-blur-2xl relative">

          {/* Animated border gradient */}
          <div className="absolute inset-0 rounded-[2rem] p-1 bg-gradient-to-r from-gray-600 via-white/30 to-gray-600 animate-borderSpin">
            <div className="w-full h-full bg-black rounded-[1.8rem]" />
          </div>

          {/* Ultra refined header */}
          <div className="relative bg-gradient-to-r from-black via-gray-950 to-black text-white border-b-3 border-gray-700 overflow-hidden">
            {/* Animated top accent line */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer" />

            {/* Dynamic background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-pulse" />
            </div>

            <div className="relative px-20 py-16 text-center">
              <button
                onClick={handleClose}
                className="absolute top-10 right-12 text-gray-400 hover:text-white text-5xl w-16 h-16 flex items-center justify-center hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 rounded-2xl transition-all duration-500 hover:rotate-90 group border border-gray-700 hover:border-gray-500"
              >
                <span className="transform transition-all duration-500 group-hover:scale-125 font-light">×</span>
              </button>

              <div className="mb-8">
                <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-gray-900/90 rounded-2xl text-sm font-black text-gray-200 border-2 border-gray-600 backdrop-blur-lg tracking-[0.3em] shadow-2xl">
                  <svg className="w-6 h-6 mr-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  EVENT REGISTRATION
                </div>
              </div>

              <h1 className="text-6xl font-black mb-6 tracking-tight text-white leading-none animate-textGlow">
                TEAM REGISTRATION
              </h1>
              <p className="text-2xl text-gray-200 font-light tracking-[0.1em] leading-relaxed">
                Register your team for the upcoming competition
              </p>
            </div>
          </div>

          {/* Form content with ultimate refinement */}
          <div className="p-20 max-h-[70vh] overflow-y-auto custom-scrollbar bg-gradient-to-b from-black via-gray-950 to-black relative">

            {/* Success message */}
            {showSuccess && (
              <div className="mb-16 p-10 bg-gradient-to-r from-green-950/70 via-green-900/50 to-green-950/70 border-3 border-green-600 rounded-3xl backdrop-blur-lg animate-slideDown shadow-2xl">
                <div className="flex items-center justify-center text-green-300">
                  <svg className="w-10 h-10 mr-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-2xl font-black tracking-wide">REGISTRATION SUCCESSFUL! CONFIRMATION EMAIL SENT.</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-20">

              {/* Team Information Section */}
              <div className="space-y-12 animate-slideUp">
                <div className="flex items-center space-x-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 rounded-3xl flex items-center justify-center border-3 border-gray-600 shadow-2xl group hover:scale-110 transition-transform duration-500">
                    <svg className="w-10 h-10 text-gray-200 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-white tracking-[0.15em] leading-tight mb-3">TEAM INFORMATION</h2>
                    <p className="text-gray-300 font-semibold text-xl">Enter your team details and leader information</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-950/80 via-gray-900/60 to-gray-950/80 border-3 border-gray-700 rounded-[2rem] p-12 space-y-12 shadow-2xl backdrop-blur-lg hover:shadow-gray-800/50 transition-shadow duration-500">
                  <InputField
                    label="Team Name"
                    name="teamName"
                    placeholder="Enter your team name"
                    required
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <InputField
                      label="Team Leader Name"
                      name="leaderName"
                      placeholder="Enter leader's full name"
                      required
                    />
                    <InputField
                      label="Roll Number"
                      name="leaderRoll"
                      placeholder="Enter roll number"
                      required
                    />
                  </div>

                  <InputField
                    label="Branch"
                    name="leaderBranch"
                    placeholder="Select your branch"
                    options={branches}
                    required
                  />
                </div>
              </div>

              {/* Team Members Section */}
              <div className="space-y-12 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center space-x-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 rounded-3xl flex items-center justify-center border-3 border-gray-600 shadow-2xl group hover:scale-110 transition-transform duration-500">
                    <svg className="w-10 h-10 text-gray-200 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-white tracking-[0.15em] leading-tight mb-3">TEAM MEMBERS</h2>
                    <p className="text-gray-300 font-semibold text-xl">Add up to 4 team members (all fields optional)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  {[1, 2, 3, 4].map((memberNum) => (
                    <div
                      key={memberNum}
                      className="bg-gradient-to-br from-gray-950/80 via-gray-900/60 to-gray-950/80 border-3 border-gray-700 hover:border-gray-600 rounded-[2rem] p-12 transition-all duration-700 hover:bg-gradient-to-br hover:from-gray-900/80 hover:via-gray-800/60 hover:to-gray-900/80 group shadow-2xl hover:shadow-gray-800/50 hover:scale-[1.02] backdrop-blur-lg"
                      style={{ animationDelay: `${0.1 * memberNum}s` }}
                    >
                      <div className="flex items-center mb-10">
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mr-8 border-3 border-gray-500 shadow-xl group-hover:scale-110 transition-all duration-500 group-hover:rotate-12">
                          <span className="text-white font-black text-xl">{memberNum}</span>
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-[0.15em]">
                          MEMBER {memberNum}
                        </h3>
                      </div>

                      <div className="space-y-10">
                        <InputField
                          label="Full Name"
                          name={`member${memberNum}Name`}
                          placeholder="Enter full name"
                        />
                        <InputField
                          label="Roll Number"
                          name={`member${memberNum}Roll`}
                          placeholder="Enter roll number"
                        />
                        <InputField
                          label="Branch"
                          name={`member${memberNum}Branch`}
                          placeholder="Select branch"
                          options={branches}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-16 animate-slideUp" style={{ animationDelay: '0.4s' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-24 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 hover:from-gray-800 hover:via-gray-600 hover:to-gray-800 text-white text-3xl font-black rounded-3xl transition-all duration-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] hover:shadow-2xl border-3 border-gray-600 hover:border-gray-500 tracking-[0.3em] group relative overflow-hidden"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  {isSubmitting ? (
                    <div className="flex items-center justify-center relative z-10">
                      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mr-8"></div>
                      <span>REGISTERING TEAM...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center relative z-10">
                      <svg className="w-10 h-10 mr-6 group-hover:scale-125 transition-transform duration-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                      REGISTER TEAM
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
          50% { text-shadow: 0 0 30px rgba(255, 255, 255, 0.5); }
        }

        @keyframes borderSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.5s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.6s ease-out; }
        .animate-slideDown { animation: slideDown 0.5s ease-out; }
        .animate-shimmer { animation: shimmer 3s ease-in-out infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-textGlow { animation: textGlow 2s ease-in-out infinite; }
        .animate-borderSpin { animation: borderSpin 10s linear infinite; }

        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 20px;
          border: 2px solid #111827;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #4b5563, #6b7280, #9ca3af);
          border-radius: 20px;
          border: 3px solid #1f2937;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #6b7280, #9ca3af, #d1d5db);
        }
      `}</style>
    </div>
  );
};

export default RegistrationForm;