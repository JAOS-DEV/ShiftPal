import React, { useState } from "react";
import { AuthForm } from "../components/auth";

const LandingPage: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const handleGetStarted = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F0] to-[#F0F4F8] overflow-y-auto">
      {/* Beta Testing Banner */}
      <div className="bg-orange-50 border-b border-orange-200 px-4 sm:px-6 py-2 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-orange-800 text-sm sm:text-base font-medium">
              🧪 Beta Testing Phase - Please report any issues you encounter
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#003D5B] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs sm:text-sm">SP</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-[#003D5B]">
            ShiftPal
          </span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => handleGetStarted("signin")}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-[#003D5B] font-medium hover:text-[#002A3F] transition-colors text-sm sm:text-base"
          >
            Sign In
          </button>
          <button
            onClick={() => handleGetStarted("signup")}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#003D5B] text-white rounded-lg font-medium hover:bg-[#002A3F] transition-colors text-sm sm:text-base"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 lg:py-12 xl:py-16 2xl:py-20 w-full">
        <div className="text-center mb-6 sm:mb-8 lg:mb-12 xl:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-[#003D5B] mb-3 sm:mb-4 md:mb-6 lg:mb-8">
            Track Time, <span className="text-[#0077CC]">Calculate Pay</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-2xl text-slate-600 mb-4 sm:mb-6 md:mb-8 lg:mb-10 max-w-3xl mx-auto px-4">
            The ultimate app for shift workers. Track your hours, calculate your
            pay.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 justify-center">
            <button
              onClick={() => handleGetStarted("signup")}
              className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-[#003D5B] text-white rounded-xl font-semibold text-sm sm:text-base md:text-lg hover:bg-[#002A3F] transition-colors shadow-lg"
            >
              Start Tracking Now
            </button>
            <button
              onClick={() => handleGetStarted("signin")}
              className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 border-2 border-[#003D5B] text-[#003D5B] rounded-xl font-semibold text-sm sm:text-base md:text-lg hover:bg-[#003D5B] hover:text-white transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* App Preview */}
        <div className="mb-8 sm:mb-12 lg:mb-16 xl:mb-20 2xl:mb-24">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 xl:p-12 2xl:p-16 w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-8">
              <div className="text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-blue-100 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xs sm:text-base md:text-lg font-semibold text-slate-800 mb-1 sm:mb-2">
                  Time Tracking
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm">
                  Log your shifts with start and end times. Submit daily entries
                  and track your total hours.
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-green-100 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3 className="text-xs sm:text-base md:text-lg font-semibold text-slate-800 mb-1 sm:mb-2">
                  Pay Calculator
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm">
                  Calculate your earnings with overtime rates, tax deductions,
                  and National Insurance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-6 sm:mb-8 lg:mb-12 xl:mb-16 2xl:mb-20">
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-center text-[#003D5B] mb-4 sm:mb-6 lg:mb-8 xl:mb-12 2xl:mb-16">
            Everything you need for shift work
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 2xl:gap-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="bg-white rounded-2xl p-3 sm:p-4 lg:p-6 xl:p-8 shadow-lg">
              <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-slate-800 mb-2 sm:mb-3 lg:mb-4">
                Smart Time Tracking
              </h3>
              <ul className="space-y-1.5 sm:space-y-2 text-slate-600 text-sm sm:text-base">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Easy shift entry with start/end times
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Daily submission tracking
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Total hours calculation
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-3 sm:p-4 lg:p-6 xl:p-8 shadow-lg">
              <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-slate-800 mb-2 sm:mb-3 lg:mb-4">
                Accurate Pay Calculations
              </h3>
              <ul className="space-y-1.5 sm:space-y-2 text-slate-600 text-sm sm:text-base">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Multiple pay rates support
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Tax and NI calculations
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Working time directive compliance
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-3 sm:p-4 lg:p-6 xl:p-8 shadow-lg">
              <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-slate-800 mb-2 sm:mb-3 lg:mb-4">
                Built for Shift Workers
              </h3>
              <ul className="space-y-1.5 sm:space-y-2 text-slate-600 text-sm sm:text-base">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Simple, intuitive interface
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Works offline for core features
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Fast and reliable performance
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Designed for mobile and desktop
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pb-8 sm:pb-12 lg:pb-16 xl:pb-20">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-[#003D5B] mb-3 sm:mb-4 lg:mb-6">
            Ready to take control of your shifts?
          </h2>
          <p className="text-slate-600 mb-4 sm:mb-6 lg:mb-8 xl:mb-10 text-sm sm:text-base lg:text-lg">
            The ultimate app for shift workers to track their time and calculate
            their pay.
          </p>
          <button
            onClick={() => handleGetStarted("signup")}
            className="px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 lg:py-4 xl:py-5 bg-[#003D5B] text-white rounded-xl font-semibold text-sm sm:text-base lg:text-lg xl:text-xl hover:bg-[#002A3F] transition-colors shadow-lg"
          >
            Start Free Today
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-full mx-4">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                  {authMode === "signin" ? "Welcome Back" : "Create Account"}
                </h2>
                <button
                  onClick={handleCloseAuth}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <AuthForm initialMode={authMode} onSuccess={handleCloseAuth} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
