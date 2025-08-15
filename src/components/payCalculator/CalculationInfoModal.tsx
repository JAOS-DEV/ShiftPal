import React from "react";
import { Settings } from "../../types";

interface CalculationInfoModalProps {
  showInfoModal: boolean;
  setShowInfoModal: (show: boolean) => void;
  settings: Settings;
}

const CalculationInfoModal: React.FC<CalculationInfoModalProps> = ({
  showInfoModal,
  setShowInfoModal,
  settings,
}) => {
  if (!showInfoModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div
        className={`rounded-lg w-full max-w-sm mx-auto ${
          settings.darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div
          className={`p-3 border-b ${
            settings.darkMode ? "border-gray-600" : "border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <h3
              className={`text-lg font-bold ${
                settings.darkMode ? "text-gray-100" : "text-slate-800"
              }`}
            >
              Calculation Methods
            </h3>
            <button
              onClick={() => setShowInfoModal(false)}
              className={`transition-colors ${
                settings.darkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-3 space-y-3">
          <div>
            <h4
              className={`font-medium mb-2 ${
                settings.darkMode ? "text-gray-200" : "text-slate-700"
              }`}
            >
              Time Tracker Mode
            </h4>
            <p
              className={`text-sm leading-relaxed ${
                settings.darkMode ? "text-gray-300" : "text-slate-600"
              }`}
            >
              Automatically calculates your pay based on the total time tracked
              in the Time Tracker. This uses the accumulated hours and minutes
              from your time entries.
            </p>
          </div>

          <div>
            <h4
              className={`font-medium mb-2 ${
                settings.darkMode ? "text-gray-200" : "text-slate-700"
              }`}
            >
              Manual Hours Mode
            </h4>
            <p
              className={`text-sm leading-relaxed ${
                settings.darkMode ? "text-gray-300" : "text-slate-600"
              }`}
            >
              Manually enter your hours and minutes worked. Useful when you want
              to calculate pay for a specific period or when you have your hours
              from another source.
            </p>
          </div>

          <div
            className={`pt-2 border-t ${
              settings.darkMode ? "border-gray-600" : "border-gray-200"
            }`}
          >
            <p
              className={`text-xs ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              💡 <strong>Tip:</strong> Use Time Tracker for automatic
              calculations from your tracked time, or Manual Hours when you have
              specific hours to calculate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculationInfoModal;
