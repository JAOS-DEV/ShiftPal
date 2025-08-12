export interface Duration {
  hours: number;
  minutes: number;
  totalMinutes: number;
}

// Helper to parse HH:mm string into total minutes from midnight
export const timeToMinutes = (time: string): number => {
  if (!time) return 0;

  if (time === "24:00") {
    return 24 * 60;
  }

  const parts = time.split(":");
  if (parts.length !== 2) {
    return 0;
  }

  const [hoursStr, minutesStr] = parts;
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return 0;
  }

  return hours * 60 + minutes;
};

// Calculates the duration between a start and end time
export const calculateDuration = (
  startTime: string,
  endTime: string
): Duration => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  let diff = endMinutes - startMinutes;
  if (diff < 0) {
    // Handles overnight case
    diff += 24 * 60;
  }

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return { hours, minutes, totalMinutes: diff };
};

// Formats a duration object into a H:MM string
export const formatDuration = (duration: Duration): string => {
  return `${duration.hours}:${String(duration.minutes).padStart(2, "0")}`;
};

// Formats a duration object into a compact H hr/XXX mins string
export const formatDurationWithMinutes = (duration: Duration): string => {
  if (duration.hours === 0) {
    return `${duration.totalMinutes} mins`;
  } else if (duration.minutes === 0) {
    return `${duration.hours} hr/${duration.totalMinutes} mins`;
  } else {
    return `${duration.hours}:${String(duration.minutes).padStart(2, "0")}/${
      duration.totalMinutes
    } mins`;
  }
};

// Convert decimal hours to Duration object
export const decimalHoursToDuration = (decimalHours: number): Duration => {
  const totalMinutes = Math.round(decimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes, totalMinutes };
};

// Format time from HHMM to HH:MM for display
export const formatTimeForDisplay = (time: string): string => {
  if (!time) return "";

  if (time.length === 4) {
    return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
  }

  return time;
};

// Format time from HH:MM to HHMM for storage
export const formatTimeForStorage = (time: string): string => {
  if (!time) return "";

  return time.replace(":", "");
};
