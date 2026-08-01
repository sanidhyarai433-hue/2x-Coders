import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Splash = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {

    // Transition automatically after 2.5 seconds
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        if (token) {
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      }, 500); // Wait for exit animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, token]);

  return (
    <div className={`min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-slate-200 select-none relative overflow-hidden transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background gradients for premium feel */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-saffron-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-ashoka-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div 
        className={`text-center space-y-6 max-w-md px-6 animate-page-enter`}
      >
        {/* Emblem/Logo container */}
        <div className="mx-auto flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-950 p-4.5 w-24 h-24 rounded-3xl shadow-2xl mb-4 border border-slate-800/80 relative">
          {/* Tri-color glow ring */}
          <div className="absolute -inset-0.5 bg-gradient-to-tr from-saffron-500 via-white to-ashoka-500 rounded-3xl opacity-20 blur-sm"></div>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            className="w-14 h-14 object-contain opacity-95 relative z-10" 
            alt="Emblem of India Logo" 
          />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-saffron-500 via-white to-ashoka-500 leading-none">
            ADHIKAR
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            Government of India Initiative
          </p>
        </div>

        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-slate-700 to-transparent mx-auto my-4"></div>

        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          AI-Powered Citizen Grievance & RTI Assistant Portal
        </p>

        {/* Premium subtle loading indicator */}
        <div className="pt-6 flex flex-col items-center gap-2">
          <div className="w-12 h-[3px] bg-slate-900 rounded-full overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-saffron-500 to-ashoka-500 rounded-full animate-[loading_1.5s_infinite_ease-in-out]"></div>
          </div>
          <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase animate-pulse">
            Establishing secure registry connection...
          </span>
        </div>
      </div>

      {/* CSS injection for the progress bar animation */}
      <style>{`
        @keyframes loading {
          0% { left: -50%; width: 50%; }
          50% { left: 25%; width: 50%; }
          100% { left: 100%; width: 50%; }
        }
      `}</style>
    </div>
  );
};

export default Splash;
