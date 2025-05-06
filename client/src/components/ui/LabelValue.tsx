import React from "react";
import { colors, typography } from "@/design/tokens";

interface LabelValueProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

/**
 * LabelValue component
 * 
 * A consistent component for displaying label-value pairs.
 */
export function LabelValue({ label, value, className = "" }: LabelValueProps) {
  return (
    <div className={className}>
      <p 
        className={`
          text-[${typography.fontSize.sm}] 
          font-${typography.fontWeight.medium} 
          tracking-[${typography.letterSpacing.normal}] 
          text-[${colors.white}] 
          opacity-60 
          mb-1
        `}
      >
        {label}
      </p>
      <p 
        className={`
          text-[${typography.fontSize.sm}] 
          font-${typography.fontWeight.medium} 
          tracking-[${typography.letterSpacing.normal}] 
          text-[${colors.white}]
        `}
      >
        {value}
      </p>
    </div>
  );
}
