import React from "react";
import { UserRole, Settings } from "../../types";

interface AdminFiltersProps {
  settings: Settings;
  searchTerm: string;
  roleFilter: UserRole | "all";
  statusFilter: "all" | "active" | "expired" | "no-sub";
  lastLoginFilter: "all" | "today" | "week" | "month" | "never";
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: UserRole | "all") => void;
  onStatusFilterChange: (
    value: "all" | "active" | "expired" | "no-sub"
  ) => void;
  onLastLoginFilterChange: (
    value: "all" | "today" | "week" | "month" | "never"
  ) => void;
  onClearFilters: () => void;
}

const AdminFilters: React.FC<AdminFiltersProps> = ({
  settings,
  searchTerm,
  roleFilter,
  statusFilter,
  lastLoginFilter,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onLastLoginFilterChange,
  onClearFilters,
}) => {
  return (
    <div className="space-y-2 mb-3">
      {/* Search */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`flex-1 text-xs border rounded px-2 py-1 ${
            settings.darkMode
              ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400"
              : "bg-white border-slate-300 text-slate-800 placeholder-slate-500"
          }`}
        />
      </div>

      {/* Role and Status Filters */}
      <div className="flex gap-2">
        <select
          value={roleFilter}
          onChange={(e) =>
            onRoleFilterChange(e.target.value as UserRole | "all")
          }
          className={`text-xs border rounded px-2 py-1 ${
            settings.darkMode
              ? "bg-gray-800 border-gray-600 text-gray-100"
              : "bg-white border-slate-300 text-slate-800"
          }`}
        >
          <option value="all">All Roles</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="beta">Beta</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            onStatusFilterChange(
              e.target.value as "all" | "active" | "expired" | "no-sub"
            )
          }
          className={`text-xs border rounded px-2 py-1 ${
            settings.darkMode
              ? "bg-gray-800 border-gray-600 text-gray-100"
              : "bg-white border-slate-300 text-slate-800"
          }`}
        >
          <option value="all">All Status</option>
          <option value="active">Active Subs</option>
          <option value="expired">Expired Subs</option>
          <option value="no-sub">No Subscription</option>
        </select>

        <select
          value={lastLoginFilter}
          onChange={(e) =>
            onLastLoginFilterChange(
              e.target.value as "all" | "today" | "week" | "month" | "never"
            )
          }
          className={`text-xs border rounded px-2 py-1 ${
            settings.darkMode
              ? "bg-gray-800 border-gray-600 text-gray-100"
              : "bg-white border-slate-300 text-slate-800"
          }`}
        >
          <option value="all">All Times</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="never">Never</option>
        </select>

        {/* Clear Filters */}
        {(roleFilter !== "all" ||
          statusFilter !== "all" ||
          lastLoginFilter !== "all" ||
          searchTerm) && (
          <button
            onClick={onClearFilters}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              settings.darkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminFilters;
