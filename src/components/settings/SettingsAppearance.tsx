import React from "react";
import { Settings as SettingsType } from "../../types";

interface SettingsAppearanceProps {
  settings: SettingsType;
  updateSettings: (updates: Partial<SettingsType>) => void;
}

const SettingsAppearance: React.FC<SettingsAppearanceProps> = ({
  settings,
  updateSettings,
}) => {
  return (
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
        Appearance
      </h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <label
              className={`text-xs font-bold tracking-wider uppercase block mb-0.5 ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              DARK MODE
            </label>
            <p
              className={`text-xs ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              Switch between light and dark themes
            </p>
          </div>
          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.darkMode ? "bg-gray-700" : "bg-slate-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.darkMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsAppearance;
