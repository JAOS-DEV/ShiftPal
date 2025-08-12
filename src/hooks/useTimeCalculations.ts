import { useMemo } from "react";
import { TimeEntry } from "../types";
import {
  Duration,
  calculateDuration,
  formatDuration,
  formatDurationWithMinutes,
  formatTimeForDisplay,
} from "../utils/timeUtils";

export const useTimeCalculations = (entries: TimeEntry[]) => {
  const totalDuration = useMemo<Duration>(() => {
    const totalMinutes = entries.reduce((acc, entry) => {
      if (!entry.startTime || !entry.endTime) return acc;

      const formattedStartTime = formatTimeForDisplay(entry.startTime);
      const formattedEndTime = formatTimeForDisplay(entry.endTime);

      return (
        acc +
        calculateDuration(formattedStartTime, formattedEndTime).totalMinutes
      );
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes, totalMinutes };
  }, [entries]);

  return {
    totalDuration,
    formatDuration,
    formatDurationWithMinutes,
    calculateDuration,
  };
};
