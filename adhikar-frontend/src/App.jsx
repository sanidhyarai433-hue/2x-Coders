import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FilingWizard from './pages/FilingWizard';
import RtiWizard from './pages/RtiWizard';
import CopilotSandbox from './pages/CopilotSandbox';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/file"
                element={
                  <ProtectedRoute>
                    <FilingWizard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rti"
                element={
                  <ProtectedRoute>
                    <RtiWizard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/copilot/:id"
                element={
                  <ProtectedRoute>
                    <CopilotSandbox />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
