import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

interface SidebarContextProps {
  isOpen: boolean;
  toggle: () => void;
  isMobile: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined,
);

interface SidebarProviderProps {
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SidebarProvider({
  defaultOpen = false,
  children,
}: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(defaultOpen);
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [defaultOpen]);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, isMobile, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sidebar({
  className,
  open,
  onOpenChange,
  ...props
}: SidebarProps) {
  const { isOpen, isMobile, setIsOpen } = useSidebar();

  // Sync the controlled state with context if provided
  React.useEffect(() => {
    if (open !== undefined && open !== isOpen) {
      setIsOpen(open);
    }
  }, [open, isOpen, setIsOpen]);

  // Notify parent of changes
  React.useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  return (
    <aside
      className={cn(
        "h-screen flex-shrink-0 flex flex-col overflow-hidden z-20 bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        isOpen ? "md:w-48" : isMobile ? "-translate-x-full w-64" : "md:w-16",
        className,
      )}
      {...props}
    />
  );
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  const { isOpen } = useSidebar();

  return (
    <div
      className={cn(
        "w-full flex items-center h-16",
        isOpen ? "justify-between px-4" : "justify-center px-0",
        className,
      )}
      {...props}
    />
  );
}

interface SidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: SidebarTriggerProps) {
  const { toggle } = useSidebar();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggle();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn("p-2 rounded-md hover:bg-accent", className)}
      {...props}
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SidebarContent({ className, ...props }: SidebarContentProps) {
  return <div className={cn("flex-1 overflow-auto", className)} {...props} />;
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return <div className={cn("", className)} {...props} />;
}

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SidebarMenu({ className, ...props }: SidebarMenuProps) {
  return <div className={cn("py-2", className)} {...props} />;
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SidebarMenuItem({ className, ...props }: SidebarMenuItemProps) {
  return <div className={cn("py-0", className)} {...props} />;
}

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  tooltip?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SidebarMenuButton({
  isActive = false,
  tooltip,
  className,
  children,
  ...props
}: SidebarMenuButtonProps) {
  const { isOpen } = useSidebar();

  return (
    <button
      data-tooltip-id={tooltip && !isOpen ? "sidebar-tooltip" : undefined}
      data-tooltip-content={tooltip && !isOpen ? tooltip : undefined}
      className={cn(
        "relative group flex items-center rounded-md px-4 py-2 w-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isActive
          ? "bg-sidebar-active text-sidebar-active-foreground font-medium"
          : "hover:bg-sidebar-hover text-sidebar-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface SidebarMenuBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

export function SidebarMenuBadge({
  className,
  ...props
}: SidebarMenuBadgeProps) {
  return (
    <span
      className={cn(
        "ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-medium leading-none text-primary-foreground",
        className,
      )}
      {...props}
    />
  );
}

interface SidebarMenuActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function SidebarMenuAction({
  className,
  ...props
}: SidebarMenuActionProps) {
  return (
    <button
      className={cn(
        "group flex items-center rounded-md p-2 w-full transition-colors",
        "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

interface SidebarMenuSubProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SidebarMenuSub({ className, ...props }: SidebarMenuSubProps) {
  return <div className={cn("mt-0", className)} {...props} />;
}

interface SidebarMenuSubItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SidebarMenuSubItem({
  className,
  ...props
}: SidebarMenuSubItemProps) {
  return <div className={cn("py-0", className)} {...props} />;
}

interface SidebarMenuSubButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function SidebarMenuSubButton({
  isActive = false,
  className,
  children,
  ...props
}: SidebarMenuSubButtonProps) {
  return (
    <button
      className={cn(
        "group flex items-center rounded-md pl-8 pr-4 py-2 w-full transition-colors text-sm",
        isActive
          ? "text-primary font-medium"
          : "text-muted-foreground hover:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SidebarInset({ className, ...props }: SidebarInsetProps) {
  const { isOpen } = useSidebar();
  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        isOpen ? "pl-8" : "pl-0 w-full flex justify-center",
        className,
      )}
      {...props}
    />
  );
}

interface SidebarInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function SidebarInput({ className, ...props }: SidebarInputProps) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenuSkeleton() {
  return (
    <div className="space-y-2 py-2">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-10 w-full rounded-md bg-muted animate-pulse"
        />
      ))}
    </div>
  );
}

export function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen } = useSidebar();
  return (
    <div
      className={cn(
        "px-2 py-1 text-xs font-medium text-muted-foreground transition-opacity duration-300",
        !isOpen && "opacity-0 w-0 h-0 overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("py-2", className)} {...props} />;
}

export function SidebarGroupContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

export function SidebarGroupAction({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { isOpen } = useSidebar();
  return (
    <button
      className={cn(
        "p-1 rounded-md text-muted-foreground hover:text-accent-foreground transition-opacity duration-300",
        !isOpen && "opacity-0 w-0 h-0 pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("-mx-2 my-2 h-px bg-border", className)} {...props} />
  );
}
