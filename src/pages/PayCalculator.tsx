import React, { useState, useEffect, useRef } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import {
  decimalHoursToDuration,
  formatDurationWithMinutes,
} from "../utils/timeUtils";
import { formatCurrency } from "../utils/formatUtils";
import { DailyPay, Settings, DailySubmission, UserProfile } from "../types";
import PayHistory from "./PayHistory";
import { isPro } from "../services/firestoreStorage";
import { UpgradeModal } from "../components/modals";
import {
  PayCalculatorTabs,
  CalculationMethodToggle,
  PayCalculatorInputs,
  TotalPayDisplay,
  PayCalculatorSaveSection,
  PayBreakdownModal,
  CalculationInfoModal,
  DateInfoModal,
  TaxInfoModal,
  PaySaveSuccessToast,
} from "../components/payCalculator/index";

interface PayCalculatorProps {
  totalMinutes: number;
  hourlyRate: number;
  setHourlyRate: (rate: number) => void;
  settings: Settings;
  payHistory: DailyPay[];
  setPayHistory: (history: DailyPay[]) => void;
  dailySubmissions: DailySubmission[];
  userProfile?: UserProfile | null;
}

const PayCalculator: React.FC<PayCalculatorProps> = ({
  totalMinutes,
  hourlyRate,
  setHourlyRate,
  settings,
  payHistory,
  setPayHistory,
  dailySubmissions,
  userProfile,
}) => {
  const [activeTab, setActiveTab] = useState<"calculator" | "history">(
    "calculator"
  );
  const [useManualHours, setUseManualHours] = useLocalStorage<boolean>(
    "useManualHours",
    false
  );
  const [manualHours, setManualHours] = useLocalStorage<number>(
    "manualHours",
    0
  );
  const [manualMinutes, setManualMinutes] = useLocalStorage<number>(
    "manualMinutes",
    0
  );
  const [overtimeHours, setOvertimeHours] = useLocalStorage<number>(
    "overtimeHours",
    0
  );
  const [overtimeMinutes, setOvertimeMinutes] = useLocalStorage<number>(
    "overtimeMinutes",
    0
  );
  const [overtimeRate, setOvertimeRate] = useLocalStorage<number>(
    "overtimeRate",
    0
  );
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showDateInfoModal, setShowDateInfoModal] = useState(false);
  const [showTaxInfoModal, setShowTaxInfoModal] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string | undefined>(
    undefined
  );
  const [payDate, setPayDate] = useLocalStorage<string>(
    "payDate",
    new Date().toISOString().split("T")[0]
  );

  const userIsPro = isPro(userProfile || null);
  const openUpgrade = (feature: string) => {
    setUpgradeFeature(feature);
    setUpgradeOpen(true);
  };

  // Track selected rate IDs for dropdowns
  const [selectedStandardRateId, setSelectedStandardRateId] =
    useLocalStorage<string>("selectedStandardRateId", "");
  const [selectedOvertimeRateId, setSelectedOvertimeRateId] =
    useLocalStorage<string>("selectedOvertimeRateId", "");

  const containerRef = useRef<HTMLDivElement>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);
  const totalSectionRef = useRef<HTMLDivElement>(null);

  // Sync selected rate IDs with current rates and validate selections
  useEffect(() => {
    // Check if selected standard rate still exists
    if (selectedStandardRateId && settings.standardRates) {
      const rateExists = settings.standardRates.some(
        (rate) => rate.id === selectedStandardRateId
      );
      if (!rateExists) {
        setSelectedStandardRateId("");
      }
    }

    // Check if selected overtime rate still exists
    if (selectedOvertimeRateId && settings.overtimeRates) {
      const rateExists = settings.overtimeRates.some(
        (rate) => rate.id === selectedOvertimeRateId
      );
      if (!rateExists) {
        setSelectedOvertimeRateId("");
      }
    }

    // Sync hourly rate with selected standard rate
    if (selectedStandardRateId && settings.standardRates) {
      const selectedRate = settings.standardRates.find(
        (rate) => rate.id === selectedStandardRateId
      );
      if (selectedRate && hourlyRate !== selectedRate.rate) {
        setHourlyRate(selectedRate.rate);
      }
    }

    // Sync overtime rate with selected overtime rate
    if (selectedOvertimeRateId && settings.overtimeRates) {
      const selectedRate = settings.overtimeRates.find(
        (rate) => rate.id === selectedOvertimeRateId
      );
      if (selectedRate && overtimeRate !== selectedRate.rate) {
        setOvertimeRate(selectedRate.rate);
      }
    }
  }, [
    selectedStandardRateId,
    selectedOvertimeRateId,
    settings.standardRates,
    settings.overtimeRates,
    hourlyRate,
    overtimeRate,
  ]);

  // Calculate total minutes for the selected date by combining current entries with submitted entries
  const getTotalMinutesForDate = (
    date: string
  ): { submitted: number; unsubmitted: number; total: number } => {
    // Get submitted entries for the specified date
    const submittedEntriesForDate = dailySubmissions.filter(
      (submission) => submission.date === date
    );

    // Calculate total from submitted entries
    const submittedTotal = submittedEntriesForDate.reduce(
      (sum, submission) => sum + submission.totalMinutes,
      0
    );

    // If the selected date is today, also include current unsubmitted entries
    const today = new Date().toISOString().split("T")[0];
    const unsubmittedTotal = date === today ? totalMinutes : 0;

    // Return the breakdown
    return {
      submitted: submittedTotal,
      unsubmitted: unsubmittedTotal,
      total: submittedTotal + unsubmittedTotal,
    };
  };

  const timeBreakdown = getTotalMinutesForDate(payDate);
  const totalMinutesForSelectedDate = timeBreakdown.total;

  const duration = useManualHours
    ? {
        hours: manualHours,
        minutes: manualMinutes,
        totalMinutes: manualHours * 60 + manualMinutes,
      }
    : {
        hours: Math.floor(totalMinutesForSelectedDate / 60),
        minutes: totalMinutesForSelectedDate % 60,
        totalMinutes: totalMinutesForSelectedDate,
      };

  const overtimeDuration = {
    hours: overtimeHours,
    minutes: overtimeMinutes,
    totalMinutes: overtimeHours * 60 + overtimeMinutes,
  };

  // Calculate earnings breakdown
  const standardEarnings = (duration.totalMinutes / 60) * hourlyRate;
  const overtimeEarnings =
    (overtimeDuration.totalMinutes / 60) * (overtimeRate || hourlyRate);
  const totalEarnings = standardEarnings + overtimeEarnings;

  // Tax calculations
  const proTaxEnabled =
    isPro(userProfile || null) && settings.enableTaxCalculations;
  const taxAmount = proTaxEnabled ? totalEarnings * settings.taxRate : 0;
  const afterTaxEarnings = totalEarnings - taxAmount;

  // NI calculations (UK National Insurance)
  const calculateNI = (earnings: number): number => {
    if (!(isPro(userProfile || null) && settings.enableNiCalculations))
      return 0;

    // For daily pay calculations, use a more realistic daily threshold
    // Using a lower threshold that makes sense for daily work
    const dailyNiThreshold = 10.0; // £10 per day threshold
    const niRate = 0.12; // 12% for earnings above threshold

    if (earnings <= dailyNiThreshold) return 0;

    const taxableEarnings = earnings - dailyNiThreshold;
    const niAmount = taxableEarnings * niRate;

    return niAmount;
  };

  const niAmount = calculateNI(totalEarnings);
  const afterNiEarnings = totalEarnings - niAmount;

  // Get submissions for the selected date
  const submissionsForDate = payHistory.filter((pay) => pay.date === payDate);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSavePay = () => {
    if (totalEarnings <= 0) return;

    // Pro gating: limit free users to 30 pay history entries
    if (!userIsPro && payHistory.length >= 30) {
      openUpgrade("unlimited pay history");
      return;
    }

    const newPay: DailyPay = {
      id: `${Date.now()}`,
      date: payDate,
      timestamp: new Date().toISOString(),
      submissionTime: getCurrentTime(),
      standardHours: Math.floor(duration.totalMinutes / 60),
      standardMinutes: duration.totalMinutes % 60,
      standardRate: hourlyRate,
      standardPay: standardEarnings,
      overtimeHours: Math.floor(overtimeDuration.totalMinutes / 60),
      overtimeMinutes: overtimeDuration.totalMinutes % 60,
      overtimeRate: overtimeRate || hourlyRate,
      overtimePay: overtimeEarnings,
      totalPay: totalEarnings,
      calculationMethod: useManualHours ? "manualHours" : "timeTracker",
      taxAmount,
      afterTaxPay: afterTaxEarnings,
      taxRate: settings.taxRate,
      niAmount,
      afterNiPay: afterNiEarnings,
    };

    setPayHistory([...payHistory, newPay]);
    setShowSaveSuccess(true);

    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 3000);
  };

  // Calculate available space for breakdown
  useEffect(() => {
    const calculateBreakdownHeight = () => {
      if (
        containerRef.current &&
        inputSectionRef.current &&
        totalSectionRef.current
      ) {
        const viewportHeight = window.innerHeight;
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerTop = containerRect.top;
        const availableViewportHeight = viewportHeight - containerTop;

        const inputHeight = inputSectionRef.current.offsetHeight;
        const totalHeight = totalSectionRef.current.offsetHeight;
        const navBarHeight = 64;
        const padding = 16;

        const availableHeight =
          availableViewportHeight -
          inputHeight -
          totalHeight -
          navBarHeight -
          padding;

        const finalHeight = Math.max(availableHeight, 100);
        // We don't need this anymore since we're using a modal
      }
    };

    calculateBreakdownHeight();
    const timeoutId = setTimeout(calculateBreakdownHeight, 100);

    window.addEventListener("resize", calculateBreakdownHeight);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", calculateBreakdownHeight);
    };
  }, [activeTab]);

  return (
    <div
      className={`h-full flex flex-col ${
        settings.darkMode ? "bg-gray-800" : "bg-[#FAF7F0]"
      }`}
    >
      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        featureName={upgradeFeature}
        darkMode={settings.darkMode}
      />

      {/* Success Toast */}
      <PaySaveSuccessToast showSaveSuccess={showSaveSuccess} />

      {/* Breakdown Modal */}
      <PayBreakdownModal
        showBreakdownModal={showBreakdownModal}
        setShowBreakdownModal={setShowBreakdownModal}
        useManualHours={useManualHours}
        timeBreakdown={timeBreakdown}
        duration={duration}
        overtimeDuration={overtimeDuration}
        hourlyRate={hourlyRate}
        overtimeRate={overtimeRate}
        standardEarnings={standardEarnings}
        overtimeEarnings={overtimeEarnings}
        totalEarnings={totalEarnings}
        proTaxEnabled={proTaxEnabled}
        taxAmount={taxAmount}
        niAmount={niAmount}
        settings={settings}
        formatCurrency={formatCurrency}
      />

      {/* Info Modal */}
      <CalculationInfoModal
        showInfoModal={showInfoModal}
        setShowInfoModal={setShowInfoModal}
        settings={settings}
      />

      {/* Date Info Modal */}
      <DateInfoModal
        showDateInfoModal={showDateInfoModal}
        setShowDateInfoModal={setShowDateInfoModal}
        settings={settings}
      />

      {/* Tax Info Modal */}
      <TaxInfoModal
        showTaxInfoModal={showTaxInfoModal}
        setShowTaxInfoModal={setShowTaxInfoModal}
        settings={settings}
      />

      {/* Internal Navigation Tabs */}
      <PayCalculatorTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
      />

      {/* Content based on active tab */}
      {activeTab === "calculator" ? (
        <>
          <div ref={inputSectionRef} className="flex-shrink-0 space-y-1 p-3">
            {/* Toggle Section */}
            <CalculationMethodToggle
              useManualHours={useManualHours}
              setUseManualHours={setUseManualHours}
              setShowInfoModal={setShowInfoModal}
              settings={settings}
            />

            {/* Input Fields Grid */}
            <PayCalculatorInputs
              useManualHours={useManualHours}
              hourlyRate={hourlyRate}
              setHourlyRate={setHourlyRate}
              manualHours={manualHours}
              setManualHours={setManualHours}
              manualMinutes={manualMinutes}
              setManualMinutes={setManualMinutes}
              overtimeRate={overtimeRate}
              setOvertimeRate={setOvertimeRate}
              overtimeHours={overtimeHours}
              setOvertimeHours={setOvertimeHours}
              overtimeMinutes={overtimeMinutes}
              setOvertimeMinutes={setOvertimeMinutes}
              selectedStandardRateId={selectedStandardRateId}
              setSelectedStandardRateId={setSelectedStandardRateId}
              selectedOvertimeRateId={selectedOvertimeRateId}
              setSelectedOvertimeRateId={setSelectedOvertimeRateId}
              settings={settings}
            />
          </div>

          {/* Total Pay Display */}
          <TotalPayDisplay
            totalEarnings={totalEarnings}
            proTaxEnabled={proTaxEnabled}
            taxAmount={taxAmount}
            niAmount={niAmount}
            useManualHours={useManualHours}
            timeBreakdown={timeBreakdown}
            setShowBreakdownModal={setShowBreakdownModal}
            setShowTaxInfoModal={setShowTaxInfoModal}
            settings={settings}
            formatCurrency={formatCurrency}
          />

          {/* Save Section */}
          <div ref={totalSectionRef}>
            <PayCalculatorSaveSection
              payDate={payDate}
              setPayDate={setPayDate}
              submissionsForDate={submissionsForDate}
              setShowDateInfoModal={setShowDateInfoModal}
              handleSavePay={handleSavePay}
              totalEarnings={totalEarnings}
              settings={settings}
            />
          </div>
        </>
      ) : (
        <div className="flex-1">
          <PayHistory
            payHistory={payHistory}
            setPayHistory={setPayHistory}
            settings={settings}
          />
        </div>
      )}
    </div>
  );
};

export default PayCalculator;
