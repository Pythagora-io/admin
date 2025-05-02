import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarFooter, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "./ui/sidebar";
import { UserCircle, CreditCard, FileText, Globe, Settings, Layers, Users, LogOut, FileEdit, ExternalLink, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { BackgroundImage } from "./BackgroundImage";
import { useMobile } from "@/hooks/useMobile";

export function DashboardLayout() {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMobile();

  // Open the projects submenu by default if we're on a projects page
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(
    location.pathname.startsWith('/projects') ? "projects" : null
  );

  // State for sidebar open status
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    // Keep Projects submenu open if we're on a projects page
    if (location.pathname.startsWith('/projects') && openSubmenu !== "projects") {
      setOpenSubmenu("projects");
    }
    // Close the submenu when navigating away from projects pages
    if (!location.pathname.startsWith('/projects') && openSubmenu === "projects") {
      setOpenSubmenu(null);
    }

    // Close sidebar on mobile when route changes
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, openSubmenu, isMobile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSubmenu = (key: string) => {
    setOpenSubmenu(openSubmenu === key ? null : key);
  };

  const isProjectsPage = location.pathname.startsWith('/projects');
  const isProjectsDraftsPage = location.pathname === '/projects/drafts';
  const isProjectsDeployedPage = location.pathname === '/projects/deployed';

  const navigateTo = (path: string) => {
    navigate(path);
    // Close sidebar on mobile when navigating
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="relative min-h-screen">
      <BackgroundImage />

      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen">
          <Sidebar className="border-r fixed md:relative" open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SidebarHeader className="pt-6 pb-4">
              <div className="flex items-center px-6">
                <div
                  onClick={() => navigate("/")}
                  className="flex items-center cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="h-7 w-7 text-primary" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2.00001 17.5228 6.47716 22 12 22Z" fill="currentColor" fillOpacity="0.2" />
                    <path d="M15.5 9C15.5 11.2091 13.7091 13 11.5 13H9V9C9 6.79086 10.7909 5 13 5C15.2091 5 15.5 6.79086 15.5 9Z" fill="currentColor" />
                    <path d="M9 13H11.5C13.7091 13 15.5 14.7909 15.5 17C15.5 19.2091 13.2091 20 11 20C8.79086 20 9 18.2091 9 16V13Z" fill="currentColor" />
                  </svg>
                  <span className="ml-3 text-xl font-semibold">Pythagora</span>
                </div>
                <div className="ml-auto md:hidden">
                  <SidebarTrigger onClick={toggleSidebar} />
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent className="px-3">
              <SidebarMenu className="space-y-2">
                {/* Account */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/"}
                    tooltip="Account"
                    onClick={() => navigateTo("/")}
                    className="w-full py-3 px-4 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <UserCircle className="h-5 w-5 mr-3" />
                    <span>Account</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Subscription */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/subscription"}
                    tooltip="Subscription"
                    onClick={() => navigateTo("/subscription")}
                    className="w-full py-3 px-4 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <CreditCard className="h-5 w-5 mr-3" />
                    <span>Subscription</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Payments */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/payments"}
                    tooltip="Payments"
                    onClick={() => navigateTo("/payments")}
                    className="w-full py-3 px-4 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <FileText className="h-5 w-5 mr-3" />
                    <span>Payments</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Domains */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/domains"}
                    tooltip="Domains"
                    onClick={() => navigateTo("/domains")}
                    className="w-full py-3 px-4 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <Globe className="h-5 w-5 mr-3" />
                    <span>Domains</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Projects - Modified to remove the arrow */}
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
                    className="w-full py-3 px-4 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <Layers className="h-5 w-5 mr-3" />
                    <span>Projects</span>
                  </SidebarMenuButton>
                  {openSubmenu === "projects" && (
                    <SidebarMenuSub className="mt-1 ml-2 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={isProjectsDraftsPage}
                          onClick={() => navigateTo("/projects/drafts")}
                          className="py-2.5 px-3 text-base font-medium hover:bg-accent hover:text-accent-foreground rounded-md w-full flex items-center"
                        >
                          <FileEdit className="h-4 w-4 mr-3" />
                          Drafts
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={isProjectsDeployedPage}
                          onClick={() => navigateTo("/projects/deployed")}
                          className="py-2.5 px-3 text-base font-medium hover:bg-accent hover:text-accent-foreground rounded-md w-full flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-3" />
                          Deployed
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>

                {/* Settings */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/settings"}
                    tooltip="Settings"
                    onClick={() => navigateTo("/settings")}
                    className="w-full py-3 px-4 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Team */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/team"}
                    tooltip="Team"
                    onClick={() => navigateTo("/team")}
                    className="w-full py-3 px-4 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <Users className="h-5 w-5 mr-3" />
                    <span>Team</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="mt-auto py-6 px-6">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground h-10 w-10 rounded-full"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="w-full p-0">
            <div className="md:hidden fixed top-4 left-4 z-30">
              <SidebarTrigger
                className="bg-background/80 backdrop-blur-sm shadow-sm border"
                onClick={toggleSidebar}
              />
            </div>
            <main className="flex-1 overflow-y-auto p-6 pt-16 md:pt-6">
              <div className="mx-auto max-w-7xl">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}