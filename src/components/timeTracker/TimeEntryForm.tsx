import React, { useRef } from "react";
import { Settings } from "../types";
import { PlusIcon } from "../ui/icons";

interface TimeEntryFormProps {
  startTime: string;
  endTime: string;
  startTimeError: string;
  endTimeError: string;
  isFormValid: boolean;
  settings: Settings;
  onStartTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEndTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onShowTimeFormatModal: () => void;
  endTimeRef?: React.RefObject<HTMLInputElement>;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  startTime,
  endTime,
  startTimeError,
  endTimeError,
  isFormValid,
  settings,
  onStartTimeChange,
  onEndTimeChange,
  onSubmit,
  onShowTimeFormatModal,
  endTimeRef,
}) => {
  const localEndTimeRef = useRef<HTMLInputElement>(null);
  const finalEndTimeRef = endTimeRef || localEndTimeRef;

  return (
    <div className="flex-shrink-0 p-3">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-1">
          <h2
            className={`text-xs font-bold tracking-wider uppercase ${
              settings.darkMode ? "text-gray-400" : "text-slate-500"
            }`}
          >
            TODAY'S ENTRIES
          </h2>
          <button
            onClick={onShowTimeFormatModal}
            className={`transition-colors ${
              settings.darkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-slate-400 hover:text-slate-600"
            }`}
            title="How to enter time format"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className={`p-1.5 rounded-lg border mb-2 ${
          settings.darkMode
            ? "bg-gray-700/50 border-gray-600"
            : "bg-white/50 border-gray-200/80"
        }`}
      >
        <div className="grid grid-cols-2 gap-2 mb-1.5">
          <div className="min-h-[2rem]">
            <label
              htmlFor="start-time"
              className={`text-xs font-bold tracking-wider uppercase ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              START TIME
            </label>
            <input
              id="start-time"
              name="start-time"
              type="text"
              inputMode="numeric"
              title="Enter time in HH:MM format (e.g., 09:30)"
              placeholder="HH:MM"
              maxLength={5}
              value={startTime}
              onChange={onStartTimeChange}
              className={`mt-0.5 w-full p-0.5 text-base bg-transparent border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 ${
                startTimeError
                  ? "border-red-500"
                  : settings.darkMode
                  ? "border-gray-500 text-gray-100 placeholder-gray-400"
                  : "border-slate-300 text-slate-800 placeholder-slate-400"
              }`}
            />
            {startTimeError && (
              <p className="mt-0.5 text-xs text-red-500">{startTimeError}</p>
            )}
          </div>
          <div className="min-h-[2rem]">
            <label
              htmlFor="end-time"
              className={`text-xs font-bold tracking-wider uppercase ${
                settings.darkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              END TIME
            </label>
            <input
              ref={finalEndTimeRef}
              id="end-time"
              name="end-time"
              type="text"
              inputMode="numeric"
              title="Enter time in HH:MM format (e.g., 17:00 or 24:00)"
              placeholder="HH:MM"
              maxLength={5}
              value={endTime}
              onChange={onEndTimeChange}
              className={`mt-0.5 w-full p-0.5 text-base bg-transparent border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 ${
                endTimeError
                  ? "border-red-500"
                  : settings.darkMode
                  ? "border-gray-500 text-gray-100 placeholder-gray-400"
                  : "border-slate-300 text-slate-800 placeholder-slate-400"
              }`}
            />
            {endTimeError && (
              <p className="mt-0.5 text-xs text-red-500">{endTimeError}</p>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-1 px-2 rounded-md hover:bg-gray-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed text-sm"
        >
          <PlusIcon className="h-3 w-3" />
          Add Entry
        </button>
      </form>
    </div>
  );
};

export default TimeEntryForm;
