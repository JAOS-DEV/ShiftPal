import React, { useState, useEffect, useRef } from "react";
import { DailySubmission, Settings } from "../../types";
import { PeriodSelector } from "../layout";

interface HistoryViewProps {
  filteredSubmissions: DailySubmission[];
  settings: Settings;
  selectedPeriod: string;
  selectedDate: string;
  openDropdownId: string | null;
  onPeriodChange: (period: string) => void;
  onDateChange: (date: string) => void;
  onToggleDropdown: (submissionId: string) => void;
  onEditSubmission: (submission: DailySubmission) => void;
  onDuplicateSubmission: (submission: DailySubmission) => void;
  onDeleteSubmission: (timestamp: string) => void;
  getPeriodLabel: (period: string, date: string) => string;
  getCurrentWeekStart: () => string;
  getCurrentMonthStart: () => string;
  navigateWeek: (direction: "prev" | "next") => void;
  navigateMonth: (direction: "prev" | "next") => void;
  goToCurrentPeriod: () => void;
  calculateDuration: (
    startTime: string,
    endTime: string
  ) => { hours: number; minutes: number; totalMinutes: number };
  formatDurationWithMinutes: (duration: {
    hours: number;
    minutes: number;
    totalMinutes: number;
  }) => string;
  calculateTotalDuration: (entries: any[]) => {
    hours: number;
    minutes: number;
    totalMinutes: number;
  };
}

const HistoryView: React.FC<HistoryViewProps> = ({
  filteredSubmissions,
  settings,
  selectedPeriod,
  selectedDate,
  openDropdownId,
  onPeriodChange,
  onDateChange,
  onToggleDropdown,
  onEditSubmission,
  onDuplicateSubmission,
  onDeleteSubmission,
  getPeriodLabel,
  getCurrentWeekStart,
  getCurrentMonthStart,
  navigateWeek,
  navigateMonth,
  goToCurrentPeriod,
  calculateDuration,
  formatDurationWithMinutes,
  calculateTotalDuration,
}) => {
  // Height state for scroll container
  const [historyListHeight, setHistoryListHeight] = useState(400);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Calculate available space for history list
  useEffect(() => {
    const calculateHistoryListHeight = () => {
      if (containerRef.current && headerRef.current) {
        const viewportHeight = window.innerHeight;
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerTop = containerRect.top;
        const availableViewportHeight = viewportHeight - containerTop;
        const headerHeight = headerRef.current.offsetHeight;

        // Simple calculation with correct spacing (same as PayHistory)
        const navBarHeight = 44; // Correct bottom navigation height
        const padding = 5; // Reasonable padding for extra space

        const availableHeight =
          availableViewportHeight - headerHeight - navBarHeight - padding;
        const finalHeight = Math.max(availableHeight, 100);

        setHistoryListHeight(finalHeight);
      }
    };

    calculateHistoryListHeight();
    const timeoutId = setTimeout(calculateHistoryListHeight, 100);

    window.addEventListener("resize", calculateHistoryListHeight);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", calculateHistoryListHeight);
    };
  }, [selectedPeriod, selectedDate]);
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // Format the times for display (HHMM to HH:MM)
  const formatTimeForDisplay = (time: string) => {
    if (time.length === 4) {
      return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
    }
    return time;
  };

  return (
    <div
      ref={containerRef}
      className={`h-full flex flex-col overflow-hidden ${
        settings.darkMode ? "text-gray-100" : "text-gray-800"
      }`}
    >
      {/* Header */}
      <div ref={headerRef} className="flex-shrink-0 p-4 space-y-3">
        {/* Period Selector */}
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          selectedDate={selectedDate}
          settings={settings}
          onPeriodChange={onPeriodChange}
          onDateChange={onDateChange}
          getPeriodLabel={getPeriodLabel}
          getCurrentWeekStart={getCurrentWeekStart}
          getCurrentMonthStart={getCurrentMonthStart}
          navigateWeek={navigateWeek}
          navigateMonth={navigateMonth}
          goToCurrentPeriod={goToCurrentPeriod}
        />

        <h2
          className={`text-xs font-bold tracking-wider uppercase mb-2 ${
            settings.darkMode ? "text-gray-400" : "text-slate-500"
          }`}
        >
          SUBMITTED ENTRIES
        </h2>
      </div>

      {/* History List */}
      <div
        className="overflow-y-auto"
        style={{ height: `${historyListHeight}px` }}
      >
        <div className="space-y-2">
          {filteredSubmissions.length === 0 ? (
            <p
              className={`text-center py-4 ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              No submitted entries for this period.
            </p>
          ) : (
            // Group submissions by date
            Object.entries(
              filteredSubmissions.reduce(
                (groups: Record<string, DailySubmission[]>, submission) => {
                  const date = submission.date;
                  if (!groups[date]) {
                    groups[date] = [];
                  }
                  groups[date].push(submission);
                  return groups;
                },
                {} as Record<string, DailySubmission[]>
              )
            )
              .sort(
                ([dateA], [dateB]) =>
                  new Date(dateB).getTime() - new Date(dateA).getTime()
              )
              .map(([date, submissions]: [string, DailySubmission[]]) => (
                <div
                  key={date}
                  className={`${
                    settings.darkMode
                      ? "bg-gray-700/40 border-gray-600/60"
                      : "bg-white/50 border-gray-200/50"
                  } p-3 rounded-md border`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span
                      className={`font-medium ${
                        settings.darkMode ? "text-gray-200" : "text-slate-700"
                      }`}
                    >
                      {formatDate(date)}
                    </span>
                  </div>

                  <div
                    className={`text-xs mb-1.5 ${
                      settings.darkMode ? "text-gray-400" : "text-slate-500"
                    }`}
                  >
                    {submissions.length} submission
                    {submissions.length > 1 ? "s" : ""}
                  </div>

                  <div className="space-y-1.5">
                    {submissions
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime()
                      )
                      .map((submission, index) => (
                        <div
                          key={submission.timestamp}
                          className={`border-l-2 pl-3 relative ${
                            settings.darkMode
                              ? "border-gray-600"
                              : "border-slate-200"
                          } ${
                            index > 0
                              ? settings.darkMode
                                ? "mt-3 pt-3 border-t border-gray-700"
                                : "mt-3 pt-3 border-t border-slate-100"
                              : ""
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span
                              className={`text-xs ${
                                settings.darkMode
                                  ? "text-gray-400"
                                  : "text-slate-400"
                              }`}
                            >
                              Submitted at:{" "}
                              {submission.timestamp
                                .split("T")[1]
                                .substring(0, 5)}
                            </span>
                            <div className="relative dropdown-menu">
                              <button
                                onClick={() =>
                                  onToggleDropdown(submission.timestamp)
                                }
                                className={`${
                                  settings.darkMode
                                    ? "text-gray-400 hover:text-gray-200"
                                    : "text-slate-500 hover:text-slate-700"
                                } p-1`}
                                title="More options"
                              >
                                ⋮
                              </button>
                              {openDropdownId === submission.timestamp && (
                                <div
                                  className={`absolute right-0 top-6 rounded-lg shadow-lg z-10 min-w-[120px] border ${
                                    settings.darkMode
                                      ? "bg-gray-800 border-gray-700"
                                      : "bg-white border-gray-200"
                                  }`}
                                >
                                  <button
                                    onClick={() => {
                                      onEditSubmission(submission);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${
                                      settings.darkMode
                                        ? "hover:bg-gray-700 text-gray-100"
                                        : "hover:bg-gray-100"
                                    }`}
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      onDuplicateSubmission(submission);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${
                                      settings.darkMode
                                        ? "hover:bg-gray-700 text-gray-100"
                                        : "hover:bg-gray-100"
                                    }`}
                                  >
                                    📋 Duplicate
                                  </button>
                                  <button
                                    onClick={() => {
                                      onDeleteSubmission(submission.timestamp);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${
                                      settings.darkMode
                                        ? "hover:bg-red-900/30 text-red-400"
                                        : "hover:bg-red-50 text-red-600"
                                    }`}
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            {submission.entries.map((entry) => {
                              const displayStartTime = formatTimeForDisplay(
                                entry.startTime
                              );
                              const displayEndTime = formatTimeForDisplay(
                                entry.endTime
                              );

                              const duration = calculateDuration(
                                displayStartTime,
                                displayEndTime
                              );
                              return (
                                <div
                                  key={entry.id}
                                  className={`flex justify-between items-center text-xs ${
                                    settings.darkMode
                                      ? "text-gray-300"
                                      : "text-slate-600"
                                  }`}
                                >
                                  <span>
                                    {displayStartTime} - {displayEndTime}
                                  </span>
                                  <span className="font-mono">
                                    {formatDurationWithMinutes(duration)}
                                  </span>
                                </div>
                              );
                            })}
                            {/* Total time for this submission */}
                            <div
                              className={`pt-1 border-t ${
                                settings.darkMode
                                  ? "border-gray-700"
                                  : "border-slate-200"
                              }`}
                            >
                              <div
                                className={`flex justify-between items-center text-xs font-medium ${
                                  settings.darkMode
                                    ? "text-gray-200"
                                    : "text-slate-700"
                                }`}
                              >
                                <span>Total:</span>
                                <span className="font-mono">
                                  {formatDurationWithMinutes(
                                    calculateTotalDuration(submission.entries)
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    {/* Total time for all submissions on this day */}
                    <div
                      className={`pt-2 border-t-2 ${
                        settings.darkMode
                          ? "border-gray-600"
                          : "border-slate-300"
                      }`}
                    >
                      <div
                        className={`flex justify-between items-center text-sm font-bold ${
                          settings.darkMode ? "text-gray-100" : "text-slate-800"
                        }`}
                      >
                        <span>Day Total:</span>
                        <span className="font-mono">
                          {formatDurationWithMinutes(
                            calculateTotalDuration(
                              submissions.flatMap((sub) => sub.entries)
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
