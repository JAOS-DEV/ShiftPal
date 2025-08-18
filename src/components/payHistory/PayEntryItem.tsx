import React from "react";
import { DailyPay, Settings } from "../../types";
import PayEntryDropdown from "./PayEntryDropdown";

interface PayEntryItemProps {
  pay: DailyPay;
  openDropdownId: string | null;
  settings: Settings;
  formatCurrency: (amount: number) => string;
  onToggleDropdown: (payId: string) => void;
  onCloseDropdown: () => void;
  onEditPay: (pay: DailyPay) => void;
  onDuplicatePay: (pay: DailyPay) => void;
  onDeletePay: (payId: string) => void;
}

const PayEntryItem: React.FC<PayEntryItemProps> = ({
  pay,
  openDropdownId,
  settings,
  formatCurrency,
  onToggleDropdown,
  onCloseDropdown,
  onEditPay,
  onDuplicatePay,
  onDeletePay,
}) => {
  return (
    <div
      className={`border-l-2 pl-3 relative ${
        settings.darkMode ? "border-gray-600" : "border-slate-200"
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <div>
          <span
            className={`text-xs ${
              settings.darkMode ? "text-gray-400" : "text-slate-400"
            }`}
          >
            Submitted at: {pay.submissionTime}
          </span>
          <div
            className={`text-xs ${
              settings.enableTaxCalculations || settings.enableNiCalculations
                ? settings.darkMode
                  ? "text-gray-400"
                  : "text-slate-500"
                : "text-green-600"
            }`}
          >
            {settings.enableTaxCalculations || settings.enableNiCalculations
              ? `Total (before deductions): ${formatCurrency(pay.totalPay)}`
              : `Total: ${formatCurrency(pay.totalPay)}`}
          </div>
        </div>
        <PayEntryDropdown
          pay={pay}
          openDropdownId={openDropdownId}
          settings={settings}
          onToggleDropdown={onToggleDropdown}
          onCloseDropdown={onCloseDropdown}
          onEditPay={onEditPay}
          onDuplicatePay={onDuplicatePay}
          onDeletePay={onDeletePay}
        />
      </div>

      <div
        className={`text-xs ${
          settings.darkMode ? "text-gray-300" : "text-slate-600"
        } ${
          pay.overtimeHours > 0 || pay.overtimeMinutes > 0
            ? "grid grid-cols-2 gap-2"
            : ""
        }`}
      >
        <div>
          <span>Standard:</span>
          <div className="font-mono">
            {pay.standardHours}:
            {pay.standardMinutes.toString().padStart(2, "0")} @{" "}
            {formatCurrency(pay.standardRate)}
          </div>
          <div className="font-mono">{formatCurrency(pay.standardPay)}</div>
        </div>
        {pay.overtimeHours > 0 || pay.overtimeMinutes > 0 ? (
          <div>
            <span>Overtime:</span>
            <div className="font-mono">
              {pay.overtimeHours}:
              {pay.overtimeMinutes.toString().padStart(2, "0")} @{" "}
              {formatCurrency(pay.overtimeRate)}
            </div>
            <div className="font-mono text-orange-500">
              {formatCurrency(pay.overtimePay)}
            </div>
          </div>
        ) : null}
      </div>

      {/* Show individual breakdowns when only one is enabled */}
      {settings.enableTaxCalculations &&
        !settings.enableNiCalculations &&
        (() => {
          const taxAmount = pay.taxAmount || pay.totalPay * settings.taxRate;
          const afterTaxPay = pay.totalPay - taxAmount;
          return taxAmount > 0 ? (
            <>
              <div className="mt-1 text-xs text-red-600">
                Tax: -{formatCurrency(taxAmount)}
              </div>
              <div className="mt-1 text-xs text-green-600">
                Final Total: {formatCurrency(afterTaxPay)}
              </div>
            </>
          ) : null;
        })()}
      {settings.enableNiCalculations &&
        !settings.enableTaxCalculations &&
        (() => {
          const calculateNI = (earnings: number): number => {
            const dailyNiThreshold = 34.44;
            const niRate = 0.12;
            if (earnings <= dailyNiThreshold) return 0;
            const taxableEarnings = earnings - dailyNiThreshold;
            const niAmount = taxableEarnings * niRate;
            return niAmount;
          };
          const niAmount = pay.niAmount || calculateNI(pay.totalPay);
          const afterNiPay = pay.totalPay - niAmount;
          return niAmount > 0 ? (
            <>
              <div className="mt-1 text-xs text-orange-600">
                NI: -{formatCurrency(niAmount)}
              </div>
              <div className="mt-1 text-xs text-green-600">
                Final Total: {formatCurrency(afterNiPay)}
              </div>
            </>
          ) : null;
        })()}
      {/* Show simplified breakdown when both are enabled */}
      {settings.enableTaxCalculations &&
        settings.enableNiCalculations &&
        (() => {
          const taxAmount = pay.taxAmount || pay.totalPay * settings.taxRate;
          const calculateNI = (earnings: number): number => {
            const dailyNiThreshold = 34.44;
            const niRate = 0.12;
            if (earnings <= dailyNiThreshold) return 0;
            const taxableEarnings = earnings - dailyNiThreshold;
            return taxableEarnings * niRate;
          };
          const niAmount = pay.niAmount || calculateNI(pay.totalPay);
          const finalTotal = pay.totalPay - taxAmount - niAmount;
          return (
            <>
              {taxAmount > 0 && (
                <div className="mt-1 text-xs text-red-600">
                  Tax: -{formatCurrency(taxAmount)}
                </div>
              )}
              {niAmount > 0 && (
                <div className="mt-1 text-xs text-orange-600">
                  NI: -{formatCurrency(niAmount)}
                </div>
              )}
              <div className="mt-1 text-xs text-green-600">
                Final Total: {formatCurrency(finalTotal)}
              </div>
            </>
          );
        })()}

      {/* Show notes if they exist */}
      {pay.notes && pay.notes.trim() !== "" && (
        <div
          className={`mt-1 text-xs italic ${
            settings.darkMode ? "text-gray-400" : "text-slate-500"
          }`}
        >
          💬 {pay.notes}
        </div>
      )}
    </div>
  );
};

export default PayEntryItem;
