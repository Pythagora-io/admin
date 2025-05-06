import React from "react";
import { colors, borderRadius, typography } from "@/design/tokens";

interface PlanTagProps {
  plan: string;
  className?: string;
}

/**
 * PlanTag component
 * 
 * A consistent tag for displaying plan types.
 */
export function PlanTag({ plan, className = "" }: PlanTagProps) {
  return (
    <div 
      className={`
        flex 
        h-[22px] 
        px-2 
        py-1 
        items-center 
        rounded-[${borderRadius.sm}] 
        bg-[${colors.yellow}]
        ${className}
      `}
    >
      <span 
        className={`
          text-xs 
          font-${typography.fontWeight.medium} 
          text-black
        `}
      >
        {plan} plan
      </span>
    </div>
  );
}
