import React from "react";
import { UserProfile, UserRole, Settings } from "../../types";
import AdminFilters from "./AdminFilters";
import AdminUserItem from "./AdminUserItem";

interface AdminUserListProps {
  settings: Settings;
  users: UserProfile[];
  filteredUsers: UserProfile[];
  searchTerm: string;
  roleFilter: UserRole | "all";
  statusFilter: "all" | "active" | "expired" | "no-sub";
  lastLoginFilter: "all" | "today" | "week" | "month" | "never";
  updating: string | null;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: UserRole | "all") => void;
  onStatusFilterChange: (
    value: "all" | "active" | "expired" | "no-sub"
  ) => void;
  onLastLoginFilterChange: (
    value: "all" | "today" | "week" | "month" | "never"
  ) => void;
  onClearFilters: () => void;
  onRoleUpdate: (uid: string, newRole: UserRole) => void;
  onExpiryClick: (user: UserProfile) => void;
  getRoleBadgeColor: (role: UserRole) => string;
  getExpiryStatus: (userProfile: UserProfile) => {
    isExpired: boolean;
    daysUntilExpiry: number;
    expiryDate: Date;
  } | null;
}

const AdminUserList: React.FC<AdminUserListProps> = ({
  settings,
  users,
  filteredUsers,
  searchTerm,
  roleFilter,
  statusFilter,
  lastLoginFilter,
  updating,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onLastLoginFilterChange,
  onClearFilters,
  onRoleUpdate,
  onExpiryClick,
  getRoleBadgeColor,
  getExpiryStatus,
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
        Users ({filteredUsers.length})
      </h3>

      <AdminFilters
        settings={settings}
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        lastLoginFilter={lastLoginFilter}
        onSearchChange={onSearchChange}
        onRoleFilterChange={onRoleFilterChange}
        onStatusFilterChange={onStatusFilterChange}
        onLastLoginFilterChange={onLastLoginFilterChange}
        onClearFilters={onClearFilters}
      />

      <div className="space-y-2">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((userProfile) => (
            <AdminUserItem
              key={userProfile.uid}
              userProfile={userProfile}
              settings={settings}
              updating={updating}
              onRoleUpdate={onRoleUpdate}
              onExpiryClick={onExpiryClick}
              getRoleBadgeColor={getRoleBadgeColor}
              getExpiryStatus={getExpiryStatus}
            />
          ))
        ) : (
          <div
            className={`p-4 text-center rounded border ${
              settings.darkMode
                ? "bg-gray-700/30 border-gray-600/50"
                : "bg-white/30 border-gray-200/50"
            }`}
          >
            <div
              className={`text-sm font-medium mb-1 ${
                settings.darkMode ? "text-gray-300" : "text-slate-700"
              }`}
            >
              No users found
            </div>
            <div
              className={`text-xs ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              Try adjusting your filters or search terms
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserList;
