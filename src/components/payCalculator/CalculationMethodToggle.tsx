import React from "react";
import { Settings } from "../../types";
import InfoButton from "../ui/InfoButton";

interface CalculationMethodToggleProps {
  useManualHours: boolean;
  setUseManualHours: (value: boolean) => void;
  setShowInfoModal: (show: boolean) => void;
  settings: Settings;
}

const CalculationMethodToggle: React.FC<CalculationMethodToggleProps> = ({
  useManualHours,
  setUseManualHours,
  setShowInfoModal,
  settings,
}) => {
  return (
    <div
      className={`p-1.5 rounded-lg border ${
        settings.darkMode
          ? "bg-gray-700/50 border-gray-600"
          : "bg-white/50 border-gray-200/80"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <label
          className={`text-xs font-bold tracking-wider uppercase ${
            !useManualHours
              ? settings.darkMode
                ? "text-gray-100"
                : "text-gray-800"
              : settings.darkMode
              ? "text-gray-400"
              : "text-slate-500"
          }`}
        >
          CALCULATION METHOD
        </label>
                 <InfoButton
           onClick={() => setShowInfoModal(true)}
           title="How calculation methods work"
           settings={settings}
         />
      </div>
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-medium ${
            !useManualHours
              ? settings.darkMode
                ? "text-gray-100"
                : "text-[#003D5B]"
              : settings.darkMode
              ? "text-gray-500"
              : "text-slate-500"
          }`}
        >
          Time Tracker
        </span>
        <button
          onClick={() => setUseManualHours(!useManualHours)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            useManualHours ? "bg-gray-700" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              useManualHours ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span
          className={`text-xs font-medium ${
            useManualHours
              ? settings.darkMode
                ? "text-gray-100"
                : "text-[#003D5B]"
              : settings.darkMode
              ? "text-gray-500"
              : "text-slate-500"
          }`}
        >
          Manual Hours
        </span>
      </div>
    </div>
  );
};

export default CalculationMethodToggle;
