import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import {
  UserPlus,
  Search,
  ChevronDown,
  Check,
  MoreVertical,
} from "lucide-react";
import {
  getOrganization,
  getOrganizationMembers,
  getOrganizationApps,
  inviteOrganizationMember,
  removeOrganizationMember,
  updateOrganizationMemberRole,
  getMemberAppAccess,
  updateMemberAppAccess,
  searchOrganizationApps,
  getUserMemberships,
} from "@/api/organizations";
import { getCurrentUser } from "@/api/user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SpinnerShape from "@/components/SpinnerShape";

// Define interfaces
interface App {
  _id: string;
  name: string;
  permissions: string[];
}

interface OrganizationMember {
  userId: string;
  email: string;
  fullName: string;
  username: string;
  role: "owner" | "admin" | "member";
  status: string;
  orgPermissions: {
    canManageUsers: boolean;
    canManageApps: boolean;
    canViewAuditLogs: boolean;
  };
  appPermissions: Record<string, string[]>;
  joinedAt: string;
  lastActiveAt: string;
  isOwner: boolean;
}

interface Organization {
  _id: string;
  name: string;
  slug: string;
  ownerId: string;
}

console.log('TeamPage.tsx: Starting to import functions from organizations API');

console.log('TeamPage.tsx: Successfully imported organization functions');

console.log('TeamPage.tsx: Component is rendering');

export function TeamPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [accessManagementOpen, setAccessManagementOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [memberApps, setMemberApps] = useState<App[]>([]);
  const [appSearchQuery, setAppSearchQuery] = useState("");
  const [appSearchResults, setAppSearchResults] = useState<App[]>([]);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null);
  const [savingAccess, setSavingAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        console.log("TeamPage: Starting fetchOrganizationData...");

        // Get current user synchronously from localStorage
        const currentUserResponse = getCurrentUser();
        const currentUser = currentUserResponse.user;
        console.log("TeamPage: Current user data:", currentUser);

        if (!currentUser) {
          console.error("TeamPage: No current user found in localStorage");
          throw new Error("User not authenticated. Please log in again.");
        }

        if (!currentUser.userId) {
          console.error("TeamPage: Current user missing userId:", currentUser);
          throw new Error("User ID not found. Please log in again.");
        }

        console.log(`TeamPage: Fetching memberships for userId: ${currentUser.userId}`);

        // Get user memberships to find organization slug
        const membershipsResponse = await getUserMemberships(currentUser.userId);
        console.log("TeamPage: User memberships response:", membershipsResponse);

        if (!membershipsResponse.memberships || membershipsResponse.memberships.length === 0) {
          console.log("TeamPage: No organization memberships found for user");
          setMembers([]);
          setLoading(false);
          return;
        }

        // Use the first organization membership
        const firstMembership = membershipsResponse.memberships[0];
        const orgSlug = firstMembership.organizationSlug;
        console.log(`TeamPage: Using organization slug: ${orgSlug}`);

        // Fetch organization metadata
        const orgResponse = await getOrganization(orgSlug);
        console.log("TeamPage: Organization metadata response:", orgResponse);
        setOrganization(orgResponse.organization);

        // Fetch organization members
        const membersResponse = await getOrganizationMembers(orgSlug);
        console.log("TeamPage: Organization members response:", membersResponse);
        setMembers(membersResponse.members);

        console.log("TeamPage: Successfully completed fetchOrganizationData");

      } catch (error: unknown) {
        console.error("TeamPage: Error in fetchOrganizationData:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch organization data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, [toast]);

  const handleInviteMember = async () => {
    if (!organization) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address",
      });
      return;
    }

    setSendingInvite(true);
    try {
      const response = await inviteOrganizationMember(organization.slug, { email: inviteEmail });

      // Fetch the updated organization members list after successful invitation
      const updatedMembers = await getOrganizationMembers(organization.slug);
      setMembers(updatedMembers.members);

      toast({
        variant: "default",
        title: "Success",
        description: response.message || "Invitation sent successfully",
      });
      setInviteEmail("");
      setInviteOpen(false);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send invitation",
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !organization) return;

    try {
      await removeOrganizationMember(organization.slug, memberToRemove.userId);
      setMembers(members.filter((member) => member.userId !== memberToRemove.userId));
      toast({
        variant: "default",
        title: "Success",
        description: "Organization member removed successfully",
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove organization member",
      });
    } finally {
      setRemoveConfirmOpen(false);
      setMemberToRemove(null);
    }
  };

  const handleRoleChange = async (
    userId: string,
    role: "owner" | "admin" | "member",
  ) => {
    if (!organization) return;

    try {
      await updateOrganizationMemberRole(organization.slug, userId, { role });
      setMembers(
        members.map((member) =>
          member.userId === userId ? { ...member, role } : member,
        ),
      );
      toast({
        variant: "default",
        title: "Success",
        description: `Role updated to ${role}`,
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update role",
      });
    }
  };

  const openAccessManagement = async (member: OrganizationMember) => {
    if (!organization) return;

    setSelectedMember(member);
    setAccessManagementOpen(true);

    try {
      const response = await getMemberAppAccess(organization.slug, member.userId);
      setMemberApps(response.apps);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch member access",
      });
    }
  };

  const handleAppSearch = async (query: string) => {
    if (!organization) return;

    setAppSearchQuery(query);

    if (!query.trim()) {
      setAppSearchResults([]);
      return;
    }

    try {
      const response = await searchOrganizationApps(organization.slug, query);
      // Filter out apps that are already in memberApps
      const existingAppIds = memberApps.map((app) => app._id);
      setAppSearchResults(
        response.apps.filter(
          (app: App) => !existingAppIds.includes(app._id),
        ),
      );
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to search apps",
      });
    }
  };

  const addAppToMember = (app: App) => {
    // Add app to memberApps with basic permissions as default
    setMemberApps([...memberApps, { ...app, permissions: [] }]);
    // Clear search results
    setAppSearchResults([]);
    setAppSearchQuery("");
  };

  const handlePermissionChange = (appId: string, permissions: string[]) => {
    setMemberApps(
      memberApps.map((app) =>
        app._id === appId ? { ...app, permissions } : app,
      ),
    );
  };

  const saveAccessChanges = async () => {
    if (!selectedMember || !organization) return;

    setSavingAccess(true);
    try {
      const appsToUpdate = memberApps.map((app) => ({
        appId: app._id,
        permissions: app.permissions,
      }));

      await updateMemberAppAccess(organization.slug, selectedMember.userId, {
        apps: appsToUpdate,
      });

      toast({
        variant: "default",
        title: "Success",
        description: "App access updated successfully",
      });
      setAccessManagementOpen(false);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update app access",
      });
    } finally {
      setSavingAccess(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-success text-warning-foreground";
      case "admin":
        return "bg-developer text-warning-foreground";
      case "member":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700/20 dark:text-gray-400";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "owner":
        return "Owner";
      case "admin":
        return "Admin";
      case "member":
        return "Member";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <SpinnerShape className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex flex-col gap-14 text-foreground">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-heading-3 text-foreground">
            {organization ? organization.name : "My Organization"}
          </h1>
          <p className="text-body-sm text-foreground/60">
            Manage your organization members and their access
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground text-body-md px-3 py-2 h-auto rounded-lg">
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="flex flex-col gap-6 bg-card border-none rounded-2xl p-6 w-[90%] sm:max-w-lg">
            <DialogHeader className="flex flex-row justify-between items-center">
              <DialogTitle className="!text-subheading text-foreground">
                Invite an organization member
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center justify-between bg-foreground/10 border border-border rounded-lg p-1">
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Invite others by email"
                className="flex-grow bg-transparent border-0 px-3 py-2 placeholder:text-foreground/60 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-body-lg"
              />
              <Button
                onClick={handleInviteMember}
                disabled={sendingInvite || !inviteEmail.trim()}
                className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90 h-auto m-[1px] flex-shrink-0"
              >
                {sendingInvite ? "Sending..." : "Invite"}
              </Button>
            </div>

            <div>
              {members.length > 0 ? (
                <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
                  {members.map((member) => (
                    <div
                      key={member.userId}
                      className="flex justify-between items-center"
                    >
                      <span className="text-foreground/80 text-body-sm">
                        {member.email}
                      </span>
                      <div className="flex items-center text-body-sm text-foreground/50">
                        <span className="capitalize mr-1">
                          {getRoleText(member.role)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-body-sm text-foreground/60 text-center py-4">
                  No other members in the organization
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div className="space-y-1.5">
            <h2 className="text-heading-3 font-normal text-foreground">
              Organization Members
            </h2>
          </div>
        </div>

        {/* Organization Members Table */}
        <div className="flex flex-col space-y-5">
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border-border rounded-lg">
              <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-body-lg-medium text-foreground">
                No organization members yet
              </h3>
              <p className="text-body-sm text-foreground/60 mt-1 mb-4">
                Invite colleagues to collaborate on your apps.
              </p>
              <Button
                onClick={() => setInviteOpen(true)}
                className="bg-primary text-primary-foreground text-body-md px-3 py-2 h-auto rounded-lg"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Your First Organization Member
              </Button>
            </div>
          ) : (
            <div>
              {/* Header Row */}
              <div className="flex items-center py-3 border-border text-body-sm font-medium text-foreground/60">
                <div className="w-[45%]">Email</div>
                <div className="w-[25%]">Role</div>
                <div className="w-[25%]">Access</div>
                <div className="w-[5%] text-right"></div>
              </div>
              {/* Member Rows */}
              <div className="flex flex-col">
                {members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center py-3 border-t border-border text-caption-strong text-foreground"
                    tabIndex={0}
                  >
                    <div className="w-[45%]">{member.email}</div>
                    <div className="w-[25%]">{member.fullName}</div>
                    <div className="w-[25%]">
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-2 py-1 rounded text-caption-strong ${getRoleColor(member.role)}`}
                        >
                          {getRoleText(member.role)}
                        </div>
                        {!member.isOwner && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0"
                              >
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="min-w-[120px] p-1 space-y-0.5"
                            >
                              <DropdownMenuItem
                                className="bg-developer text-warning-foreground focus:bg-developer/90 focus:text-warning-foreground text-xs py-1 px-2 h-6"
                                onClick={() =>
                                  handleRoleChange(member.userId, "admin")
                                }
                              >
                                <span className="flex-1">Admin</span>
                                {member.role === "admin" && (
                                  <Check className="h-3 w-3 ml-1" />
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="bg-warning text-warning-foreground focus:bg-warning/90 focus:text-warning-foreground text-xs py-1 px-2 h-6"
                                onClick={() =>
                                  handleRoleChange(member.userId, "member")
                                }
                              >
                                <span className="flex-1">Member</span>
                                {member.role === "member" && (
                                  <Check className="h-3 w-3 ml-1" />
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <div className="w-[5%] text-right">
                      {!member.isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openAccessManagement(member)}
                            >
                              Manage access
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setMemberToRemove(member);
                                setRemoveConfirmOpen(true);
                              }}
                            >
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Access Management Dialog */}
      <Dialog
        open={accessManagementOpen}
        onOpenChange={setAccessManagementOpen}
      >
        <DialogContent className="bg-card border-none rounded-2xl p-8 w-[90%] sm:w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-foreground">
              Manage App Access
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground/60 text-left pt-1">
              {selectedMember &&
                `Configure access for ${selectedMember.fullName || selectedMember.email}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="relative">
              <div className="flex items-center w-full bg-foreground/10 rounded-lg border border-border">
                <Search className="h-4 w-4 ml-3 text-foreground/60 flex-shrink-0" />
                <Input
                  placeholder="Search for apps"
                  className="border-0 bg-transparent px-2 py-3 placeholder:text-foreground/60 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={appSearchQuery}
                  onChange={(e) => handleAppSearch(e.target.value)}
                />
              </div>
              {appSearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                  {appSearchResults.map((app) => (
                    <div
                      key={app._id}
                      className="p-2 hover:bg-highlight cursor-pointer text-foreground"
                      onClick={() => addAppToMember(app)}
                    >
                      {app.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 max-h-60 overflow-auto">
              {memberApps.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No apps assigned yet. Search and add apps above.
                </p>
              ) : (
                memberApps.map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between py-2 border-none border-border"
                  >
                    <span className="text-foreground text-body-lg">
                      {app.name}
                    </span>
                    <div className="flex items-center space-x-1 text-foreground/80">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center text-body-md opacity-70 hover:opacity-100">
                            <span className="capitalize">
                              {app.permissions.length > 0 ? app.permissions.join(", ") : "No permissions"}
                            </span>
                            <ChevronDown className="h-4 w-4 ml-1" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="min-w-[100px] p-1"
                        >
                          <DropdownMenuItem
                            className="text-xs py-1 px-2 cursor-pointer flex items-center justify-between"
                            onClick={() =>
                              handlePermissionChange(app._id, ["read"])
                            }
                          >
                            Read
                            {app.permissions.includes("read") && (
                              <Check className="h-3 w-3 ml-2" />
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs py-1 px-2 cursor-pointer flex items-center justify-between"
                            onClick={() =>
                              handlePermissionChange(app._id, ["read", "write"])
                            }
                          >
                            Read & Write
                            {app.permissions.includes("write") && (
                              <Check className="h-3 w-3 ml-2" />
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter className="mt-6 sm:justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setAccessManagementOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-foreground/10"
            >
              Cancel
            </Button>
            <Button
              onClick={saveAccessChanges}
              disabled={savingAccess}
              className="bg-primary text-primary-foreground rounded-lg px-4 py-3 text-sm font-medium hover:bg-primary/90"
            >
              {savingAccess ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <AlertDialogContent className="bg-card border-none rounded-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-medium text-foreground">
              Remove Organization Member
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-foreground/60">
              {memberToRemove &&
                `Are you sure you want to remove ${memberToRemove.fullName || memberToRemove.email} from the organization? They will lose access to all apps.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 sm:justify-end gap-2">
            <AlertDialogCancel className="rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-foreground/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground rounded-lg px-4 py-3 text-sm font-medium hover:bg-destructive/90"
              onClick={handleRemoveMember}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}