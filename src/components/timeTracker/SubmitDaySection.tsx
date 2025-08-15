import React from "react";
import { Settings } from "../../types";
import InfoButton from "../ui/InfoButton";

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
          <InfoButton
            onClick={onShowSubmissionInfoModal}
            title="What is a submission?"
            settings={settings}
          />
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
