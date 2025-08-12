import React from "react";
import { Settings } from "../../types";

interface PayCalculatorTabsProps {
  activeTab: "calculator" | "history";
  setActiveTab: (tab: "calculator" | "history") => void;
  settings: Settings;
}

const PayCalculatorTabs: React.FC<PayCalculatorTabsProps> = ({
  activeTab,
  setActiveTab,
  settings,
}) => {
  return (
    <div
      className={`flex-shrink-0 border-b ${
        settings.darkMode
          ? "bg-gray-900/40 border-gray-700"
          : "bg-white/50 border-gray-200/80"
      }`}
    >
      <div className="flex">
        <button
          onClick={() => setActiveTab("calculator")}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
            activeTab === "calculator"
              ? settings.darkMode
                ? "text-gray-100 border-b-2 border-indigo-400"
                : "text-gray-800 border-b-2 border-gray-800"
              : settings.darkMode
              ? "text-gray-400 hover:text-gray-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Calculator
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
            activeTab === "history"
              ? settings.darkMode
                ? "text-gray-100 border-b-2 border-indigo-400"
                : "text-gray-800 border-b-2 border-gray-800"
              : settings.darkMode
              ? "text-gray-400 hover:text-gray-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Pay History
        </button>
      </div>
    </div>
  );
};

export default PayCalculatorTabs;
