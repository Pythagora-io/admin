import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * SectionHeader component
 * 
 * A consistent header for sections within a page.
 * Provides the standard styling for section titles with optional right-aligned content.
 */
export function SectionHeader({ title, children, className = "" }: SectionHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col md:flex-row md:items-center md:justify-between mb-6",
      className
    )}>
      <div className="flex items-center gap-3 mb-4 md:mb-0">
        <h2 className="text-base font-normal leading-base text-app-white">
          {title}
        </h2>
        {/* Slot for additional elements like tags/badges */}
      </div>
      {/* Right-aligned content like buttons */}
      {children}
    </div>
  );
}
