import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
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

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(
    location.pathname.startsWith("/projects") ? "projects" : null
  );

  useEffect(() => {
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
                : navButtonInactiveClasses
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
                : navButtonInactiveClasses
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
                : navButtonInactiveClasses
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
                : navButtonInactiveClasses
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
              isProjectsPage ? navButtonActiveClasses : navButtonInactiveClasses
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
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                : navButtonInactiveClasses
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
                : navButtonInactiveClasses
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
              onClick={() => navigate("/")}
              className="flex items-center cursor-pointer"
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
                    onClick={() => navigate("/")}
                    className="flex items-center cursor-pointer"
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

      <main className="relative min-h-screen flex flex-col flex-1 overflow-y-auto py-4 md:ml-48">
        <div className="flex-1 bg-[rgba(17,16,22,0.8)] border border-[rgba(247,248,248,0.1)] rounded-2xl backdrop-blur-lg px-4 md:px-6 py-4 md:py-6">
          <div className="mx-auto max-w-7xl h-full">
            <Outlet />
          </div>
        </div>

        <div className="flex absolute bottom-0 left-0 right-0 -z-10">
          <svg
            width="1278"
            height="269"
            viewBox="0 0 1278 269"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M563.455 60.8303C592.747 50.2243 625.09 65.3723 635.696 94.6641L741.318 386.376C751.924 415.668 736.777 448.012 707.484 458.618L548.368 516.23C519.076 526.836 486.733 511.688 476.127 482.396L370.505 190.684C359.899 161.392 375.047 129.049 404.338 118.443L563.455 60.8303ZM480.237 240.941C472.166 243.864 467.992 252.775 470.915 260.847L508.341 364.213C511.264 372.284 520.176 376.458 528.247 373.536L631.615 336.108C639.686 333.186 643.86 324.274 640.938 316.203L603.511 212.836C600.589 204.765 591.677 200.592 583.606 203.514L480.237 240.941Z"
              fill="#F34222"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M1203.46 41.39C1217.59 35.5366 1233.47 35.5368 1247.6 41.39L1356.39 86.4541C1370.52 92.3077 1381.75 103.535 1387.61 117.666L1432.67 226.459C1438.52 240.591 1438.52 256.469 1432.67 270.6L1387.61 379.393C1381.75 393.525 1370.53 404.753 1356.39 410.607L1247.6 455.669C1233.47 461.523 1217.59 461.523 1203.46 455.669L1094.67 410.607C1080.53 404.753 1069.31 393.525 1063.45 379.393L1018.39 270.6C1012.54 256.469 1012.54 240.59 1018.39 226.459L1063.45 117.666C1069.31 103.535 1080.53 92.3078 1094.67 86.4541L1203.46 41.39ZM1225.19 176.437C1185.37 176.437 1153.1 208.715 1153.1 248.531C1153.1 288.348 1185.37 320.626 1225.19 320.626C1265.01 320.625 1297.28 288.347 1297.28 248.531C1297.28 208.715 1265.01 176.438 1225.19 176.437Z"
              fill="#07998A"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M268.258 73.8842C302.09 38.7052 361.298 53.3483 374.833 100.242L469.677 428.865C483.211 475.758 440.922 519.732 393.556 508.018L61.6214 425.926C14.2557 414.212 -2.66137 355.595 31.1701 320.416L268.258 73.8842ZM284.187 238.008C244.686 228.239 204.743 252.353 194.97 291.87C185.197 331.386 209.295 371.34 248.796 381.11C288.297 390.879 328.242 366.763 338.015 327.247C347.788 287.73 323.688 247.777 284.187 238.008Z"
              fill="#3057E1"
            />
            <path
              d="M1052.02 152.884C1068.07 165.14 1076.37 185.031 1073.79 205.064L1053.95 358.78C1051.36 378.813 1038.29 395.945 1019.65 403.723L876.604 463.401C857.962 471.178 836.587 468.419 820.53 456.164L697.327 362.126C681.271 349.871 672.972 329.979 675.557 309.946L695.396 156.229C697.981 136.196 711.058 119.064 729.699 111.286L872.741 51.6087C891.383 43.8312 912.758 46.5901 928.814 58.8456L1052.02 152.884ZM965.672 219.965C956.655 198.351 931.823 188.139 910.209 197.156L805.849 240.696C784.235 249.714 774.024 274.546 783.042 296.16C792.059 317.773 816.89 327.984 838.504 318.967L942.865 275.427C964.478 266.41 974.689 241.579 965.672 219.965Z"
              fill="#FFD11A"
            />
          </svg>
        </div>
      </main>
    </div>
  );
}
