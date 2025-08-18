import React, { useEffect, useState } from "react";
import { UserProfile, UserRole, Settings } from "../types";
import {
  getAllUsers,
  updateUserRole,
  checkAndDowngradeExpiredSubscriptions,
} from "../services/firestoreStorage";
import type { User } from "firebase/auth";
import { SubscriptionExpiryModal } from "../components/modals";
import {
  AdminStats,
  AdminActions,
  AdminUserList,
  DefaultRoleManager,
} from "../components/admin";

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
          <AdminStats users={users} settings={settings} />

          {/* Actions */}
          <AdminActions
            settings={settings}
            onRefreshUsers={loadUsers}
            onCheckExpiredSubscriptions={handleCheckExpiredSubscriptions}
            checkingExpired={checkingExpired}
          />

          {/* Default Role Manager */}
          <DefaultRoleManager settings={settings} />

          {/* Users List */}
          <AdminUserList
            settings={settings}
            users={users}
            filteredUsers={getFilteredUsers()}
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            statusFilter={statusFilter}
            lastLoginFilter={lastLoginFilter}
            updating={updating}
            onSearchChange={setSearchTerm}
            onRoleFilterChange={setRoleFilter}
            onStatusFilterChange={setStatusFilter}
            onLastLoginFilterChange={setLastLoginFilter}
            onClearFilters={() => {
              setRoleFilter("all");
              setStatusFilter("all");
              setLastLoginFilter("all");
              setSearchTerm("");
            }}
            onRoleUpdate={handleRoleUpdate}
            onExpiryClick={setSelectedUserForExpiry}
            getRoleBadgeColor={getRoleBadgeColor}
            getExpiryStatus={getExpiryStatus}
          />
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
