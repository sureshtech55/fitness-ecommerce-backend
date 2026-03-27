import React, { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../services/api';

interface AuthUser {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  sendOtp: (identifier: string, channel: 'email' | 'whatsapp' | 'sms') => Promise<any>;
  verifyOtp: (identifier: string, otp: string) => Promise<void>;
  completeOAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await userApi.login(email, password);
    const { user: userData, token: authToken } = response;
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  };

  const signup = async (name: string, email: string, password: string) => {
    // Register then auto-login
    await userApi.register(name, email, password);
    await login(email, password);
  };

  const sendOtp = async (identifier: string, channel: 'email' | 'whatsapp' | 'sms') => {
    return await userApi.sendOtp(identifier, channel);
  };

  const verifyOtp = async (identifier: string, otp: string) => {
    const response = await userApi.verifyOtp(identifier, otp);
    const { user: userData, token: authToken } = response;
    completeOAuth(authToken, userData);
  };

  const completeOAuth = (authToken: string, userData: AuthUser) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        signup,
        sendOtp,
        verifyOtp,
        completeOAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
