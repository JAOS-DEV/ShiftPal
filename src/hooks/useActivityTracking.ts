import { useEffect, useRef } from "react";
import { auth } from "../services/firebase";

export const useActivityTracking = () => {
  const lastUpdateRef = useRef<number>(0);

  const updateActivity = async () => {
    if (!auth.currentUser) return;

    const now = Date.now();
    // Only update if 5+ minutes have passed (avoid spam)
    if (now - lastUpdateRef.current < 5 * 60 * 1000) return;

    try {
      const { updateLastActive } = await import("../services/firestoreStorage");
      await updateLastActive(auth.currentUser.uid);
      lastUpdateRef.current = now;
    } catch (error) {
      console.warn("Failed to update activity:", error);
    }
  };

  // Update on user interactions
  useEffect(() => {
    const handleUserActivity = () => updateActivity();

    // Track various user activities
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("keypress", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);

    return () => {
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("keypress", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
    };
  }, []);

  return { updateActivity };
};
