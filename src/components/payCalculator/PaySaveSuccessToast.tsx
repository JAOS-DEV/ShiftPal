import React from "react";

interface PaySaveSuccessToastProps {
  showSaveSuccess: boolean;
}

const PaySaveSuccessToast: React.FC<PaySaveSuccessToastProps> = ({
  showSaveSuccess,
}) => {
  if (!showSaveSuccess) return null;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <span className="text-sm font-medium">✅ Pay saved successfully!</span>
      </div>
    </div>
  );
};

export default PaySaveSuccessToast;
