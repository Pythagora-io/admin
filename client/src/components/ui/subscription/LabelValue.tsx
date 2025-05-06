import React from "react";
import { cn } from "@/lib/utils";

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
    <div className={cn(className)}>
      <p className="text-sm font-medium tracking-normal text-app-white opacity-60 mb-1">
        {label}
      </p>
      <p className="text-sm font-medium tracking-normal text-app-white">
        {value}
      </p>
    </div>
  );
}
