import React from "react";
import { Settings as SettingsType } from "../../types";
import type { User } from "firebase/auth";
import { UserProfile } from "../../types";

interface SettingsAppInfoProps {
  settings: SettingsType;
  user?: User | null;
  userProfile?: UserProfile | null;
}

const SettingsAppInfo: React.FC<SettingsAppInfoProps> = ({
  settings,
  user,
  userProfile,
}) => {
  return (
    <>
      {/* App Info */}
      <div
        className={`p-2 rounded-lg border ${
          settings.darkMode
            ? "bg-gray-700/50 border-gray-600"
            : "bg-white/50 border-gray-200/80"
        }`}
      >
        <h3
          className={`text-sm font-bold mb-2 ${
            settings.darkMode ? "text-gray-100" : "text-slate-700"
          }`}
        >
          About ShiftPal
        </h3>
        <div
          className={`space-y-1.5 text-xs ${
            settings.darkMode ? "text-gray-400" : "text-slate-600"
          }`}
        >
          <p>Beta version 1.0.0</p>
        </div>
      </div>

      {/* Support / Contact */}
      <div
        className={`p-2 rounded-lg border ${
          settings.darkMode
            ? "bg-gray-700/50 border-gray-600"
            : "bg-white/50 border-gray-200/80"
        }`}
      >
        <h3
          className={`text-sm font-bold mb-2 ${
            settings.darkMode ? "text-gray-100" : "text-slate-700"
          }`}
        >
          Support
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`mailto:${encodeURIComponent(
              "shiftpalapp@gmail.com"
            )}?subject=${encodeURIComponent(
              "ShiftPal - Pro access request"
            )}&body=${encodeURIComponent(
              `Hi,\n\nI'd like pro access.\n\nDiagnostics:\nUID: ${
                user?.uid || "n/a"
              }\nRole: ${userProfile?.role || "n/a"}\n\nThanks!`
            )}`}
            className={`block w-full text-center py-1 px-2 rounded border transition-colors text-xs ${
              settings.darkMode
                ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
                : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
            }`}
          >
            Request Pro Access
          </a>
          <a
            href={`mailto:${encodeURIComponent(
              "shiftpalapp@gmail.com"
            )}?subject=${encodeURIComponent(
              "ShiftPal - Bug report / feedback"
            )}&body=${encodeURIComponent(
              `Hi,\n\nI found a bug / have feedback:\n\n(Describe here)\n\nDiagnostics:\nUID: ${
                user?.uid || "n/a"
              }\nRole: ${userProfile?.role || "n/a"}\n\nThanks!`
            )}`}
            className={`block w-full text-center py-1 px-2 rounded border transition-colors text-xs ${
              settings.darkMode
                ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
                : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
            }`}
          >
            Report a Bug / Feedback
          </a>
        </div>
        <p
          className={`text-[11px] mt-1 ${
            settings.darkMode ? "text-gray-400" : "text-slate-500"
          }`}
        >
          We'll reply as soon as possible.
        </p>
      </div>
    </>
  );
};

export default SettingsAppInfo;
