export type UserRole = 'admin' | 'user' | 'demo';

export interface User {
  username: string;
  role: UserRole;
  displayName: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}
