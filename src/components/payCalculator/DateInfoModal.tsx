import React from "react";
import { Settings } from "../../types";

interface DateInfoModalProps {
  showDateInfoModal: boolean;
  setShowDateInfoModal: (show: boolean) => void;
  settings: Settings;
}

const DateInfoModal: React.FC<DateInfoModalProps> = ({
  showDateInfoModal,
  setShowDateInfoModal,
  settings,
}) => {
  if (!showDateInfoModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg w-full max-w-sm mx-auto">
        <div className="p-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">
              Pay Date Selection
            </h3>
            <button
              onClick={() => setShowDateInfoModal(false)}
              className={`${
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
              What is the Pay Date?
            </h4>
            <p
              className={`text-sm leading-relaxed ${
                settings.darkMode ? "text-gray-300" : "text-slate-600"
              }`}
            >
              This is the date that the pay calculation represents. It's the day
              you worked, not when you're saving the calculation.
            </p>
          </div>

          <div>
            <h4
              className={`font-medium mb-2 ${
                settings.darkMode ? "text-gray-200" : "text-slate-700"
              }`}
            >
              Why is it Important?
            </h4>
            <p
              className={`text-sm leading-relaxed ${
                settings.darkMode ? "text-gray-300" : "text-slate-600"
              }`}
            >
              The date helps organize your pay history and ensures you don't
              accidentally save multiple pay calculations for the same day.
            </p>
          </div>

          <div>
            <h4
              className={`font-medium mb-2 ${
                settings.darkMode ? "text-gray-200" : "text-slate-700"
              }`}
            >
              Submissions Counter
            </h4>
            <p
              className={`text-sm leading-relaxed ${
                settings.darkMode ? "text-gray-300" : "text-slate-600"
              }`}
            >
              The number in parentheses shows how many pay calculations you've
              already saved for this date. This helps you avoid duplicates.
            </p>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <p
              className={`text-xs ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              💡 <strong>Tip:</strong> Use today's date for current work, or
              select a past date if you're catching up on previous pay
              calculations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateInfoModal;
