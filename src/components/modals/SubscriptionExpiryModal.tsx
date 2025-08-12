import React, { useState } from "react";
import { UserProfile } from "../../types";
import { updateSubscriptionExpiry } from "../../services/firestoreStorage";

interface SubscriptionExpiryModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  settings: {
    darkMode: boolean;
  };
}

const SubscriptionExpiryModal: React.FC<SubscriptionExpiryModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdate,
  settings,
}) => {
  const [expiryDate, setExpiryDate] = useState(
    user.proUntil ? user.proUntil.split("T")[0] : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newExpiry = expiryDate ? new Date(expiryDate).toISOString() : null;
      await updateSubscriptionExpiry(user.uid, newExpiry);
      onUpdate();
      onClose();
    } catch (err) {
      setError("Failed to update subscription expiry date");
      console.error("Error updating subscription expiry:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveExpiry = async () => {
    if (
      !confirm(
        "Remove subscription expiry date? This will make the subscription permanent."
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateSubscriptionExpiry(user.uid, null);
      onUpdate();
      onClose();
    } catch (err) {
      setError("Failed to remove subscription expiry date");
      console.error("Error removing subscription expiry:", err);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = user.proUntil
    ? new Date(user.proUntil) < new Date()
    : false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-md rounded-lg p-6 ${
          settings.darkMode
            ? "bg-gray-800 text-gray-100 border border-gray-700"
            : "bg-white text-slate-800 border border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-lg font-bold ${
              settings.darkMode ? "text-gray-100" : "text-slate-800"
            }`}
          >
            Manage Subscription Expiry
          </h3>
          <button
            onClick={onClose}
            className={`text-2xl font-bold ${
              settings.darkMode
                ? "text-gray-400 hover:text-gray-300"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <div
            className={`text-sm ${
              settings.darkMode ? "text-gray-300" : "text-slate-600"
            }`}
          >
            User: <span className="font-medium">{user.email}</span>
          </div>
          <div
            className={`text-sm ${
              settings.darkMode ? "text-gray-300" : "text-slate-600"
            }`}
          >
            Current Role: <span className="font-medium">{user.role}</span>
          </div>
          {user.proUntil && (
            <div
              className={`text-sm ${
                settings.darkMode ? "text-gray-300" : "text-slate-600"
              }`}
            >
              Current Expiry:{" "}
              <span
                className={`font-medium ${
                  isExpired
                    ? settings.darkMode
                      ? "text-red-400"
                      : "text-red-600"
                    : settings.darkMode
                    ? "text-green-400"
                    : "text-green-600"
                }`}
              >
                {new Date(user.proUntil).toLocaleDateString()}
                {isExpired && " (Expired)"}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="expiryDate"
              className={`block text-sm font-medium mb-2 ${
                settings.darkMode ? "text-gray-300" : "text-slate-700"
              }`}
            >
              Subscription Expiry Date
            </label>
            <input
              type="date"
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className={`w-full px-3 py-2 border rounded-md ${
                settings.darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white border-slate-300 text-slate-800"
              }`}
            />
            <p
              className={`text-xs mt-1 ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              Leave empty to remove expiry date (permanent subscription)
            </p>
          </div>

          {error && (
            <div
              className={`text-sm p-2 rounded ${
                settings.darkMode
                  ? "bg-red-900/50 text-red-300 border border-red-700"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 font-bold py-2 px-4 rounded-md transition-colors ${
                settings.darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-500 disabled:bg-blue-800"
                  : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300"
              }`}
            >
              {loading ? "Updating..." : "Update Expiry"}
            </button>
            {user.proUntil && (
              <button
                type="button"
                onClick={handleRemoveExpiry}
                disabled={loading}
                className={`px-4 py-2 rounded-md border transition-colors ${
                  settings.darkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700 disabled:bg-gray-800"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50 disabled:bg-slate-100"
                }`}
              >
                Remove
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionExpiryModal;
