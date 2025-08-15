import React from "react";
import { DailySubmission, TimeEntry, Settings } from "../types";

interface EditSubmissionModalProps {
  visible: boolean;
  editingSubmission: DailySubmission | null;
  editTimeErrors: { [key: string]: string };
  settings: Settings;
  onCancel: () => void;
  onSave: (submission: DailySubmission) => void;
  onSubmissionChange: (submission: DailySubmission) => void;
  onEditTimeErrorsChange: (errors: { [key: string]: string }) => void;
  validateEditTimeInput: (
    time: string,
    entryIndex: number,
    field: "startTime" | "endTime"
  ) => boolean;
  formatEditTimeInput: (value: string) => string;
  calculateDuration: (
    startTime: string,
    endTime: string
  ) => { hours: number; minutes: number; totalMinutes: number };
  formatDurationWithMinutes: (duration: {
    hours: number;
    minutes: number;
    totalMinutes: number;
  }) => string;
  calculateTotalDuration: (entries: TimeEntry[]) => {
    hours: number;
    minutes: number;
    totalMinutes: number;
  };
}

const EditSubmissionModal: React.FC<EditSubmissionModalProps> = ({
  visible,
  editingSubmission,
  editTimeErrors,
  settings,
  onCancel,
  onSave,
  onSubmissionChange,
  onEditTimeErrorsChange,
  validateEditTimeInput,
  formatEditTimeInput,
  calculateDuration,
  formatDurationWithMinutes,
  calculateTotalDuration,
}) => {
  if (!visible || !editingSubmission) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg w-full max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
        <div className="p-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">
              Edit Time Submission
            </h3>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-3 space-y-3">
          {/* Date */}
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${
                settings.darkMode ? "text-gray-200" : "text-slate-700"
              }`}
            >
              Date
            </label>
            <input
              type="date"
              value={editingSubmission.date}
              onChange={(e) => {
                const updatedSubmission = {
                  ...editingSubmission,
                  date: e.target.value,
                };
                onSubmissionChange(updatedSubmission);
              }}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-xs bg-white min-w-0 text-slate-700 max-w-full"
            />
          </div>

          {/* Time Entries */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Time Entries
            </label>
            <div className="space-y-2">
              {editingSubmission.entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="border border-slate-200 rounded-md p-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`text-sm font-medium ${
                        settings.darkMode ? "text-gray-200" : "text-slate-700"
                      }`}
                    >
                      Entry {index + 1}
                    </span>
                    <button
                      onClick={() => {
                        const updatedEntries = editingSubmission.entries.filter(
                          (_, i) => i !== index
                        );
                        const updatedSubmission = {
                          ...editingSubmission,
                          entries: updatedEntries,
                          totalMinutes:
                            calculateTotalDuration(updatedEntries).totalMinutes,
                        };
                        onSubmissionChange(updatedSubmission);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">
                        Start Time
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          entry.startTime.length === 4
                            ? `${entry.startTime.substring(
                                0,
                                2
                              )}:${entry.startTime.substring(2, 4)}`
                            : entry.startTime
                        }
                        onChange={(e) => {
                          const formattedValue = formatEditTimeInput(
                            e.target.value
                          );
                          const formattedTime = formattedValue.replace(
                            /:/g,
                            ""
                          );

                          // Validate the time input
                          const errorKey = `startTime-${index}`;
                          if (
                            formattedValue.length === 5 &&
                            formattedValue.includes(":")
                          ) {
                            if (
                              !validateEditTimeInput(
                                formattedValue,
                                index,
                                "startTime"
                              )
                            ) {
                              onEditTimeErrorsChange({
                                ...editTimeErrors,
                                [errorKey]: "Invalid time format (HH:MM)",
                              });
                            } else {
                              onEditTimeErrorsChange({
                                ...editTimeErrors,
                                [errorKey]: "",
                              });
                            }
                          } else {
                            onEditTimeErrorsChange({
                              ...editTimeErrors,
                              [errorKey]: "",
                            });
                          }

                          const updatedEntries = [...editingSubmission.entries];
                          updatedEntries[index] = {
                            ...entry,
                            startTime: formattedTime,
                          };
                          const updatedSubmission = {
                            ...editingSubmission,
                            entries: updatedEntries,
                            totalMinutes: updatedEntries.reduce((total, e) => {
                              const startTime =
                                e.startTime.length === 4
                                  ? `${e.startTime.substring(
                                      0,
                                      2
                                    )}:${e.startTime.substring(2, 4)}`
                                  : e.startTime;
                              const endTime =
                                e.endTime.length === 4
                                  ? `${e.endTime.substring(
                                      0,
                                      2
                                    )}:${e.endTime.substring(2, 4)}`
                                  : e.endTime;
                              return (
                                total +
                                calculateDuration(startTime, endTime)
                                  .totalMinutes
                              );
                            }, 0),
                          };
                          onSubmissionChange(updatedSubmission);
                        }}
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#003D5B] focus:border-[#003D5B] ${
                          editTimeErrors[`startTime-${index}`]
                            ? "border-red-300 bg-red-50"
                            : "border-slate-300"
                        }`}
                        placeholder="HH:MM"
                      />
                      {editTimeErrors[`startTime-${index}`] && (
                        <p className="text-xs text-red-600 mt-1">
                          {editTimeErrors[`startTime-${index}`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">
                        End Time
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          entry.endTime.length === 4
                            ? `${entry.endTime.substring(
                                0,
                                2
                              )}:${entry.endTime.substring(2, 4)}`
                            : entry.endTime
                        }
                        onChange={(e) => {
                          const formattedValue = formatEditTimeInput(
                            e.target.value
                          );
                          const formattedTime = formattedValue.replace(
                            /:/g,
                            ""
                          );

                          // Validate the time input
                          const errorKey = `endTime-${index}`;
                          if (
                            formattedValue.length === 5 &&
                            formattedValue.includes(":")
                          ) {
                            if (
                              !validateEditTimeInput(
                                formattedValue,
                                index,
                                "endTime"
                              )
                            ) {
                              onEditTimeErrorsChange({
                                ...editTimeErrors,
                                [errorKey]: "Invalid time format (HH:MM)",
                              });
                            } else {
                              onEditTimeErrorsChange({
                                ...editTimeErrors,
                                [errorKey]: "",
                              });
                            }
                          } else {
                            onEditTimeErrorsChange({
                              ...editTimeErrors,
                              [errorKey]: "",
                            });
                          }

                          const updatedEntries = [...editingSubmission.entries];
                          updatedEntries[index] = {
                            ...entry,
                            endTime: formattedTime,
                          };
                          const updatedSubmission = {
                            ...editingSubmission,
                            entries: updatedEntries,
                            totalMinutes:
                              calculateTotalDuration(updatedEntries)
                                .totalMinutes,
                          };
                          onSubmissionChange(updatedSubmission);
                        }}
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 ${
                          editTimeErrors[`endTime-${index}`]
                            ? "border-red-300 bg-red-50"
                            : "border-slate-300"
                        }`}
                        placeholder="HH:MM"
                      />
                      {editTimeErrors[`endTime-${index}`] && (
                        <p className="text-xs text-red-600 mt-1">
                          {editTimeErrors[`endTime-${index}`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Entry */}
          <div>
            <button
              onClick={() => {
                const newEntry: TimeEntry = {
                  id: Date.now(),
                  startTime: "",
                  endTime: "",
                };
                const updatedSubmission = {
                  ...editingSubmission,
                  entries: [...editingSubmission.entries, newEntry],
                };
                onSubmissionChange(updatedSubmission);
              }}
              className="w-full py-2 px-4 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
            >
              + Add Entry
            </button>
          </div>

          {/* Preview */}
          <div className="bg-slate-50 p-3 rounded-md">
            <h4
              className={`text-sm font-medium mb-2 ${
                settings.darkMode ? "text-gray-200" : "text-slate-700"
              }`}
            >
              Preview
            </h4>
            <div className="text-sm text-slate-600 space-y-1">
              {editingSubmission.entries.map((entry, index) => {
                const startTime =
                  entry.startTime.length === 4
                    ? `${entry.startTime.substring(
                        0,
                        2
                      )}:${entry.startTime.substring(2, 4)}`
                    : entry.startTime;
                const endTime =
                  entry.endTime.length === 4
                    ? `${entry.endTime.substring(
                        0,
                        2
                      )}:${entry.endTime.substring(2, 4)}`
                    : entry.endTime;
                const duration = calculateDuration(startTime, endTime);
                return (
                  <div key={index} className="flex justify-between">
                    <span>
                      {startTime} - {endTime}
                    </span>
                    <span className="font-mono">
                      {formatDurationWithMinutes(duration)}
                    </span>
                  </div>
                );
              })}
              <div className="font-medium pt-1 border-t border-slate-200">
                Total:{" "}
                {formatDurationWithMinutes(
                  calculateTotalDuration(editingSubmission.entries)
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-gray-200 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Check if there are any validation errors
              const hasErrors = Object.values(editTimeErrors).some(
                (error) => error !== ""
              );
              if (hasErrors) {
                return; // Don't save if there are validation errors
              }

              // Check if all entries have complete, valid times
              const hasIncompleteEntries = editingSubmission.entries.some(
                (entry) => {
                  const startTimeFormatted =
                    entry.startTime.length === 4
                      ? `${entry.startTime.substring(
                          0,
                          2
                        )}:${entry.startTime.substring(2, 4)}`
                      : entry.startTime;
                  const endTimeFormatted =
                    entry.endTime.length === 4
                      ? `${entry.endTime.substring(
                          0,
                          2
                        )}:${entry.endTime.substring(2, 4)}`
                      : entry.endTime;

                  return (
                    !validateEditTimeInput(
                      startTimeFormatted,
                      0,
                      "startTime"
                    ) ||
                    !validateEditTimeInput(endTimeFormatted, 0, "endTime") ||
                    startTimeFormatted.length !== 5 ||
                    endTimeFormatted.length !== 5
                  );
                }
              );

              if (hasIncompleteEntries) {
                return; // Don't save if any entries are incomplete
              }

              onSave(editingSubmission);
            }}
            disabled={
              Object.values(editTimeErrors).some((error) => error !== "") ||
              editingSubmission.entries.some((entry) => {
                const startTimeFormatted =
                  entry.startTime.length === 4
                    ? `${entry.startTime.substring(
                        0,
                        2
                      )}:${entry.startTime.substring(2, 4)}`
                    : entry.startTime;
                const endTimeFormatted =
                  entry.endTime.length === 4
                    ? `${entry.endTime.substring(
                        0,
                        2
                      )}:${entry.endTime.substring(2, 4)}`
                    : entry.endTime;

                return (
                  !validateEditTimeInput(startTimeFormatted, 0, "startTime") ||
                  !validateEditTimeInput(endTimeFormatted, 0, "endTime") ||
                  startTimeFormatted.length !== 5 ||
                  endTimeFormatted.length !== 5
                );
              })
            }
            className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSubmissionModal;
