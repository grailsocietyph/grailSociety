"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
  login: (passcode: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Set your secure passcode here
const SECURE_PASSCODE = "Grailsocietywillbebig1!";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem("grail_admin_authenticated") === "true";
      setIsAuthenticated(isAuth);
      setIsAuthLoaded(true);
    }
  }, []);

  const login = (passcode: string) => {
    if (passcode === SECURE_PASSCODE) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("grail_admin_authenticated", "true");
      }
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("grail_admin_authenticated");
    }
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isAuthLoaded, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return context;
}