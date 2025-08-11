import React from "react";
import { Settings } from "../types";

interface TotalSectionProps {
  totalDuration: { hours: number; minutes: number; totalMinutes: number };
  formatDurationWithMinutes: (duration: {
    hours: number;
    minutes: number;
    totalMinutes: number;
  }) => string;
  settings: Settings;
}

const TotalSection: React.FC<TotalSectionProps> = ({
  totalDuration,
  formatDurationWithMinutes,
  settings,
}) => {
  return (
    <div className="flex-shrink-0 border-t border-slate-200 pt-1.5 mt-1.5 pb-2 px-4 mb-1.5">
      <div className="flex justify-between items-center">
        <h2
          className={`text-sm font-bold tracking-wider uppercase ${
            settings.darkMode ? "text-gray-400" : "text-slate-500"
          }`}
        >
          TOTAL
        </h2>
        <p className="text-xl font-bold text-gray-800 font-mono">
          {formatDurationWithMinutes(totalDuration)}
        </p>
      </div>
    </div>
  );
};

export default TotalSection;
