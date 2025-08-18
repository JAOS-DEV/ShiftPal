import type { User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { ProVerificationUpgradeModal } from "../components/modals";
import {
  SettingsAccount,
  SettingsAppearance,
  SettingsAppInfo,
  SettingsCloudSync,
  SettingsDataManagement,
  SettingsEarningGoals,
  SettingsPayRates,
  SettingsTaxNI,
  SettingsWeekConfig,
} from "../components/settings/index";
import ToastNotification from "../components/ui/ToastNotification";
import { useActivityTracking } from "../hooks/useActivityTracking";
import { Settings as SettingsType, UserProfile } from "../types";

interface SettingsProps {
  settings: SettingsType;
  setSettings: (settings: SettingsType) => void;
  user?: User | null;
  userProfile?: UserProfile | null;
}

const Settings: React.FC<SettingsProps> = ({
  settings,
  setSettings,
  user,
  userProfile,
}) => {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string | undefined>(
    undefined
  );
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    action: () => void;
  } | null>(null);

  const { updateActivity } = useActivityTracking();

  const updateSettings = (updates: Partial<SettingsType>) => {
    setSettings({ ...settings, ...updates });
    updateActivity(); // Track activity when settings are changed
  };

  const openUpgrade = (feature: string) => {
    setUpgradeFeature(feature);
    setUpgradeOpen(true);
  };

  const onToast = (message: string) => {
    setToast({ message, visible: true });
  };

  const onDestructiveAction = (
    title: string,
    message: string,
    action: () => void
  ) => {
    setConfirmAction({ title, message, action });
    setShowConfirmModal(true);
  };

  const executeConfirmedAction = () => {
    if (confirmAction) {
      confirmAction.action();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  // Toast effect
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast({ message: "", visible: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  return (
    <div
      className={`h-full flex flex-col ${
        settings.darkMode
          ? "text-gray-100 bg-gray-800"
          : "text-[#003D5B] bg-[#FAF7F0]"
      }`}
    >
      {/* Hybrid Verification & Upgrade Modal */}
      <ProVerificationUpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        featureName={upgradeFeature}
        darkMode={settings.darkMode}
        userProfile={userProfile}
        supportEmail="shiftpalapp@gmail.com"
        userUid={user?.uid}
      />

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50">
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
                  {confirmAction.title}
                </h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
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
            <div className="px-3 sm:px-4 py-3 space-y-2 text-xs sm:text-sm">
              <p>{confirmAction.message}</p>
            </div>
            <div
              className={`px-3 sm:px-4 py-3 border-t ${
                settings.darkMode ? "border-gray-600" : "border-gray-200"
              } flex justify-end gap-2`}
            >
              <button
                onClick={() => setShowConfirmModal(false)}
                className={
                  settings.darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm"
                    : "bg-slate-800 hover:bg-slate-700 text-white px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm"
                }
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedAction}
                className={
                  settings.darkMode
                    ? "bg-red-700 hover:bg-red-600 text-white px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm"
                    : "bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm"
                }
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2
              className={`text-lg font-bold ${
                settings.darkMode ? "text-gray-100" : "text-slate-800"
              }`}
            >
              Settings
            </h2>
            <p
              className={`text-xs mt-1 ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              Configure your preferences
            </p>
          </div>

          {/* Account */}
          <SettingsAccount
            settings={settings}
            user={user}
            userProfile={userProfile}
            onSignOutError={onToast}
          />

          {/* Appearance */}
          <SettingsAppearance
            settings={settings}
            updateSettings={updateSettings}
          />

          {/* Week Configuration */}
          <SettingsWeekConfig
            settings={settings}
            updateSettings={updateSettings}
          />

          {/* Pay Rates */}
          <SettingsPayRates
            settings={settings}
            updateSettings={updateSettings}
            userProfile={userProfile}
            openUpgrade={openUpgrade}
          />

          {/* Tax & NI */}
          <SettingsTaxNI
            settings={settings}
            updateSettings={updateSettings}
            userProfile={userProfile}
            openUpgrade={openUpgrade}
          />

          {/* Earning Goals */}
          <SettingsEarningGoals
            settings={settings}
            updateSettings={updateSettings}
          />

          {/* Cloud Sync */}
          <SettingsCloudSync
            settings={settings}
            updateSettings={updateSettings}
            user={user}
            userProfile={userProfile}
            openUpgrade={openUpgrade}
            onToast={onToast}
            onDestructiveAction={onDestructiveAction}
          />

          {/* Data Management */}
          <SettingsDataManagement
            settings={settings}
            updateSettings={updateSettings}
            user={user}
            userProfile={userProfile}
            openUpgrade={openUpgrade}
            onToast={onToast}
            onDestructiveAction={onDestructiveAction}
          />

          {/* App Info & Support */}
          <SettingsAppInfo
            settings={settings}
            user={user}
            userProfile={userProfile}
          />
        </div>
      </div>
      <ToastNotification message={toast.message} visible={toast.visible} />
    </div>
  );
};

export default Settings;
