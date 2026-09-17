"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarInitial: string;
  role: string;
  workspaceId?: string;
  credits: number;
  maxCredits: number;
  plan: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const defaultUser: UserProfile = {
  id: "usr_101",
  name: "Riya",
  email: "riya@vidoai.com",
  avatarInitial: "R",
  role: "Content Creator",
  credits: 1000,
  maxCredits: 1000,
  plan: "Pro Creator",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("vidoai_user", JSON.stringify(data.user));
          return;
        }
      }
      // Check stored user if offline
      const stored = localStorage.getItem("vidoai_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(defaultUser);
      }
    } catch {
      setUser(defaultUser);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password?: string, name?: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password || "Password123!" }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("vidoai_user", JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch {
      // Fallback
      const fallbackUser: UserProfile = {
        id: "usr_" + Date.now().toString().slice(-4),
        name: name || email.split("@")[0],
        email,
        avatarInitial: (name || email)[0].toUpperCase(),
        role: "Creator",
        credits: 1000,
        maxCredits: 1000,
        plan: "Pro Creator",
      };
      setUser(fallbackUser);
      return true;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("vidoai_user", JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch {
      return login(email, password, name);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
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
        refreshUser: fetchCurrentUser,
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
