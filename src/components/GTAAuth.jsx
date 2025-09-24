import React, { useState } from 'react';
import GTASignin from './GTASignin';
import GTASignup from './GTASignup';
import { useAuth } from '../contexts/AuthContext';

const GTAAuth = ({ onClose, onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const { login } = useAuth();

  const handleSwitchToSignup = () => {
    setAuthMode('signup');
  };

  const handleSwitchToSignin = () => {
    setAuthMode('signin');
  };

  const handleAuthSuccess = (user) => {
    // Login to auth context
    login(user);

    if (onAuthSuccess) {
      onAuthSuccess(user);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[100001] text-white bg-black/50 hover:bg-black/70 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold transition-all duration-300"
        >
          ×
        </button>

        {authMode === 'signin' ? (
          <GTASignin
            onSwitchToSignup={handleSwitchToSignup}
            onSigninSuccess={handleAuthSuccess}
          />
        ) : (
          <GTASignup
            onSwitchToSignin={handleSwitchToSignin}
          />
        )}
      </div>
    </div>
  );
};

export default GTAAuth;