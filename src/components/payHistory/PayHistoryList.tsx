import React from "react";
import { DailyPay, Settings } from "../../types";
import PayEntryItem from "./PayEntryItem";

interface PayHistoryListProps {
  paysByDate: Record<string, DailyPay[]>;
  openDropdownId: string | null;
  settings: Settings;
  formatCurrency: (amount: number) => string;
  formatDate: (dateStr: string) => string;
  onToggleDropdown: (payId: string) => void;
  onCloseDropdown: () => void;
  onEditPay: (pay: DailyPay) => void;
  onDuplicatePay: (pay: DailyPay) => void;
  onDeletePay: (payId: string) => void;
}

const PayHistoryList: React.FC<PayHistoryListProps> = ({
  paysByDate,
  openDropdownId,
  settings,
  formatCurrency,
  formatDate,
  onToggleDropdown,
  onCloseDropdown,
  onEditPay,
  onDuplicatePay,
  onDeletePay,
}) => {
  if (Object.keys(paysByDate).length === 0) {
    return (
      <div className="text-center py-6">
        <p className={settings.darkMode ? "text-gray-400" : "text-slate-500"}>
          No pay saved yet.
        </p>
        <p
          className={`text-xs mt-1 ${
            settings.darkMode ? "text-gray-500" : "text-slate-400"
          }`}
        >
          Use "Save Pay" in the Calculator tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {Object.entries(paysByDate)
        .sort(
          ([dateA], [dateB]) =>
            new Date(dateB).getTime() - new Date(dateA).getTime()
        )
        .map(([date, pays]: [string, DailyPay[]]) => (
          <div
            key={date}
            className={`${
              settings.darkMode
                ? "bg-gray-700/40 border-gray-600/60"
                : "bg-white/50 border-gray-200/80"
            } p-2 rounded-lg border`}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span
                className={
                  settings.darkMode
                    ? "font-medium text-gray-200"
                    : "font-medium text-slate-700"
                }
              >
                {formatDate(date)}
              </span>
              <span
                className={`text-xs ${
                  settings.darkMode ? "text-gray-400" : "text-slate-500"
                }`}
              >
                {pays.length} submission{pays.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-1.5">
              {pays
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                )
                .map((pay) => (
                  <PayEntryItem
                    key={pay.id}
                    pay={pay}
                    openDropdownId={openDropdownId}
                    settings={settings}
                    formatCurrency={formatCurrency}
                    onToggleDropdown={onToggleDropdown}
                    onCloseDropdown={onCloseDropdown}
                    onEditPay={onEditPay}
                    onDuplicatePay={onDuplicatePay}
                    onDeletePay={onDeletePay}
                  />
                ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default PayHistoryList;
