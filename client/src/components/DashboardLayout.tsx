import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardBackground from '@/assets/dashboard-background.svg';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader as CustomSidebarHeader,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter as CustomSidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "./ui/sidebar";
import {
  UserCircle,
  CreditCard,
  FileText,
  Globe,
  Settings,
  Layers,
  Users,
  LogOut,
  FileEdit,
  ExternalLink,
  Menu,
} from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

export function DashboardLayout() {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Open the projects submenu by default if we're on a projects page
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(
    location.pathname.startsWith("/projects") ? "projects" : null,
  );

  useEffect(() => {
    // Keep Projects submenu open if we're on a projects page
    if (
      location.pathname.startsWith("/projects") &&
      openSubmenu !== "projects"
    ) {
      setOpenSubmenu("projects");
    }
    // Close the submenu when navigating away from projects pages
    if (
      !location.pathname.startsWith("/projects") &&
      openSubmenu === "projects"
    ) {
      setOpenSubmenu(null);
    }
  }, [location.pathname, openSubmenu]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSubmenu = (key: string) => {
    setOpenSubmenu(openSubmenu === key ? null : key);
  };

  const isProjectsPage = location.pathname.startsWith("/projects");
  const isProjectsDraftsPage = location.pathname === "/projects/drafts";
  const isProjectsDeployedPage = location.pathname === "/projects/deployed";

  const navigateTo = (path: string) => {
    navigate(path);
  };

  const handleLogoClick = () => {
    navigateTo("/");
  };

  const handleLogoKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      navigateTo("/");
    }
  };

  const navButtonBaseClasses =
    "w-full flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150";
  const navButtonInactiveClasses =
    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
  const navButtonActiveClasses = "bg-btn-primary text-btn-primary-foreground";
  const iconClasses = "h-5 w-5 mr-2 flex-shrink-0";

  const renderSidebarContent = () => (
    <>
      <SidebarMenu className="space-y-1 px-2">
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={location.pathname === "/"}
            tooltip="Account"
            onClick={() => navigateTo("/")}
            className={cn(
              navButtonBaseClasses,
              location.pathname === "/"
                ? navButtonActiveClasses
                : navButtonInactiveClasses,
            )}
          >
            <UserCircle className={cn(iconClasses, "stroke-current")} />
            <span>Account</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={location.pathname === "/subscription"}
            tooltip="Subscription"
            onClick={() => navigateTo("/subscription")}
            className={cn(
              navButtonBaseClasses,
              location.pathname === "/subscription"
                ? navButtonActiveClasses
                : navButtonInactiveClasses,
            )}
          >
            <CreditCard className={cn(iconClasses, "")} />
            <span>Subscription</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={location.pathname === "/payments"}
            tooltip="Payments"
            onClick={() => navigateTo("/payments")}
            className={cn(
              navButtonBaseClasses,
              location.pathname === "/payments"
                ? navButtonActiveClasses
                : navButtonInactiveClasses,
            )}
          >
            <FileText className={cn(iconClasses, "stroke-current")} />
            <span>Payments</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={location.pathname === "/domains"}
            tooltip="Domains"
            onClick={() => navigateTo("/domains")}
            className={cn(
              navButtonBaseClasses,
              location.pathname === "/domains"
                ? navButtonActiveClasses
                : navButtonInactiveClasses,
            )}
          >
            <Globe className={cn(iconClasses, "")} />
            <span>Domains</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={isProjectsPage}
            tooltip="Projects"
            onClick={() => {
              toggleSubmenu("projects");
              if (!isProjectsPage) {
                navigateTo("/projects/drafts");
              }
            }}
            className={cn(
              navButtonBaseClasses,
              isProjectsPage
                ? navButtonActiveClasses
                : navButtonInactiveClasses,
            )}
          >
            <Layers className={cn(iconClasses, "stroke-current")} />
            <span>Projects</span>
          </SidebarMenuButton>
          {openSubmenu === "projects" && (
            <SidebarMenuSub className="mt-1 ml-2 pl-6 border-l">
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={isProjectsDraftsPage}
                  onClick={() => navigateTo("/projects/drafts")}
                  className={cn(
                    "py-1.5 px-3 text-sm font-medium rounded-md w-full flex items-center",
                    isProjectsDraftsPage
                      ? "text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <FileEdit
                    className={cn(iconClasses, "h-4 w-4 stroke-current")}
                  />
                  Drafts
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={isProjectsDeployedPage}
                  onClick={() => navigateTo("/projects/deployed")}
                  className={cn(
                    "py-1.5 px-3 text-sm font-medium rounded-md w-full flex items-center",
                    isProjectsDeployedPage
                      ? "text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <ExternalLink
                    className={cn(iconClasses, "h-4 w-4 stroke-current")}
                  />
                  Deployed
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={location.pathname === "/settings"}
            tooltip="Settings"
            onClick={() => navigateTo("/settings")}
            className={cn(
              navButtonBaseClasses,
              location.pathname === "/settings"
                ? navButtonActiveClasses
                : navButtonInactiveClasses,
            )}
          >
            <Settings className={cn(iconClasses, "stroke-current")} />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={location.pathname === "/team"}
            tooltip="Team"
            onClick={() => navigateTo("/team")}
            className={cn(
              navButtonBaseClasses,
              location.pathname === "/team"
                ? navButtonActiveClasses
                : navButtonInactiveClasses,
            )}
          >
            <Users className={cn(iconClasses, "stroke-current")} />
            <span>Team</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );

  return (
    <div className="relative min-h-screen">
      {/* <BackgroundImage /> */}

      <SidebarProvider>
        <Sidebar className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-50 md:w-48 bg-black pl-1 py-2">
          <CustomSidebarHeader className="flex justify-start pt-6 pb-4 pl-6">
            <div
              onClick={handleLogoClick}
              onKeyDown={handleLogoKeyDown}
              role="button"
              tabIndex={0}
              className="flex items-center cursor-pointer"
              aria-label="Go to homepage"
            >
              <svg
                width="22"
                height="21"
                viewBox="0 0 22 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M9.03434 1.44003C8.51753 1.81812 8.06841 2.631 7.17016 4.25674L1.27418 14.9279C0.462737 16.3965 0.0570166 17.1308 0.00899945 17.725C-0.0888068 18.9353 0.61797 20.0726 1.7701 20.5589C2.33572 20.7977 3.19777 20.7977 4.92186 20.7977H16.7138C18.4379 20.7977 19.2999 20.7977 19.8656 20.5589C21.0177 20.0726 21.7245 18.9353 21.6267 17.725C21.5787 17.1308 21.1729 16.3965 20.3615 14.9279L14.4655 4.25674C13.5673 2.631 13.1181 1.81812 12.6013 1.44003C11.5466 0.668428 10.089 0.668428 9.03434 1.44003ZM10.6494 5.3605C10.2872 5.45603 10.0342 5.91608 9.52829 6.83618L4.36435 16.2274C3.92963 17.018 4.50772 17.9741 5.43453 17.9973C6.89391 18.0339 17.3358 16.3973 15.3793 12.7456L12.2208 6.85007C11.7251 5.9248 11.4772 5.46217 11.1161 5.36291C10.9637 5.32101 10.8023 5.32018 10.6494 5.3605Z"
                  fill="#FFD11A"
                />
              </svg>

              <span className="ml-2 text-lg font-semibold text-foreground">
                Pythagora
              </span>
            </div>
          </CustomSidebarHeader>
          <SidebarContent className="flex-1 overflow-y-auto">
            {renderSidebarContent()}
          </SidebarContent>
          <CustomSidebarFooter className="mt-auto py-4 px-4">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5 stroke-current" />
              </Button>
            </div>
          </CustomSidebarFooter>
        </Sidebar>
      </SidebarProvider>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-30 bg-background/80 backdrop-blur-sm shadow-sm border p-2 rounded-lg text-white"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 bg-black p-0 flex flex-col">
            <SidebarProvider>
              <SheetHeader className="pt-6 pb-4 px-4 border-b">
                <div className="flex items-center justify-between">
                  <div
                    onClick={handleLogoClick}
                    onKeyDown={handleLogoKeyDown}
                    role="button"
                    tabIndex={0}
                    className="flex items-center cursor-pointer"
                    aria-label="Go to homepage"
                  >
                    <svg
                      width="22"
                      height="21"
                      viewBox="0 0 22 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M9.03434 1.44003C8.51753 1.81812 8.06841 2.631 7.17016 4.25674L1.27418 14.9279C0.462737 16.3965 0.0570166 17.1308 0.00899945 17.725C-0.0888068 18.9353 0.61797 20.0726 1.7701 20.5589C2.33572 20.7977 3.19777 20.7977 4.92186 20.7977H16.7138C18.4379 20.7977 19.2999 20.7977 19.8656 20.5589C21.0177 20.0726 21.7245 18.9353 21.6267 17.725C21.5787 17.1308 21.1729 16.3965 20.3615 14.9279L14.4655 4.25674C13.5673 2.631 13.1181 1.81812 12.6013 1.44003C11.5466 0.668428 10.089 0.668428 9.03434 1.44003ZM10.6494 5.3605C10.2872 5.45603 10.0342 5.91608 9.52829 6.83618L4.36435 16.2274C3.92963 17.018 4.50772 17.9741 5.43453 17.9973C6.89391 18.0339 17.3358 16.3973 15.3793 12.7456L12.2208 6.85007C11.7251 5.9248 11.4772 5.46217 11.1161 5.36291C10.9637 5.32101 10.8023 5.32018 10.6494 5.3605Z"
                        fill="#FFD11A"
                      />
                    </svg>
                    <span className="ml-2 text-lg font-semibold text-foreground">
                      Pythagora
                    </span>
                  </div>
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-4">
                {renderSidebarContent()}
              </div>
              <SheetFooter className="mt-auto py-4 px-4 border-t">
                <div className="flex items-center justify-between">
                  <ThemeToggle />
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg"
                      aria-label="Log out"
                    >
                      <LogOut className="h-5 w-5 stroke-current" />
                    </Button>
                  </SheetClose>
                </div>
              </SheetFooter>
            </SidebarProvider>
          </SheetContent>
        </Sheet>
      </div>

      <main className="relative min-h-screen flex flex-col flex-1 overflow-y-auto md:ml-48 py-4">
        <div className="flex-1 bg-[rgba(17,16,22,0.8)] border border-[rgba(247,248,248,0.1)] rounded-2xl backdrop-blur-lg px-4 md:px-6 py-4 md:py-6">
          <div className="mx-auto max-w-7xl h-full">
            <Outlet />
          </div>
        </div>

        <div className="flex absolute bottom-0 left-0 right-0 -z-10">
          <img
            src={DashboardBackground}
            alt="Decorative background"
            className="w-full h-auto"
          />
        </div>
      </main>
    </div>
  );
}
