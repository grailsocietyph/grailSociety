"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Announcement {
  id: string;
  text: string;
  link: string;
  isActive: boolean;
}

interface AnnouncementContextType {
  announcement: Announcement;
  loading: boolean;
  updateAnnouncement: (data: Partial<Announcement>) => Promise<boolean>;
  deleteAnnouncement: () => Promise<boolean>;
  refreshAnnouncement: () => Promise<void>;
}

const DEFAULT_ANNOUNCEMENT: Announcement = {
  id: "primary",
  text: "",
  link: "",
  isActive: false,
};

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export function AnnouncementProvider({ children }: { children: React.ReactNode }) {
  const [announcement, setAnnouncement] = useState<Announcement>(DEFAULT_ANNOUNCEMENT);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncement = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("id", "primary")
        .single();

      if (error) {
        return;
      }

      if (data) {
        const loaded: Announcement = {
          id: data.id || "primary",
          text: data.text || "",
          link: data.link || "",
          isActive: data.is_active !== undefined ? !!data.is_active : true,
        };
        setAnnouncement(loaded);
        if (typeof window !== "undefined") {
          localStorage.setItem("grail_society_announcement", JSON.stringify(loaded));
        }
      }
    } catch (err) {
      console.error("Failed to fetch announcement:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("grail_society_announcement");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.text === "string") {
            setAnnouncement(parsed);
          }
        } catch (e) {
          console.error("Failed to load cached announcement", e);
        }
      }
    }

    fetchAnnouncement();

    // Supabase Realtime Subscription for instant cross-tab/device syncing
    const channel = supabase
      .channel("public:announcements")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setAnnouncement(DEFAULT_ANNOUNCEMENT);
            if (typeof window !== "undefined") {
              localStorage.removeItem("grail_society_announcement");
            }
          } else if (payload.new && (payload.new as any).id === "primary") {
            const row = payload.new as any;
            const updated: Announcement = {
              id: row.id || "primary",
              text: row.text || "",
              link: row.link || "",
              isActive: row.is_active !== undefined ? !!row.is_active : true,
            };
            setAnnouncement(updated);
            if (typeof window !== "undefined") {
              localStorage.setItem("grail_society_announcement", JSON.stringify(updated));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAnnouncement]);

  const updateAnnouncement = async (data: Partial<Announcement>): Promise<boolean> => {
    const updated: Announcement = {
      ...announcement,
      ...data,
      id: "primary",
    };

    setAnnouncement(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("grail_society_announcement", JSON.stringify(updated));
    }

    try {
      const payload = {
        id: "primary",
        text: updated.text,
        link: updated.link,
        is_active: updated.isActive,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("announcements")
        .upsert(payload, { onConflict: "id" });

      if (error) {
        console.error("Supabase announcement upsert error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed to save announcement in Supabase:", err);
      return false;
    }
  };

  const deleteAnnouncement = async (): Promise<boolean> => {
    setAnnouncement(DEFAULT_ANNOUNCEMENT);
    if (typeof window !== "undefined") {
      localStorage.removeItem("grail_society_announcement");
    }

    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", "primary");

      if (error) {
        console.error("Supabase announcement delete error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed to delete announcement from Supabase:", err);
      return false;
    }
  };

  return (
    <AnnouncementContext.Provider
      value={{
        announcement,
        loading,
        updateAnnouncement,
        deleteAnnouncement,
        refreshAnnouncement: fetchAnnouncement,
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncement() {
  const context = useContext(AnnouncementContext);
  if (!context) throw new Error("useAnnouncement must be used within an AnnouncementProvider");
  return context;
}
