import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageContainer component
 *
 * A consistent container for all pages in the application.
 * Provides the standard styling for page wrappers including background, border, and padding.
 */
export function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "min-h-[calc(100dvh-32px)]",
        "rounded-app-md",
        "border",
        "border-app-stroke-dark",
        "bg-app-window-blur",
        "backdrop-blur-app",
        "p-6 md:p-app-15",
        className
      )}
    >
      {children}
    </div>
  );
}
