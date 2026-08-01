import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scale, Lock, Mail, User, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('citizen@adhikar.gov.in');
  const [password, setPassword] = useState('password123');
  const [formError, setFormError] = useState('');

  const { login, register, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (isLogin) {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      }
    } else {
      if (!name) {
        setFormError('Please enter your name');
        return;
      }
      const success = await register(name, email, password);
      if (success) {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-saffron-500/10 to-ashoka-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex items-center justify-center bg-gradient-to-tr from-saffron-500 to-amber-600 p-4 w-16 h-16 rounded-2xl shadow-xl shadow-saffron-500/10 mb-4 animate-pulse">
          <Scale className="w-8 h-8 text-slate-950 stroke-[2]" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-saffron-500 via-slate-100 to-ashoka-500 bg-clip-text text-transparent">
          ADHIKAR
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          AI-Powered Citizen Grievance & RTI Copilot
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-slate-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {(error || formError) && (
              <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span className="text-xs text-red-300 leading-tight">{formError || error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-slate-950 bg-gradient-to-r from-saffron-500 to-amber-500 hover:from-saffron-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-saffron-500 transform active:scale-[0.98] transition-all"
              >
                {isLogin ? 'Sign In to Portal' : 'Register Citizen Account'}
              </button>
            </div>
          </form>

          {/* Toggle login/signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setFormError('');
              }}
              className="text-xs font-semibold text-saffron-500 hover:underline"
            >
              {isLogin
                ? "Don't have an account? Create one"
                : 'Already have an account? Sign In'}
            </button>
          </div>

          {/* Demo account guidance */}
          {isLogin && (
            <div className="mt-8 border-t border-slate-800 pt-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-saffron-500 font-bold mb-2">
                  SIH Judge / Tester Quick Credentials:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                  <div>Email:</div>
                  <div className="text-slate-200">citizen@adhikar.gov.in</div>
                  <div>Password:</div>
                  <div className="text-slate-200">password123</div>
                </div>
                <div className="text-[10px] text-slate-500 mt-2 italic">
                  Note: Backend supports dynamic in-memory database simulation if MongoDB is offline.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
