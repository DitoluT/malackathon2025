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
    console.log('AuthContext: Initializing');
    const storedUser = localStorage.getItem('auth_user');
    console.log('AuthContext: Stored user:', storedUser);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthContext: Setting user:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('AuthContext: Error parsing user:', error);
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    console.log('AuthContext: Login attempt for:', username);
    const foundUser = USERS.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      const userSession: User = {
        username: foundUser.username,
        role: foundUser.role,
        displayName: foundUser.displayName,
      };
      console.log('AuthContext: Login successful:', userSession);
      setUser(userSession);
      localStorage.setItem('auth_user', JSON.stringify(userSession));
      return true;
    }

    console.log('AuthContext: Login failed');
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
