import React from "react";

interface ProBadgeProps {
  text?: string;
}

const ProBadge: React.FC<ProBadgeProps> = ({ text = "Pro feature" }) => (
  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-semibold bg-amber-100 text-amber-800 border-amber-200 whitespace-nowrap">
    {text}
  </span>
);

export default ProBadge;
