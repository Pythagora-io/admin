import React from "react";
import { cn } from "@/lib/utils";

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
      className={cn(
        "relative w-full h-[6px] rounded-[40px] bg-app-red-opacity-20",
        className
      )}
    >
      <div 
        className="absolute top-0 left-0 h-[6px] rounded-[40px] bg-app-red"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
