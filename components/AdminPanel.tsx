import React, { useEffect, useState } from "react";
import { UserProfile, UserRole, Settings } from "../types";
import {
  getAllUsers,
  updateUserRole,
  checkAndDowngradeExpiredSubscriptions,
} from "../services/firestoreStorage";
import type { User } from "firebase/auth";
import SubscriptionExpiryModal from "./SubscriptionExpiryModal";

interface AdminPanelProps {
  user: User;
  settings: Settings;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, settings }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedUserForExpiry, setSelectedUserForExpiry] =
    useState<UserProfile | null>(null);
  const [checkingExpired, setCheckingExpired] = useState(false);
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "expired" | "no-sub"
  >("all");
  const [lastLoginFilter, setLastLoginFilter] = useState<
    "all" | "today" | "week" | "month" | "never"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (uid: string, newRole: UserRole) => {
    try {
      // Confirm role change
      const selfChange = uid === user.uid;
      const confirmMsg =
        selfChange && newRole !== "admin"
          ? "You are changing your own role and may lose admin access. Are you sure?"
          : `Change role for this user to "${newRole}"?`;
      if (!confirm(confirmMsg)) return;

      setUpdating(uid);
      await updateUserRole(uid, newRole);
      await loadUsers();
      showToast("Role updated successfully");
    } catch (error) {
      console.error("Error updating user role:", error);
      showToast("Failed to update user role");
    } finally {
      setUpdating(null);
    }
  };

  const handleCheckExpiredSubscriptions = async () => {
    try {
      setCheckingExpired(true);
      const result = await checkAndDowngradeExpiredSubscriptions();

      if (result.downgraded > 0) {
        showToast(`${result.downgraded} expired subscriptions downgraded`);
        await loadUsers(); // Refresh the user list
      } else {
        showToast("No expired subscriptions found");
      }

      if (result.errors.length > 0) {
        console.error("Errors during subscription check:", result.errors);
        showToast(`Check completed with ${result.errors.length} errors`);
      }
    } catch (error) {
      console.error("Error checking expired subscriptions:", error);
      showToast("Failed to check expired subscriptions");
    } finally {
      setCheckingExpired(false);
    }
  };

  const getExpiryStatus = (userProfile: UserProfile) => {
    if (!userProfile.proUntil) return null;

    const expiryDate = new Date(userProfile.proUntil);
    const now = new Date();
    const isExpired = expiryDate < now;
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return { isExpired, daysUntilExpiry, expiryDate };
  };

  const getRoleBadgeColor = (role: UserRole) => {
    if (settings.darkMode) {
      switch (role) {
        case "admin":
          return "bg-red-900/50 text-red-300 border-red-700";
        case "pro":
          return "bg-green-900/50 text-green-300 border-green-700";
        case "beta":
          return "bg-indigo-900/50 text-indigo-300 border-indigo-700";
        case "free":
          return "bg-gray-700/50 text-gray-300 border-gray-600";
        default:
          return "bg-gray-700/50 text-gray-300 border-gray-600";
      }
    } else {
      switch (role) {
        case "admin":
          return "bg-red-100 text-red-800 border-red-200";
        case "pro":
          return "bg-green-100 text-green-800 border-green-200";
        case "beta":
          return "bg-indigo-100 text-indigo-800 border-indigo-200";
        case "free":
          return "bg-gray-100 text-gray-800 border-gray-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    }
  };

  const getFilteredUsers = () => {
    return users.filter((userProfile) => {
      // Role filter
      if (roleFilter !== "all" && userProfile.role !== roleFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const expiryStatus = getExpiryStatus(userProfile);
        if (statusFilter === "active") {
          if (!userProfile.proUntil || expiryStatus?.isExpired) {
            return false;
          }
        } else if (statusFilter === "expired") {
          if (!userProfile.proUntil || !expiryStatus?.isExpired) {
            return false;
          }
        } else if (statusFilter === "no-sub") {
          if (userProfile.proUntil) {
            return false;
          }
        }
      }

      // Last login filter
      if (lastLoginFilter !== "all") {
        if (!userProfile.lastLoginAt) {
          if (lastLoginFilter !== "never") {
            return false;
          }
        } else {
          const lastLogin = new Date(userProfile.lastLoginAt);
          const now = new Date();
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

          if (lastLoginFilter === "today" && lastLogin < today) {
            return false;
          } else if (lastLoginFilter === "week" && lastLogin < weekAgo) {
            return false;
          } else if (lastLoginFilter === "month" && lastLogin < monthAgo) {
            return false;
          } else if (lastLoginFilter === "never") {
            return false;
          }
        }
      }

      // Search filter
      if (
        searchTerm &&
        !userProfile.email.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  };

  if (loading) {
    return (
      <div
        className={`p-4 text-center ${
          settings.darkMode ? "text-gray-300" : "text-slate-800"
        }`}
      >
        <div
          className={`text-sm ${
            settings.darkMode ? "text-gray-400" : "text-slate-500"
          }`}
        >
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-full flex flex-col ${
        settings.darkMode
          ? "bg-gray-800 text-gray-100"
          : "bg-[#FAF7F0] text-[#003D5B]"
      }`}
    >
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 text-sm px-3 py-1.5 rounded shadow ${
            settings.darkMode
              ? "bg-gray-700 text-gray-100"
              : "bg-slate-800 text-white"
          }`}
        >
          {toastMessage}
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2
              className={`text-lg font-bold ${
                settings.darkMode ? "text-gray-100" : "text-slate-800"
              }`}
            >
              Admin Panel
            </h2>
            <p
              className={`text-xs mt-1 ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              Manage user accounts and roles
            </p>
          </div>

          {/* Stats */}
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

          {/* Actions */}
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
                onClick={loadUsers}
                className={`flex-1 font-bold py-1.5 px-3 rounded-md transition-colors text-sm ${
                  settings.darkMode
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Refresh Users
              </button>
              <button
                onClick={handleCheckExpiredSubscriptions}
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

          {/* Users List */}
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
              Users ({getFilteredUsers().length})
            </h3>

            {/* Filters */}
            <div className="space-y-2 mb-3">
              {/* Search */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    setRoleFilter(e.target.value as UserRole | "all")
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
                    setStatusFilter(
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
                    setLastLoginFilter(
                      e.target.value as
                        | "all"
                        | "today"
                        | "week"
                        | "month"
                        | "never"
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
                    onClick={() => {
                      setRoleFilter("all");
                      setStatusFilter("all");
                      setLastLoginFilter("all");
                      setSearchTerm("");
                    }}
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

            <div className="space-y-2">
              {getFilteredUsers().length > 0 ? (
                getFilteredUsers().map((userProfile) => (
                  <div
                    key={userProfile.uid}
                    className={`flex items-center justify-between p-2 rounded border ${
                      settings.darkMode
                        ? "bg-gray-700/50 border-gray-600/50"
                        : "bg-white/50 border-gray-200/50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {userProfile.email}
                      </div>
                      <div
                        className={`text-xs ${
                          settings.darkMode ? "text-gray-400" : "text-slate-500"
                        }`}
                      >
                        Created:{" "}
                        {new Date(userProfile.createdAt).toLocaleDateString()}
                        {userProfile.lastLoginAt && (
                          <>
                            <br />
                            Last login:{" "}
                            {new Date(userProfile.lastLoginAt).toLocaleString()}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-1.5 py-0.5 rounded-full border text-xs font-medium ${getRoleBadgeColor(
                            userProfile.role
                          )}`}
                        >
                          {userProfile.role}
                        </span>
                        {userProfile.proUntil && (
                          <div className="text-xs">
                            <span
                              className={`${
                                getExpiryStatus(userProfile)?.isExpired
                                  ? settings.darkMode
                                    ? "text-red-400"
                                    : "text-red-600"
                                  : settings.darkMode
                                  ? "text-green-400"
                                  : "text-green-600"
                              }`}
                            >
                              {getExpiryStatus(userProfile)?.isExpired
                                ? "Expired"
                                : `${
                                    getExpiryStatus(userProfile)
                                      ?.daysUntilExpiry
                                  }d left`}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <select
                          value={userProfile.role}
                          onChange={(e) =>
                            handleRoleUpdate(
                              userProfile.uid,
                              e.target.value as UserRole
                            )
                          }
                          disabled={updating === userProfile.uid}
                          className={`text-xs border rounded px-1 py-0.5 ${
                            settings.darkMode
                              ? "bg-gray-800 border-gray-600 text-gray-100"
                              : "bg-white border-slate-300 text-slate-800"
                          }`}
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="beta">Beta Tester</option>
                          <option value="admin">Admin</option>
                        </select>
                        {(userProfile.role === "pro" ||
                          userProfile.role === "beta") && (
                          <button
                            onClick={() =>
                              setSelectedUserForExpiry(userProfile)
                            }
                            className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                              settings.darkMode
                                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                                : "border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            Expiry
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
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
        </div>
      </div>

      {/* Subscription Expiry Modal */}
      {selectedUserForExpiry && (
        <SubscriptionExpiryModal
          user={selectedUserForExpiry}
          isOpen={!!selectedUserForExpiry}
          onClose={() => setSelectedUserForExpiry(null)}
          onUpdate={loadUsers}
          settings={settings}
        />
      )}
    </div>
  );
};

export default AdminPanel;
