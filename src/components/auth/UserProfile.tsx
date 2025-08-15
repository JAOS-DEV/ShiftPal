import React, { useState } from "react";
import { auth } from "../../services/firebase";
import {
  updateUserEmail,
  updateUserPassword,
  sendEmailVerificationToUser,
} from "../../services/firebase";

interface UserProfileProps {
  onSuccess?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onSuccess }) => {
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const user = auth.currentUser;

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">
          You must be signed in to view your profile.
        </p>
      </div>
    );
  }

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
      onSuccess?.();
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
      setCurrentPassword("");
      onSuccess?.();
    } catch (error: any) {
      console.error("Password update error:", error);
      setError(error.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Account Information
        </h3>

        <div className="bg-slate-50 p-4 rounded-md mb-4">
          <p className="text-sm text-slate-600">
            <span className="font-medium">Current Email:</span> {user.email}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            <span className="font-medium">Email Verified:</span>{" "}
            {user.emailVerified ? (
              <span className="text-green-600">✓ Verified</span>
            ) : (
              <span className="text-red-600">✗ Not verified</span>
            )}
          </p>
        </div>

        {!user.emailVerified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <p className="text-sm text-yellow-800 mb-2">
              Please verify your email address to access all features.
            </p>
            <button
              onClick={handleSendVerification}
              disabled={loading}
              className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Verification Email"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {message && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">{message}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Update Email Form */}
        <div>
          <h4 className="text-md font-medium text-slate-900 mb-3">
            Update Email Address
          </h4>
          <form onSubmit={handleUpdateEmail} className="space-y-3">
            <div>
              <label
                htmlFor="newEmail"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                New Email Address
              </label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new email address"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !newEmail}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Email"}
            </button>
          </form>
        </div>

        {/* Update Password Form */}
        <div>
          <h4 className="text-md font-medium text-slate-900 mb-3">
            Update Password
          </h4>
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password (min 6 characters)"
                disabled={loading}
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
