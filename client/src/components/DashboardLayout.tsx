import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarFooter, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "./ui/sidebar";
import { UserCircle, CreditCard, ReceiptText, Globe, Settings2, Folder, Users, LogOut, SquarePen, ExternalLink, Menu, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { BackgroundImage } from "./BackgroundImage";
import { useMobile } from "@/hooks/useMobile";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { LogoPythagora } from "./svg/LogoPythagora";
import tempBackground from "../assets/images/temp-background.png";

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

      {/* Implement dynamic (animated svg?) background image */}
      {/* <BackgroundImage /> */}

      {/* Temporary background image for demonstation */}
      <img src={tempBackground} className="absolute bottom-0 left-0 w-full object-contain" />

      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen">
          <Sidebar className="fixed md:relative max-w-[182px]" open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SidebarHeader className="px-2 py-7 flex">
              <div className="ml-auto md:hidden">
                <SidebarTrigger onClick={toggleSidebar} />
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="flex items-center justify-between py-3 !px-1 md:!px-4 text-sm font-medium hover:bg-accent w-full"
              >
                <div className="h-5 w-full flex justify-center md:justify-start">
                  <LogoPythagora />
                </div>
              </Button>
            </SidebarHeader>
            <SidebarContent className="px-2">
              <SidebarMenu>
                {/* Projects */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Projects"
                    onClick={() => {
                      if (!isProjectsPage) {
                        toggleSubmenu("projects");
                        navigateTo("/projects/drafts");
                      }
                    }}
                    className="w-full py-3 px-4 text-sm font-medium hover:bg-accent"
                  >
                    <Folder className="h-5 w-5 mr-2" />
                    <span className="text-accent-foreground">Projects</span>
                    <ChevronDown className={`h-4 w-4 ml-auto transition-transform  ${openSubmenu === "projects" ? "rotate-180" : ""}`} />
                  </SidebarMenuButton>
                  {openSubmenu === "projects" && (
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={isProjectsDraftsPage}
                          onClick={() => navigateTo("/projects/drafts")}
                          className="py-3 px-4 pl-8 text-sm font-medium hover:bg-accent rounded-md w-full flex items-center"
                        >
                          <SquarePen className="h-4 w-4 mr-2" />
                          <span className="text-accent-foreground">Drafts</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={isProjectsDeployedPage}
                          onClick={() => navigateTo("/projects/deployed")}
                          className="py-3 px-4 pl-8 text-sm font-medium hover:bg-accent rounded-md w-full flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          <span className="text-accent-foreground">Deployed</span>
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
                    className="w-full py-3 px-4 text-sm font-medium hover:bg-accent"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    <span className="text-accent-foreground">Team</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Domains */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/domains"}
                    tooltip="Domains"
                    onClick={() => navigateTo("/domains")}
                    className="w-full py-3 px-4 text-sm font-medium hover:bg-accent"
                  >
                    <Globe className="h-5 w-5 mr-2" />
                    <span className="text-accent-foreground">Domains</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Subscription */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/subscription"}
                    tooltip="Subscription"
                    onClick={() => navigateTo("/subscription")}
                    className="w-full py-3 px-4 text-sm font-medium hover:bg-accent"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    <span className="text-accent-foreground">Subscription</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Payments */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/payments"}
                    tooltip="Payments"
                    onClick={() => navigateTo("/payments")}
                    className="w-full py-3 px-4 text-sm font-medium hover:bg-accent"
                  >
                    <ReceiptText className="h-5 w-5 mr-2" />
                    <span className="text-accent-foreground">Payments</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Account */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/"}
                    tooltip="Account"
                    onClick={() => navigateTo("/")}
                    className="w-full py-3 px-4 text-sm font-medium hover:bg-accent"
                  >
                    <UserCircle className="h-5 w-5 mr-2" />
                    <span className="text-accent-foreground">Account</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Settings */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/settings"}
                    tooltip="Settings"
                    onClick={() => navigateTo("/settings")}
                    className="w-full py-3 px-4 text-sm font-medium hover:bg-accent"
                  >
                    <Settings2 className="h-5 w-5 mr-2" />
                    <span className="text-accent-foreground">Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="mt-auto px-2 py-7 flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="flex items-center justify-between py-3 px-4 text-smfont-medium hover:bg-accent w-full"
              >
                <div className="flex items-center">
                  <Avatar>
                    {/* Add real user avatar */}
                    <AvatarFallback
                      className="rounded-full h-8 w-8 flex items-center justify-center text-background"
                      style={{backgroundColor: '#FC8DDD'}}>
                      M
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-2">Log out</span>
                </div>
                <LogOut className="h-5 w-5" />
              </Button>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="w-full m-4 md:my-6 md:mr-6 rounded-lg border backdrop-blur-lg shadow-sm bg-[rgba(17,16,22,0.80)]">
            <div className="md:hidden fixed top-4 left-4 z-30">
              <SidebarTrigger
                className="bg-background/80 backdrop-blur-sm shadow-sm border"
                onClick={toggleSidebar}
              />
            </div>
            <main className="flex-1 overflow-y-auto p-6 md:p-16">
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