import React, { useState, useMemo, useEffect } from "react";
import { Settings as SettingsType } from "../../types";
import type { User } from "firebase/auth";
import { isPro } from "../../services/firestoreStorage";
import { UserProfile } from "../../types";
import InfoButton from "../ui/InfoButton";

interface SettingsCloudSyncProps {
  settings: SettingsType;
  updateSettings: (updates: Partial<SettingsType>) => void;
  user?: User | null;
  userProfile?: UserProfile | null;
  openUpgrade: (feature: string) => void;
  onToast: (message: string) => void;
}

const SettingsCloudSync: React.FC<SettingsCloudSyncProps> = ({
  settings,
  updateSettings,
  user,
  userProfile,
  openUpgrade,
  onToast,
}) => {
  const [showCloudInfo, setShowCloudInfo] = useState(false);
  // Removed: modal-related state no longer needed with smart merging
  const [hasCloudData, setHasCloudData] = useState(false);

  // Pro status checks
  const userIsPro = isPro(userProfile);
  const canUseCloudStorage = userIsPro;

  const lastSyncedDisplay = useMemo(() => {
    if (!settings.lastSyncAt) return "—";
    try {
      const d = new Date(settings.lastSyncAt);
      if (isNaN(d.getTime())) return String(settings.lastSyncAt);
      return d.toLocaleString("en-GB", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(settings.lastSyncAt);
    }
  }, [settings.lastSyncAt]);

  // For downgraded free users: check if they have cloud data to recover
  useEffect(() => {
    const run = async () => {
      if (!user || userIsPro) return;
      try {
        const { cloudDataExists } = await import(
          "../../services/firestoreStorage"
        );
        const exists = await cloudDataExists(user.uid);
        setHasCloudData(exists);
      } catch (e) {
        // silent fail
      }
    };
    run();
  }, [user, userIsPro]);

  // Removed: handleCloudSyncChoice function no longer needed with smart merging

  return (
    <>
      {/* Cloud Info Modal */}
      {showCloudInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className={`w-full max-w-sm rounded-xl shadow-2xl border ${
              settings.darkMode
                ? "bg-gray-800 border-gray-600 text-gray-100"
                : "bg-white border-gray-200 text-slate-800"
            }`}
          >
            <div
              className={`px-4 py-3 border-b ${
                settings.darkMode ? "border-gray-600" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">How Cloud Sync works</h3>
                <button
                  onClick={() => setShowCloudInfo(false)}
                  className={
                    settings.darkMode
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-slate-400 hover:text-slate-600"
                  }
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="px-4 py-3 space-y-2 text-sm">
              <p>
                - When Cloud Sync is ON, your data auto-syncs to your account
                and is available on any signed-in device.
              </p>
              <p>
                - Turning Cloud Sync OFF keeps your data on this device only.
              </p>
              <p>
                - Free users: Cloud is a pro feature. If you used Cloud before,
                you can download your data once to this device.
              </p>
            </div>
            <div
              className={`px-4 py-3 border-t ${
                settings.darkMode ? "border-gray-600" : "border-gray-200"
              } flex justify-end`}
            >
              <button
                onClick={() => setShowCloudInfo(false)}
                className={
                  settings.darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-1.5 rounded-md"
                    : "bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md"
                }
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Removed: Cloud Sync Choice Modal - no longer needed with smart merging */}

      {/* Cloud Sync Section */}
      <div
        className={`p-2 rounded-lg border ${
          settings.darkMode
            ? "bg-gray-700/50 border-gray-600"
            : "bg-white/50 border-gray-200/80"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3
            className={`text-sm font-bold ${
              settings.darkMode ? "text-gray-100" : "text-slate-700"
            }`}
          >
            Cloud Sync
          </h3>
          <InfoButton
            onClick={() => setShowCloudInfo(true)}
            title="How Cloud Sync works"
            settings={settings}
          />
        </div>
        <div className="space-y-2">
          <p
            className={`text-xs ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            Cloud OFF: data stays on this device. Cloud ON: data auto-syncs to
            your account.
          </p>
          <div className="flex items-center justify-between text-[10px]">
            <span>
              <span
                className={`px-1.5 py-0.5 rounded-full border ${
                  settings.storageMode === "cloud"
                    ? settings.darkMode
                      ? "border-emerald-400 text-emerald-300 bg-emerald-900/20"
                      : "border-emerald-400 text-emerald-700 bg-emerald-50"
                    : settings.darkMode
                    ? "border-gray-600 text-gray-300 bg-gray-800"
                    : "border-slate-300 text-slate-700 bg-slate-50"
                }`}
              >
                {settings.storageMode === "cloud" ? "Cloud ON" : "Cloud OFF"}
              </span>
            </span>
            <span
              className={settings.darkMode ? "text-gray-400" : "text-slate-500"}
            >
              Last synced: {lastSyncedDisplay}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span
                className={`text-sm font-medium ${
                  settings.darkMode ? "text-gray-200" : "text-slate-700"
                }`}
              >
                Cloud Sync
              </span>
              <p
                className={`text-xs ${
                  settings.darkMode ? "text-gray-400" : "text-slate-500"
                }`}
              >
                Automatically syncs your data when signed in
              </p>
              {!canUseCloudStorage && (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-semibold bg-amber-100 text-amber-800 border-amber-200 whitespace-nowrap">
                    Pro feature
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={async () => {
                if (!user) {
                  onToast("Sign in to use cloud sync.");
                  return;
                }
                if (!canUseCloudStorage) {
                  openUpgrade("Cloud Sync");
                  return;
                }
                const switchingToCloud = settings.storageMode !== "cloud";
                if (switchingToCloud) {
                  // Enable cloud sync with smart merging (no modal needed)
                  try {
                    // Import merging function and cloud write
                    const { mergeOfflineDataWithCloud } = await import(
                      "../../utils/userDataUtils"
                    );
                    const { writeCloudSnapshot } = await import(
                      "../../services/firestoreStorage"
                    );

                    // Smart merge local and cloud data
                    const mergedData = await mergeOfflineDataWithCloud(
                      user.uid
                    );

                    // Write merged data back to cloud
                    const dataToWrite = {
                      settings: JSON.parse(
                        localStorage.getItem("settings") || "{}"
                      ),
                      timeEntries: mergedData.timeEntries,
                      dailySubmissions: mergedData.dailySubmissions,
                      payHistory: mergedData.payHistory,
                    };
                    await writeCloudSnapshot(user.uid, dataToWrite);

                    // Update settings to enable cloud mode
                    const nowIso = new Date().toISOString();
                    updateSettings({
                      storageMode: "cloud",
                      lastSyncAt: nowIso,
                      storageModeSetExplicitly: true,
                    });

                    onToast("Cloud sync enabled - data merged successfully!");
                  } catch (e) {
                    onToast("Failed to enable cloud sync. Please try again.");
                    return;
                  }
                } else {
                  updateSettings({
                    storageMode: "local",
                    storageModeSetExplicitly: true,
                  });
                }
              }}
              aria-label="Toggle Cloud Sync"
              title="Toggle Cloud Sync"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.storageMode === "cloud"
                  ? "bg-[#003D5B]"
                  : "bg-slate-300"
              } ${!canUseCloudStorage ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.storageMode === "cloud"
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {/* Recovery section for ex-pro users */}
          {!canUseCloudStorage && hasCloudData && (
            <div
              className={`mt-3 p-2 rounded-lg border ${
                settings.darkMode
                  ? "bg-gray-700/50 border-gray-600"
                  : "bg-white/50 border-gray-200/80"
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`text-sm ${
                    settings.darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  ℹ️
                </div>
                <div className="flex-1">
                  <h4
                    className={`text-sm font-medium mb-1 ${
                      settings.darkMode ? "text-gray-100" : "text-slate-700"
                    }`}
                  >
                    Recover Your Data
                  </h4>
                  <p
                    className={`text-xs mb-2 ${
                      settings.darkMode ? "text-gray-400" : "text-slate-500"
                    }`}
                  >
                    We found data from when you had pro features. You can
                    recover it anytime.
                  </p>
                  <button
                    onClick={() => {
                      if (!user) {
                        onToast("Sign in first.");
                        return;
                      }
                      // Recovery download for ex-pro users (unlimited)
                      import("../../services/firestoreStorage").then(
                        async (m) => {
                          try {
                            const snap = await m.readCloudSnapshot(user.uid);
                            if (snap.settings)
                              localStorage.setItem(
                                "settings",
                                JSON.stringify(snap.settings)
                              );
                            localStorage.setItem(
                              "timeEntries",
                              JSON.stringify(snap.timeEntries || [])
                            );
                            localStorage.setItem(
                              "dailySubmissions",
                              JSON.stringify(snap.dailySubmissions || [])
                            );
                            localStorage.setItem(
                              "payHistory",
                              JSON.stringify(snap.payHistory || [])
                            );

                            updateSettings({
                              storageMode: "local",
                              enableTaxCalculations: false,
                              enableNiCalculations: false,
                            });

                            onToast("Data recovered successfully! Reloading…");
                            setTimeout(() => window.location.reload(), 500);
                          } catch (error) {
                            onToast("Recovery failed. Please try again.");
                            console.error("Recovery error:", error);
                          }
                        }
                      );
                    }}
                    className={`w-full py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                      settings.darkMode
                        ? "bg-gray-600 text-gray-100 hover:bg-gray-500"
                        : "bg-slate-800 text-white hover:bg-slate-700"
                    }`}
                  >
                    Recover My Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SettingsCloudSync;
