import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Settings,
  DailyPay,
  TimeEntry,
  DailySubmission,
  UserProfile,
} from "./types";
import { WorkLog } from "./components/timeTracker";
import UnionChatbot from "./pages/UnionChatbot";
import SettingsComponent from "./pages/Settings";
import PayCalculator from "./pages/PayCalculator";
import { LawLimits } from "./components/payCalculator";
import BottomNav from "./components/ui/BottomNav";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import AdminPanel from "./pages/AdminPanel";
import useLocalStorage from "./hooks/useLocalStorage";
import { useTimeCalculations } from "./hooks/useTimeCalculations";
import LandingPage from "./pages/LandingPage";
import { auth, onAuthStateChanged } from "./services/firebase";
import {
  getUserProfile,
  createUserProfile,
  isPro,
  updateLastLogin,
} from "./services/firestoreStorage";
import type { User } from "firebase/auth";
import {
  setCurrentUserId,
  getCurrentUserId,
  isDifferentUser,
  ensureProFeaturesDisabled,
  switchToUser,
  saveUserData,
  loadUserData,
  getDefaultStorageMode,
  detectRoleChange,
  migrateToCloudStorage,
  mergeOfflineDataWithCloud,
} from "./utils/userDataUtils";

const App: React.FC = () => {
  const [activeView, setActiveView] = useLocalStorage<View>(
    "activeView",
    View.WORK
  );
  const [settings, setSettings] = useLocalStorage<Settings>("settings", {
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
  });

  // Onboarding (first run) - DISABLED FOR NOW
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);
  // useEffect(() => {
  //   const done = localStorage.getItem("onboardingComplete");
  //   if (!done) setShowOnboarding(true);
  // }, []);
  const closeOnboarding = () => {
    localStorage.setItem("onboardingComplete", "true");
    setShowOnboarding(false);
  };

  // Get time entries for pay calculations
  const [entries, setEntries] = useLocalStorage<TimeEntry[]>("timeEntries", []);
  const [hourlyRate, setHourlyRate] = useLocalStorage<number>("hourlyRate", 0);
  const [payHistory, setPayHistory] = useLocalStorage<DailyPay[]>(
    "payHistory",
    []
  );
  const [dailySubmissions, setDailySubmissions] = useLocalStorage<
    DailySubmission[]
  >("dailySubmissions", []);
  const { totalDuration } = useTimeCalculations(entries);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const applyingCloudRef = useRef(false);

  // Cloud sync state
  const [isLoadingCloudData, setIsLoadingCloudData] = useState(false);

  // Listen for storage changes (when user signs out in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentUserId" && e.newValue === null && user) {
        // User was signed out in another tab - preserve local data but clear user state
        setUser(null);
        setUserProfile(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecked(true);

      if (firebaseUser) {
        // Check if this is a different user than the one stored in localStorage
        if (isDifferentUser(firebaseUser.uid)) {
          // Different user or fresh sign-in - switch to their data
          switchToUser(firebaseUser.uid);
        } else {
          // Same user signing back in - load their saved data
          loadUserData(firebaseUser.uid);
          setCurrentUserId(firebaseUser.uid);
        }

        // Load or create user profile
        try {
          let profile = await getUserProfile(firebaseUser.uid);
          if (!profile) {
            // Create new user profile
            await createUserProfile(firebaseUser.uid, firebaseUser.email || "");
            profile = await getUserProfile(firebaseUser.uid);
          }

          // Update last login time
          if (profile) {
            await updateLastLogin(firebaseUser.uid);
            // Update local profile with new login time
            const now = new Date().toISOString();
            profile = { ...profile, lastLoginAt: now, updatedAt: now };
          }

          setUserProfile(profile);

          // Initialize storage mode based on user role
          const currentSettings = JSON.parse(
            localStorage.getItem("settings") || "{}"
          );
          const defaultStorageMode = getDefaultStorageMode(profile?.role);

          // Check if storage mode needs to be initialized or updated
          let updatedSettings = { ...currentSettings };

          // If no storage mode is set, use the default for this user role
          if (!updatedSettings.storageMode) {
            updatedSettings.storageMode = defaultStorageMode;
          }

          // Ensure pro features are properly gated based on user profile
          if (profile && !isPro(profile)) {
            // User is not pro - ensure pro features are disabled
            updatedSettings = ensureProFeaturesDisabled(updatedSettings);
          } else if (profile && isPro(profile)) {
            // User is pro - handle cloud storage appropriately
            // Only auto-enable cloud storage if user hasn't explicitly chosen their preference
            if (
              updatedSettings.storageMode === "local" &&
              defaultStorageMode === "cloud" &&
              !updatedSettings.storageModeSetExplicitly
            ) {
              console.log(
                "First-time pro user - enabling cloud storage by default"
              );
              updatedSettings.storageMode = "cloud";
              updatedSettings.storageModeSetExplicitly = true;

              // Merge offline data with cloud and migrate (async, non-blocking)
              mergeOfflineDataWithCloud(firebaseUser.uid)
                .then(async (mergedData) => {
                  if (mergedData.hasLocalChanges) {
                    // User has local changes, migrate them to cloud
                    const migrationSuccess = await migrateToCloudStorage(
                      firebaseUser.uid
                    );
                    if (migrationSuccess) {
                      console.log(
                        "Successfully migrated local data to cloud storage"
                      );
                      // Update local state with merged data
                      setEntries(mergedData.timeEntries);
                      setDailySubmissions(mergedData.dailySubmissions);
                      setPayHistory(mergedData.payHistory);
                    } else {
                      console.warn(
                        "Failed to migrate local data to cloud storage"
                      );
                    }
                  } else {
                    console.log(
                      "No local changes to migrate - cloud data is current"
                    );
                  }
                })
                .catch((error) => {
                  console.error("Failed to merge offline data:", error);
                });
            }
          }

          // If settings changed, update localStorage and state
          if (
            JSON.stringify(currentSettings) !== JSON.stringify(updatedSettings)
          ) {
            localStorage.setItem("settings", JSON.stringify(updatedSettings));
            setSettings(updatedSettings);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      } else {
        // User logged out - save their data but keep the currentUserId for comparison
        const currentUserId = getCurrentUserId();
        if (currentUserId) {
          saveUserData(currentUserId);
        }
        // User data is saved above, currentUserId will be handled when a new user signs in
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Live-subscribe to the user's profile so role changes reflect instantly
  useEffect(() => {
    if (!user) return;
    let unsubscribeProfile: undefined | (() => void);
    (async () => {
      try {
        const { onSnapshot, doc } = await import("firebase/firestore");
        const { db } = await import("./services/firebase");
        const profileRef = doc(db, "users", user.uid, "profile", "user");
        unsubscribeProfile = onSnapshot(
          profileRef,
          (snap) => {
            if (snap.exists()) {
              const newProfile = snap.data() as UserProfile;
              const oldProfile = userProfile;
              setUserProfile(newProfile);

              // Check for role changes and handle accordingly
              const roleChange = detectRoleChange(
                oldProfile?.role,
                newProfile.role
              );
              const currentSettings = JSON.parse(
                localStorage.getItem("settings") || "{}"
              );
              let updatedSettings = { ...currentSettings };

              if (roleChange === "upgrade") {
                // User upgraded to pro - enable cloud storage and migrate data (if not explicitly set)
                if (!updatedSettings.storageModeSetExplicitly) {
                  console.log(
                    "User role upgraded - enabling cloud storage by default"
                  );
                  updatedSettings.storageMode = "cloud";
                  updatedSettings.storageModeSetExplicitly = true;
                } else {
                  console.log(
                    "User role upgraded - respecting existing storage mode choice"
                  );
                }

                // Only migrate if cloud storage is enabled
                if (updatedSettings.storageMode === "cloud") {
                  // Merge offline data with cloud and migrate (async, non-blocking)
                  mergeOfflineDataWithCloud(user.uid)
                    .then(async (mergedData) => {
                      if (mergedData.hasLocalChanges) {
                        // User has local changes, migrate them to cloud
                        const migrationSuccess = await migrateToCloudStorage(
                          user.uid
                        );
                        if (migrationSuccess) {
                          console.log(
                            "Successfully migrated local data to cloud storage on role upgrade"
                          );
                          // Update local state with merged data
                          setEntries(mergedData.timeEntries);
                          setDailySubmissions(mergedData.dailySubmissions);
                          setPayHistory(mergedData.payHistory);
                        } else {
                          console.warn(
                            "Failed to migrate local data to cloud storage on role upgrade"
                          );
                        }
                      } else {
                        console.log(
                          "No local changes to migrate on role upgrade - cloud data is current"
                        );
                      }
                    })
                    .catch((error) => {
                      console.error(
                        "Failed to merge offline data on role upgrade:",
                        error
                      );
                    });
                }
              } else if (roleChange === "downgrade") {
                // User downgraded to free - disable pro features and force local storage
                console.log("User role downgraded - disabling pro features");
                updatedSettings = ensureProFeaturesDisabled(updatedSettings);
              } else if (!isPro(newProfile)) {
                // User is not pro (could be a refresh, not necessarily a change)
                updatedSettings = ensureProFeaturesDisabled(updatedSettings);
              }

              // If settings changed, update localStorage and state
              if (
                JSON.stringify(currentSettings) !==
                JSON.stringify(updatedSettings)
              ) {
                localStorage.setItem(
                  "settings",
                  JSON.stringify(updatedSettings)
                );
                setSettings(updatedSettings);
              }
            }
          },
          (err) => {
            console.error("Profile subscribe error:", err);
          }
        );
      } catch (e) {
        console.error("Failed to subscribe to profile:", e);
      }
    })();
    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [user?.uid]);

  // Auto-sync to cloud when enabled and authenticated (debounced, loop guard)
  useEffect(() => {
    if (!authChecked || !user) return;
    if (settings.storageMode !== "cloud") return;
    // Gate cloud writes to pro/admin only
    const userIsPro = isPro(userProfile);
    if (!userIsPro) return;
    if (applyingCloudRef.current) return;

    let timeoutId: number | undefined;
    const performSync = async () => {
      const payload = {
        settings,
        timeEntries: entries,
        dailySubmissions,
        payHistory,
      };
      const { writeCloudSnapshot } = await import(
        "./services/firestoreStorage"
      );
      try {
        await writeCloudSnapshot(user.uid, payload);
        // set lastSyncAt locally after successful write
        const nowIso = new Date().toISOString();
        setSettings((prev) => ({ ...prev, lastSyncAt: nowIso }));
        localStorage.setItem(
          "settings",
          JSON.stringify({ ...settings, lastSyncAt: nowIso })
        );
      } catch (e) {
        // Silent fail in UI; user can use manual sync
        console.error("Auto-sync failed", e);
      }
    };
    // debounce writes
    timeoutId = window.setTimeout(performSync, 400);
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    authChecked,
    user,
    settings.storageMode,
    JSON.stringify(settings),
    JSON.stringify(entries),
    JSON.stringify(dailySubmissions),
    JSON.stringify(payHistory),
    userProfile,
  ]);

  // Auto-save to multi-user storage when localStorage changes (debounced)
  useEffect(() => {
    if (!authChecked || !user) return;

    let timeoutId: number | undefined;
    const performMultiUserSave = () => {
      console.log(`[Auto-save] Saving data for user ${user.uid}`);
      saveUserData(user.uid);
    };

    // Debounce saves to avoid excessive writes
    timeoutId = window.setTimeout(performMultiUserSave, 1000);
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [
    authChecked,
    user,
    JSON.stringify(entries),
    JSON.stringify(dailySubmissions),
    JSON.stringify(payHistory),
    JSON.stringify(settings),
  ]);

  // Cloud read mode: subscribe when in cloud storage mode
  useEffect(() => {
    if (!authChecked || !user) return;
    if (settings.storageMode !== "cloud") return;
    // Gate cloud reads to pro/admin only so free users don't re-apply cloud settings
    const userIsPro = isPro(userProfile);
    if (!userIsPro) return;

    setIsLoadingCloudData(true);
    let unsubscribers: Array<() => void> = [];
    let cloudDataReady = false;
    let pendingCloudData: {
      settings?: any;
      timeEntries?: any[];
      dailySubmissions?: any[];
      payHistory?: any[];
    } = {};

    const setup = async () => {
      const { onSnapshot, doc, collection } = await import(
        "firebase/firestore"
      );
      const { db } = await import("./services/firebase");
      const userRoot = doc(db, "users", user.uid);

      // Settings doc listener
      const settingsDoc = doc(userRoot, "meta", "settings");
      const unsubSettings = onSnapshot(settingsDoc, (snap) => {
        const data = snap.data() as any;
        if (!data) return;

        if (cloudDataReady) {
          // Apply cloud data immediately
          applyingCloudRef.current = true;
          const lastSyncIso = data.lastSyncAt?.toDate
            ? data.lastSyncAt.toDate().toISOString()
            : data.lastSyncAt;
          const incoming = { ...data, lastSyncAt: lastSyncIso } as Settings;
          setSettings((prev) => ({
            ...prev,
            ...incoming,
            storageMode: "cloud",
          }));
          localStorage.setItem(
            "settings",
            JSON.stringify({ ...incoming, storageMode: "cloud" })
          );
          setTimeout(() => {
            applyingCloudRef.current = false;
          }, 50);
        } else {
          // Store for later application
          pendingCloudData.settings = data;
        }
      });
      unsubscribers.push(unsubSettings);

      // Collections listeners
      const subscribeCol = (
        colName: "timeEntries" | "dailySubmissions" | "payHistory",
        setter: (v: any) => void,
        storageKey: string
      ) => {
        const colRef = collection(userRoot, colName);
        const unsub = onSnapshot(colRef, (qs) => {
          const arr = qs.docs.map((d) => d.data());

          if (cloudDataReady) {
            // Apply cloud data immediately
            applyingCloudRef.current = true;
            setter(arr as any);
            localStorage.setItem(storageKey, JSON.stringify(arr));
            setTimeout(() => {
              applyingCloudRef.current = false;
            }, 50);
          } else {
            // Store for later application
            pendingCloudData[colName as keyof typeof pendingCloudData] = arr;
          }
        });
        unsubscribers.push(unsub);
      };

      subscribeCol("timeEntries", setEntries, "timeEntries");
      subscribeCol("dailySubmissions", setDailySubmissions, "dailySubmissions");
      subscribeCol("payHistory", setPayHistory, "payHistory");

      // Wait for initial cloud data to arrive, then apply it
      const checkAndApplyCloudData = () => {
        if (Object.keys(pendingCloudData).length > 0) {
          // Apply all pending cloud data
          applyingCloudRef.current = true;

          if (pendingCloudData.settings) {
            const lastSyncIso = pendingCloudData.settings.lastSyncAt?.toDate
              ? pendingCloudData.settings.lastSyncAt.toDate().toISOString()
              : pendingCloudData.settings.lastSyncAt;
            const incoming = {
              ...pendingCloudData.settings,
              lastSyncAt: lastSyncIso,
            } as Settings;
            setSettings((prev) => ({
              ...prev,
              ...incoming,
              storageMode: "cloud",
            }));
            localStorage.setItem(
              "settings",
              JSON.stringify({ ...incoming, storageMode: "cloud" })
            );
          }

          if (pendingCloudData.timeEntries) {
            setEntries(pendingCloudData.timeEntries);
            localStorage.setItem(
              "timeEntries",
              JSON.stringify(pendingCloudData.timeEntries)
            );
          }

          if (pendingCloudData.dailySubmissions) {
            setDailySubmissions(pendingCloudData.dailySubmissions);
            localStorage.setItem(
              "dailySubmissions",
              JSON.stringify(pendingCloudData.dailySubmissions)
            );
          }

          if (pendingCloudData.payHistory) {
            setPayHistory(pendingCloudData.payHistory);
            localStorage.setItem(
              "payHistory",
              JSON.stringify(pendingCloudData.payHistory)
            );
          }

          setTimeout(() => {
            applyingCloudRef.current = false;
          }, 50);

          cloudDataReady = true;
          setIsLoadingCloudData(false);
        } else {
          // Keep checking until we have data
          setTimeout(checkAndApplyCloudData, 100);
        }
      };

      // Start checking for cloud data
      setTimeout(checkAndApplyCloudData, 500);
    };
    setup();

    return () => {
      unsubscribers.forEach((u) => u());
      applyingCloudRef.current = false;
      setIsLoadingCloudData(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, user, settings.storageMode, userProfile]);

  // Check if user is pro and admin
  const userIsPro = isPro(userProfile);
  const userIsAdmin = userProfile?.role === "admin";

  // Show loading while auth is being checked
  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAF7F0]">
        <div className="text-center">
          <div className="text-lg font-bold text-[#003D5B] mb-2">
            Loading...
          </div>
          <div className="text-sm text-slate-500">Please wait</div>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!user) {
    return (
      <div className="w-full">
        <LandingPage />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-full max-w-md mx-auto">
        <div
          className={`h-[100dvh] w-full flex items-center justify-center overflow-hidden ${
            settings.darkMode ? "bg-gray-900" : "bg-[#FAF7F0]"
          }`}
        >
          {/* Onboarding Modal */}
          {showOnboarding && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-3">
              <div
                className={`w-full max-w-sm rounded-xl shadow-2xl border ${
                  settings.darkMode
                    ? "bg-gray-800 border-gray-600 text-gray-100"
                    : "bg-white border-gray-200 text-slate-800"
                }`}
              >
                <div
                  className={`px-3 sm:px-4 py-3 border-b ${
                    settings.darkMode ? "border-gray-600" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-bold">
                      Welcome to ShiftPal
                    </h3>
                    <button
                      aria-label="Close onboarding"
                      onClick={closeOnboarding}
                      className={
                        settings.darkMode
                          ? "text-gray-400 hover:text-gray-200"
                          : "text-slate-400 hover:text-slate-600"
                      }
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="px-3 sm:px-4 py-3 space-y-2 text-xs sm:text-sm">
                  {onboardingStep === 1 ? (
                    <>
                      <p>
                        Step 1: Track time in <strong>Tracker</strong>.
                      </p>
                      <p className="text-xs text-slate-500">
                        Add your shifts and submit entries when done.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Step 2: Save pay in <strong>Pay</strong>.
                      </p>
                      <p className="text-xs text-slate-500">
                        Change the date to save a past day.
                      </p>
                    </>
                  )}
                </div>
                <div
                  className={`px-3 sm:px-4 py-3 border-t flex justify-end gap-2 ${
                    settings.darkMode ? "border-gray-600" : "border-gray-200"
                  }`}
                >
                  {onboardingStep === 1 ? (
                    <button
                      aria-label="Next"
                      onClick={() => setOnboardingStep(2)}
                      className={
                        settings.darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-100 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm"
                          : "bg-slate-800 hover:bg-slate-700 text-white px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm"
                      }
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      aria-label="Finish onboarding"
                      onClick={closeOnboarding}
                      className={
                        settings.darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-100 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm"
                          : "bg-slate-800 hover:bg-slate-700 text-white px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm"
                      }
                    >
                      Got it
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div
            className={`w-full h-full sm:max-w-md sm:rounded-3xl sm:border flex flex-col overflow-hidden mx-auto ${
              settings.darkMode
                ? "bg-gray-800 sm:border-gray-600/50"
                : "bg-[#FAF7F0] sm:border-slate-200/50"
            }`}
          >
            <div className="flex-1 overflow-hidden pt-2 pr-6 pl-6 pb-0">
              {activeView === View.WORK && (
                <WorkLog
                  settings={settings}
                  entries={entries}
                  setEntries={setEntries}
                  dailySubmissions={dailySubmissions}
                  setDailySubmissions={setDailySubmissions}
                  isLoadingCloudData={isLoadingCloudData}
                />
              )}
              {activeView === View.PAY && (
                <PayCalculator
                  totalMinutes={totalDuration.totalMinutes}
                  hourlyRate={hourlyRate}
                  setHourlyRate={setHourlyRate}
                  settings={settings}
                  payHistory={payHistory}
                  setPayHistory={setPayHistory}
                  dailySubmissions={dailySubmissions}
                  userProfile={userProfile}
                  isLoadingCloudData={isLoadingCloudData}
                />
              )}
              {activeView === View.LAW_LIMITS && (
                <LawLimits
                  totalMinutes={totalDuration.totalMinutes}
                  settings={settings}
                />
              )}
              {activeView === View.CHAT && <UnionChatbot settings={settings} />}
              {activeView === View.SETTINGS && (
                <SettingsComponent
                  settings={settings}
                  setSettings={setSettings}
                  user={user}
                  userProfile={userProfile}
                />
              )}
              {userIsAdmin && activeView === View.ADMIN && (
                <AdminPanel user={user} settings={settings} />
              )}
            </div>
            {authChecked && user && (
              <BottomNav
                activeView={activeView}
                setActiveView={setActiveView}
                userProfile={userProfile}
                settings={settings}
              />
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
