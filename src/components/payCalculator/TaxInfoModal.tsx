import React from "react";
import { Settings } from "../../types";

interface TaxInfoModalProps {
  showTaxInfoModal: boolean;
  setShowTaxInfoModal: (show: boolean) => void;
  settings: Settings;
}

const TaxInfoModal: React.FC<TaxInfoModalProps> = ({
  showTaxInfoModal,
  setShowTaxInfoModal,
  settings,
}) => {
  if (!showTaxInfoModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg w-full max-w-sm mx-auto">
        <div className="p-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">
              Tax & NI Calculations
            </h3>
            <button
              onClick={() => setShowTaxInfoModal(false)}
              className={`${
                settings.darkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-3 space-y-3">
          <div>
            <h4
              className={`font-medium mb-2 ${
                settings.darkMode ? "text-gray-200" : "text-slate-700"
              }`}
            >
              Income Tax
            </h4>
            <p
              className={`text-sm leading-relaxed ${
                settings.darkMode ? "text-gray-300" : "text-slate-600"
              }`}
            >
              UK standard rate of 20% applied to your total earnings. This gives
              you an estimate of your take-home pay after tax deductions.
            </p>
          </div>

          <div>
            <h4
              className={`font-medium mb-2 ${
                settings.darkMode ? "text-gray-200" : "text-slate-700"
              }`}
            >
              National Insurance
            </h4>
            <p
              className={`text-sm leading-relaxed ${
                settings.darkMode ? "text-gray-300" : "text-slate-600"
              }`}
            >
              NI is calculated at 12% on earnings above £34.44 per day
              (equivalent to the annual threshold). This is simplified for daily
              calculations.
            </p>
          </div>

          <div>
            <h4
              className={`font-medium mb-2 ${
                settings.darkMode ? "text-gray-200" : "text-slate-700"
              }`}
            >
              Combined Calculations
            </h4>
            <p
              className={`text-sm leading-relaxed ${
                settings.darkMode ? "text-gray-300" : "text-slate-600"
              }`}
            >
              When both tax and NI are enabled, you'll see the final total after
              both deductions. This gives you the most accurate take-home pay
              estimate.
            </p>
          </div>

          <div>
            <h4
              className={`font-medium mb-2 ${
                settings.darkMode ? "text-gray-200" : "text-slate-700"
              }`}
            >
              How to Enable
            </h4>
            <p
              className={`text-sm leading-relaxed ${
                settings.darkMode ? "text-gray-300" : "text-slate-600"
              }`}
            >
              Go to <strong>Settings</strong> →{" "}
              <strong>Tax Calculations </strong>
              and <strong>NI Calculations</strong> sections. Toggle the switches
              to enable tax and NI calculations for your pay history.
            </p>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <p
              className={`text-xs ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              💡 <strong>Note:</strong> These are estimates for planning
              purposes. Actual tax and NI may vary based on your specific
              circumstances.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxInfoModal;
