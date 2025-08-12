import React from "react";
import { Settings as SettingsType } from "../../types";
import type { User } from "firebase/auth";
import { isPro } from "../../services/firestoreStorage";
import { UserProfile } from "../../types";

interface SettingsDataManagementProps {
  settings: SettingsType;
  user?: User | null;
  userProfile?: UserProfile | null;
  openUpgrade: (feature: string) => void;
  onToast: (message: string) => void;
  onDestructiveAction: (
    title: string,
    message: string,
    action: () => void
  ) => void;
}

const SettingsDataManagement: React.FC<SettingsDataManagementProps> = ({
  settings,
  user,
  userProfile,
  openUpgrade,
  onToast,
  onDestructiveAction,
}) => {
  // Pro status checks
  const userIsPro = isPro(userProfile);
  const canExportCSV = userIsPro;

  return (
    <>
      {/* Data Management (Local device only) */}
      <div
        className={`p-2 rounded-lg border ${
          settings.darkMode
            ? "bg-gray-700/50 border-gray-600"
            : "bg-white/50 border-gray-200/80"
        }`}
      >
        <h3
          className={`text-sm font-bold mb-2 ${
            settings.darkMode ? "text-gray-100" : "text-slate-700"
          }`}
        >
          Data on this device
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => openUpgrade("CSV export")}
            aria-label="Export Pay History (CSV)"
            title={canExportCSV ? "Export Pay History (CSV)" : "Pro required"}
            className={`w-full font-bold py-1.5 px-3 rounded-md transition-colors text-sm ${
              canExportCSV
                ? settings.darkMode
                  ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
                  : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                : settings.darkMode
                ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                : "bg-slate-100/80 text-slate-500 border-slate-300/60 cursor-not-allowed"
            }`}
          >
            Export Pay History (CSV) {canExportCSV ? "" : "(Pro required)"}
          </button>
          {!canExportCSV && (
            <div className="mt-1">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-semibold bg-amber-100 text-amber-800 border-amber-200 whitespace-nowrap">
                Pro required
              </span>
            </div>
          )}
          <p
            className={`text-[11px] -mt-1 ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            Exports the pay history currently stored on this device.
          </p>
          <button
            onClick={() => {
              onDestructiveAction(
                "Clear local pay history",
                "This will permanently delete all saved pay on this device. Continue?",
                () => {
                  localStorage.removeItem("payHistory");
                  onToast("All pay history has been cleared.");
                }
              );
            }}
            className="w-full bg-red-500 text-white font-bold py-1.5 px-3 rounded-md hover:bg-red-600 transition-colors text-sm"
          >
            Clear local pay history
          </button>
          <p
            className={`text-[11px] -mt-1 ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            Removes pay history from this device only. Cloud data is not
            affected.
          </p>
          <button
            onClick={() => {
              onDestructiveAction(
                "Clear all local data",
                "This will permanently delete ALL local data (entries, pay history, settings). Continue?",
                () => {
                  localStorage.clear();
                  onToast("All local data has been cleared. Reloading…");
                  setTimeout(() => window.location.reload(), 500);
                }
              );
            }}
            className="w-full bg-red-700 text-white font-bold py-1.5 px-3 rounded-md hover:bg-red-800 transition-colors text-sm"
          >
            Clear all local data
          </button>
        </div>
      </div>

      {/* Cloud Data Management */}
      {user && (
        <div
          className={`p-2 rounded-lg border ${
            settings.darkMode
              ? "bg-gray-700/50 border-gray-600"
              : "bg-white/50 border-gray-200/80"
          }`}
        >
          <h3
            className={`text-sm font-bold mb-2 ${
              settings.darkMode ? "text-gray-100" : "text-slate-700"
            }`}
          >
            Cloud data
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                if (!canExportCSV) {
                  openUpgrade("Cloud Sync");
                  return;
                }
                onDestructiveAction(
                  "Delete cloud data",
                  "This will permanently delete all data stored in the cloud. Your local data on this device will remain unchanged. Continue?",
                  async () => {
                    const { clearCloudData } = await import(
                      "../../services/firestoreStorage"
                    );
                    await clearCloudData(user.uid);
                    onToast("Cloud data cleared.");
                  }
                );
              }}
              className={`w-full font-bold py-1.5 px-3 rounded-md transition-colors text-sm ${
                canExportCSV
                  ? "bg-red-700 text-white hover:bg-red-800"
                  : "bg-red-200 text-white cursor-not-allowed"
              }`}
            >
              Delete cloud data (keeps this device's data)
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsDataManagement;
