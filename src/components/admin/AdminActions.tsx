import React from "react";
import { Settings } from "../../types";

interface AdminActionsProps {
  settings: Settings;
  onRefreshUsers: () => void;
  onCheckExpiredSubscriptions: () => void;
  checkingExpired: boolean;
}

const AdminActions: React.FC<AdminActionsProps> = ({
  settings,
  onRefreshUsers,
  onCheckExpiredSubscriptions,
  checkingExpired,
}) => {
  return (
    <div
      className={`rounded-lg p-2 border ${
        settings.darkMode
          ? "bg-gray-800/50 border-gray-700/80"
          : "bg-white/50 border-gray-200/80"
      }`}
    >
      <h3
        className={`text-sm font-bold mb-2 ${
          settings.darkMode ? "text-gray-200" : "text-slate-700"
        }`}
      >
        Actions
      </h3>
      <div className="flex gap-2">
        <button
          onClick={onRefreshUsers}
          className={`flex-1 font-bold py-1.5 px-3 rounded-md transition-colors text-sm ${
            settings.darkMode
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Refresh Users
        </button>
        <button
          onClick={onCheckExpiredSubscriptions}
          disabled={checkingExpired}
          className={`flex-1 font-bold py-1.5 px-3 rounded-md transition-colors text-sm ${
            settings.darkMode
              ? "bg-orange-600 text-white hover:bg-orange-500 disabled:bg-orange-800"
              : "bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300"
          }`}
        >
          {checkingExpired ? "Checking..." : "Check Expired Subs"}
        </button>
      </div>
    </div>
  );
};

export default AdminActions;
