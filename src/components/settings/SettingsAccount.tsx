import React, { useState } from "react";
import { Settings as SettingsType } from "../../types";
import type { User } from "firebase/auth";
import {
  signOutUser,
  updateUserEmail,
  updateUserPassword,
  sendEmailVerificationToUser,
} from "../../services/firebase";
import { UserProfile } from "../../types";
import { signOutUserAndSaveData } from "../../utils/userDataUtils";

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
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  const validatePassword = () => {
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const validateEmail = (email: string) => {
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!validateEmail(newEmail)) return;

    setLoading(true);
    try {
      await updateUserEmail(newEmail);
      setMessage("Email updated successfully!");
      setNewEmail("");
      setShowEmailForm(false);
    } catch (error: any) {
      console.error("Email update error:", error);
      setError(error.message || "Failed to update email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!validatePassword()) return;

    setLoading(true);
    try {
      await updateUserPassword(newPassword);
      setMessage("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (error: any) {
      console.error("Password update error:", error);
      setError(error.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    if (!user) return;

    setError("");
    setMessage("");
    setLoading(true);
    try {
      await sendEmailVerificationToUser(user);
      setMessage("Verification email sent! Check your inbox.");
    } catch (error: any) {
      console.error("Verification email error:", error);
      setError(
        error.message || "Failed to send verification email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setNewEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");
    setShowEmailForm(false);
    setShowPasswordForm(false);
  };

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

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {message && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-xs text-green-600">{message}</p>
        </div>
      )}

      {user ? (
        <div className="space-y-3">
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
                <div className="text-xs flex items-center gap-1 mt-1">
                  <span
                    className={
                      user.emailVerified ? "text-green-600" : "text-red-600"
                    }
                  >
                    {user.emailVerified ? "✓ Verified" : "✗ Not verified"}
                  </span>
                  {!user.emailVerified && (
                    <button
                      onClick={handleSendVerification}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-700 text-xs underline disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "Verify"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  // Sign out from Firebase first
                  await signOutUser();

                  // Sign out user and save their data
                  signOutUserAndSaveData();
                } catch (e) {
                  onSignOutError("Failed to sign out. Please try again.");
                }
              }}
              className="text-sm bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
            >
              Sign out
            </button>
          </div>

          {/* Email Update Form */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-medium ${
                  settings.darkMode ? "text-gray-300" : "text-slate-600"
                }`}
              >
                Email Address
              </span>
              <button
                onClick={() => {
                  resetForms();
                  setShowEmailForm(!showEmailForm);
                }}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showEmailForm ? "Cancel" : "Update"}
              </button>
            </div>

            {showEmailForm && (
              <form onSubmit={handleUpdateEmail} className="space-y-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={`w-full px-2 py-1 text-xs border rounded ${
                    settings.darkMode
                      ? "bg-gray-600 border-gray-500 text-gray-100"
                      : "bg-white border-gray-300 text-slate-800"
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="Enter new email address"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !newEmail}
                  className="w-full text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Email"}
                </button>
              </form>
            )}
          </div>

          {/* Password Update Form */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-medium ${
                  settings.darkMode ? "text-gray-300" : "text-slate-600"
                }`}
              >
                Password
              </span>
              <button
                onClick={() => {
                  resetForms();
                  setShowPasswordForm(!showPasswordForm);
                }}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showPasswordForm ? "Cancel" : "Update"}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handleUpdatePassword} className="space-y-2">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-2 py-1 text-xs border rounded ${
                    settings.darkMode
                      ? "bg-gray-600 border-gray-500 text-gray-100"
                      : "bg-white border-gray-300 text-slate-800"
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="Enter new password (min 6 characters)"
                  disabled={loading}
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-2 py-1 text-xs border rounded ${
                    settings.darkMode
                      ? "bg-gray-600 border-gray-500 text-gray-100"
                      : "bg-white border-gray-300 text-slate-800"
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}
          </div>
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
