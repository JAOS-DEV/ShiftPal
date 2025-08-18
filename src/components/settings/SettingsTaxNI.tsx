import React, { useState } from "react";
import { Settings as SettingsType } from "../../types";
import { isPro } from "../../services/firestoreStorage";
import { parseAndRoundFloat } from "../../utils/formatUtils";
import { UserProfile } from "../../types";
import ProBadge from "./ProBadge";

interface SettingsTaxNIProps {
  settings: SettingsType;
  updateSettings: (updates: Partial<SettingsType>) => void;
  userProfile?: UserProfile | null;
  openUpgrade: (feature: string) => void;
}

const SettingsTaxNI: React.FC<SettingsTaxNIProps> = ({
  settings,
  updateSettings,
  userProfile,
  openUpgrade,
}) => {
  const [showTaxSection, setShowTaxSection] = useState(
    settings.enableTaxCalculations
  );

  // Pro status checks
  const userIsPro = isPro(userProfile);
  const canUseTaxCalculations = userIsPro;

  return (
    <>
      {/* Tax Calculations */}
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
          Tax Calculations
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span
                className={`text-sm font-medium ${
                  settings.darkMode ? "text-gray-200" : "text-slate-700"
                }`}
              >
                Enable Tax Calculations
              </span>
              <p
                className={`text-xs ${
                  settings.darkMode ? "text-gray-400" : "text-slate-500"
                }`}
              >
                Show after-tax earnings in pay breakdown
              </p>
              {!canUseTaxCalculations && (
                <div className="mt-1">
                  <ProBadge />
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (!canUseTaxCalculations) {
                  openUpgrade("tax calculations");
                  return;
                }
                const newValue = !settings.enableTaxCalculations;
                updateSettings({ enableTaxCalculations: newValue });
                setShowTaxSection(newValue);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableTaxCalculations ? "bg-[#003D5B]" : "bg-slate-300"
              } ${
                !canUseTaxCalculations ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableTaxCalculations
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {showTaxSection && (
            <div
              className={`pt-2 border-t ${
                settings.darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <label
                htmlFor="tax-rate"
                className={`text-xs font-bold tracking-wider uppercase block mb-0.5 ${
                  settings.darkMode ? "text-gray-400" : "text-slate-500"
                }`}
              >
                TAX RATE (%)
              </label>
              <input
                id="tax-rate"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                max="100"
                value={Math.round(settings.taxRate * 100) || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only update if it's a valid number or empty
                  if (value === "" || !isNaN(parseFloat(value))) {
                    updateSettings({
                      taxRate: value === "" ? 0 : parseFloat(value) / 100,
                    });
                  }
                }}
                onBlur={(e) => {
                  // Apply rounding only when input loses focus
                  const value = parseAndRoundFloat(e.target.value) / 100;
                  updateSettings({ taxRate: value });
                }}
                placeholder="e.g., 20"
                disabled={!canUseTaxCalculations}
                className={`w-full p-1 text-sm bg-transparent border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 ${
                  settings.darkMode
                    ? "border-gray-600 text-gray-100 placeholder-gray-400"
                    : "border-slate-300 text-slate-800 placeholder-slate-400"
                }`}
              />
              <p
                className={`text-xs mt-0.5 ${
                  settings.darkMode ? "text-gray-400" : "text-slate-500"
                }`}
              >
                Standard UK tax rate is 20%. This will show after-tax earnings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* NI Calculations */}
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
          National Insurance
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span
                className={`text-sm font-medium ${
                  settings.darkMode ? "text-gray-200" : "text-slate-700"
                }`}
              >
                Enable NI Calculations
              </span>
              <p
                className={`text-xs ${
                  settings.darkMode ? "text-gray-400" : "text-slate-500"
                }`}
              >
                Show after-NI earnings in pay breakdown
              </p>
              {!canUseTaxCalculations && (
                <div className="mt-1">
                  <ProBadge />
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (!canUseTaxCalculations) {
                  openUpgrade("NI calculations");
                  return;
                }
                const newValue = !settings.enableNiCalculations;
                updateSettings({ enableNiCalculations: newValue });
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableNiCalculations ? "bg-[#003D5B]" : "bg-slate-300"
              } ${
                !canUseTaxCalculations ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableNiCalculations
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <p
              className={`text-xs ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              UK NI rates: 12% on earnings between £12,570-£50,270, 2% above
              £50,270. This will show after-NI earnings.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsTaxNI;
