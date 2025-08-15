import React from "react";
import { Settings as SettingsType } from "../../types";

interface SettingsWeekConfigProps {
  settings: SettingsType;
  updateSettings: (updates: Partial<SettingsType>) => void;
}

const SettingsWeekConfig: React.FC<SettingsWeekConfigProps> = ({
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
        Week Configuration
      </h3>
      <div className="space-y-2">
        <div>
          <label
            htmlFor="week-start-day"
            className={`text-xs font-bold tracking-wider uppercase block mb-0.5 ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            WEEK START DAY
          </label>
          <select
            id="week-start-day"
            value={settings.weekStartDay}
            onChange={(e) =>
              updateSettings({ weekStartDay: e.target.value as any })
            }
            className={`w-full p-1 text-sm border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 ${
              settings.darkMode
                ? "bg-gray-800 border-gray-600 text-gray-100"
                : "bg-white border-slate-300 text-slate-800"
            }`}
          >
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
          </select>
          <p
            className={`text-xs mt-1 ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            This affects how weekly totals are calculated in pay history.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsWeekConfig;
