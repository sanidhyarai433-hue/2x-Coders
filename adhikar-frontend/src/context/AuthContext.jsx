import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adhikar_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setUser(data.data);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.warn('Backend server unreachable, trying to decode mock user from token');
        // Fallback: decode JWT or use mock session if server is offline
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            id: payload.id,
            name: payload.name,
            email: payload.email,
            role: 'citizen'
          });
        } catch (e) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adhikar_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return true;
      } else {
        setError(data.message || 'Login failed');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.warn('Backend connection failed during login. Using mock login fallback.');
      
      // Fallback: If server is offline, allow demo login
      if (email === 'citizen@adhikar.gov.in' && password === 'password123') {
        const mockUser = { id: 'mock_citizen_id_12345', name: 'Adhikar Demo Citizen', email: 'citizen@adhikar.gov.in', role: 'citizen' };
        // Generate a simple mock base64 token header.payload.signature
        const mockHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const mockPayload = btoa(JSON.stringify({ id: mockUser.id, name: mockUser.name, email: mockUser.email }));
        const mockToken = `${mockHeader}.${mockPayload}.mocksignature`;
        
        localStorage.setItem('adhikar_token', mockToken);
        setToken(mockToken);
        setUser(mockUser);
        setLoading(false);
        return true;
      } else {
        setError('Server offline. Use credentials: citizen@adhikar.gov.in / password123');
        setLoading(false);
        return false;
      }
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adhikar_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return true;
      } else {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.warn('Backend connection failed during registration. Using mock registration.');
      const mockUser = { id: 'mock_user_' + Math.random().toString(36).substr(2, 9), name, email, role: 'citizen' };
      const mockHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const mockPayload = btoa(JSON.stringify({ id: mockUser.id, name: mockUser.name, email: mockUser.email }));
      const mockToken = `${mockHeader}.${mockPayload}.mocksignature`;

      localStorage.setItem('adhikar_token', mockToken);
      setToken(mockToken);
      setUser(mockUser);
      setLoading(false);
      return true;
    }
  };

  const logout = () => {
    localStorage.removeItem('adhikar_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
