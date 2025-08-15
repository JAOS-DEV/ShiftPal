import React from "react";
import { Settings } from "../types";

interface TimeFormatModalProps {
  visible: boolean;
  settings: Settings;
  onClose: () => void;
}

const TimeFormatModal: React.FC<TimeFormatModalProps> = ({
  visible,
  settings,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg w-full max-w-sm mx-auto">
        <div className="p-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">
              Time Input Format
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
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
              24-Hour Format
            </h4>
            <p
              className={`text-sm leading-relaxed ${
                settings.darkMode ? "text-gray-300" : "text-slate-600"
              }`}
            >
              Enter times using 24-hour format (HH:MM). This means 1:00 PM is
              13:00, 2:30 PM is 14:30, and midnight is 00:00.
            </p>
          </div>

          <div>
            <h4
              className={`font-medium mb-2 ${
                settings.darkMode ? "text-gray-200" : "text-slate-700"
              }`}
            >
              Valid Examples
            </h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p>
                • <strong>09:30</strong> - 9:30 AM
              </p>
              <p>
                • <strong>13:45</strong> - 1:45 PM
              </p>
              <p>
                • <strong>17:00</strong> - 5:00 PM
              </p>
              <p>
                • <strong>00:00</strong> - Midnight
              </p>
              <p>
                • <strong>23:59</strong> - 11:59 PM
              </p>
            </div>
          </div>

          <div>
            <h4
              className={`font-medium mb-2 ${
                settings.darkMode ? "text-gray-200" : "text-slate-700"
              }`}
            >
              Common Mistakes
            </h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p>• Don't use AM/PM (use 13:00, not 1:00 PM)</p>
              <p>• Always use two digits (09:30, not 9:30)</p>
              <p>• Use colon separator (09:30, not 0930)</p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <p
              className={`text-xs ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              💡 <strong>Tip:</strong> For overnight shifts, end time can be
              after midnight (e.g., 06:00 for 6 AM the next day).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeFormatModal;
