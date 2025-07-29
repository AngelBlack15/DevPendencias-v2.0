import type { ReactNode, Context } from 'react';

export interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export type AuthContext = Context<AuthContextType | undefined>;
