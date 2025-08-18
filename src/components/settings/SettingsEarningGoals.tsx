import React from "react";
import { Settings as SettingsType } from "../../types";
import { parseAndRoundFloat } from "../../utils/formatUtils";

interface SettingsEarningGoalsProps {
  settings: SettingsType;
  updateSettings: (updates: Partial<SettingsType>) => void;
}

const SettingsEarningGoals: React.FC<SettingsEarningGoalsProps> = ({
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
        Earning Goals
      </h3>
      <div className="space-y-2">
        <div>
          <label
            htmlFor="weekly-goal"
            className={`text-xs font-bold tracking-wider uppercase block mb-0.5 ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            WEEKLY GOAL (£)
          </label>
          <input
            id="weekly-goal"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={settings.weeklyGoal || ""}
            onChange={(e) =>
              updateSettings({
                weeklyGoal: parseAndRoundFloat(e.target.value),
              })
            }
            placeholder="e.g., 800"
            className={`w-full p-1 text-sm bg-transparent border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 ${
              settings.darkMode
                ? "border-gray-600 text-gray-100 placeholder-gray-400"
                : "border-slate-300 text-slate-800 placeholder-slate-400"
            }`}
          />
        </div>
        <div>
          <label
            htmlFor="monthly-goal"
            className={`text-xs font-bold tracking-wider uppercase block mb-0.5 ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            MONTHLY GOAL (£)
          </label>
          <input
            id="monthly-goal"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={settings.monthlyGoal || ""}
            onChange={(e) =>
              updateSettings({
                monthlyGoal: parseAndRoundFloat(e.target.value),
              })
            }
            placeholder="e.g., 3200"
            className={`w-full p-1 text-sm bg-transparent border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 ${
              settings.darkMode
                ? "border-gray-600 text-gray-100 placeholder-gray-400"
                : "border-slate-300 text-slate-800 placeholder-slate-400"
            }`}
          />
        </div>
        <p
          className={`text-xs ${
            settings.darkMode ? "text-gray-400" : "text-slate-500"
          }`}
        >
          Set goals to track your progress in the pay history view.
        </p>
      </div>
    </div>
  );
};

export default SettingsEarningGoals;
