import React from "react";
import { Settings as SettingsType } from "../../types";
import type { User } from "firebase/auth";
import { signOutUser } from "../../services/firebase";
import { UserProfile } from "../../types";

interface SettingsAccountProps {
  settings: SettingsType;
  user?: User | null;
  userProfile?: UserProfile | null;
  onSignOutError: (message: string) => void;
}

const SettingsAccount: React.FC<SettingsAccountProps> = ({
  settings,
  user,
  userProfile,
  onSignOutError,
}) => {
  const roleBadge = (() => {
    const role = userProfile?.role;
    if (role === "admin")
      return {
        label: "Admin",
        classes: "bg-red-100 text-red-800 border-red-200",
      };
    if (role === "pro")
      return {
        label: "Pro",
        classes: "bg-green-100 text-green-800 border-green-200",
      };
    if (role === "beta")
      return {
        label: "Beta Tester",
        classes: "bg-indigo-100 text-indigo-800 border-indigo-200",
      };
    return {
      label: "Free",
      classes: "bg-gray-100 text-gray-800 border-gray-200",
    };
  })();

  return (
    <div
      className={`p-2 rounded-lg border ${
        settings.darkMode
          ? "bg-gray-700/50 border-gray-600"
          : "bg-white/50 border-gray-200/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3
          className={`text-sm font-bold mb-2 ${
            settings.darkMode ? "text-gray-100" : "text-slate-700"
          }`}
        >
          Account
        </h3>
        <span
          className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${roleBadge.classes}`}
          title={`Account role: ${roleBadge.label}`}
        >
          {roleBadge.label}
        </span>
      </div>
      {user ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="avatar"
                className="w-8 h-8 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-300" />
            )}
            <div className="min-w-0">
              <div className="text-sm font-medium truncate flex items-center gap-2">
                <span>{user.displayName || "Signed in user"}</span>
              </div>
              <div
                className={`text-xs truncate ${
                  settings.darkMode ? "text-gray-400" : "text-slate-500"
                }`}
              >
                {user.email || ""}
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                await signOutUser();
              } catch (e) {
                onSignOutError("Failed to sign out. Please try again.");
              }
            }}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
          >
            Sign out
          </button>
        </div>
      ) : (
        <p
          className={`text-sm ${
            settings.darkMode ? "text-gray-400" : "text-slate-500"
          }`}
        >
          Not signed in
        </p>
      )}
    </div>
  );
};

export default SettingsAccount;
