import React from "react";
import { DailyPay, Settings } from "../../types";

interface PayEntryDropdownProps {
  pay: DailyPay;
  openDropdownId: string | null;
  settings: Settings;
  onToggleDropdown: (payId: string) => void;
  onCloseDropdown: () => void;
  onEditPay: (pay: DailyPay) => void;
  onDuplicatePay: (pay: DailyPay) => void;
  onDeletePay: (payId: string) => void;
}

const PayEntryDropdown: React.FC<PayEntryDropdownProps> = ({
  pay,
  openDropdownId,
  settings,
  onToggleDropdown,
  onCloseDropdown,
  onEditPay,
  onDuplicatePay,
  onDeletePay,
}) => {
  return (
    <div className="relative dropdown-menu">
      <button
        onClick={() => onToggleDropdown(pay.id)}
        className={`${
          settings.darkMode
            ? "text-gray-400 hover:text-gray-200"
            : "text-slate-500 hover:text-slate-700"
        } p-1`}
        title="More options"
      >
        ⋮
      </button>
      {openDropdownId === pay.id && (
        <div
          className={`absolute right-0 top-6 rounded-lg shadow-lg z-10 min-w-[120px] border ${
            settings.darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <button
            onClick={() => {
              onEditPay(pay);
              onCloseDropdown();
            }}
            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${
              settings.darkMode
                ? "hover:bg-gray-700 text-gray-100"
                : "hover:bg-gray-100"
            }`}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => {
              onDuplicatePay(pay);
              onCloseDropdown();
            }}
            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${
              settings.darkMode
                ? "hover:bg-gray-700 text-gray-100"
                : "hover:bg-gray-100"
            }`}
          >
            📋 Duplicate
          </button>
          <button
            onClick={() => {
              onDeletePay(pay.id);
              onCloseDropdown();
            }}
            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${
              settings.darkMode
                ? "hover:bg-red-900/30 text-red-400"
                : "hover:bg-red-50 text-red-600"
            }`}
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default PayEntryDropdown;
