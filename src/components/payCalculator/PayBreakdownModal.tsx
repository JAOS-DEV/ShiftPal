import React from "react";
import { Settings } from "../../types";
import { formatDurationWithMinutes } from "../../utils/timeUtils";

interface PayBreakdownModalProps {
  showBreakdownModal: boolean;
  setShowBreakdownModal: (show: boolean) => void;
  useManualHours: boolean;
  timeBreakdown: {
    submitted: number;
    unsubmitted: number;
    total: number;
  };
  duration: {
    hours: number;
    minutes: number;
    totalMinutes: number;
  };
  overtimeDuration: {
    hours: number;
    minutes: number;
    totalMinutes: number;
  };
  hourlyRate: number;
  overtimeRate: number;
  standardEarnings: number;
  overtimeEarnings: number;
  totalEarnings: number;
  proTaxEnabled: boolean;
  proNiEnabled: boolean;
  taxAmount: number;
  niAmount: number;
  settings: Settings;
  formatCurrency: (amount: number) => string;
}

const PayBreakdownModal: React.FC<PayBreakdownModalProps> = ({
  showBreakdownModal,
  setShowBreakdownModal,
  useManualHours,
  timeBreakdown,
  duration,
  overtimeDuration,
  hourlyRate,
  overtimeRate,
  standardEarnings,
  overtimeEarnings,
  totalEarnings,
  proTaxEnabled,
  proNiEnabled,
  taxAmount,
  niAmount,
  settings,
  formatCurrency,
}) => {
  if (!showBreakdownModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div
        className={`rounded-lg w-full max-w-sm mx-auto max-h-[90vh] overflow-y-auto ${
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
              Pay Breakdown
            </h3>
            <button
              onClick={() => setShowBreakdownModal(false)}
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
          {/* Time Breakdown - only show if not manual hours and there are both submitted and unsubmitted entries */}
          {!useManualHours &&
            (timeBreakdown.submitted > 0 || timeBreakdown.unsubmitted > 0) && (
              <div
                className={`mb-3 p-2 rounded-md ${
                  settings.darkMode ? "bg-gray-700" : "bg-slate-50"
                }`}
              >
                <div
                  className={`text-xs font-medium mb-2 ${
                    settings.darkMode ? "text-gray-300" : "text-slate-600"
                  }`}
                >
                  Time Breakdown:
                </div>
                {timeBreakdown.submitted > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span
                      className={
                        settings.darkMode ? "text-gray-400" : "text-slate-500"
                      }
                    >
                      Submitted:
                    </span>
                    <span
                      className={`font-mono ${
                        settings.darkMode ? "text-gray-300" : "text-slate-600"
                      }`}
                    >
                      {formatDurationWithMinutes({
                        hours: Math.floor(timeBreakdown.submitted / 60),
                        minutes: timeBreakdown.submitted % 60,
                        totalMinutes: timeBreakdown.submitted,
                      })}
                    </span>
                  </div>
                )}
                {timeBreakdown.unsubmitted > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span
                      className={
                        settings.darkMode ? "text-gray-400" : "text-slate-500"
                      }
                    >
                      Unsubmitted:
                    </span>
                    <span
                      className={`font-mono ${
                        settings.darkMode ? "text-gray-300" : "text-slate-600"
                      }`}
                    >
                      {formatDurationWithMinutes({
                        hours: Math.floor(timeBreakdown.unsubmitted / 60),
                        minutes: timeBreakdown.unsubmitted % 60,
                        totalMinutes: timeBreakdown.unsubmitted,
                      })}
                    </span>
                  </div>
                )}
                <div
                  className={`flex justify-between items-center text-xs font-medium mt-1 pt-1 border-t ${
                    settings.darkMode ? "border-gray-600" : "border-slate-200"
                  }`}
                >
                  <span
                    className={
                      settings.darkMode ? "text-gray-200" : "text-slate-700"
                    }
                  >
                    Total:
                  </span>
                  <span
                    className={`font-mono ${
                      settings.darkMode ? "text-gray-100" : "text-slate-800"
                    }`}
                  >
                    {formatDurationWithMinutes({
                      hours: Math.floor(timeBreakdown.total / 60),
                      minutes: timeBreakdown.total % 60,
                      totalMinutes: timeBreakdown.total,
                    })}
                  </span>
                </div>
              </div>
            )}

          {/* Standard Hours */}
          <div className="flex justify-between items-center">
            <span
              className={`text-sm ${
                settings.darkMode ? "text-gray-300" : "text-slate-600"
              }`}
            >
              Standard Hours:
            </span>
            <span
              className={`font-mono text-base font-medium ${
                settings.darkMode ? "text-gray-100" : "text-slate-800"
              }`}
            >
              {duration.hours}:{duration.minutes.toString().padStart(2, "0")} @{" "}
              {formatCurrency(hourlyRate)}
            </span>
          </div>

          {/* Standard Pay */}
          <div className="flex justify-between items-center">
            <span
              className={`text-sm ${
                settings.darkMode ? "text-gray-300" : "text-slate-600"
              }`}
            >
              Standard Pay:
            </span>
            <span
              className={`font-mono text-base font-medium ${
                settings.darkMode ? "text-gray-100" : "text-slate-800"
              }`}
            >
              {formatCurrency(standardEarnings)}
            </span>
          </div>

          {/* Overtime Section - only show if overtime hours > 0 */}
          {overtimeDuration.totalMinutes > 0 && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-600">Overtime Hours:</span>
                <span className="font-mono text-base font-medium text-orange-600">
                  {overtimeDuration.hours}:
                  {overtimeDuration.minutes.toString().padStart(2, "0")} @{" "}
                  {formatCurrency(overtimeRate || hourlyRate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-600">Overtime Pay:</span>
                <span className="font-mono text-base font-medium text-orange-600">
                  {formatCurrency(overtimeEarnings)}
                </span>
              </div>
            </>
          )}

          {/* Tax Section - only show if tax calculations are enabled */}
          {proTaxEnabled && taxAmount > 0 && (
            <div className="pt-2 border-t border-red-200 mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-red-600">
                  Tax ({Math.round(settings.taxRate * 100)}%)
                </span>
                <span className="font-mono text-base font-medium text-red-700">
                  -{formatCurrency(taxAmount)}
                </span>
              </div>
            </div>
          )}

          {/* NI Section - only show if NI calculations are enabled */}
          {proNiEnabled && niAmount > 0 && (
            <div className="pt-2 border-t border-orange-200 mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-orange-600">NI (12%/2%)</span>
                <span className="font-mono text-base font-medium text-orange-700">
                  -{formatCurrency(niAmount)}
                </span>
              </div>
            </div>
          )}

          {/* Total Pay */}
          <div
            className={`pt-2 border-t mt-2 ${
              settings.darkMode ? "border-gray-600" : "border-slate-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <span
                className={`text-base font-bold ${
                  settings.darkMode ? "text-gray-200" : "text-slate-700"
                }`}
              >
                Total Pay:
              </span>
              <span
                className={`font-mono text-xl font-bold ${
                  settings.darkMode ? "text-gray-100" : "text-slate-700"
                }`}
              >
                {formatCurrency(
                  proTaxEnabled || proNiEnabled
                    ? totalEarnings - taxAmount - niAmount
                    : totalEarnings
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayBreakdownModal;
