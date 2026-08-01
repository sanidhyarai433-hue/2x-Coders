import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import FilingWizard from './pages/FilingWizard';
import Splash from './pages/Splash';
import FutureScopeDemo from './pages/FutureScopeDemo';
import AdhikarSplitDemo from './pages/AdhikarSplitDemo';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
          <Routes>
            {/* Splash / Intro screen */}
            <Route path="/" element={<Splash />} />

            {/* Public Route */}
            <Route path="/split-demo" element={<AdhikarSplitDemo />} />
            <Route path="/future-scope" element={<FutureScopeDemo />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/new-case"
              element={
                <ProtectedRoute>
                  <FilingWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
