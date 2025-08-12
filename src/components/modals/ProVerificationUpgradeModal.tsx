import React, { useState } from "react";
import { auth } from "../../services/firebase";
import { canAccessProFeatures } from "../../services/firebase";
import { sendEmailVerificationToUser } from "../../services/firebase";
import { isPro } from "../../services/firestoreStorage";
import { UserProfile } from "../../types";

interface ProVerificationUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  featureName?: string;
  darkMode?: boolean;
  userProfile?: UserProfile | null;
  supportEmail?: string;
  userUid?: string;
}

const ProVerificationUpgradeModal: React.FC<
  ProVerificationUpgradeModalProps
> = ({
  open,
  onClose,
  featureName = "Pro features",
  darkMode = false,
  userProfile,
  supportEmail = "shiftpalapp@gmail.com",
  userUid,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const user = auth.currentUser;
  const isEmailVerified = canAccessProFeatures(user);
  const userIsPro = isPro(userProfile);

  if (!open) return null;

  const handleResendVerification = async () => {
    if (!user) return;

    setLoading(true);
    setMessage("");
    try {
      await sendEmailVerificationToUser(user);
      setMessage("Verification email sent! Check your inbox.");
    } catch (error: any) {
      console.error("Verification email error:", error);
      setMessage("Failed to send verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent(`Pro Upgrade Request - ${featureName}`);
    const body = encodeURIComponent(
      `Hi ShiftPal team,\n\nI'd like to upgrade to Pro to access ${featureName}.\n\nUser ID: ${
        userUid || "Not available"
      }\n\nThanks!`
    );
    window.open(`mailto:${supportEmail}?subject=${subject}&body=${body}`);
  };

  const handleRequestBetaAccess = () => {
    const subject = encodeURIComponent(`Beta Tester Request - ${featureName}`);
    const body = encodeURIComponent(
      `Hi ShiftPal team,\n\nI'd like to request beta tester access for Pro features.\n\nUser ID: ${
        userUid || "Not available"
      }\n\nI'm interested in testing:\n- ${featureName}\n- Other Pro features\n\nThanks!`
    );
    window.open(`mailto:${supportEmail}?subject=${subject}&body=${body}`);
  };

  // Determine what to show based on user status
  const getModalContent = () => {
    if (!user) {
      return {
        title: "Sign In Required",
        content: "Please sign in to access Pro features.",
        showVerification: false,
        showUpgrade: false,
      };
    }

    if (!isEmailVerified && !userIsPro) {
      return {
        title: "Email Verification Required",
        content: `To access ${featureName}, please verify your email address first, then upgrade to Pro.`,
        showVerification: true,
        showUpgrade: true,
      };
    }

    if (isEmailVerified && !userIsPro) {
      return {
        title: "Pro Upgrade Required",
        content: `${featureName} is a Pro feature. Upgrade to access this and many more premium features.`,
        showVerification: false,
        showUpgrade: true,
      };
    }

    return {
      title: "Access Granted",
      content: "You have access to this feature!",
      showVerification: false,
      showUpgrade: false,
    };
  };

  const modalContent = getModalContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={`w-full max-w-md rounded-xl shadow-2xl border ${
          darkMode
            ? "bg-gray-800 border-gray-600 text-gray-100"
            : "bg-white border-gray-200 text-slate-800"
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">{modalContent.title}</h3>
            <p className="text-sm mt-1 opacity-80">{modalContent.content}</p>
          </div>

          {/* Email Verification Section */}
          {modalContent.showVerification && user && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 mb-2">
                <span className="font-medium">Current email:</span> {user.email}
              </p>
              <p className="text-sm text-yellow-700 mb-3">
                Check your inbox for a verification link, or click "Resend"
                below.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full text-sm bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Resend Verification Email"}
              </button>
            </div>
          )}

          {/* Pro Upgrade Section */}
          {modalContent.showUpgrade && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Pro Features Include:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1 mb-3">
                <li>• Multiple pay rates</li>
                <li>• Tax & NI calculations</li>
                <li>• CSV export</li>
                <li>• Cloud sync</li>
                <li>• Unlimited pay history</li>
              </ul>
              <button
                onClick={handleContactSupport}
                className="w-full text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
              >
                Contact Support to Upgrade
              </button>
              <button
                onClick={handleRequestBetaAccess}
                className="w-full text-sm bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 mt-2"
              >
                Request Beta Access
              </button>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{message}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 text-sm border rounded-md transition-colors ${
                darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Maybe Later
            </button>
            {!modalContent.showVerification && !modalContent.showUpgrade && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Got it
              </button>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-4 text-center">
            <p className="text-xs opacity-60">
              Need help? Contact us at {supportEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProVerificationUpgradeModal;
