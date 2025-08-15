import React from "react";
import { Settings } from "../../types";

interface PayGoalProgressBarProps {
  current: number;
  goal: number;
  label: string;
  settings: Settings;
  formatCurrency: (amount: number) => string;
}

const PayGoalProgressBar: React.FC<PayGoalProgressBarProps> = ({
  current,
  goal,
  label,
  settings,
  formatCurrency,
}) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const isOver = current > goal;

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span
          className={`text-xs font-medium ${
            settings.darkMode ? "text-gray-200" : "text-slate-700"
          }`}
        >
          {label}
        </span>
        <span
          className={`text-xs font-medium ${
            isOver
              ? "text-green-500"
              : settings.darkMode
              ? "text-gray-400"
              : "text-slate-500"
          }`}
        >
          {formatCurrency(current)} / {formatCurrency(goal)}
        </span>
      </div>
      <div
        className={`w-full rounded-full h-2 ${
          settings.darkMode ? "bg-gray-700" : "bg-slate-200"
        }`}
      >
        <div
          className={`h-2 rounded-full ${
            isOver
              ? "bg-green-500"
              : settings.darkMode
              ? "bg-blue-500"
              : "bg-blue-600"
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {isOver && (
        <p className="text-green-500 text-xs mt-1">Goal achieved! 🎉</p>
      )}
    </div>
  );
};

export default PayGoalProgressBar;
