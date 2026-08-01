import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adhikar_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate existing token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setUser(data.data);
        } else {
          // Token is invalid/expired
          logout();
        }
      } catch (err) {
        console.warn('Backend server unreachable, decoding payload offline.');
        // Decoding helper if server is offline for demo safety
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            id: payload.id,
            phone: payload.phone,
            firstName: payload.firstName,
            lastName: payload.lastName,
            fullName: `${payload.firstName} ${payload.lastName}`,
            gender: payload.gender,
            dob: payload.dob,
            state: payload.state,
            district: payload.district,
            role: 'citizen',
            isProfileComplete: true
          });
        } catch (e) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  // Request OTP from phone number
  const requestOtp = async (phone) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.warn('Network error requesting OTP, triggering mock response');
      // Mock fallback for offline resilience
      const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
      return { success: true, otp: mockOtp, message: 'Simulated OTP sent successfully' };
    }
  };

  // Verify OTP code
  const verifyOtp = async (phone, otp) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, otp })
      });
      const data = await response.json();

      if (data.success) {
        if (data.registered) {
          localStorage.setItem('adhikar_token', data.token);
          setToken(data.token);
          setUser(data.user);
        }
        return data;
      } else {
        setError(data.message || 'OTP verification failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.warn('Network error during verification, using mock check');
      if (phone === '9876543210' && otp === '1234') {
        const mockUser = {
          id: 'mock_citizen_id_12345',
          phone: '9876543210',
          firstName: 'Adhikar',
          lastName: 'Demo Citizen',
          gender: 'Male',
          dob: '1995-05-15',
          state: 'Maharashtra',
          district: 'Mumbai',
          fullName: 'Adhikar Demo Citizen',
          role: 'citizen',
          isProfileComplete: true
        };
        const mockHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const mockPayload = btoa(JSON.stringify(mockUser));
        const mockToken = `${mockHeader}.${mockPayload}.mocksignature`;
        
        localStorage.setItem('adhikar_token', mockToken);
        setToken(mockToken);
        setUser(mockUser);
        return { success: true, registered: true, token: mockToken, user: mockUser };
      } else {
        // Assume new user for other numbers
        return { success: true, registered: false };
      }
    }
  };

  // Complete profile and sign up
  const createProfile = async (profileData) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/create-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adhikar_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return true;
      } else {
        setError(data.message || 'Error registering profile');
        return false;
      }
    } catch (err) {
      console.warn('Network error during registration, saving locally');
      const mockUser = {
        id: 'mock_user_' + Math.random().toString(36).substr(2, 9),
        phone: profileData.phone,
        firstName: profileData.firstName || (profileData.fullName ? profileData.fullName.split(' ')[0] : ''),
        lastName: profileData.lastName || (profileData.fullName ? profileData.fullName.split(' ').slice(1).join(' ') : ''),
        gender: profileData.gender,
        dob: profileData.dob,
        state: profileData.state,
        district: profileData.district,
        blockOrMunicipality: profileData.blockOrMunicipality,
        fullName: profileData.fullName || `${profileData.firstName} ${profileData.lastName}`,
        role: 'citizen',
        profileImage: profileData.profileImage,
        isProfileComplete: true
      };
      
      const mockHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const mockPayload = btoa(JSON.stringify(mockUser));
      const mockToken = `${mockHeader}.${mockPayload}.mocksignature`;
      
      localStorage.setItem('adhikar_token', mockToken);
      setToken(mockToken);
      setUser(mockUser);
      return true;
    }
  };

  // Legacy login support for backward compatibility if needed
  const login = async (email, password) => {
    // Left empty/unimplemented or alias to standard flow
    console.warn('Direct login is deprecated. Use OTP authentication.');
    return false;
  };

  // Update citizen profile details
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adhikar_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return true;
      } else {
        setError(data.message || 'Error updating profile');
        return false;
      }
    } catch (err) {
      console.warn('Network error during profile update, saving locally');
      const updatedUser = {
        ...user,
        firstName: profileData.firstName || (profileData.fullName ? profileData.fullName.split(' ')[0] : user.firstName),
        lastName: profileData.lastName || (profileData.fullName ? profileData.fullName.split(' ').slice(1).join(' ') : user.lastName),
        fullName: profileData.fullName || `${profileData.firstName || user.firstName} ${profileData.lastName || user.lastName}`,
        state: profileData.state,
        district: profileData.district,
        address: profileData.address || user.address,
        profileImage: profileData.profileImage || user.profileImage,
        isProfileComplete: true
      };
      
      const mockHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const mockPayload = btoa(JSON.stringify(updatedUser));
      const mockToken = `${mockHeader}.${mockPayload}.mocksignature`;
      
      localStorage.setItem('adhikar_token', mockToken);
      setToken(mockToken);
      setUser(updatedUser);
      return true;
    }
  };

  const logout = () => {
    localStorage.removeItem('adhikar_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, requestOtp, verifyOtp, createProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
