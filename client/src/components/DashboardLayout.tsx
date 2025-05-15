import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
} from "./ui/sidebar";
import {
  ChevronDown,
  LogOut,
} from "lucide-react";
import {
  SidebarIcon,
  ProjectsIcon,
  DraftsIcon,
  DeployedIcon,
  TeamIcon,
  DomainsIcon,
  SubscriptionIcon,
  PaymentsIcon,
  AccountIcon,
  SettingsIcon,
} from './ui/sidebaricons';
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUser } from "@/api/user";
import { useMobile } from "@/hooks/useMobile";
import { BackgroundImage } from "./BackgroundImage";
import { cn } from "@/lib/utils";
import PythagoraLogo from "@/assets/svg/pythagora-logo.svg";

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isMobile = useMobile();

  // Fetch current user for avatar
  const [user, setUser] = useState<{ name: string } | null>(null);
  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data.user))
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  // Projects submenu state
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(
    location.pathname.startsWith("/projects") ? "projects" : null
  );
  const toggleSubmenu = (key: string) =>
    setOpenSubmenu(openSubmenu === key ? null : key);

  // Sidebar open/collapse
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
    if (
      location.pathname.startsWith("/projects") &&
      openSubmenu !== "projects"
    ) {
      setOpenSubmenu("projects");
    }
    if (
      !location.pathname.startsWith("/projects") &&
      openSubmenu === "projects"
    ) {
      setOpenSubmenu(null);
    }
  }, [location.pathname, openSubmenu, isMobile]);

  const navigateTo = (path: string) => {
    navigate(path);
    if (isMobile) setSidebarOpen(false);
  };
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isProjectsPage = location.pathname.startsWith("/projects");
  const isDrafts = location.pathname === "/projects/drafts";
  const isDeployed = location.pathname === "/projects/deployed";

  // Derive avatar initial
  const initial = user?.name?.[0]?.toUpperCase() || "U";

  return (
    <div className="relative min-h-screen">
      {/* BLEED GRAPHIC */}
      <BackgroundImage />

      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen relative">
          {/* SIDEBAR */}
          <Sidebar
            open={sidebarOpen}
            onOpenChange={setSidebarOpen}
            className="border-r fixed"
          >
            <SidebarHeader className="pt-6 pb-4">
              <div className="flex items-center px-6">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  {/* Logo */}
                  <img src={PythagoraLogo} alt="Pythagora" className="h-7" />
                </div>
                {isMobile && (
                  <div className="ml-auto">
                    <SidebarTrigger
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                    />
                  </div>
                )}
              </div>
            </SidebarHeader>

            <SidebarContent className="px-3">
              <SidebarMenu className="space-y-2">
                {/* Projects */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isProjectsPage}
                    tooltip="Projects"
                    onClick={() => {
                      toggleSubmenu("projects");
                      if (!isProjectsPage) navigateTo("/projects/drafts");
                    }}
                    className={cn(
                      "w-full py-3 px-4 text-base font-medium",
                      isProjectsPage ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <SidebarIcon isActive={isProjectsPage}>
                      <ProjectsIcon />
                    </SidebarIcon>
                    <span>Projects</span>
                    <ChevronDown
                      className={`h-4 w-4 ml-auto transition-transform ${
                        openSubmenu === "projects"
                          ? "rotate-180"
                          : "rotate-0"
                      }`}
                    />
                  </SidebarMenuButton>
                  {openSubmenu === "projects" && (
                    <SidebarMenuSub className="mt-1 ml-2 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={isDrafts}
                          onClick={() => navigateTo("/projects/drafts")}
                          className={cn(
                            "flex items-center py-2.5 px-3 w-full rounded-md text-base font-medium",
                            isDrafts ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <SidebarIcon isActive={isDrafts} className="h-4 w-4 mr-3">
                            <DraftsIcon />
                          </SidebarIcon>
                          Drafts
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={isDeployed}
                          onClick={() => navigateTo("/projects/deployed")}
                          className={cn(
                            "flex items-center py-2.5 px-3 w-full rounded-md text-base font-medium",
                            isDeployed ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <SidebarIcon isActive={isDeployed} className="h-4 w-4 mr-3">
                            <DeployedIcon />
                          </SidebarIcon>
                          Deployed
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>

                {/* Team */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/team"}
                    tooltip="Team"
                    onClick={() => navigateTo("/team")}
                    className={cn(
                      "w-full py-3 px-4 text-base font-medium",
                      location.pathname === "/team" ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <SidebarIcon isActive={location.pathname === "/team"}>
                      <TeamIcon />
                    </SidebarIcon>
                    <span>Team</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Domains */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/domains"}
                    tooltip="Domains"
                    onClick={() => navigateTo("/domains")}
                    className={cn(
                      "w-full py-3 px-4 text-base font-medium",
                      location.pathname === "/domains" ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <SidebarIcon isActive={location.pathname === "/domains"}>
                      <DomainsIcon />
                    </SidebarIcon>
                    <span>Domains</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Subscription */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/subscription"}
                    tooltip="Subscription"
                    onClick={() => navigateTo("/subscription")}
                    className={cn(
                      "w-full py-3 px-4 text-base font-medium",
                      location.pathname === "/subscription" ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <SidebarIcon isActive={location.pathname === "/subscription"}>
                      <SubscriptionIcon />
                    </SidebarIcon>
                    <span>Subscription</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Payments */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/payments"}
                    tooltip="Payments"
                    onClick={() => navigateTo("/payments")}
                    className={cn(
                      "w-full py-3 px-4 text-base font-medium",
                      location.pathname === "/payments" ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <SidebarIcon isActive={location.pathname === "/payments"}>
                      <PaymentsIcon />
                    </SidebarIcon>
                    <span>Payments</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Account */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/"}
                    tooltip="Account"
                    onClick={() => navigateTo("/")}
                    className={cn(
                      "w-full py-3 px-4 text-base font-medium",
                      location.pathname === "/" ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <SidebarIcon isActive={location.pathname === "/"}>
                      <AccountIcon />
                    </SidebarIcon>
                    <span>Account</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Settings */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/settings"}
                    tooltip="Settings"
                    onClick={() => navigateTo("/settings")}
                    className={cn(
                      "w-full py-3 px-4 text-base font-medium",
                      location.pathname === "/settings" ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <SidebarIcon isActive={location.pathname === "/settings"}>
                      <SettingsIcon />
                    </SidebarIcon>
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="mt-auto py-6 px-6">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-between text-muted-foreground hover:text-foreground"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm font-medium">
                    {initial}
                  </div>
                  <span>Log out</span>
                </div>
                <LogOut className="h-5 w-5" />
              </button>
            </SidebarFooter>
          </Sidebar>

          {/* MAIN CONTENT */}
          <SidebarInset className="w-full p-4 relative z-0 ml-0 md:ml-64">
            {isMobile && (
              <div className="fixed top-4 left-4 z-30">
                <SidebarTrigger onClick={() => setSidebarOpen(!sidebarOpen)} />
              </div>
            )}

            <main className="relative w-full h-full flex-1 overflow-y-auto p-0 pt-16 md:pt-6">
              <div className="absolute inset-2 rounded-2xl border border-[rgba(247,248,248,0.10)] bg-[rgba(17,16,22,0.80)] backdrop-blur-[20px] flex flex-col p-6 overflow-y-auto max-h-screen">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
