"use client";

import React, { createContext, useContext, useState } from "react";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (passcode: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Set your secure passcode here
const SECURE_PASSCODE = "GrailSociety@2026!";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize state directly from sessionStorage to avoid useEffect setState linter errors
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("grail_admin_authenticated") === "true";
    }
    return false;
  });

  const login = (passcode: string) => {
    if (passcode === SECURE_PASSCODE) {
      sessionStorage.setItem("grail_admin_authenticated", "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem("grail_admin_authenticated");
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return context;
}