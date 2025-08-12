import React from "react";
import { UserProfile, Settings } from "../../types";

interface AdminStatsProps {
  users: UserProfile[];
  settings: Settings;
}

const AdminStats: React.FC<AdminStatsProps> = ({ users, settings }) => {
  return (
    <div className="space-y-2">
      <h3
        className={`text-sm font-bold ${
          settings.darkMode ? "text-gray-200" : "text-slate-700"
        }`}
      >
        Account Statistics
      </h3>
      <div className="grid grid-cols-6 gap-1">
        <div
          className={`rounded p-1.5 border text-center ${
            settings.darkMode
              ? "bg-gray-800/50 border-gray-700/80"
              : "bg-white/50 border-gray-200/80"
          }`}
        >
          <div
            className={`text-sm font-bold ${
              settings.darkMode ? "text-gray-100" : "text-slate-800"
            }`}
          >
            {users.filter((u) => u.role === "free").length}
          </div>
          <div
            className={`text-xs ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            Free
          </div>
        </div>
        <div
          className={`rounded p-1.5 border text-center ${
            settings.darkMode
              ? "bg-gray-800/50 border-gray-700/80"
              : "bg-white/50 border-gray-200/80"
          }`}
        >
          <div
            className={`text-sm font-bold ${
              settings.darkMode ? "text-gray-100" : "text-slate-800"
            }`}
          >
            {users.filter((u) => u.role === "pro").length}
          </div>
          <div
            className={`text-xs ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            Pro
          </div>
        </div>
        <div
          className={`rounded p-1.5 border text-center ${
            settings.darkMode
              ? "bg-gray-800/50 border-gray-700/80"
              : "bg-white/50 border-gray-200/80"
          }`}
        >
          <div
            className={`text-sm font-bold ${
              settings.darkMode ? "text-gray-100" : "text-slate-800"
            }`}
          >
            {users.filter((u) => u.role === "beta").length}
          </div>
          <div
            className={`text-xs ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            Beta
          </div>
        </div>
        <div
          className={`rounded p-1.5 border text-center ${
            settings.darkMode
              ? "bg-gray-800/50 border-gray-700/80"
              : "bg-white/50 border-gray-200/80"
          }`}
        >
          <div
            className={`text-sm font-bold ${
              settings.darkMode ? "text-gray-100" : "text-slate-800"
            }`}
          >
            {users.filter((u) => u.role === "admin").length}
          </div>
          <div
            className={`text-xs ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            Admin
          </div>
        </div>
        <div
          className={`rounded p-1.5 border text-center ${
            settings.darkMode
              ? "bg-gray-800/50 border-gray-700/80"
              : "bg-white/50 border-gray-200/80"
          }`}
        >
          <div
            className={`text-sm font-bold ${
              settings.darkMode ? "text-gray-100" : "text-slate-800"
            }`}
          >
            {
              users.filter(
                (u) => u.proUntil && new Date(u.proUntil) < new Date()
              ).length
            }
          </div>
          <div
            className={`text-xs ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            Expired
          </div>
        </div>
        <div
          className={`rounded p-1.5 border text-center ${
            settings.darkMode
              ? "bg-gray-800/50 border-gray-700/80"
              : "bg-white/50 border-gray-200/80"
          }`}
        >
          <div
            className={`text-sm font-bold ${
              settings.darkMode ? "text-gray-100" : "text-slate-800"
            }`}
          >
            {
              users.filter(
                (u) =>
                  u.role === "pro" &&
                  u.proUntil &&
                  new Date(u.proUntil) >= new Date()
              ).length
            }
          </div>
          <div
            className={`text-xs ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            Active
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
