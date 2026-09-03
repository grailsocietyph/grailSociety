"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  supabase,
  AdminUser,
  DbAdminUser,
  mapDbAdminUserToAdminUser,
  hashPassword,
} from "@/lib/supabase";

interface CreateAdminPayload {
  username: string;
  email?: string;
  fullName: string;
  password: string;
  role?: "owner" | "admin";
}

interface UpdateAdminPayload {
  username?: string;
  email?: string;
  fullName?: string;
  password?: string;
  role?: "owner" | "admin";
  isActive?: boolean;
}

interface AdminAuthContextType {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
  adminUsers: AdminUser[];
  lockoutRemaining: number;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; lockoutSeconds?: number }>;
  logout: () => void;
  createAdminAccount: (data: CreateAdminPayload) => Promise<{ success: boolean; error?: string }>;
  updateAdminAccount: (id: string, data: UpdateAdminPayload) => Promise<{ success: boolean; error?: string }>;
  deleteAdminAccount: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshAdminUsers: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Default fallback master owner credentials
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSCODE = "Grailsocietywillbebig1!";

const STORAGE_KEY = "grail_admin_user_session";
const ATTEMPTS_KEY = "grail_admin_failed_attempts";
const LOCKOUT_KEY = "grail_admin_lockout_until";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Calculate remaining lockout seconds from storage
  const calculateRemainingLockout = useCallback((): number => {
    if (typeof window === "undefined") return 0;
    try {
      const untilStr = localStorage.getItem(LOCKOUT_KEY) || sessionStorage.getItem(LOCKOUT_KEY);
      if (!untilStr) return 0;
      const until = parseInt(untilStr, 10);
      const diff = Math.ceil((until - Date.now()) / 1000);
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  }, []);

  // Timer interval to update lockout countdown
  useEffect(() => {
    const initialRem = calculateRemainingLockout();
    setLockoutRemaining(initialRem);

    if (initialRem <= 0) return;

    const interval = setInterval(() => {
      const remaining = calculateRemainingLockout();
      setLockoutRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateRemainingLockout]);

  // Record a failed login attempt and apply security timeout
  const recordFailedAttempt = (): number => {
    if (typeof window === "undefined") return 0;
    try {
      const currentAttempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || "0", 10) + 1;
      localStorage.setItem(ATTEMPTS_KEY, currentAttempts.toString());

      let penaltySeconds = 0;
      if (currentAttempts >= 8) {
        penaltySeconds = 300; // 5 minutes lockout
      } else if (currentAttempts >= 5) {
        penaltySeconds = 60; // 1 minute lockout
      } else if (currentAttempts >= 3) {
        penaltySeconds = 15; // 15 seconds cooldown
      }

      if (penaltySeconds > 0) {
        const until = Date.now() + penaltySeconds * 1000;
        localStorage.setItem(LOCKOUT_KEY, until.toString());
        sessionStorage.setItem(LOCKOUT_KEY, until.toString());
        setLockoutRemaining(penaltySeconds);
      }

      return penaltySeconds;
    } catch {
      return 0;
    }
  };

  // Clear failed login attempts on successful authentication
  const clearFailedAttempts = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);
      sessionStorage.removeItem(LOCKOUT_KEY);
      setLockoutRemaining(0);
    } catch {
      // Ignore storage errors
    }
  };

  // Fetch all admin users from database
  const refreshAdminUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.warn("Could not load admin_users:", error.message);
        return;
      }

      if (data) {
        const mapped = data.map((row: DbAdminUser) => mapDbAdminUserToAdminUser(row));
        setAdminUsers(mapped);
      }
    } catch (err) {
      console.warn("refreshAdminUsers error:", err);
    }
  }, []);

  // Restore saved session on initial mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        if (typeof window !== "undefined") {
          const savedRaw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
          if (savedRaw) {
            const savedUser: AdminUser = JSON.parse(savedRaw);
            setCurrentUser(savedUser);
            setIsAuthenticated(true);

            // Verify in background if account is still active in Supabase
            const { data } = await supabase
              .from("admin_users")
              .select("*")
              .eq("id", savedUser.id)
              .single();

            if (data) {
              const freshUser = mapDbAdminUserToAdminUser(data);
              if (!freshUser.isActive) {
                logout();
                return;
              }
              setCurrentUser(freshUser);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(freshUser));
            }
          }
        }
      } catch (err) {
        console.warn("Failed to restore admin session:", err);
      } finally {
        setIsAuthLoaded(true);
      }
    };

    restoreSession();
    refreshAdminUsers();
  }, [refreshAdminUsers]);

  // Realtime subscription for admin_users updates
  useEffect(() => {
    const channel = supabase
      .channel("admin_users_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_users" },
        () => {
          refreshAdminUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshAdminUsers]);

  // Login handler with lockout protection
  const login = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string; lockoutSeconds?: number }> => {
    // Check if currently locked out
    const remainingSeconds = calculateRemainingLockout();
    if (remainingSeconds > 0) {
      return {
        success: false,
        lockoutSeconds: remainingSeconds,
        error: `Too many failed login attempts. Security lockout active for ${remainingSeconds}s.`,
      };
    }

    const trimmedId = identifier.trim();
    const trimmedPass = password.trim();

    if (!trimmedId || !trimmedPass) {
      return { success: false, error: "Please enter your username/email and password." };
    }

    try {
      const inputHash = await hashPassword(trimmedPass);

      // Query admin_users table in Supabase
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .or(`username.ilike.${trimmedId},email.ilike.${trimmedId}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        const dbUser: DbAdminUser = data[0];

        // Check if account is active
        if (dbUser.is_active === false) {
          return {
            success: false,
            error: "This admin account has been deactivated. Please contact your Store Owner.",
          };
        }

        // Verify password hash or plain text fallback
        const isPasswordMatch =
          dbUser.password_hash === inputHash || dbUser.password_hash === trimmedPass;

        if (isPasswordMatch) {
          clearFailedAttempts();

          // If stored as plain-text, upgrade it to hash
          if (dbUser.password_hash === trimmedPass) {
            await supabase
              .from("admin_users")
              .update({ password_hash: inputHash })
              .eq("id", dbUser.id);
          }

          // Update last_login_at
          const nowIso = new Date().toISOString();
          await supabase
            .from("admin_users")
            .update({ last_login_at: nowIso })
            .eq("id", dbUser.id);

          const mappedUser = mapDbAdminUserToAdminUser({
            ...dbUser,
            last_login_at: nowIso,
          });

          setCurrentUser(mappedUser);
          setIsAuthenticated(true);
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedUser));
            sessionStorage.setItem("grail_admin_authenticated", "true");
          }

          refreshAdminUsers();
          return { success: true };
        }

        // Incorrect password
        const lockout = recordFailedAttempt();
        return {
          success: false,
          lockoutSeconds: lockout > 0 ? lockout : undefined,
          error:
            lockout > 0
              ? `Incorrect password. Too many failed attempts. Locked out for ${lockout}s.`
              : "Incorrect password. Please try again.",
        };
      }

      // If not found in database, check fallback default master owner
      const isDefaultMatch =
        (trimmedId.toLowerCase() === DEFAULT_ADMIN_USERNAME ||
          trimmedId.toLowerCase() === "admin@grailsociety.com") &&
        trimmedPass === DEFAULT_ADMIN_PASSCODE;

      if (isDefaultMatch) {
        clearFailedAttempts();

        const defaultOwner: AdminUser = {
          id: "default-owner",
          username: "admin",
          email: "admin@grailsociety.com",
          fullName: "Store Owner",
          role: "owner",
          isActive: true,
          lastLoginAt: new Date().toISOString(),
        };

        // Try to auto-seed to Supabase if table exists
        try {
          const defaultHash = await hashPassword(DEFAULT_ADMIN_PASSCODE);
          await supabase.from("admin_users").insert([
            {
              username: "admin",
              email: "admin@grailsociety.com",
              full_name: "Store Owner",
              password_hash: defaultHash,
              role: "owner",
              is_active: true,
            },
          ]);
        } catch {
          // Ignore if already exists
        }

        setCurrentUser(defaultOwner);
        setIsAuthenticated(true);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOwner));
          sessionStorage.setItem("grail_admin_authenticated", "true");
        }

        refreshAdminUsers();
        return { success: true };
      }

      const lockout = recordFailedAttempt();
      return {
        success: false,
        lockoutSeconds: lockout > 0 ? lockout : undefined,
        error:
          lockout > 0
            ? `Invalid credentials. Too many failed attempts. Locked out for ${lockout}s.`
            : "Account not found or invalid credentials.",
      };
    } catch (err: any) {
      console.error("Login error:", err);
      return { success: false, error: err.message || "An unexpected login error occurred." };
    }
  };

  // Logout handler
  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem("grail_admin_authenticated");
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Create new admin account
  const createAdminAccount = async (
    data: CreateAdminPayload
  ): Promise<{ success: boolean; error?: string }> => {
    const username = data.username.trim().toLowerCase();
    const fullName = data.fullName.trim();
    const email = data.email?.trim().toLowerCase() || undefined;
    const password = data.password.trim();
    const role = data.role === "owner" ? "owner" : "admin";

    if (!username || username.length < 3) {
      return { success: false, error: "Username must be at least 3 characters." };
    }
    if (!fullName) {
      return { success: false, error: "Full Name is required." };
    }
    if (!password || password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    try {
      const password_hash = await hashPassword(password);

      const { data: inserted, error } = await supabase
        .from("admin_users")
        .insert([
          {
            username,
            full_name: fullName,
            email: email || null,
            password_hash,
            role,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === "23505" || error.message.includes("unique")) {
          return { success: false, error: "An account with this username or email already exists." };
        }
        return { success: false, error: error.message };
      }

      if (inserted) {
        const newAdmin = mapDbAdminUserToAdminUser(inserted);
        setAdminUsers((prev) => [...prev, newAdmin]);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to create admin account." };
    }
  };

  // Update existing admin account
  const updateAdminAccount = async (
    id: string,
    data: UpdateAdminPayload
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const updateData: Record<string, any> = {};

      if (data.username !== undefined) updateData.username = data.username.trim().toLowerCase();
      if (data.fullName !== undefined) updateData.full_name = data.fullName.trim();
      if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase() || null;
      if (data.role !== undefined) updateData.role = data.role === "owner" ? "owner" : "admin";
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

      if (data.password && data.password.trim()) {
        if (data.password.trim().length < 6) {
          return { success: false, error: "New password must be at least 6 characters." };
        }
        updateData.password_hash = await hashPassword(data.password.trim());
      }

      updateData.updated_at = new Date().toISOString();

      const { data: updated, error } = await supabase
        .from("admin_users")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (updated) {
        const mapped = mapDbAdminUserToAdminUser(updated);
        setAdminUsers((prev) => prev.map((u) => (u.id === id ? mapped : u)));

        if (currentUser && currentUser.id === id) {
          setCurrentUser(mapped);
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          }
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update admin account." };
    }
  };

  // Delete admin account
  const deleteAdminAccount = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (currentUser && currentUser.id === id) {
      return { success: false, error: "You cannot delete your own active account." };
    }

    try {
      const { error } = await supabase.from("admin_users").delete().eq("id", id);
      if (error) {
        return { success: false, error: error.message };
      }

      setAdminUsers((prev) => prev.filter((u) => u.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to delete admin account." };
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAuthLoaded,
        adminUsers,
        lockoutRemaining,
        login,
        logout,
        createAdminAccount,
        updateAdminAccount,
        deleteAdminAccount,
        refreshAdminUsers,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return context;
}