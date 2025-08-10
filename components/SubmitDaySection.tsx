import React from "react";
import { Settings } from "../types";

interface SubmitDaySectionProps {
  submitDate: string;
  submissionsForDate: any[];
  entries: any[];
  settings: Settings;
  onDateChange: (date: string) => void;
  onSubmitDay: () => void;
  onShowSubmissionInfoModal: () => void;
}

const SubmitDaySection: React.FC<SubmitDaySectionProps> = ({
  submitDate,
  submissionsForDate,
  entries,
  settings,
  onDateChange,
  onSubmitDay,
  onShowSubmissionInfoModal,
}) => {
  return (
    <div className="flex-shrink-0 px-4 pb-3 space-y-1.5">
      {/* Date Picker */}
      <div
        className={`${
          settings.darkMode
            ? "bg-gray-700/50 border border-gray-600/80"
            : "bg-white/50 border border-gray-200/80"
        } p-1 rounded-lg`}
      >
        <div className="flex items-center justify-center gap-2 mb-0.5">
          <label
            className={`text-xs font-medium text-center ${
              settings.darkMode ? "text-gray-300" : "text-slate-600"
            }`}
          >
            Select date ({submissionsForDate.length} submissions)
          </label>
          <button
            onClick={onShowSubmissionInfoModal}
            className={`${
              settings.darkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-slate-400 hover:text-slate-600"
            } transition-colors`}
            title="What is a submission?"
            aria-label="What is a submission?"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <input
          type="date"
          value={submitDate}
          onChange={(e) => onDateChange(e.target.value)}
          className={`w-5/6 p-0.5 text-sm bg-transparent border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 mx-auto block ${
            settings.darkMode
              ? "border-gray-600 text-gray-100"
              : "border-slate-300 text-slate-800"
          }`}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmitDay}
        disabled={entries.length === 0}
        className={`w-full py-1.5 px-3 rounded-lg font-bold transition-colors text-sm ${
          entries.length > 0
            ? "bg-gray-700 text-white hover:bg-gray-600"
            : "bg-slate-300 text-slate-500 cursor-not-allowed"
        }`}
      >
        Submit Entries
      </button>
    </div>
  );
};

export default SubmitDaySection;
