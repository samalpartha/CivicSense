import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'parent' | 'senior' | 'worker' | 'student' | 'general';
  location?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('civicsense_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // For demo purposes, accept any login
    const demoUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email,
      name: email.split('@')[0],
      userType: 'general',
      location: 'Downtown'
    };
    
    setUser(demoUser);
    localStorage.setItem('civicsense_user', JSON.stringify(demoUser));
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email || '',
      name: userData.name || '',
      userType: userData.userType || 'general',
      location: userData.location
    };
    
    setUser(newUser);
    localStorage.setItem('civicsense_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('civicsense_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      register 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


