import React from "react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  featureName?: string;
  darkMode?: boolean;
  supportEmail?: string;
  userUid?: string;
  userRole?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  open,
  onClose,
  featureName = "this feature",
  darkMode = false,
  supportEmail,
  userUid,
  userRole,
}) => {
  if (!open) return null;

  const handleEmailAdmin = () => {
    if (!supportEmail) return;
    const subject = `ShiftPal - Pro access request`;
    const diagnostics = `Diagnostics:\nUID: ${userUid || "n/a"}\nRole: ${
      userRole || "n/a"
    }`;
    const body = `Hi,\n\nI'd like to upgrade to Pro.\n\n${diagnostics}\n\nThanks!`;
    const url = `mailto:${encodeURIComponent(
      supportEmail
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const handleRequestBetaAccess = () => {
    if (!supportEmail) return;
    const subject = `ShiftPal - Beta Tester Request`;
    const diagnostics = `Diagnostics:\nUID: ${userUid || "n/a"}\nRole: ${
      userRole || "n/a"
    }`;
    const body = `Hi ShiftPal team,\n\nI'd like to request beta tester access for Pro features.\n\n${diagnostics}\n\nI'm interested in testing:\n- ${featureName}\n- Other Pro features\n\nThanks!`;
    const url = `mailto:${encodeURIComponent(
      supportEmail
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={`w-full max-w-sm rounded-xl shadow-2xl border ${
          darkMode
            ? "bg-gray-800 border-gray-600 text-gray-100"
            : "bg-white border-gray-200 text-slate-800"
        }`}
      >
        <div
          className={`px-4 py-3 border-b ${
            darkMode ? "border-gray-600" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Upgrade to Pro</h3>
            <button
              onClick={onClose}
              className={
                darkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-slate-400 hover:text-slate-600"
              }
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="px-4 py-3 space-y-3">
          <p className={darkMode ? "text-gray-300" : "text-slate-600"}>
            Unlock Pro to use all features.
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Cloud storage across devices</li>
            <li>Tax & NI calculations</li>
            <li>Unlimited pay history</li>
            <li>CSV export</li>
            <li>Multiple pay rates</li>
          </ul>
          <div className="text-xs mt-1">
            <span className={darkMode ? "text-gray-400" : "text-slate-500"}>
              Want to try Pro features? Request beta tester access or email the admin to upgrade.
            </span>
          </div>
        </div>
        <div
          className={`px-4 py-3 border-t flex flex-col gap-2 ${
            darkMode ? "border-gray-600" : "border-gray-200"
          }`}
        >
          {supportEmail && (
            <>
              <button
                onClick={handleRequestBetaAccess}
                className={
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                    : "bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                }
              >
                🧪 Request Beta Access
              </button>
              <button
                onClick={handleEmailAdmin}
                className={
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-1.5 rounded-md text-sm"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-md text-sm"
                }
              >
                Email admin to upgrade
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className={
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-1.5 rounded-md text-sm"
                : "bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md text-sm"
            }
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
