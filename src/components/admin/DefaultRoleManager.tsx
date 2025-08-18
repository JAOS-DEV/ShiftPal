import React, { useState, useEffect } from "react";
import { UserRole, Settings } from "../../types";
import {
  getDefaultUserRole,
  updateDefaultUserRole,
  initializeDefaultUserRole,
} from "../../services/firestoreStorage";

interface DefaultRoleManagerProps {
  settings: Settings;
}

const DefaultRoleManager: React.FC<DefaultRoleManagerProps> = ({
  settings,
}) => {
  const [defaultRole, setDefaultRole] = useState<UserRole>("beta"); // Start with beta as default
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default
  const [hasFirestoreAccess, setHasFirestoreAccess] = useState(false);

  useEffect(() => {
    loadDefaultRole();
  }, []);

  const loadDefaultRole = async () => {
    try {
      setLoading(true);

      // Try to initialize the default role setting first
      try {
        await initializeDefaultUserRole();
        setHasFirestoreAccess(true);
      } catch (initError) {
        // Silently handle permission errors - this is expected until security rules are updated
        console.warn(
          "Default role setting not accessible yet - using fallback mode"
        );
        setHasFirestoreAccess(false);
      }

      // Try to get the current setting
      try {
        const role = await getDefaultUserRole();
        setDefaultRole(role);
        setHasFirestoreAccess(true);
      } catch (error) {
        // Silently handle permission errors - this is expected until security rules are updated
        console.warn(
          "Could not load default role setting - using fallback mode"
        );
        setHasFirestoreAccess(false);
      }
    } catch (error) {
      // Keep the current default role (beta) as fallback
      setHasFirestoreAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole: UserRole) => {
    if (!hasFirestoreAccess) {
      setToastMessage(
        "Firestore access not configured yet - please update security rules"
      );
      return;
    }

    try {
      setUpdating(true);
      await updateDefaultUserRole(newRole);
      setDefaultRole(newRole);
      setToastMessage("Default role updated successfully");
    } catch (error) {
      console.error("Error updating default role:", error);
      setToastMessage("Failed to update default role");
    } finally {
      setUpdating(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return (
      <div
        className={`rounded-lg p-2 border ${
          settings.darkMode
            ? "bg-gray-800/50 border-gray-700/80"
            : "bg-white/50 border-gray-200/80"
        }`}
      >
        <div
          className={`text-sm ${
            settings.darkMode ? "text-gray-400" : "text-slate-500"
          }`}
        >
          Loading default role...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border ${
        settings.darkMode
          ? "bg-gray-800/50 border-gray-700/80"
          : "bg-white/50 border-gray-200/80"
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

      {/* Header with collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`w-full p-2 text-left flex items-center justify-between hover:bg-opacity-70 transition-colors ${
          settings.darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100/50"
        }`}
      >
        <div className="flex items-center space-x-2">
          <h3
            className={`text-sm font-bold ${
              settings.darkMode ? "text-gray-200" : "text-slate-700"
            }`}
          >
            Default User Role
          </h3>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              settings.darkMode
                ? "bg-blue-900/50 text-blue-300"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {defaultRole === "beta" ? "Beta Tester" : defaultRole}
          </span>
          {!hasFirestoreAccess && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                settings.darkMode
                  ? "bg-yellow-900/50 text-yellow-300"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              Fallback
            </span>
          )}
        </div>
        <span
          className={`text-lg transition-transform ${
            isCollapsed ? "rotate-0" : "rotate-90"
          }`}
        >
          &gt;
        </span>
      </button>

      {/* Collapsible content */}
      {!isCollapsed && (
        <div className="px-2 pb-2 space-y-3">
          <p
            className={`text-xs ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            Set the default role for new user sign-ups
          </p>

          {!hasFirestoreAccess && (
            <div
              className={`text-xs p-2 rounded ${
                settings.darkMode
                  ? "bg-yellow-900/20 text-yellow-300 border border-yellow-700/50"
                  : "bg-yellow-50 text-yellow-800 border border-yellow-200"
              }`}
            >
              <strong>Note:</strong> Currently using fallback mode. To enable
              full functionality, update your Firestore security rules to allow
              access to the <code>adminSettings</code> collection.
            </div>
          )}

          <div className="space-y-2">
            {(["free", "beta", "pro"] as UserRole[]).map((role) => (
              <label
                key={role}
                className={`flex items-center space-x-2 cursor-pointer ${
                  settings.darkMode ? "text-gray-300" : "text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="defaultRole"
                  value={role}
                  checked={defaultRole === role}
                  onChange={() => handleRoleChange(role)}
                  disabled={updating || !hasFirestoreAccess}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                />
                <span className="text-sm font-medium capitalize">
                  {role === "beta" ? "Beta Tester" : role}
                </span>
                {defaultRole === role && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      settings.darkMode
                        ? "bg-blue-900/50 text-blue-300"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    Current
                  </span>
                )}
              </label>
            ))}
          </div>

          {updating && (
            <div
              className={`text-xs ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              Updating...
            </div>
          )}

          {/* Info about current setting */}
          <div
            className={`text-xs p-2 rounded ${
              settings.darkMode
                ? "bg-gray-700/50 text-gray-300"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <strong>Current Setting:</strong> New users will be assigned the "
            {defaultRole === "beta" ? "Beta Tester" : defaultRole}" role by
            default.
            {!hasFirestoreAccess && (
              <span className="block mt-1">
                <strong>Status:</strong> Fallback mode - changes will not
                persist until Firestore access is configured.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DefaultRoleManager;
