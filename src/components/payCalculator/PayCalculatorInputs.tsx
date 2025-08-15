import React from "react";
import { Settings } from "../../types";

interface PayCalculatorInputsProps {
  useManualHours: boolean;
  hourlyRate: number;
  setHourlyRate: (rate: number) => void;
  manualHours: number;
  setManualHours: (hours: number) => void;
  manualMinutes: number;
  setManualMinutes: (minutes: number) => void;
  overtimeRate: number;
  setOvertimeRate: (rate: number) => void;
  overtimeHours: number;
  setOvertimeHours: (hours: number) => void;
  overtimeMinutes: number;
  setOvertimeMinutes: (minutes: number) => void;
  selectedStandardRateId: string;
  setSelectedStandardRateId: (id: string) => void;
  selectedOvertimeRateId: string;
  setSelectedOvertimeRateId: (id: string) => void;
  settings: Settings;
}

const PayCalculatorInputs: React.FC<PayCalculatorInputsProps> = ({
  useManualHours,
  hourlyRate,
  setHourlyRate,
  manualHours,
  setManualHours,
  manualMinutes,
  setManualMinutes,
  overtimeRate,
  setOvertimeRate,
  overtimeHours,
  setOvertimeHours,
  overtimeMinutes,
  setOvertimeMinutes,
  selectedStandardRateId,
  setSelectedStandardRateId,
  selectedOvertimeRateId,
  setSelectedOvertimeRateId,
  settings,
}) => {
  return (
    <div className="grid grid-cols-1 gap-1">
      {/* Standard Hours Section */}
      <div
        className={`grid ${
          useManualHours ? "grid-cols-2" : "grid-cols-1"
        } gap-1`}
      >
        {/* Hourly Rate Input */}
        <div
          className={`p-1.5 rounded-lg border ${
            settings.darkMode
              ? "bg-gray-700/50 border-gray-600"
              : "bg-white/50 border-gray-200/80"
          }`}
        >
          <label
            htmlFor="hourly-rate"
            className={`text-xs font-bold tracking-wider uppercase block mb-1 ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            HOURLY RATE (£)
          </label>
          <div className="flex gap-1">
            <input
              id="hourly-rate"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={hourlyRate || ""}
              onChange={(e) => {
                setHourlyRate(parseFloat(e.target.value) || 0);
                // Clear dropdown selection when user manually edits
                setSelectedStandardRateId("");
              }}
              placeholder="e.g., 18.50"
              className={`flex-1 mt-1 p-1 text-sm bg-transparent border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 min-w-0 ${
                settings.darkMode
                  ? "border-gray-600 text-gray-100 placeholder-gray-400"
                  : "border-slate-300 text-slate-800 placeholder-slate-400"
              }`}
            />
            {settings.standardRates && settings.standardRates.length > 0 && (
              <select
                value={selectedStandardRateId}
                onChange={(e) => {
                  const selectedRate = settings.standardRates.find(
                    (rate) => rate.id === e.target.value
                  );
                  if (selectedRate) {
                    setHourlyRate(selectedRate.rate);
                    setSelectedStandardRateId(e.target.value);
                  } else {
                    setSelectedStandardRateId("");
                  }
                }}
                className={`mt-1 p-1 text-xs border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 w-20 flex-shrink-0 ${
                  settings.darkMode
                    ? "bg-gray-800 border-gray-600 text-gray-100"
                    : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <option value="">Select...</option>
                {settings.standardRates.map((rate) => (
                  <option key={rate.id} value={rate.id}>
                    {rate.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Manual Hours Input */}
        {useManualHours && (
          <div
            className={`p-1.5 rounded-lg border ${
              settings.darkMode
                ? "bg-gray-700/50 border-gray-600"
                : "bg-white/50 border-gray-200/80"
            }`}
          >
            <label
              htmlFor="manual-hours"
              className={`text-xs font-bold tracking-wider uppercase block mb-1 ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              HOURS WORKED
            </label>
            <div className="grid grid-cols-2 gap-1">
              <input
                id="manual-hours"
                type="number"
                inputMode="numeric"
                min="0"
                value={manualHours || ""}
                onChange={(e) => {
                  setManualHours(parseInt(e.target.value) || 0);
                }}
                placeholder="Hours"
                className={`mt-1 w-full p-1 text-sm bg-transparent border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 ${
                  settings.darkMode
                    ? "border-gray-600 text-gray-100 placeholder-gray-400"
                    : "border-slate-300 text-slate-800 placeholder-slate-400"
                }`}
              />
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="59"
                value={manualMinutes || ""}
                onChange={(e) => {
                  setManualMinutes(parseInt(e.target.value) || 0);
                }}
                placeholder="Minutes"
                className={`mt-1 w-full p-1 text-sm bg-transparent border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 ${
                  settings.darkMode
                    ? "border-gray-600 text-gray-100 placeholder-gray-400"
                    : "border-slate-300 text-slate-800 placeholder-slate-400"
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Overtime Section */}
      <div className="grid grid-cols-2 gap-1">
        {/* Overtime Rate Input */}
        <div
          className={`p-1.5 rounded-lg border ${
            settings.darkMode
              ? "bg-gray-700/50 border-gray-600"
              : "bg-white/50 border-gray-200/80"
          }`}
        >
          <label
            className={`text-xs font-bold tracking-wider uppercase block mb-1 ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            OVERTIME RATE (£)
          </label>
          <div className="flex gap-1">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={overtimeRate || ""}
              onChange={(e) => {
                setOvertimeRate(parseFloat(e.target.value) || 0);
                // Clear dropdown selection when user manually edits
                setSelectedOvertimeRateId("");
              }}
              placeholder="e.g., 27.75"
              className={`flex-1 p-1 text-sm bg-transparent border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 min-w-0 ${
                settings.darkMode
                  ? "border-gray-600 text-gray-100 placeholder-gray-400"
                  : "border-slate-300 text-slate-800 placeholder-slate-400"
              }`}
            />
            {settings.overtimeRates && settings.overtimeRates.length > 0 && (
              <select
                value={selectedOvertimeRateId}
                onChange={(e) => {
                  const selectedRate = settings.overtimeRates.find(
                    (rate) => rate.id === e.target.value
                  );
                  if (selectedRate) {
                    setOvertimeRate(selectedRate.rate);
                    setSelectedOvertimeRateId(e.target.value);
                  } else {
                    setSelectedOvertimeRateId("");
                  }
                }}
                className={`p-1 text-xs border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 w-20 flex-shrink-0 ${
                  settings.darkMode
                    ? "bg-gray-800 border-gray-600 text-gray-100"
                    : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <option value="">Select...</option>
                {settings.overtimeRates.map((rate) => (
                  <option key={rate.id} value={rate.id}>
                    {rate.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Overtime Hours Input */}
        <div
          className={`p-1.5 rounded-lg border ${
            settings.darkMode
              ? "bg-gray-700/50 border-gray-600"
              : "bg-white/50 border-gray-200/80"
          }`}
        >
          <label
            className={`text-xs font-bold tracking-wider uppercase block mb-1 ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            OVERTIME HOURS
          </label>
          <div className="grid grid-cols-2 gap-1">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={overtimeHours || ""}
              onChange={(e) => {
                setOvertimeHours(parseInt(e.target.value) || 0);
              }}
              placeholder="Hours"
              className={`w-full p-1 text-sm bg-transparent border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 ${
                settings.darkMode
                  ? "border-gray-600 text-gray-100 placeholder-gray-400"
                  : "border-slate-300 text-slate-800 placeholder-slate-400"
              }`}
            />
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="59"
              value={overtimeMinutes || ""}
              onChange={(e) => {
                setOvertimeMinutes(parseInt(e.target.value) || 0);
              }}
              placeholder="Minutes"
              className={`w-full p-1 text-sm bg-transparent border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 ${
                settings.darkMode
                  ? "border-gray-600 text-gray-100 placeholder-gray-400"
                  : "border-slate-300 text-slate-800 placeholder-slate-400"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayCalculatorInputs;
