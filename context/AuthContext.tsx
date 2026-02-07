import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import * as Storage from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string) => void;
  checkEmail: (email: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = Storage.getSession();
    if (session) setUser(session);
  }, []);

  const login = (email: string, name?: string) => {
    const u = Storage.login(email, name);
    setUser(u);
  };

  const checkEmail = (email: string) => {
      return Storage.checkEmailExists(email);
  }

  const logout = () => {
    Storage.logout();
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
      if (user) {
          const updated = Storage.updateUser(user.id, data);
          setUser(updated);
      }
  }

  return (
    <AuthContext.Provider value={{ user, login, checkEmail, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);