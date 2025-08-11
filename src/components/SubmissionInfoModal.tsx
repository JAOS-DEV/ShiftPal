import React from "react";
import { Settings } from "../types";

interface SubmissionInfoModalProps {
  visible: boolean;
  settings: Settings;
  onClose: () => void;
}

const SubmissionInfoModal: React.FC<SubmissionInfoModalProps> = ({
  visible,
  settings,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg w-full max-w-sm mx-auto">
        <div className="p-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">
              What's a submission?
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-3 space-y-3">
          <p
            className={`text-sm leading-relaxed ${
              settings.darkMode ? "text-gray-300" : "text-slate-600"
            }`}
          >
            Submissions are a snapshot of the current entries. When you submit
            entries, your current entries are saved to History so you can review
            totals later.
          </p>
          <p
            className={`text-sm leading-relaxed ${
              settings.darkMode ? "text-gray-300" : "text-slate-600"
            }`}
          >
            You can keep adding entries during the day and submit multiple
            entries for a day and they will be added to the days History and
            show the total. You can also save pay in the Pay tab; it uses your
            tracked time for that date. (If in time tracker mode)
          </p>
        </div>
        <div className="p-3 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="py-1.5 px-3 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionInfoModal;
