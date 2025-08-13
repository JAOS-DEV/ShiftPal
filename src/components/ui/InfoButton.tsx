import React from "react";
import { Settings } from "../../types";

interface InfoButtonProps {
  onClick: () => void;
  title: string;
  settings: Settings;
  size?: "sm" | "md" | "lg";
}

const InfoButton: React.FC<InfoButtonProps> = ({
  onClick,
  title,
  settings,
  size = "sm",
}) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      onClick={onClick}
      className="text-[rgb(55_65_81)] hover:text-[rgb(75_85_99)] transition-colors"
      title={title}
    >
      <svg
        className={sizeClasses[size]}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
};

export default InfoButton;
