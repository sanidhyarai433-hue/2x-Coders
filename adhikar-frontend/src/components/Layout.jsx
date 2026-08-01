import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, List, Clock, Settings, LogOut, Scale } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      
      {/* FIXED LEFT SIDEBAR (240px wide) */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 fixed h-screen z-10 select-none">
        
        {/* Top Section */}
        <div className="flex flex-col">
          {/* Logo / Wordmark */}
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center gap-2.5">
            <div className="bg-blue-900 p-1.5 rounded shadow-sm">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-blue-900 tracking-wider text-base uppercase">
                Adhikar
              </span>
              <div className="text-[8px] text-slate-500 font-bold tracking-widest leading-none">AI Copilot Portal</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <NavLink
              to="/new-case"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-900 pl-3'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                }`
              }
            >
              <FileText className="w-4 h-4 shrink-0" />
              File a Case
            </NavLink>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-900 pl-3'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                }`
              }
            >
              <List className="w-4 h-4 shrink-0" />
              My Cases
            </NavLink>

            <NavLink
              to="/timeline"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-900 pl-3'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                }`
              }
            >
              <Clock className="w-4 h-4 shrink-0" />
              Timeline
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-900 pl-3'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                }`
              }
            >
              <Settings className="w-4 h-4 shrink-0" />
              Settings
            </NavLink>
          </nav>
        </div>

        {/* Bottom Section Pinned Profile & Logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-2.5">
          <div className="px-2">
            <div className="text-xs font-extrabold text-slate-800 truncate">
              {user?.fullName || 'Citizen User'}
            </div>
            <div className="text-[9px] font-bold text-slate-500 font-mono uppercase tracking-wider mt-0.5">
              Phone: {user?.phone || '9876543210'}
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-slate-300 rounded bg-white hover:bg-red-50 hover:text-red-700 text-xs font-bold text-slate-700 transition-colors uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow pl-60 min-h-screen flex flex-col">
        {/* Top official emblem banner strip */}
        <div className="bg-blue-900 text-white px-8 py-3.5 flex justify-between items-center border-b-4 border-amber-500 shadow-sm shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="w-7 h-7 bg-white p-0.5 rounded shadow-sm" alt="Emblem" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider font-sans leading-none">
                Ministry of Personnel, Public Grievances and Pensions
              </div>
              <div className="text-[9px] text-amber-300 font-semibold mt-0.5">
                Centralized Public Grievance Redress & Monitoring System
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-950/80 px-3 py-1.5 rounded-lg border border-blue-800 text-[10px]">
              <span className="font-bold text-amber-400">{user?.fullName || `${user?.firstName || 'Citizen'} ${user?.lastName || ''}`}</span>
              <span className="text-blue-400">•</span>
              <span className="text-slate-300">📍 {user?.district || 'Mumbai'}, {user?.state || 'Maharashtra'}</span>
              <span className="text-blue-400">•</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                🛡️ Verified Identity
              </span>
            </div>
            <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest hidden md:block">
              Adhikar AI Platform
            </div>
          </div>
        </div>

        {/* Dynamic Outlet rendering page content */}
        <div className="flex-grow p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default Layout;
