import React from "react";
import { colors } from "@/design/tokens";

interface TokenProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

/**
 * TokenProgressBar component
 * 
 * A specialized progress bar for displaying token usage.
 */
export function TokenProgressBar({ value, max, className = "" }: TokenProgressBarProps) {
  // Calculate percentage, ensuring it doesn't exceed 100%
  const percentage = Math.min(100, (value / max) * 100);
  
  return (
    <div 
      className={`
        relative 
        w-full 
        h-[6px] 
        rounded-[40px] 
        bg-[${colors.redOpacity20}]
        ${className}
      `}
    >
      <div 
        className={`
          absolute 
          top-0 
          left-0 
          h-[6px] 
          rounded-[40px] 
          bg-[${colors.red}]
        `}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
