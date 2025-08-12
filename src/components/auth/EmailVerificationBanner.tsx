import React, { useState } from "react";
import { auth } from "../../services/firebase";
import { sendEmailVerificationToUser } from "../../services/firebase";

interface EmailVerificationBannerProps {
  onSuccess?: () => void;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const user = auth.currentUser;

  if (!user || user.emailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
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

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Verify your email address
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            Please check your email ({user.email}) and click the verification
            link to complete your account setup.
          </p>
          {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
        </div>
        <button
          onClick={handleResendVerification}
          disabled={loading}
          className="ml-4 text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Resend"}
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
