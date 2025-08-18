import React from "react";
import {
  Settings as SettingsType,
  StandardRate,
  OvertimeRate,
} from "../../types";
import { isPro } from "../../services/firestoreStorage";
import { UserProfile } from "../../types";
import ProBadge from "./ProBadge";
import { parseAndRoundFloat } from "../../utils/formatUtils";

interface SettingsPayRatesProps {
  settings: SettingsType;
  updateSettings: (updates: Partial<SettingsType>) => void;
  userProfile?: UserProfile | null;
  openUpgrade: (feature: string) => void;
}

const SettingsPayRates: React.FC<SettingsPayRatesProps> = ({
  settings,
  updateSettings,
  userProfile,
  openUpgrade,
}) => {
  // Pro status checks
  const userIsPro = isPro(userProfile);
  const canAddStandardRate =
    userIsPro || (settings.standardRates?.length || 0) < 1;
  const canAddOvertimeRate =
    userIsPro || (settings.overtimeRates?.length || 0) < 1;

  return (
    <>
      {/* Standard Rates */}
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
          Standard Rates
        </h3>
        <div className="space-y-2">
          {settings.standardRates?.map((rate, index) => (
            <div
              key={rate.id}
              className={`${
                settings.darkMode
                  ? "bg-gray-700/50 border-gray-600"
                  : "bg-white/50 border-slate-200"
              } border rounded p-2`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-medium ${
                    settings.darkMode ? "text-gray-200" : "text-slate-700"
                  }`}
                >
                  {rate.name}
                </span>
                <button
                  onClick={() => {
                    const newRates =
                      settings.standardRates?.filter((_, i) => i !== index) ||
                      [];
                    updateSettings({ standardRates: newRates });
                  }}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rate.rate || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only update if it's a valid number or empty
                    if (value === "" || !isNaN(parseFloat(value))) {
                      const newRates = [...(settings.standardRates || [])];
                      newRates[index].rate =
                        value === "" ? 0 : parseFloat(value);
                      updateSettings({ standardRates: newRates });
                    }
                  }}
                  onBlur={(e) => {
                    // Apply rounding only when input loses focus
                    const value = parseAndRoundFloat(e.target.value);
                    const newRates = [...(settings.standardRates || [])];
                    newRates[index].rate = value;
                    updateSettings({ standardRates: newRates });
                  }}
                  className={`flex-1 p-0.5 text-xs bg-transparent border rounded focus:ring-1 focus:ring-gray-600 ${
                    settings.darkMode
                      ? "border-gray-600 text-gray-100 placeholder-gray-400"
                      : "border-slate-300 text-slate-800 placeholder-slate-400"
                  }`}
                  placeholder="0.00"
                />
              </div>
              <input
                type="text"
                value={rate.name}
                onChange={(e) => {
                  const newRates = [...(settings.standardRates || [])];
                  newRates[index].name = e.target.value;
                  updateSettings({ standardRates: newRates });
                }}
                className={`w-full mt-1 p-0.5 text-xs bg-transparent border rounded focus:ring-1 focus:ring-gray-600 ${
                  settings.darkMode
                    ? "border-gray-600 text-gray-100 placeholder-gray-400"
                    : "border-slate-300 text-slate-800 placeholder-slate-400"
                }`}
                placeholder="Rate name"
              />
            </div>
          ))}
          <button
            onClick={() => {
              if (!canAddStandardRate) {
                openUpgrade("multiple pay rates");
                return;
              }
              const newRate: StandardRate = {
                id: Date.now().toString(),
                name: `Standard Rate ${
                  (settings.standardRates?.length || 0) + 1
                }`,
                rate: 0,
              };
              updateSettings({
                standardRates: [...(settings.standardRates || []), newRate],
              });
            }}
            className={`w-full py-1 px-2 rounded border transition-colors text-xs ${
              canAddStandardRate
                ? settings.darkMode
                  ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
                  : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                : settings.darkMode
                ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
            }`}
          >
            + Add Standard Rate
          </button>
          {!canAddStandardRate && (
            <div className="flex items-center gap-1 mt-1">
              <ProBadge text="Pro required" />
              <span
                className={`text-[11px] ${
                  settings.darkMode ? "text-gray-400" : "text-slate-500"
                }`}
              >
                More than 1 standard rate requires Pro.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Overtime Rates */}
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
          Overtime Rates
        </h3>
        <div className="space-y-2">
          {settings.overtimeRates?.map((rate, index) => (
            <div
              key={rate.id}
              className={`${
                settings.darkMode
                  ? "bg-gray-700/50 border-gray-600"
                  : "bg-white/50 border-slate-200"
              } border rounded p-2`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-medium ${
                    settings.darkMode ? "text-gray-200" : "text-slate-700"
                  }`}
                >
                  {rate.name}
                </span>
                <button
                  onClick={() => {
                    const newRates =
                      settings.overtimeRates?.filter((_, i) => i !== index) ||
                      [];
                    updateSettings({ overtimeRates: newRates });
                  }}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rate.rate || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only update if it's a valid number or empty
                    if (value === "" || !isNaN(parseFloat(value))) {
                      const newRates = [...(settings.overtimeRates || [])];
                      newRates[index].rate =
                        value === "" ? 0 : parseFloat(value);
                      updateSettings({ overtimeRates: newRates });
                    }
                  }}
                  onBlur={(e) => {
                    // Apply rounding only when input loses focus
                    const value = parseAndRoundFloat(e.target.value);
                    const newRates = [...(settings.overtimeRates || [])];
                    newRates[index].rate = value;
                    updateSettings({ overtimeRates: newRates });
                  }}
                  className={`flex-1 p-0.5 text-xs bg-transparent border rounded focus:ring-1 focus:ring-gray-600 ${
                    settings.darkMode
                      ? "border-gray-600 text-gray-100 placeholder-gray-400"
                      : "border-slate-300 text-slate-800 placeholder-slate-400"
                  }`}
                  placeholder="0.00"
                />
              </div>
              <input
                type="text"
                value={rate.name}
                onChange={(e) => {
                  const newRates = [...(settings.overtimeRates || [])];
                  newRates[index].name = e.target.value;
                  updateSettings({ overtimeRates: newRates });
                }}
                className={`w-full mt-1 p-0.5 text-xs bg-transparent border rounded focus:ring-1 focus:ring-gray-600 ${
                  settings.darkMode
                    ? "border-gray-600 text-gray-100 placeholder-gray-400"
                    : "border-slate-300 text-slate-800 placeholder-slate-400"
                }`}
                placeholder="Rate name"
              />
            </div>
          ))}
          <button
            onClick={() => {
              if (!canAddOvertimeRate) {
                openUpgrade("multiple pay rates");
                return;
              }
              const newRate: OvertimeRate = {
                id: Date.now().toString(),
                name: `Overtime Rate ${
                  (settings.overtimeRates?.length || 0) + 1
                }`,
                rate: 0,
              };
              updateSettings({
                overtimeRates: [...(settings.overtimeRates || []), newRate],
              });
            }}
            className={`w-full py-1 px-2 rounded border transition-colors text-xs ${
              canAddOvertimeRate
                ? settings.darkMode
                  ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
                  : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                : settings.darkMode
                ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
            }`}
          >
            + Add Overtime Rate
          </button>
          {!canAddOvertimeRate && (
            <div className="flex items-center gap-1 mt-1">
              <ProBadge text="Pro required" />
              <span
                className={`text-[11px] ${
                  settings.darkMode ? "text-gray-400" : "text-slate-500"
                }`}
              >
                More than 1 overtime rate requires Pro.
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SettingsPayRates;
