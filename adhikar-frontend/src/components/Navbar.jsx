import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scale, LogOut, LayoutDashboard, FileSpreadsheet, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-800 px-6 py-4 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-tr from-saffron-500 to-amber-600 p-2.5 rounded-xl shadow-lg shadow-saffron-500/20 group-hover:scale-105 transition-transform duration-300">
            <Scale className="w-6 h-6 text-slate-950 stroke-[2]" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-saffron-500 via-slate-100 to-ashoka-500 bg-clip-text text-transparent">
              ADHIKAR
            </span>
            <div className="text-[10px] text-slate-400 font-mono tracking-widest leading-none">AI CITIZEN Copilot</div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-saffron-500 transition-colors font-medium text-sm">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link to="/file" className="flex items-center gap-2 text-slate-300 hover:text-saffron-500 transition-colors font-medium text-sm">
            <PlusCircle className="w-4 h-4" />
            File Grievance
          </Link>
          <Link to="/rti" className="flex items-center gap-2 text-slate-300 hover:text-saffron-500 transition-colors font-medium text-sm">
            <FileSpreadsheet className="w-4 h-4" />
            RTI Portal
          </Link>
        </div>

        {/* User profile & logout */}
        <div className="flex items-center gap-4 border-l border-slate-850 pl-6">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-200">{user.name}</div>
            <div className="text-xs text-slate-400 capitalize">{user.role} Account</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-900/50 transition-all duration-300"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
