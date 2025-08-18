import React, { useState, useMemo, useEffect, useRef } from "react";
import { usePeriodNavigation } from "../hooks/usePeriodNavigation";
import { usePeriodFilter } from "../hooks/usePeriodFilter";
import { DailyPay, Settings } from "../types";
import { PeriodSelector } from "../components/layout";
import {
  PayHistorySummary,
  PayHistoryList,
  EditPayModal,
} from "../components/payHistory";

interface PayHistoryProps {
  payHistory: DailyPay[];
  setPayHistory: (history: DailyPay[]) => void;
  settings: Settings;
  isLoadingCloudData?: boolean; // Add cloud sync loading state
}

const PayHistory: React.FC<PayHistoryProps> = ({
  payHistory,
  setPayHistory,
  settings,
  isLoadingCloudData = false, // Add default value
}) => {
  // Use shared period navigation hook
  const {
    selectedPeriod,
    setSelectedPeriod,
    selectedDate,
    setSelectedDate,
    getCurrentWeekStart,
    getCurrentMonthStart,
    goToCurrentPeriod,
    navigateWeek,
    navigateMonth,
    getPeriodLabel,
  } = usePeriodNavigation(settings);

  // Use shared period filter hook
  const filteredPayHistory = usePeriodFilter(
    payHistory,
    selectedPeriod,
    selectedDate,
    settings
  );

  // Edit modal state
  const [editingPay, setEditingPay] = useState<DailyPay | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Height state for scroll container
  const [payListHeight, setPayListHeight] = useState(400);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Calculate available space for pay list
  useEffect(() => {
    const calculatePayListHeight = () => {
      if (containerRef.current && headerRef.current) {
        const viewportHeight = window.innerHeight;
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerTop = containerRect.top;
        const availableViewportHeight = viewportHeight - containerTop;
        const headerHeight = headerRef.current.offsetHeight;

        // Simple calculation with correct spacing
        const navBarHeight = 44; // Correct bottom navigation height
        const padding = 5; // Reasonable padding for extra space

        const availableHeight =
          availableViewportHeight - headerHeight - navBarHeight - padding;
        const finalHeight = Math.max(availableHeight, 100);

        setPayListHeight(finalHeight);
      }
    };

    calculatePayListHeight();
    // Add a longer delay to ensure progress bars are fully rendered
    const timeoutId = setTimeout(calculatePayListHeight, 200);

    window.addEventListener("resize", calculatePayListHeight);

    // Use ResizeObserver to watch for header height changes
    let resizeObserver: ResizeObserver | null = null;
    if (headerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        calculatePayListHeight();
      });
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", calculatePayListHeight);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [
    selectedPeriod,
    settings.weeklyGoal,
    settings.monthlyGoal,
    filteredPayHistory,
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: settings.currency || "GBP",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // Sort pay history by date (newest first)
  const sortedPayHistory = useMemo(() => {
    return [...filteredPayHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredPayHistory]);

  // Calculate totals for the filtered period
  const periodTotals = useMemo(() => {
    return filteredPayHistory.reduce(
      (totals, pay) => {
        // Calculate standard pay and overtime pay using the stored values
        const standardPay = pay.standardPay;
        const overtimePay = pay.overtimePay;

        totals.totalPay += pay.totalPay;
        totals.standardPay += standardPay;
        totals.overtimePay += overtimePay;
        totals.totalHours += pay.standardHours + pay.overtimeHours;
        totals.totalMinutes += pay.standardMinutes + pay.overtimeMinutes;

        // Calculate tax for existing entries if tax calculations are enabled
        if (settings.enableTaxCalculations) {
          const taxAmount = pay.taxAmount || pay.totalPay * settings.taxRate;
          // Always recalculate after-tax amount when tax calculations are enabled
          const afterTaxPay = pay.totalPay - taxAmount;
          totals.totalTax += taxAmount;
          totals.afterTaxPay += afterTaxPay;
        } else {
          // Use stored values if tax calculations are disabled
          if (pay.taxAmount) {
            totals.totalTax += pay.taxAmount;
          }
          if (pay.afterTaxPay) {
            totals.afterTaxPay += pay.afterTaxPay;
          }
        }

        // Calculate NI for existing entries if NI calculations are enabled
        if (settings.enableNiCalculations) {
          const niAmount = pay.niAmount || 0;
          totals.totalNI += niAmount;
          totals.afterNIPay += pay.afterNiPay || pay.totalPay - niAmount;
        } else {
          // Use stored values if NI calculations are disabled
          if (pay.niAmount) {
            totals.totalNI += pay.niAmount;
          }
          if (pay.afterNiPay) {
            totals.afterNIPay += pay.afterNiPay;
          }
        }

        return totals;
      },
      {
        totalPay: 0,
        standardPay: 0,
        overtimePay: 0,
        totalHours: 0,
        totalMinutes: 0,
        totalTax: 0,
        afterTaxPay: 0,
        totalNI: 0,
        afterNIPay: 0,
      }
    );
  }, [
    filteredPayHistory,
    settings.enableTaxCalculations,
    settings.enableNiCalculations,
    settings.taxRate,
  ]);

  // Group pays by date
  const paysByDate = useMemo(() => {
    return filteredPayHistory.reduce((groups, pay) => {
      const date = pay.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(pay);
      return groups;
    }, {} as Record<string, DailyPay[]>);
  }, [filteredPayHistory]);

  const handleDeletePay = (payId: string) => {
    setPayHistory(payHistory.filter((pay) => pay.id !== payId));
  };

  const handleEditPay = (pay: DailyPay) => {
    setEditingPay(pay);
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedPay: DailyPay) => {
    if (updatedPay.id.startsWith("duplicate-")) {
      // This is a new duplicated entry, give it a proper unique ID and add it to pay history
      const newPay: DailyPay = {
        ...updatedPay,
        id: `${Date.now()}`, // Generate a proper unique ID
        timestamp: new Date().toISOString(),
      };
      setPayHistory([newPay, ...payHistory]);
    } else {
      // This is an existing entry being edited, update it
      setPayHistory(
        payHistory.map((pay) => (pay.id === updatedPay.id ? updatedPay : pay))
      );
    }
    setShowEditModal(false);
    setEditingPay(null);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingPay(null);
  };

  const handleToggleDropdown = (payId: string) => {
    setOpenDropdownId(openDropdownId === payId ? null : payId);
  };

  const handleCloseDropdown = () => {
    setOpenDropdownId(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openDropdownId &&
        !(event.target as Element).closest(".dropdown-menu")
      ) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId]);

  const handleDuplicatePay = (pay: DailyPay) => {
    // Create a copy of the pay entry with today's date
    const today = new Date().toISOString().split("T")[0];
    const duplicatedPay: DailyPay = {
      ...pay,
      id: `duplicate-${Date.now()}`, // Generate new ID
      date: today,
      timestamp: new Date().toISOString(),
      submissionTime: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Open edit modal with duplicated data
    setEditingPay(duplicatedPay);
    setShowEditModal(true);
  };

  return (
    <div
      ref={containerRef}
      className={`h-full flex flex-col overflow-hidden ${
        settings.darkMode ? "text-gray-100" : "text-gray-800"
      }`}
    >
      {/* Edit Modal */}
      {showEditModal && (
        <EditPayModal
          editingPay={editingPay}
          settings={settings}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
      {/* Header */}
      <div ref={headerRef} className="flex-shrink-0 p-3 space-y-2">
        {/* Period Selection */}
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          selectedDate={selectedDate}
          settings={settings}
          onPeriodChange={setSelectedPeriod}
          onDateChange={setSelectedDate}
          getPeriodLabel={getPeriodLabel}
          getCurrentWeekStart={getCurrentWeekStart}
          getCurrentMonthStart={getCurrentMonthStart}
          navigateWeek={navigateWeek}
          navigateMonth={navigateMonth}
          goToCurrentPeriod={goToCurrentPeriod}
        />

        {/* Cloud Sync Indicator */}
        {isLoadingCloudData && (
          <div
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
              settings.darkMode
                ? "bg-blue-900/30 border border-blue-700/50 text-blue-300"
                : "bg-blue-50 border border-blue-200 text-blue-700"
            }`}
          >
            <div
              className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin`}
            ></div>
            <span>Syncing with cloud...</span>
          </div>
        )}

        {/* Summary */}
        <div ref={summaryRef}>
          <PayHistorySummary
            periodTotals={periodTotals}
            selectedPeriod={selectedPeriod}
            settings={settings}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>

      {/* Pay List */}
      <div className="overflow-y-auto" style={{ height: `${payListHeight}px` }}>
        <div className="space-y-1.5 px-3">
          <PayHistoryList
            paysByDate={paysByDate}
            openDropdownId={openDropdownId}
            settings={settings}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            onToggleDropdown={handleToggleDropdown}
            onCloseDropdown={handleCloseDropdown}
            onEditPay={handleEditPay}
            onDuplicatePay={handleDuplicatePay}
            onDeletePay={handleDeletePay}
          />
        </div>
      </div>
    </div>
  );
};

export default PayHistory;
