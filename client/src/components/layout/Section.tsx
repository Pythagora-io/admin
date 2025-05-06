import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Section component
 * 
 * A consistent container for sections within a page.
 * Provides the standard spacing between sections.
 */
export function Section({ children, className = "" }: SectionProps) {
  return (
    <div className={cn("mb-app-10", className)}>
      {children}
    </div>
  );
}
