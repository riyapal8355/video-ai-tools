"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarInitial: string;
  role: string;
  credits: number;
  maxCredits: number;
  plan: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  signup: (email: string, name: string) => void;
}

const defaultUser: UserProfile = {
  id: "usr_101",
  name: "Riya",
  email: "riya@vidoai.com",
  avatarInitial: "R",
  role: "Content Creator",
  credits: 850,
  maxCredits: 1000,
  plan: "Pro Creator",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent session
    const storedUser = localStorage.getItem("vidoai_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(defaultUser);
      }
    } else {
      // Default to logged in as Riya for seamless initial experience
      setUser(defaultUser);
      localStorage.setItem("vidoai_user", JSON.stringify(defaultUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, name?: string) => {
    const newUser: UserProfile = {
      id: "usr_" + Date.now().toString().slice(-4),
      name: name || (email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)) || "User",
      email: email,
      avatarInitial: (name || email)[0].toUpperCase(),
      role: "Creator",
      credits: 850,
      maxCredits: 1000,
      plan: "Pro Creator",
    };
    setUser(newUser);
    localStorage.setItem("vidoai_user", JSON.stringify(newUser));
  };

  const signup = (email: string, name: string) => {
    login(email, name);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("vidoai_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
