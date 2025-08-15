import React from "react";
import { TimeEntry, Settings } from "../../types";
import { formatTimeForDisplay } from "../../utils/timeUtils";

interface EntriesListProps {
  entries: TimeEntry[];
  entriesHeight: number;
  settings: Settings;
  onRemoveEntry: (id: number) => void;
  calculateDuration: (
    startTime: string,
    endTime: string
  ) => { hours: number; minutes: number; totalMinutes: number };
  formatDurationWithMinutes: (duration: {
    hours: number;
    minutes: number;
    totalMinutes: number;
  }) => string;
}

const EntriesList: React.FC<EntriesListProps> = ({
  entries,
  entriesHeight,
  settings,
  onRemoveEntry,
  calculateDuration,
  formatDurationWithMinutes,
}) => {
  return (
    <div className="flex-1 overflow-hidden px-3">
      <div className="overflow-y-auto" style={{ height: `${entriesHeight}px` }}>
        <div className="space-y-1.5">
          {entries.length === 0 ? (
            <div
              className={`text-center p-3 rounded-md border ${
                settings.darkMode
                  ? "bg-gray-700/50 border-gray-600/50"
                  : "bg-white/50 border-gray-200/50"
              }`}
            >
              <div className="text-sm font-medium mb-1">
                Add your first entry
              </div>
              <div
                className={`text-xs mb-1 ${
                  settings.darkMode ? "text-gray-400" : "text-slate-500"
                }`}
              >
                Example: <span className="font-mono">09:00 – 17:30</span>
              </div>
              <div
                className={`text-[11px] ${
                  settings.darkMode ? "text-gray-400" : "text-slate-500"
                }`}
              >
                Enter times above and press "Add Entry".
              </div>
            </div>
          ) : (
            entries.map((entry) => {
              const displayStartTime = formatTimeForDisplay(entry.startTime);
              const displayEndTime = formatTimeForDisplay(entry.endTime);

              const duration = calculateDuration(
                displayStartTime,
                displayEndTime
              );
              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-1.5 rounded-md border ${
                    settings.darkMode
                      ? "bg-gray-700/50 border-gray-600/50"
                      : "bg-white/50 border-gray-200/50"
                  }`}
                >
                  <div className="flex items-center space-x-2 text-sm">
                    <span>{displayStartTime}</span>
                    <span
                      className={
                        settings.darkMode ? "text-gray-400" : "text-slate-400"
                      }
                    >
                      &mdash;
                    </span>
                    <span>{displayEndTime}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-sm ${
                        settings.darkMode ? "text-gray-300" : "text-slate-600"
                      }`}
                    >
                      {formatDurationWithMinutes(duration)}
                    </span>
                    <button
                      onClick={() => onRemoveEntry(entry.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EntriesList;
