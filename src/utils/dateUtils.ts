// Format date string to readable format
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

// Format timestamp to readable format
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Get current date in YYYY-MM-DD format
export const getCurrentDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

// Get current time in HH:MM format
export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Check if a date is today
export const isToday = (dateStr: string): boolean => {
  const today = new Date().toDateString();
  const date = new Date(dateStr).toDateString();
  return today === date;
};

// Check if a date is yesterday
export const isYesterday = (dateStr: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(dateStr);
  return yesterday.toDateString() === date.toDateString();
};

// Get relative date string (Today, Yesterday, or formatted date)
export const getRelativeDate = (dateStr: string): string => {
  if (isToday(dateStr)) {
    return "Today";
  } else if (isYesterday(dateStr)) {
    return "Yesterday";
  } else {
    return formatDate(dateStr);
  }
};
