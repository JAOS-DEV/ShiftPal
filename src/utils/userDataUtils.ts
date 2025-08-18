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
  storageModeSetExplicitly: false,
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
 * Determines the default storage mode based on user role
 */
export function getDefaultStorageMode(
  userRole: string | undefined
): "local" | "cloud" {
  // Free users must use local storage
  if (!userRole || userRole === "free") {
    return "local";
  }

  // Beta, Pro, and Admin users default to cloud storage
  if (userRole === "beta" || userRole === "pro" || userRole === "admin") {
    return "cloud";
  }

  // Fallback to local for unknown roles
  return "local";
}

/**
 * Checks if user role changed from free to pro (or vice versa)
 * Returns the type of change: "upgrade", "downgrade", or "none"
 */
export function detectRoleChange(
  oldRole: string | undefined,
  newRole: string | undefined
): "upgrade" | "downgrade" | "none" {
  const wasProUser = oldRole && ["beta", "pro", "admin"].includes(oldRole);
  const isProUser = newRole && ["beta", "pro", "admin"].includes(newRole);

  if (!wasProUser && isProUser) {
    return "upgrade";
  }

  if (wasProUser && !isProUser) {
    return "downgrade";
  }

  return "none";
}

/**
 * Merges two arrays of data based on timestamp, keeping the newer entries
 */
function mergeByTimestamp<
  T extends { timestamp?: string; id?: string | number }
>(localData: T[], cloudData: T[]): T[] {
  const merged = new Map<string, T>();

  // Add cloud data first
  cloudData.forEach((item) => {
    const key =
      item.id?.toString() || item.timestamp || Math.random().toString();
    merged.set(key, item);
  });

  // Add local data, overwriting cloud data if local is newer
  localData.forEach((item) => {
    const key =
      item.id?.toString() || item.timestamp || Math.random().toString();
    const cloudItem = merged.get(key);

    if (!cloudItem) {
      // New local item not in cloud
      merged.set(key, item);
    } else if (item.timestamp && cloudItem.timestamp) {
      // Both have timestamps, keep newer one
      if (new Date(item.timestamp) > new Date(cloudItem.timestamp)) {
        merged.set(key, item);
      }
    } else if (item.timestamp && !cloudItem.timestamp) {
      // Local has timestamp, cloud doesn't - prefer local
      merged.set(key, item);
    }
    // If cloud has timestamp but local doesn't, keep cloud (already there)
  });

  return Array.from(merged.values());
}

/**
 * Merges offline localStorage data with cloud data, keeping newer entries
 */
export async function mergeOfflineDataWithCloud(userId: string): Promise<{
  timeEntries: any[];
  dailySubmissions: any[];
  payHistory: any[];
  hasLocalChanges: boolean;
}> {
  try {
    // Get current localStorage data
    const localTimeEntries = JSON.parse(
      localStorage.getItem("timeEntries") || "[]"
    );
    const localDailySubmissions = JSON.parse(
      localStorage.getItem("dailySubmissions") || "[]"
    );
    const localPayHistory = JSON.parse(
      localStorage.getItem("payHistory") || "[]"
    );

    // Import cloud functions
    const { readCloudSnapshot } = await import("../services/firestoreStorage");

    // Read cloud data
    const cloudData = await readCloudSnapshot(userId);

    // Check if cloud data is empty (new user with no cloud data)
    const hasCloudData =
      cloudData.settings ||
      (cloudData.timeEntries && cloudData.timeEntries.length > 0) ||
      (cloudData.dailySubmissions && cloudData.dailySubmissions.length > 0) ||
      (cloudData.payHistory && cloudData.payHistory.length > 0);

    if (!hasCloudData) {
      // No meaningful cloud data, use local data as-is
      return {
        timeEntries: localTimeEntries,
        dailySubmissions: localDailySubmissions,
        payHistory: localPayHistory,
        hasLocalChanges:
          localTimeEntries.length > 0 ||
          localDailySubmissions.length > 0 ||
          localPayHistory.length > 0,
      };
    }

    // Merge data arrays
    const mergedTimeEntries = mergeByTimestamp(
      localTimeEntries,
      cloudData.timeEntries || []
    );
    const mergedDailySubmissions = mergeByTimestamp(
      localDailySubmissions,
      cloudData.dailySubmissions || []
    );
    const mergedPayHistory = mergeByTimestamp(
      localPayHistory,
      cloudData.payHistory || []
    );

    // Check if we have local changes that aren't in cloud
    const hasLocalChanges =
      mergedTimeEntries.length > (cloudData.timeEntries || []).length ||
      mergedDailySubmissions.length >
        (cloudData.dailySubmissions || []).length ||
      mergedPayHistory.length > (cloudData.payHistory || []).length;

    return {
      timeEntries: mergedTimeEntries,
      dailySubmissions: mergedDailySubmissions,
      payHistory: mergedPayHistory,
      hasLocalChanges,
    };
  } catch (error) {
    console.error("Failed to merge offline data with cloud:", error);
    // Fallback to local data
    return {
      timeEntries: JSON.parse(localStorage.getItem("timeEntries") || "[]"),
      dailySubmissions: JSON.parse(
        localStorage.getItem("dailySubmissions") || "[]"
      ),
      payHistory: JSON.parse(localStorage.getItem("payHistory") || "[]"),
      hasLocalChanges: false,
    };
  }
}

/**
 * Migrates localStorage data to cloud when user upgrades to pro
 */
export async function migrateToCloudStorage(userId: string): Promise<boolean> {
  try {
    // Use the merge function to handle potential conflicts
    const mergedData = await mergeOfflineDataWithCloud(userId);

    // Get current settings
    const localSettings = JSON.parse(localStorage.getItem("settings") || "{}");

    // Prepare data for cloud sync
    const migrationData = {
      settings: localSettings,
      timeEntries: mergedData.timeEntries,
      dailySubmissions: mergedData.dailySubmissions,
      payHistory: mergedData.payHistory,
    };

    // Import writeCloudSnapshot dynamically
    const { writeCloudSnapshot } = await import("../services/firestoreStorage");

    // Write merged data to cloud
    await writeCloudSnapshot(userId, migrationData);

    console.log("Successfully migrated and merged local data to cloud");
    return true;
  } catch (error) {
    console.error("Failed to migrate to cloud storage:", error);
    return false;
  }
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
    // Pay calculator input values
    useManualHours: localStorage.getItem("useManualHours"),
    manualHours: localStorage.getItem("manualHours"),
    manualMinutes: localStorage.getItem("manualMinutes"),
    overtimeHours: localStorage.getItem("overtimeHours"),
    overtimeMinutes: localStorage.getItem("overtimeMinutes"),
    overtimeRate: localStorage.getItem("overtimeRate"),
    payDate: localStorage.getItem("payDate"),
    selectedStandardRateId: localStorage.getItem("selectedStandardRateId"),
    selectedOvertimeRateId: localStorage.getItem("selectedOvertimeRateId"),
    // Time tracker date
    submitDate: localStorage.getItem("submitDate"),
  };

  // Save with user-specific keys
  localStorage.setItem(`user_${userId}_data`, JSON.stringify(userData));
}

/**
 * Loads user-specific data from localStorage (only for pro users with multi-user support)
 */
export function loadUserData(userId: string): void {
  const userDataKey = `user_${userId}_data`;
  const userData = localStorage.getItem(userDataKey);

  if (userData) {
    try {
      const parsedData = JSON.parse(userData);

      console.log(`Loading saved data for user ${userId}`);

      // Clear current data and restore from user-specific storage
      localStorage.removeItem("timeEntries");
      localStorage.removeItem("hourlyRate");
      localStorage.removeItem("payHistory");
      localStorage.removeItem("dailySubmissions");
      localStorage.removeItem("onboardingComplete");
      // Clear pay calculator values
      localStorage.removeItem("useManualHours");
      localStorage.removeItem("manualHours");
      localStorage.removeItem("manualMinutes");
      localStorage.removeItem("overtimeHours");
      localStorage.removeItem("overtimeMinutes");
      localStorage.removeItem("overtimeRate");
      localStorage.removeItem("payDate");
      localStorage.removeItem("selectedStandardRateId");
      localStorage.removeItem("selectedOvertimeRateId");

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

      // Restore pay calculator values
      if (parsedData.useManualHours)
        localStorage.setItem("useManualHours", parsedData.useManualHours);
      if (parsedData.manualHours)
        localStorage.setItem("manualHours", parsedData.manualHours);
      if (parsedData.manualMinutes)
        localStorage.setItem("manualMinutes", parsedData.manualMinutes);
      if (parsedData.overtimeHours)
        localStorage.setItem("overtimeHours", parsedData.overtimeHours);
      if (parsedData.overtimeMinutes)
        localStorage.setItem("overtimeMinutes", parsedData.overtimeMinutes);
      if (parsedData.overtimeRate)
        localStorage.setItem("overtimeRate", parsedData.overtimeRate);
      if (parsedData.payDate)
        localStorage.setItem("payDate", parsedData.payDate);
      if (parsedData.selectedStandardRateId)
        localStorage.setItem(
          "selectedStandardRateId",
          parsedData.selectedStandardRateId
        );
      if (parsedData.selectedOvertimeRateId)
        localStorage.setItem(
          "selectedOvertimeRateId",
          parsedData.selectedOvertimeRateId
        );
      if (parsedData.submitDate)
        localStorage.setItem("submitDate", parsedData.submitDate);

      // Dispatch custom event to notify components that data has been loaded
      window.dispatchEvent(
        new CustomEvent("userDataLoaded", {
          detail: { userId, data: parsedData },
        })
      );
    } catch (error) {
      console.error("Error loading user data:", error);
      // If loading fails, don't clear existing data
      // Just ensure settings are available
      if (!localStorage.getItem("settings")) {
        localStorage.setItem("settings", JSON.stringify(defaultSettings));
      }

      // Dispatch event for error case
      window.dispatchEvent(
        new CustomEvent("userDataLoaded", {
          detail: { userId, data: null },
        })
      );
    }
  } else {
    // No saved data for this user - check if current data belongs to them
    const currentUserId = getCurrentUserId();

    if (currentUserId === userId) {
      // This user's data is already loaded - just keep it and save it for future
      console.log(
        `No saved data found for user ${userId} - preserving current data and saving for future`
      );

      // Save current data to multi-user storage for future loads
      saveUserData(userId);

      // Only set settings if they don't exist
      if (!localStorage.getItem("settings")) {
        localStorage.setItem("settings", JSON.stringify(defaultSettings));
      }
    } else {
      // This is a different user - start with clean data
      console.log(
        `No saved data found for user ${userId} - starting with clean localStorage`
      );

      // Clear current data for fresh start
      localStorage.removeItem("timeEntries");
      localStorage.removeItem("hourlyRate");
      localStorage.removeItem("payHistory");
      localStorage.removeItem("dailySubmissions");
      localStorage.removeItem("onboardingComplete");
      localStorage.removeItem("activeView");
      // Clear pay calculator values
      localStorage.removeItem("useManualHours");
      localStorage.removeItem("manualHours");
      localStorage.removeItem("manualMinutes");
      localStorage.removeItem("overtimeHours");
      localStorage.removeItem("overtimeMinutes");
      localStorage.removeItem("overtimeRate");
      localStorage.removeItem("payDate");
      localStorage.removeItem("selectedStandardRateId");
      localStorage.removeItem("selectedOvertimeRateId");
      localStorage.removeItem("submitDate");

      // Set default settings
      localStorage.setItem("settings", JSON.stringify(defaultSettings));
    }

    // Dispatch event for no saved data case
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
