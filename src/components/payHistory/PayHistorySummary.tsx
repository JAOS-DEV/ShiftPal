import React from "react";
import { Settings } from "../../types";
import PayGoalProgressBar from "./PayGoalProgressBar";

interface PayHistorySummaryProps {
  periodTotals: {
    totalPay: number;
    standardPay: number;
    overtimePay: number;
    totalHours: number;
    totalMinutes: number;
    totalTax: number;
    afterTaxPay: number;
    totalNI: number;
    afterNIPay: number;
  };
  selectedPeriod: string;
  settings: Settings;
  formatCurrency: (amount: number) => string;
}

const PayHistorySummary: React.FC<PayHistorySummaryProps> = ({
  periodTotals,
  selectedPeriod,
  settings,
  formatCurrency,
}) => {
  return (
    <div
      className={`p-1.5 rounded-lg border ${
        settings.darkMode
          ? "bg-gray-700/50 border-gray-600"
          : "bg-white/50 border-gray-200/80"
      }`}
    >
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        {/* Row 1: Standard Pay vs Overtime Pay */}
        <div>
          <span
            className={settings.darkMode ? "text-gray-400" : "text-slate-500"}
          >
            Total Standard Pay:
          </span>
          <div
            className={`font-bold ${
              settings.darkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {formatCurrency(periodTotals.standardPay)}
          </div>
        </div>
        <div>
          <span
            className={settings.darkMode ? "text-gray-400" : "text-slate-500"}
          >
            Total Overtime Pay:
          </span>
          <div className="font-bold text-orange-500">
            {formatCurrency(periodTotals.overtimePay)}
          </div>
        </div>

        {/* Row 2: Tax vs NI (only show if enabled in settings) */}
        {settings.enableTaxCalculations && periodTotals.totalTax > 0 && (
          <div>
            <span
              className={settings.darkMode ? "text-gray-400" : "text-slate-500"}
            >
              Total Tax:
            </span>
            <div className="font-bold text-red-500">
              {formatCurrency(periodTotals.totalTax)}
            </div>
          </div>
        )}
        {settings.enableNiCalculations && periodTotals.totalNI > 0 && (
          <div>
            <span
              className={settings.darkMode ? "text-gray-400" : "text-slate-500"}
            >
              Total NI:
            </span>
            <div className="font-bold text-orange-500">
              {formatCurrency(periodTotals.totalNI)}
            </div>
          </div>
        )}

        {/* Row 3: Hours vs Final Total */}
        <div>
          <span
            className={settings.darkMode ? "text-gray-400" : "text-slate-500"}
          >
            Total Hours:
          </span>
          <div
            className={`font-bold ${
              settings.darkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {Math.floor(
              periodTotals.totalHours + periodTotals.totalMinutes / 60
            )}
            h {periodTotals.totalMinutes % 60}m
          </div>
        </div>
        <div>
          <span
            className={settings.darkMode ? "text-gray-400" : "text-slate-500"}
          >
            Final Total:
          </span>
          <div className="font-bold text-green-500">
            {formatCurrency(
              settings.enableTaxCalculations && settings.enableNiCalculations
                ? periodTotals.totalPay -
                    periodTotals.totalTax -
                    periodTotals.totalNI
                : settings.enableTaxCalculations
                ? periodTotals.afterTaxPay
                : settings.enableNiCalculations
                ? periodTotals.afterNIPay
                : periodTotals.totalPay
            )}
          </div>
        </div>
      </div>

      {/* Pay Goals Progress Bars */}
      {selectedPeriod === "week" && settings.weeklyGoal > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <PayGoalProgressBar
            current={periodTotals.totalPay}
            goal={settings.weeklyGoal}
            label="Weekly Goal"
            settings={settings}
            formatCurrency={formatCurrency}
          />
        </div>
      )}
      {selectedPeriod === "month" && settings.monthlyGoal > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <PayGoalProgressBar
            current={periodTotals.totalPay}
            goal={settings.monthlyGoal}
            label="Monthly Goal"
            settings={settings}
            formatCurrency={formatCurrency}
          />
        </div>
      )}
    </div>
  );
};

export default PayHistorySummary;
