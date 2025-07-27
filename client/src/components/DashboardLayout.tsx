import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardBackground from "@/assets/dashboard-background.svg";
import PythagoraIcon from "./icons/PythagoraIcon";

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
  ReceiptText,
  Globe,
  Settings2,
  Folder,
  Users,
  LogOut,
  SquarePen,
  ExternalLink,
  Menu,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
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
import { getCurrentUser } from "@/api/user";

interface User {
  _id: string;
  name?: string;
  email: string;
  receiveUpdates?: boolean;
}

export function DashboardLayout() {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { user } = await getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getUserInitials = (): string => {
    if (!user) return "U";

    if (user.name && user.name.trim()) {
      return user.name.trim().charAt(0).toUpperCase();
    }

    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "U";
  };

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
    "w-full flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors duration-150";
  const navButtonInactiveClasses =
    "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-active-foreground";
  const navButtonActiveClasses = "bg-primary text-sidebar-active-foreground";
  const iconClasses = "h-5 w-5 mr-3 flex-shrink-0";

  const renderSidebarContent = () => (
    <>
      <SidebarMenu className="px-2">
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={false}
            tooltip="Projects"
            onClick={() => {
              toggleSubmenu("projects");
              if (!isProjectsPage) {
                navigateTo("/projects/drafts");
              }
            }}
            className={cn(navButtonBaseClasses, navButtonInactiveClasses)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Folder className={cn(iconClasses, "text-sidebar-muted")} />
                <span>Projects</span>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-sidebar-muted transition-transform duration-300 ease-in-out",
                  openSubmenu === "projects" ? "rotate-180" : "rotate-0",
                )}
              />
            </div>
          </SidebarMenuButton>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              openSubmenu === "projects"
                ? "max-h-32 opacity-100"
                : "max-h-0 opacity-0",
            )}
          >
            <SidebarMenuSub className="">
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={isProjectsDraftsPage}
                  onClick={() => navigateTo("/projects/drafts")}
                  className={cn(
                    navButtonBaseClasses,
                    isProjectsDraftsPage
                      ? navButtonActiveClasses
                      : navButtonInactiveClasses,
                  )}
                >
                  <SquarePen
                    className={cn(
                      iconClasses,
                      isProjectsDraftsPage
                        ? "text-white"
                        : "text-sidebar-muted",
                    )}
                  />
                  <span>Drafts</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={isProjectsDeployedPage}
                  onClick={() => navigateTo("/projects/deployed")}
                  className={cn(
                    navButtonBaseClasses,
                    isProjectsDeployedPage
                      ? navButtonActiveClasses
                      : navButtonInactiveClasses,
                  )}
                >
                  <ExternalLink
                    className={cn(
                      iconClasses,
                      isProjectsDeployedPage
                        ? "text-white"
                        : "text-sidebar-muted",
                    )}
                  />
                  <span>Deployed</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </div>
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
            <Users
              className={cn(
                iconClasses,
                location.pathname === "/team"
                  ? "text-white"
                  : "text-sidebar-muted",
              )}
            />
            <span>Team</span>
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
            <Globe
              className={cn(
                iconClasses,
                location.pathname === "/domains"
                  ? "text-white"
                  : "text-sidebar-muted",
              )}
            />
            <span>Domains</span>
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
            <CreditCard
              className={cn(
                iconClasses,
                location.pathname === "/subscription"
                  ? "text-white"
                  : "text-sidebar-muted",
              )}
            />
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
            <ReceiptText
              className={cn(
                iconClasses,
                location.pathname === "/payments"
                  ? "text-white"
                  : "text-sidebar-muted",
              )}
            />
            <span>Payments</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

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
            <UserCircle
              className={cn(
                iconClasses,
                location.pathname === "/" ? "text-white" : "text-sidebar-muted",
              )}
            />
            <span>Account</span>
          </SidebarMenuButton>
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
            <Settings2
              className={cn(
                iconClasses,
                location.pathname === "/settings"
                  ? "text-white"
                  : "text-sidebar-muted",
              )}
            />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );

  return (
    <div className="relative h-screen">
      <SidebarProvider>
        <Sidebar className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-50 md:w-48 bg-background text-sidebar-foreground pl-1 py-2">
          <CustomSidebarHeader className="flex justify-start pt-6 pb-4 pl-6">
            <div
              onClick={handleLogoClick}
              onKeyDown={handleLogoKeyDown}
              role="button"
              tabIndex={0}
              className="flex items-center cursor-pointer"
              aria-label="Go to homepage"
            >
              <PythagoraIcon />
              <span className="ml-1 text-lg font-semibold text-foreground">
                Pythagora
              </span>
            </div>
          </CustomSidebarHeader>
          <SidebarContent className="flex-1 overflow-y-auto pt-4">
            {renderSidebarContent()}
          </SidebarContent>
          <CustomSidebarFooter className="mt-auto py-4 px-4">
            <div className="flex items-center justify-around w-full">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#FC8DDD] text-[#060218] font-medium text-xs">
                    {userLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#060218] border-t-transparent" />
                    ) : (
                      getUserInitials()
                    )}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-sidebar-foreground">
                  Log out
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-5 w-5 p-0 hover:bg-transparent cursor-pointer"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5 text-sidebar-foreground" />
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
              className="fixed top-4 left-4 z-30 bg-card/80 backdrop-blur-sm shadow-sm p-2 rounded-lg border-border"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-48 bg-sidebar text-sidebar-foreground p-0 flex flex-col"
          >
            <SidebarProvider>
              <SheetHeader className="pt-6 pb-4 px-4 border-sidebar-border">
                <div className="flex items-center justify-between">
                  <div
                    onClick={handleLogoClick}
                    onKeyDown={handleLogoKeyDown}
                    role="button"
                    tabIndex={0}
                    className="flex items-center cursor-pointer"
                    aria-label="Go to homepage"
                  >
                    <PythagoraIcon />
                    <span className="ml-2 text-lg font-semibold text-foreground">
                      Pythagora
                    </span>
                  </div>
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-4">
                {renderSidebarContent()}
              </div>
              <SheetFooter className="mt-auto py-4 px-4 border-sidebar-border">
                <div className="flex items-center justify-around w-full">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#FC8DDD] text-[#060218] font-medium text-xs">
                        {userLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#060218] border-t-transparent" />
                        ) : (
                          getUserInitials()
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-sidebar-foreground">
                      Log out
                    </span>
                  </div>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className="h-5 w-5 p-0 ml-4 hover:bg-transparent cursor-pointer"
                      aria-label="Log out"
                    >
                      <LogOut className="h-5 w-5 text-sidebar-foreground" />
                    </Button>
                  </SheetClose>
                </div>
              </SheetFooter>
            </SidebarProvider>
          </SheetContent>
        </Sheet>
      </div>

      <main className="h-screen flex flex-col md:ml-48 pt-4 pb-4 pr-4">
        <div className="flex-1 max-h-full bg-window-blur border border-window-border rounded-2xl backdrop-blur-lg px-4 md:px-6 py-4 md:py-6">
          <div className="mx-auto max-w-7xl h-full overflow-auto p-4 lg:p-14">
            <Outlet />
          </div>
        </div>

        <div className="flex absolute bottom-0 md:ml-48 left-0 right-0 -z-10">
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
