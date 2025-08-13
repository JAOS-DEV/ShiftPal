import React from "react";
import { Settings } from "../../types";
import { formatDurationWithMinutes } from "../../utils/timeUtils";
import InfoButton from "../ui/InfoButton";

interface TotalPayDisplayProps {
  totalEarnings: number;
  proTaxEnabled: boolean;
  taxAmount: number;
  niAmount: number;
  useManualHours: boolean;
  timeBreakdown: {
    submitted: number;
    unsubmitted: number;
    total: number;
  };
  setShowBreakdownModal: (show: boolean) => void;
  setShowTaxInfoModal: (show: boolean) => void;
  settings: Settings;
  formatCurrency: (amount: number) => string;
}

const TotalPayDisplay: React.FC<TotalPayDisplayProps> = ({
  totalEarnings,
  proTaxEnabled,
  taxAmount,
  niAmount,
  useManualHours,
  timeBreakdown,
  setShowBreakdownModal,
  setShowTaxInfoModal,
  settings,
  formatCurrency,
}) => {
  return (
    <div className="flex-1 px-3 flex items-center justify-center min-h-0">
      <div
        className={`p-3 rounded-lg border shadow-sm w-full max-w-sm flex flex-col justify-center min-h-[100px] ${
          settings.darkMode
            ? "bg-gray-700/50 border-gray-600"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1.5">
            <h3
              className={`text-sm font-bold ${
                settings.darkMode ? "text-gray-100" : "text-slate-700"
              }`}
            >
              Total Pay
            </h3>
            <InfoButton
              onClick={() => setShowTaxInfoModal(true)}
              title="About tax and NI calculations"
              settings={settings}
            />
          </div>
          <p
            className={`text-xl font-bold font-mono mb-2 ${
              settings.darkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {formatCurrency(
              proTaxEnabled
                ? totalEarnings - taxAmount - niAmount
                : totalEarnings
            )}
          </p>

          {/* Time Breakdown Indicator - only show if not manual hours and there are both submitted and unsubmitted entries */}
          {!useManualHours &&
            (timeBreakdown.submitted > 0 || timeBreakdown.unsubmitted > 0) && (
              <div
                className={`mb-2 text-xs ${
                  settings.darkMode ? "text-gray-400" : "text-slate-500"
                }`}
              >
                {timeBreakdown.submitted > 0 &&
                  timeBreakdown.unsubmitted > 0 && (
                    <span>
                      {formatDurationWithMinutes({
                        hours: Math.floor(timeBreakdown.submitted / 60),
                        minutes: timeBreakdown.submitted % 60,
                        totalMinutes: timeBreakdown.submitted,
                      })}{" "}
                      submitted +{" "}
                      {formatDurationWithMinutes({
                        hours: Math.floor(timeBreakdown.unsubmitted / 60),
                        minutes: timeBreakdown.unsubmitted % 60,
                        totalMinutes: timeBreakdown.unsubmitted,
                      })}{" "}
                      unsubmitted
                    </span>
                  )}
                {timeBreakdown.submitted > 0 &&
                  timeBreakdown.unsubmitted === 0 && (
                    <span>
                      {formatDurationWithMinutes({
                        hours: Math.floor(timeBreakdown.submitted / 60),
                        minutes: timeBreakdown.submitted % 60,
                        totalMinutes: timeBreakdown.submitted,
                      })}{" "}
                      submitted
                    </span>
                  )}
                {timeBreakdown.submitted === 0 &&
                  timeBreakdown.unsubmitted > 0 && (
                    <span>
                      {formatDurationWithMinutes({
                        hours: Math.floor(timeBreakdown.unsubmitted / 60),
                        minutes: timeBreakdown.unsubmitted % 60,
                        totalMinutes: timeBreakdown.unsubmitted,
                      })}{" "}
                      unsubmitted
                    </span>
                  )}
              </div>
            )}

          <button
            onClick={() => setShowBreakdownModal(true)}
            className={`w-full py-1.5 px-3 rounded-md transition-colors text-sm font-medium ${
              settings.darkMode
                ? "bg-gray-600 text-gray-100 hover:bg-gray-500"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            View Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};

export default TotalPayDisplay;
