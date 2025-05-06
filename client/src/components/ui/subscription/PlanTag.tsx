import React from "react";
import { cn } from "@/lib/utils";

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
      className={cn(
        "flex h-[22px] px-2 py-1 items-center rounded-app-sm bg-app-yellow",
        className
      )}
    >
      <span className="text-xs font-medium text-black">
        {plan} plan
      </span>
    </div>
  );
}
