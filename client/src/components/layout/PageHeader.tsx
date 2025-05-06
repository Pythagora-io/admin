import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * PageHeader component
 * 
 * A consistent header for all pages in the application.
 * Provides the standard styling for page titles and subtitles.
 */
export function PageHeader({ title, subtitle, className = "" }: PageHeaderProps) {
  return (
    <div className={cn("mb-app-15", className)}>
      <h1 className="text-xl font-medium leading-tight tracking-tight text-app-white">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-app-2 text-sm font-normal tracking-normal text-app-grey">
          {subtitle}
        </p>
      )}
    </div>
  );
}
