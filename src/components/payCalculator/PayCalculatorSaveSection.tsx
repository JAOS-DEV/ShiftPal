import React from "react";
import { Settings } from "../../types";
import InfoButton from "../ui/InfoButton";

interface PayCalculatorSaveSectionProps {
  payDate: string;
  setPayDate: (date: string) => void;
  submissionsForDate: any[];
  setShowDateInfoModal: (show: boolean) => void;
  handleSavePay: () => void;
  totalEarnings: number;
  settings: Settings;
}

const PayCalculatorSaveSection: React.FC<PayCalculatorSaveSectionProps> = ({
  payDate,
  setPayDate,
  submissionsForDate,
  setShowDateInfoModal,
  handleSavePay,
  totalEarnings,
  settings,
}) => {
  return (
    <div className="flex-shrink-0 p-3 space-y-1.5 pb-4">
      {/* Date Picker */}
      <div
        className={`${
          settings.darkMode
            ? "bg-gray-700/50 border border-gray-600/80"
            : "bg-white/50 border border-gray-200/80"
        } p-1 rounded-lg`}
      >
        <div className="flex items-center justify-center gap-1 mb-0.5">
          <label
            className={`text-xs font-medium text-center ${
              settings.darkMode ? "text-gray-300" : "text-slate-600"
            }`}
          >
            Select date ({submissionsForDate.length} submissions)
          </label>
                     <InfoButton
             onClick={() => setShowDateInfoModal(true)}
             title="About pay date selection"
             settings={settings}
           />
        </div>
        <input
          type="date"
          value={payDate}
          onChange={(e) => setPayDate(e.target.value)}
          className={`w-5/6 p-0.5 text-sm bg-transparent border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 mx-auto block ${
            settings.darkMode
              ? "border-gray-600 text-gray-100"
              : "border-slate-300 text-slate-800"
          }`}
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSavePay}
        disabled={totalEarnings <= 0}
        className={`w-full py-1.5 px-3 rounded-lg font-bold transition-colors text-sm ${
          totalEarnings > 0
            ? "bg-gray-700 text-white hover:bg-gray-600"
            : "bg-slate-300 text-slate-500 cursor-not-allowed"
        }`}
      >
        Save Pay
      </button>
      <p
        className={`text-[11px] -mt-1 text-center ${
          settings.darkMode ? "text-gray-400" : "text-slate-500"
        }`}
      >
        Saves today's pay to History. Change the date to save a past day.
      </p>
    </div>
  );
};

export default PayCalculatorSaveSection;
