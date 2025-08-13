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
  const [showCloudSyncModal, setShowCloudSyncModal] = useState(false);
  const [cloudSyncChoice, setCloudSyncChoice] = useState<
    "download" | "upload" | null
  >(null);
  const [hasCloudData, setHasCloudData] = useState(false);
  const [freeDownloadConsumedState, setFreeDownloadConsumedState] =
    useState(false);

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

  // For downgraded free users: allow one-time download if cloud data exists
  useEffect(() => {
    const run = async () => {
      if (!user || userIsPro) return;
      try {
        const { cloudDataExists, getFreeDownloadConsumed } = await import(
          "../../services/firestoreStorage"
        );
        const [exists, consumed] = await Promise.all([
          cloudDataExists(user.uid),
          getFreeDownloadConsumed(user.uid),
        ]);
        setHasCloudData(exists);
        setFreeDownloadConsumedState(consumed);
      } catch (e) {
        // silent fail
      }
    };
    run();
  }, [user, userIsPro]);

  // Handle cloud sync choice
  const handleCloudSyncChoice = async (choice: "download" | "upload") => {
    if (!user) return;

    try {
      if (choice === "download") {
        // Download cloud data to local
        const { downloadCloudData } = await import(
          "../../services/firestoreStorage"
        );
        await downloadCloudData(user.uid);
        const nowIso = new Date().toISOString();
        updateSettings({
          storageMode: "cloud",
          lastSyncAt: nowIso,
        });
        onToast("Cloud sync enabled - using cloud data.");
      } else {
        // Upload local data to cloud
        const local = {
          settings: JSON.parse(localStorage.getItem("settings") || "null"),
          timeEntries: JSON.parse(localStorage.getItem("timeEntries") || "[]"),
          dailySubmissions: JSON.parse(
            localStorage.getItem("dailySubmissions") || "[]"
          ),
          payHistory: JSON.parse(localStorage.getItem("payHistory") || "[]"),
        };
        const { writeCloudSnapshot } = await import(
          "../../services/firestoreStorage"
        );
        await writeCloudSnapshot(user.uid, local);
        const nowIso = new Date().toISOString();
        updateSettings({
          storageMode: "cloud",
          lastSyncAt: nowIso,
        });
        onToast("Cloud sync enabled - uploaded local data.");
      }
    } catch (e) {
      onToast("Failed to enable cloud sync. Please try again.");
    } finally {
      setShowCloudSyncModal(false);
      setCloudSyncChoice(null);
    }
  };

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

      {/* Cloud Sync Choice Modal */}
      {showCloudSyncModal && (
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
                <h3 className="text-base font-bold">Cloud Data Found</h3>
                <button
                  onClick={() => {
                    setShowCloudSyncModal(false);
                    setCloudSyncChoice(null);
                  }}
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
            <div className="px-4 py-3 space-y-3 text-sm">
              <p>We found existing cloud data. What would you like to do?</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleCloudSyncChoice("download")}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    settings.darkMode
                      ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                      : "bg-slate-100 border-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <div className="font-medium">Use Cloud Data</div>
                  <div className="text-xs opacity-75">
                    Download cloud data to this device (recommended)
                  </div>
                </button>
                <button
                  onClick={() => handleCloudSyncChoice("upload")}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    settings.darkMode
                      ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                      : "bg-slate-100 border-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <div className="font-medium">Upload Local Data</div>
                  <div className="text-xs opacity-75">
                    Replace cloud data with this device's data
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  // Check if cloud data exists first
                  const { readCloudSnapshot } = await import(
                    "../../services/firestoreStorage"
                  );
                  try {
                    const cloudData = await readCloudSnapshot(user.uid);
                    const hasCloudData =
                      cloudData &&
                      (cloudData.settings ||
                        (cloudData.timeEntries &&
                          cloudData.timeEntries.length > 0) ||
                        (cloudData.dailySubmissions &&
                          cloudData.dailySubmissions.length > 0) ||
                        (cloudData.payHistory &&
                          cloudData.payHistory.length > 0));

                    if (hasCloudData) {
                      setCloudSyncChoice("download");
                      setShowCloudSyncModal(true);
                    } else {
                      handleCloudSyncChoice("upload");
                    }
                  } catch (e) {
                    onToast("Failed to enable cloud sync. Please try again.");
                    return;
                  }
                } else {
                  updateSettings({ storageMode: "local" });
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
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (!user) {
                  onToast("Sign in first.");
                  return;
                }
                if (!canUseCloudStorage) {
                  openUpgrade("Cloud Sync");
                  return;
                }
                // Upload local data to cloud (no confirmation needed for manual action)
                const local = {
                  settings: JSON.parse(
                    localStorage.getItem("settings") || "null"
                  ),
                  timeEntries: JSON.parse(
                    localStorage.getItem("timeEntries") || "[]"
                  ),
                  dailySubmissions: JSON.parse(
                    localStorage.getItem("dailySubmissions") || "[]"
                  ),
                  payHistory: JSON.parse(
                    localStorage.getItem("payHistory") || "[]"
                  ),
                };
                import("../../services/firestoreStorage").then(async (m) => {
                  await m.writeCloudSnapshot(user.uid, local);
                  onToast("Synced to cloud.");
                });
              }}
              aria-label="Upload this device's data to cloud"
              title={
                canUseCloudStorage
                  ? "Upload this device's data to cloud"
                  : "Pro required"
              }
              className={`w-full py-1 px-2 rounded border transition-colors text-xs ${
                canUseCloudStorage
                  ? settings.darkMode
                    ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
                    : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                  : settings.darkMode
                  ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                  : "bg-slate-100/80 text-slate-500 border-slate-300/60 cursor-not-allowed"
              }`}
            >
              Upload this device's data to cloud
            </button>
            <button
              onClick={() => {
                if (!user) {
                  onToast("Sign in first.");
                  return;
                }
                const allowDownload =
                  canUseCloudStorage ||
                  (hasCloudData && !freeDownloadConsumedState);
                if (!allowDownload) {
                  openUpgrade("Cloud Sync");
                  return;
                }
                // Download cloud data to local (no confirmation needed for manual action)
                import("../../services/firestoreStorage").then(async (m) => {
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

                  if (
                    !canUseCloudStorage &&
                    hasCloudData &&
                    !freeDownloadConsumedState
                  ) {
                    try {
                      await m.setFreeDownloadConsumed(user.uid);
                      setFreeDownloadConsumedState(true);
                      updateSettings({
                        storageMode: "local",
                        enableTaxCalculations: false,
                        enableNiCalculations: false,
                      });
                    } catch {}
                  }

                  onToast("Synced to local. Reloading…");
                  setTimeout(() => window.location.reload(), 500);
                });
              }}
              aria-label="Download cloud data to this device"
              title={
                canUseCloudStorage ||
                (hasCloudData && !freeDownloadConsumedState)
                  ? "Download cloud data to this device"
                  : "Pro required"
              }
              className={`w-full py-1 px-2 rounded border transition-colors text-xs ${
                canUseCloudStorage ||
                (hasCloudData && !freeDownloadConsumedState)
                  ? settings.darkMode
                    ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
                    : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                  : settings.darkMode
                  ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                  : "bg-slate-100/80 text-slate-500 border-slate-300/60 cursor-not-allowed"
              }`}
            >
              Download cloud data to this device
            </button>
          </div>
          <p
            className={`text-[11px] ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            • Upload replaces your cloud data with this device's data. •
            Download replaces this device's data with what's in the cloud.
          </p>
        </div>
      </div>
    </>
  );
};

export default SettingsCloudSync;
