import React from "react";
import { UserProfile, UserRole, Settings } from "../../types";

interface AdminUserItemProps {
  userProfile: UserProfile;
  settings: Settings;
  updating: string | null;
  onRoleUpdate: (uid: string, newRole: UserRole) => void;
  onExpiryClick: (user: UserProfile) => void;
  getRoleBadgeColor: (role: UserRole) => string;
  getExpiryStatus: (userProfile: UserProfile) => {
    isExpired: boolean;
    daysUntilExpiry: number;
    expiryDate: Date;
  } | null;
}

const AdminUserItem: React.FC<AdminUserItemProps> = ({
  userProfile,
  settings,
  updating,
  onRoleUpdate,
  onExpiryClick,
  getRoleBadgeColor,
  getExpiryStatus,
}) => {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded border ${
        settings.darkMode
          ? "bg-gray-700/50 border-gray-600/50"
          : "bg-white/50 border-gray-200/50"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{userProfile.email}</div>
        <div
          className={`text-xs ${
            settings.darkMode ? "text-gray-400" : "text-slate-500"
          }`}
        >
          Created: {new Date(userProfile.createdAt).toLocaleDateString()}
          {userProfile.lastLoginAt && (
            <>
              <br />
              Last login: {new Date(userProfile.lastLoginAt).toLocaleString()}
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
                  : `${getExpiryStatus(userProfile)?.daysUntilExpiry}d left`}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <select
            value={userProfile.role}
            onChange={(e) =>
              onRoleUpdate(userProfile.uid, e.target.value as UserRole)
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
          {(userProfile.role === "pro" || userProfile.role === "beta") && (
            <button
              onClick={() => onExpiryClick(userProfile)}
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
  );
};

export default AdminUserItem;
