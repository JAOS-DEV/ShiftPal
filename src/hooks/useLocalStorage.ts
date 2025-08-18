import { useState, useEffect } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = () => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Debug logging for tracking localStorage writes
        if (
          key === "timeEntries" ||
          key === "payHistory" ||
          key === "dailySubmissions"
        ) {
          console.log(`[useLocalStorage] Saved ${key}:`, valueToStore);
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Read from localStorage on mount
  useEffect(() => {
    const currentValue = readValue();
    setStoredValue(currentValue);
  }, []); // Only run on mount

  // Listen for user data loaded events to update state when user switches
  useEffect(() => {
    const handleUserDataLoaded = () => {
      const currentValue = readValue();
      setStoredValue(currentValue);
    };

    window.addEventListener("userDataLoaded", handleUserDataLoaded);
    return () =>
      window.removeEventListener("userDataLoaded", handleUserDataLoaded);
  }, []);

  return [storedValue, setValue] as const;
}

export default useLocalStorage;
