import React, { useState } from "react";
import { DailyPay, Settings } from "../../types";

interface EditPayModalProps {
  editingPay: DailyPay | null;
  settings: Settings;
  onSave: (updatedPay: DailyPay) => void;
  onCancel: () => void;
}

const EditPayModal: React.FC<EditPayModalProps> = ({
  editingPay,
  settings,
  onSave,
  onCancel,
}) => {
  if (!editingPay) return null;

  const [formData, setFormData] = useState({
    date: editingPay.date,
    standardHours: editingPay.standardHours,
    standardMinutes: editingPay.standardMinutes,
    standardRate: editingPay.standardRate,
    overtimeHours: editingPay.overtimeHours,
    overtimeMinutes: editingPay.overtimeMinutes,
    overtimeRate: editingPay.overtimeRate,
    notes: editingPay.notes || "",
  });

  const handleInputChange = (field: string, value: string | number) => {
    // For number fields, allow empty string but convert to 0 for calculations
    if (
      typeof value === "string" &&
      (field.includes("Hours") ||
        field.includes("Minutes") ||
        field.includes("Rate"))
    ) {
      const numValue = value === "" ? 0 : parseFloat(value) || 0;
      setFormData((prev) => ({
        ...prev,
        [field]: value === "" ? "" : numValue,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = () => {
    // Calculate totals - handle empty strings by converting to 0
    const standardHours =
      typeof formData.standardHours === "string"
        ? 0
        : formData.standardHours || 0;
    const standardMinutes =
      typeof formData.standardMinutes === "string"
        ? 0
        : formData.standardMinutes || 0;
    const standardRate =
      typeof formData.standardRate === "string"
        ? 0
        : formData.standardRate || 0;
    const overtimeHours =
      typeof formData.overtimeHours === "string"
        ? 0
        : formData.overtimeHours || 0;
    const overtimeMinutes =
      typeof formData.overtimeMinutes === "string"
        ? 0
        : formData.overtimeMinutes || 0;
    const overtimeRate =
      typeof formData.overtimeRate === "string"
        ? 0
        : formData.overtimeRate || 0;

    const standardTotalMinutes = standardHours * 60 + standardMinutes;
    const overtimeTotalMinutes = overtimeHours * 60 + overtimeMinutes;

    const standardPay = (standardTotalMinutes / 60) * standardRate;
    const overtimePay = (overtimeTotalMinutes / 60) * overtimeRate;
    const totalPay = standardPay + overtimePay;

    // Calculate tax and NI if enabled
    const taxAmount = settings.enableTaxCalculations
      ? totalPay * settings.taxRate
      : 0;
    const afterTaxPay = totalPay - taxAmount;

    const calculateNI = (earnings: number): number => {
      const dailyNiThreshold = 34.44;
      const niRate = 0.12;
      if (earnings <= dailyNiThreshold) return 0;
      const taxableEarnings = earnings - dailyNiThreshold;
      return taxableEarnings * niRate;
    };

    const niAmount = settings.enableNiCalculations ? calculateNI(totalPay) : 0;
    const afterNiPay = totalPay - niAmount;

    const updatedPay: DailyPay = {
      ...editingPay,
      date: formData.date,
      standardHours,
      standardMinutes,
      standardRate,
      standardPay,
      overtimeHours,
      overtimeMinutes,
      overtimeRate,
      overtimePay,
      totalPay,
      taxAmount,
      afterTaxPay,
      niAmount,
      afterNiPay,
      notes: formData.notes,
    };

    onSave(updatedPay);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg w-full max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
        <div className="p-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Edit Pay Entry</h3>
            <button
              onClick={onCancel}
              className={`${
                settings.darkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
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
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-xs min-w-0 max-w-full"
            />
          </div>

          {/* Standard Hours */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  settings.darkMode ? "text-gray-200" : "text-slate-700"
                }`}
              >
                Standard Hours
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="24"
                value={formData.standardHours}
                onChange={(e) =>
                  handleInputChange("standardHours", e.target.value)
                }
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  settings.darkMode ? "text-gray-200" : "text-slate-700"
                }`}
              >
                Minutes
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="59"
                value={formData.standardMinutes}
                onChange={(e) =>
                  handleInputChange("standardMinutes", e.target.value)
                }
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  settings.darkMode ? "text-gray-200" : "text-slate-700"
                }`}
              >
                Rate (£)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={formData.standardRate}
                onChange={(e) =>
                  handleInputChange("standardRate", e.target.value)
                }
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
          </div>

          {/* Overtime Hours */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  settings.darkMode ? "text-gray-200" : "text-slate-700"
                }`}
              >
                Overtime Hours
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="24"
                value={formData.overtimeHours}
                onChange={(e) =>
                  handleInputChange("overtimeHours", e.target.value)
                }
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  settings.darkMode ? "text-gray-200" : "text-slate-700"
                }`}
              >
                Minutes
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="59"
                value={formData.overtimeMinutes}
                onChange={(e) =>
                  handleInputChange("overtimeMinutes", e.target.value)
                }
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  settings.darkMode ? "text-gray-200" : "text-slate-700"
                }`}
              >
                Rate (£)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={formData.overtimeRate}
                onChange={(e) =>
                  handleInputChange("overtimeRate", e.target.value)
                }
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${
                settings.darkMode ? "text-gray-200" : "text-slate-700"
              }`}
            >
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
              placeholder="Add any notes about this pay entry..."
            />
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
            <div
              className={`text-sm space-y-1 ${
                settings.darkMode ? "text-gray-300" : "text-slate-600"
              }`}
            >
              <div>
                Standard: {formData.standardHours || 0}h{" "}
                {formData.standardMinutes || 0}m @ £{formData.standardRate || 0}{" "}
                = £
                {(
                  ((formData.standardHours || 0) +
                    (formData.standardMinutes || 0) / 60) *
                  (formData.standardRate || 0)
                ).toFixed(2)}
              </div>
              {(formData.overtimeHours || 0) > 0 ||
              (formData.overtimeMinutes || 0) > 0 ? (
                <div>
                  Overtime: {formData.overtimeHours || 0}h{" "}
                  {formData.overtimeMinutes || 0}m @ £
                  {formData.overtimeRate || 0} = £
                  {(
                    ((formData.overtimeHours || 0) +
                      (formData.overtimeMinutes || 0) / 60) *
                    (formData.overtimeRate || 0)
                  ).toFixed(2)}
                </div>
              ) : null}
              <div className="font-medium">
                Total: £
                {(
                  ((formData.standardHours || 0) +
                    (formData.standardMinutes || 0) / 60) *
                    (formData.standardRate || 0) +
                  ((formData.overtimeHours || 0) +
                    (formData.overtimeMinutes || 0) / 60) *
                    (formData.overtimeRate || 0)
                ).toFixed(2)}
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
            onClick={handleSave}
            className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPayModal;
