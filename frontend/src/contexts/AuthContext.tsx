import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios predefinidos
const USERS = [
  {
    username: 'malackathon',
    password: 'malackathon',
    role: 'admin' as const,
    displayName: 'Administrador',
  },
  {
    username: 'diego',
    password: 'toledo',
    role: 'user' as const,
    displayName: 'Diego',
  },
  {
    username: 'demo',
    password: 'demo',
    role: 'demo' as const,
    displayName: 'Usuario Demo',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const foundUser = USERS.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      const userSession: User = {
        username: foundUser.username,
        role: foundUser.role,
        displayName: foundUser.displayName,
      };
      setUser(userSession);
      localStorage.setItem('auth_user', JSON.stringify(userSession));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
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
