import { Settings } from "../types";

export const defaultSettings: Settings = {
  weekStartDay: "monday",
  standardRates: [
    {
      id: "default",
      name: "Standard Rate",
      rate: 0,
    },
  ],
  overtimeRates: [
    {
      id: "default",
      name: "Overtime Rate",
      rate: 0,
    },
  ],
  enableTaxCalculations: false,
  taxRate: 0.2,
  enableNiCalculations: false,
  currency: "GBP",
  weeklyGoal: 0,
  monthlyGoal: 0,
  darkMode: false,
  storageMode: "local",
};

/**
 * Stores the current user ID in localStorage to track user sessions
 */
export function setCurrentUserId(userId: string): void {
  localStorage.setItem("currentUserId", userId);
}

/**
 * Gets the current user ID from localStorage
 */
export function getCurrentUserId(): string | null {
  return localStorage.getItem("currentUserId");
}

/**
 * Checks if the current user is different from the stored user
 * Returns true if there's a stored user ID and it doesn't match the new user ID
 * Also returns true if there's no stored user ID (indicating a fresh sign-in)
 */
export function isDifferentUser(newUserId: string): boolean {
  const storedUserId = getCurrentUserId();
  // If no stored user ID, this is a fresh sign-in (different user)
  // If stored user ID exists and doesn't match, this is a different user
  return storedUserId === null || storedUserId !== newUserId;
}

/**
 * Ensures pro features are disabled for non-pro users
 */
export function ensureProFeaturesDisabled(settings: Settings): Settings {
  return {
    ...settings,
    enableTaxCalculations: false,
    enableNiCalculations: false,
    storageMode: "local",
  };
}

/**
 * Multi-user data management functions
 */

/**
 * Saves all current user data to localStorage with user-specific keys
 */
export function saveUserData(userId: string): void {
  const userData = {
    timeEntries: localStorage.getItem("timeEntries"),
    hourlyRate: localStorage.getItem("hourlyRate"),
    payHistory: localStorage.getItem("payHistory"),
    dailySubmissions: localStorage.getItem("dailySubmissions"),
    activeView: localStorage.getItem("activeView"),
    onboardingComplete: localStorage.getItem("onboardingComplete"),
    settings: localStorage.getItem("settings"),
  };

  // Save with user-specific keys
  localStorage.setItem(`user_${userId}_data`, JSON.stringify(userData));
}

/**
 * Loads user-specific data from localStorage
 */
export function loadUserData(userId: string): void {
  const userDataKey = `user_${userId}_data`;
  const userData = localStorage.getItem(userDataKey);

  // First, clear all current data to prevent merging
  localStorage.removeItem("timeEntries");
  localStorage.removeItem("hourlyRate");
  localStorage.removeItem("payHistory");
  localStorage.removeItem("dailySubmissions");
  localStorage.removeItem("onboardingComplete");

  if (userData) {
    try {
      const parsedData = JSON.parse(userData);

      // Restore each data item
      if (parsedData.timeEntries)
        localStorage.setItem("timeEntries", parsedData.timeEntries);
      if (parsedData.hourlyRate)
        localStorage.setItem("hourlyRate", parsedData.hourlyRate);
      if (parsedData.payHistory)
        localStorage.setItem("payHistory", parsedData.payHistory);
      if (parsedData.dailySubmissions)
        localStorage.setItem("dailySubmissions", parsedData.dailySubmissions);
      if (parsedData.activeView) {
        localStorage.setItem("activeView", parsedData.activeView);
      } else {
        // If no saved activeView, remove it to use the default
        localStorage.removeItem("activeView");
      }
      if (parsedData.onboardingComplete)
        localStorage.setItem(
          "onboardingComplete",
          parsedData.onboardingComplete
        );
      if (parsedData.settings)
        localStorage.setItem("settings", parsedData.settings);
      else localStorage.setItem("settings", JSON.stringify(defaultSettings));

      // Dispatch custom event to notify components that data has been loaded
      window.dispatchEvent(
        new CustomEvent("userDataLoaded", {
          detail: { userId, data: parsedData },
        })
      );
    } catch (error) {
      console.error("Error loading user data:", error);
      // If loading fails, use default data
      localStorage.setItem("settings", JSON.stringify(defaultSettings));

      // Dispatch event for default data
      window.dispatchEvent(
        new CustomEvent("userDataLoaded", {
          detail: { userId, data: null },
        })
      );
    }
  } else {
    // No saved data for this user, use defaults
    localStorage.setItem("settings", JSON.stringify(defaultSettings));

    // Dispatch event for default data
    window.dispatchEvent(
      new CustomEvent("userDataLoaded", {
        detail: { userId, data: null },
      })
    );
  }
}

/**
 * Switches to a different user's data
 */
export function switchToUser(userId: string): void {
  // Save current user's data before switching
  const currentUserId = getCurrentUserId();
  if (currentUserId) {
    saveUserData(currentUserId);
  }

  // Clear current data and load the new user's data
  loadUserData(userId);

  // Update current user ID
  setCurrentUserId(userId);
}

/**
 * Signs out the current user and clears the currentUserId
 * This should be called when a user explicitly signs out
 */
export function signOutUserAndSaveData(): void {
  // Save current user's data before signing out
  const currentUserId = getCurrentUserId();
  if (currentUserId) {
    saveUserData(currentUserId);
  }

  // Remove the current user ID to indicate no user is currently signed in
  localStorage.removeItem("currentUserId");
}

/**
 * Clears data for a specific user
 */
export function clearUserDataForUser(userId: string): void {
  localStorage.removeItem(`user_${userId}_data`);
}

/**
 * Gets a list of all users who have saved data
 */
export function getUsersWithData(): string[] {
  const users: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("user_") && key.endsWith("_data")) {
      const userId = key.replace("user_", "").replace("_data", "");
      users.push(userId);
    }
  }
  return users;
}
