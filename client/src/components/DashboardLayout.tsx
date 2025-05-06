import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
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
} from "lucide-react";
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
    location.pathname.startsWith("/projects") ? "projects" : null
  );

  // State for sidebar open status
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

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

  const isProjectsPage = location.pathname.startsWith("/projects");
  const isProjectsDraftsPage = location.pathname === "/projects/drafts";
  const isProjectsDeployedPage = location.pathname === "/projects/deployed";

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
    <div className="min-h-screen bg-app-background">
      <BackgroundImage />

      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen">
          {/* Mobile backdrop */}
          {isMobile && sidebarOpen && (
            <div
              className="fixed inset-0 bg-app-black/50 backdrop-blur-sm z-10"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <Sidebar
            className="md:sticky ml-2"
            open={sidebarOpen}
            onOpenChange={setSidebarOpen}
          >
            <SidebarHeader className="pt-2 pb-4">
              <div className="flex items-center">
                <div
                  onClick={() => navigate("/")}
                  className="flex items-center cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="21"
                    viewBox="0 0 22 21"
                    fill="none"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M9.03434 1.44003C8.51753 1.81812 8.06841 2.631 7.17016 4.25674L1.27418 14.9279C0.462737 16.3965 0.0570166 17.1308 0.00899945 17.725C-0.0888068 18.9353 0.61797 20.0726 1.7701 20.5589C2.33572 20.7977 3.19777 20.7977 4.92186 20.7977H16.7138C18.4379 20.7977 19.2999 20.7977 19.8656 20.5589C21.0177 20.0726 21.7245 18.9353 21.6267 17.725C21.5787 17.1308 21.1729 16.3965 20.3615 14.9279L14.4655 4.25674C13.5673 2.631 13.1181 1.81812 12.6013 1.44003C11.5466 0.668428 10.089 0.668428 9.03434 1.44003ZM10.6494 5.3605C10.2872 5.45603 10.0342 5.91608 9.52829 6.83618L4.36435 16.2274C3.92963 17.018 4.50772 17.9741 5.43453 17.9973C6.89391 18.0339 17.3358 16.3973 15.3793 12.7456L12.2208 6.85007C11.7251 5.9248 11.4772 5.46217 11.1161 5.36291C10.9637 5.32101 10.8023 5.32018 10.6494 5.3605Z"
                      fill="#FFD11A"
                    />
                  </svg>
                  <span className="ml-3 text-base font-bold tracking-[-0.169px] text-app-white">
                    Pythagora
                  </span>
                </div>
                <div className="ml-auto md:hidden">
                  <SidebarTrigger onClick={toggleSidebar} />
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {/* Account */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/"}
                    tooltip="Account"
                    onClick={() => navigateTo("/")}
                    className={`w-full h-[40px] px-[16px] flex items-center text-sm font-medium tracking-[-0.28px] text-app-white ${
                      location.pathname === "/"
                        ? "bg-app-blue rounded-app-sm"
                        : "hover:bg-app-white-opacity-05 hover:text-app-white"
                    }`}
                  >
                    <UserCircle className="h-5 w-5 mr-[8px]" />
                    <span>Account</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Subscription */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/subscription"}
                    tooltip="Subscription"
                    onClick={() => navigateTo("/subscription")}
                    className={`w-full h-[40px] px-[16px] flex items-center text-sm font-medium tracking-[-0.28px] text-app-white ${
                      location.pathname === "/subscription"
                        ? "bg-app-blue rounded-app-sm"
                        : "hover:bg-app-white-opacity-05 hover:text-app-white"
                    }`}
                  >
                    <CreditCard className="h-5 w-5 mr-[8px]" />
                    <span>Subscription</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Payments */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/payments"}
                    tooltip="Payments"
                    onClick={() => navigateTo("/payments")}
                    className={`w-full h-[40px] px-[16px] flex items-center text-sm font-medium tracking-[-0.28px] text-app-white ${
                      location.pathname === "/payments"
                        ? "bg-app-blue rounded-app-sm"
                        : "hover:bg-app-white-opacity-05 hover:text-app-white"
                    }`}
                  >
                    <FileText className="h-5 w-5 mr-[8px]" />
                    <span>Payments</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Domains */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/domains"}
                    tooltip="Domains"
                    onClick={() => navigateTo("/domains")}
                    className={`w-full h-[40px] px-[16px] flex items-center text-sm font-medium tracking-[-0.28px] text-app-white ${
                      location.pathname === "/domains"
                        ? "bg-app-blue rounded-app-sm"
                        : "hover:bg-app-white-opacity-05 hover:text-app-white"
                    }`}
                  >
                    <Globe className="h-5 w-5 mr-[8px]" />
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
                    className={`w-full h-[40px] px-[16px] flex items-center text-sm font-medium tracking-[-0.28px] text-app-white ${
                      isProjectsPage
                        ? "bg-app-blue rounded-app-sm"
                        : "hover:bg-app-white-opacity-05 hover:text-app-white"
                    }`}
                  >
                    <Layers className="h-5 w-5 mr-[8px]" />
                    <span>Projects</span>
                  </SidebarMenuButton>
                  {openSubmenu === "projects" && (
                    <SidebarMenuSub className="mt-2">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={isProjectsDraftsPage}
                          onClick={() => navigateTo("/projects/drafts")}
                          className={`w-full h-[36px] px-[16px] flex items-center text-sm font-medium tracking-[-0.28px] text-app-white ${
                            isProjectsDraftsPage
                              ? "bg-app-blue rounded-app-sm"
                              : "hover:bg-app-white-opacity-05 hover:text-app-white"
                          }`}
                        >
                          <FileEdit className="h-4 w-4 mr-[8px]" />
                          <span>Drafts</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem className="mt-1">
                        <SidebarMenuSubButton
                          isActive={isProjectsDeployedPage}
                          onClick={() => navigateTo("/projects/deployed")}
                          className={`w-full h-[36px] px-[16px] flex items-center text-sm font-medium tracking-[-0.28px] text-app-white ${
                            isProjectsDeployedPage
                              ? "bg-app-blue rounded-app-sm"
                              : "hover:bg-app-white-opacity-05 hover:text-app-white"
                          }`}
                        >
                          <ExternalLink className="h-4 w-4 mr-[8px]" />
                          <span>Deployed</span>
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
                    className={`w-full h-[40px] px-[16px] flex items-center text-sm font-medium tracking-[-0.28px] text-app-white ${
                      location.pathname === "/settings"
                        ? "bg-app-blue rounded-app-sm"
                        : "hover:bg-app-white-opacity-05 hover:text-app-white"
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-[8px]" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Team */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname === "/team"}
                    tooltip="Team"
                    onClick={() => navigateTo("/team")}
                    className={`w-full h-[40px] px-[16px] flex items-center text-sm font-medium tracking-[-0.28px] text-app-white ${
                      location.pathname === "/team"
                        ? "bg-app-blue rounded-app-sm"
                        : "hover:bg-app-white-opacity-05 hover:text-app-white"
                    }`}
                  >
                    <Users className="h-5 w-5 mr-[8px]" />
                    <span>Team</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="mt-auto px-4">
              <div className="flex items-center">
                <div className="flex items-center">
                  <div className="h-8 w-8 text-sm rounded-full bg-pink-400 flex items-center justify-center font-bold">
                    M
                  </div>
                  <span className="ml-2 text-sm text-app-white font-medium">
                    Log out
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto text-app-white h-10 w-10 bg-transparent border-none flex items-center justify-center cursor-pointer"
                >
                  <LogOut className="h-5 w-5 transition-colors hover:opacity-80" />
                </button>
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
            <main className="flex-1 overflow-y-auto p-4 pl-2">
              <div className="mx-auto w-full">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
