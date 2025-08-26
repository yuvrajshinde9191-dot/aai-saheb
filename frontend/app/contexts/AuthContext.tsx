import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

interface User {
  _id: string;
  phone?: string;
  email?: string;
  role: string;
  isVerified: boolean;
  language: string;
  location?: {
    state: string;
    district: string;
    taluka: string;
  };
  trustedContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (phone: string, email: string) => Promise<{ success: boolean; message: string; requiresOTP?: boolean }>;
  verifyOTP: (phone: string, email: string, otp: string) => Promise<{ success: boolean; message: string; token?: string; user?: User }>;
  register: (phone: string, email: string, role: string, language: string) => Promise<{ success: boolean; message: string; requiresOTP?: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = Constants.expoConfig?.extra?.backendUrl || 'https://maharashtra-empower.preview.emergentagent.com';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('userData'),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verify token validity
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const response = await axios.get(`${API_BASE_URL}/api/profile`);
          setUser(response.data.user);
        } catch (error) {
          // Token invalid, clear auth
          await logout();
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone: string, email: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        phone: phone || undefined,
        email: email || undefined,
      });

      return {
        success: true,
        message: response.data.message,
        requiresOTP: true,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Login failed',
      };
    }
  };

  const verifyOTP = async (phone: string, email: string, otp: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
        phone: phone || undefined,
        email: email || undefined,
        otp,
      });

      const { token: newToken, user: userData } = response.data;
      
      await AsyncStorage.setItem('userToken', newToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return {
        success: true,
        message: 'Login successful',
        token: newToken,
        user: userData,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.detail || 'OTP verification failed',
      };
    }
  };

  const register = async (phone: string, email: string, role: string, language: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        phone: phone || undefined,
        email: email || undefined,
        role,
        language,
      });

      return {
        success: true,
        message: response.data.message,
        requiresOTP: true,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/profile`, updates);
      
      const updatedUser = response.data.user;
      setUser(updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      
      return {
        success: true,
        message: 'Profile updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Profile update failed',
      };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    token,
    login,
    verifyOTP,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};