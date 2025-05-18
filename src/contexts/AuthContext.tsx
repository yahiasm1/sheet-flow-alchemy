
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast";

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // For demo purposes, we'll simulate authentication
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      if (email && password) {
        // Mock user for demo
        const mockUser: User = {
          id: '1',
          email,
          name: email.split('@')[0],
          role: email.includes('admin') ? 'admin' : 'editor',
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        toast({
          title: "Login successful",
          description: `Welcome back, ${mockUser.name}!`,
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, name: string, password: string) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      if (email && password) {
        // Mock user for demo
        const mockUser: User = {
          id: '1',
          email,
          name,
          role: 'editor',
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        toast({
          title: "Registration successful",
          description: `Welcome, ${name}!`,
        });
      } else {
        throw new Error('Invalid details');
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please check your details",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
