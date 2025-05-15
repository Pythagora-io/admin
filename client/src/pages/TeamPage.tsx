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
  getTeamMembers,
  inviteTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  getMemberAccess,
  updateMemberAccess,
  searchProjects,
} from "@/api/team";
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

// Define interfaces
interface Project {
  _id: string;
  name: string;
  access: "view" | "edit";
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "developer" | "viewer";
}

export function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [accessManagementOpen, setAccessManagementOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberProjects, setMemberProjects] = useState<Project[]>([]);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [projectSearchResults, setProjectSearchResults] = useState<Project[]>(
    [],
  );
  const [sendingInvite, setSendingInvite] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [savingAccess, setSavingAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        console.log("Fetching team members...");
        const response = await getTeamMembers();
        console.log("Team members response:", response);
        console.log("Members array:", response.members);
        setMembers(response.members);
      } catch (error: unknown) {
        console.error("Error in fetchMembers:", error);
        toast({
          variant: "error",
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch team members",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [toast]);

  const handleInviteMember = async () => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        variant: "error",
        title: "Error",
        description: "Please enter a valid email address",
      });
      return;
    }

    setSendingInvite(true);
    try {
      const response = await inviteTeamMember({ email: inviteEmail });

      // Fetch the updated team members list after successful invitation
      const updatedMembers = await getTeamMembers();
      setMembers(updatedMembers.members);

      toast({
        variant: "success",
        title: "Success",
        description: response.message || "Invitation sent successfully",
      });
      setInviteEmail("");
      setInviteOpen(false);
    } catch (error: unknown) {
      toast({
        variant: "error",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send invitation",
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await removeTeamMember(memberToRemove._id);
      setMembers(members.filter((member) => member._id !== memberToRemove._id));
      toast({
        variant: "success",
        title: "Success",
        description: "Team member removed successfully",
      });
    } catch (error: unknown) {
      toast({
        variant: "error",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove team member",
      });
    } finally {
      setRemoveConfirmOpen(false);
      setMemberToRemove(null);
    }
  };

  const handleRoleChange = async (
    memberId: string,
    role: "admin" | "developer" | "viewer",
  ) => {
    try {
      await updateTeamMemberRole(memberId, { role });
      setMembers(
        members.map((member) =>
          member._id === memberId ? { ...member, role } : member,
        ),
      );
      toast({
        variant: "success",
        title: "Success",
        description: `Role updated to ${role}`,
      });
    } catch (error: unknown) {
      toast({
        variant: "error",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update role",
      });
    }
  };

  const openAccessManagement = async (member: TeamMember) => {
    setSelectedMember(member);
    setAccessManagementOpen(true);

    try {
      const response = await getMemberAccess(member._id);
      setMemberProjects(response.projects);
    } catch (error: unknown) {
      toast({
        variant: "error",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch member access",
      });
    }
  };

  const handleProjectSearch = async (query: string) => {
    setProjectSearchQuery(query);

    if (!query.trim()) {
      setProjectSearchResults([]);
      return;
    }

    try {
      const response = await searchProjects(query);
      // Filter out projects that are already in memberProjects
      const existingProjectIds = memberProjects.map(
        (p: { _id: string }) => p._id,
      );
      setProjectSearchResults(
        response.projects.filter(
          (p: { _id: string }) => !existingProjectIds.includes(p._id),
        ),
      );
    } catch (error: unknown) {
      toast({
        variant: "error",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to search projects",
      });
    }
  };

  const addProjectToMember = (project: Project) => {
    // Add project to memberProjects with 'view' access as default
    setMemberProjects([...memberProjects, { ...project, access: "view" }]);
    // Clear search results
    setProjectSearchResults([]);
    setProjectSearchQuery("");
  };

  const handleAccessChange = (projectId: string, access: "view" | "edit") => {
    setMemberProjects(
      memberProjects.map((project) =>
        project._id === projectId ? { ...project, access } : project,
      ),
    );
  };

  const saveAccessChanges = async () => {
    if (!selectedMember) return;

    setSavingAccess(true);
    try {
      const projectsToUpdate = memberProjects.map(
        (p: { _id: string; access: "view" | "edit" }) => ({
          id: p._id,
          access: p.access,
        }),
      );

      await updateMemberAccess(selectedMember._id, {
        projects: projectsToUpdate,
      });

      toast({
        variant: "success",
        title: "Success",
        description: "Project access updated successfully",
      });
      setAccessManagementOpen(false);
    } catch (error: unknown) {
      toast({
        variant: "error",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update project access",
      });
    } finally {
      setSavingAccess(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-success text-warning-foreground";
      case "developer":
        return "bg-developer text-warning-foreground";
      case "viewer":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700/20 dark:text-gray-400";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "developer":
        return "Developer";
      case "viewer":
        return "Viewer";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex flex-col gap-14 text-foreground">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-heading-3 text-foreground">My Team</h1>
          <p className="text-body-sm text-foreground/60">
            Manage your team members and their access
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
                Invite a team member
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
                      key={member._id}
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
                  No other members in the team
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
              Team Members
            </h2>
          </div>
        </div>

        {/* Team Members Table */}
        <div className="flex flex-col space-y-5">
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border-border rounded-lg">
              <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-body-lg-medium text-foreground">
                No team members yet
              </h3>
              <p className="text-body-sm text-foreground/60 mt-1 mb-4">
                Invite colleagues to collaborate on your projects.
              </p>
              <Button
                onClick={() => setInviteOpen(true)}
                className="bg-primary text-primary-foreground text-body-md px-3 py-2 h-auto rounded-lg"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Your First Team Member
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
                    key={member._id}
                    className="flex items-center py-3 border-t border-border text-caption-strong text-foreground"
                    tabIndex={0}
                  >
                    <div className="w-[45%]">{member.email}</div>
                    <div className="w-[25%]">{member.role}</div>
                    <div className="w-[25%]">
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-2 py-1 rounded text-caption-strong ${getRoleColor(member.role)}`}
                        >
                          {getRoleText(member.role)}
                        </div>
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
                              className="bg-success text-warning-foreground focus:bg-success/90 focus:text-warning-foreground text-xs py-1 px-2 h-6"
                              onClick={() =>
                                handleRoleChange(member._id, "admin")
                              }
                            >
                              <span className="flex-1">Admin</span>
                              {member.role === "admin" && (
                                <Check className="h-3 w-3 ml-1" />
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="bg-developer text-warning-foreground focus:bg-developer/90 focus:text-warning-foreground text-xs py-1 px-2 h-6"
                              onClick={() =>
                                handleRoleChange(member._id, "developer")
                              }
                            >
                              <span className="flex-1">Developer</span>
                              {member.role === "developer" && (
                                <Check className="h-3 w-3 ml-1" />
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="bg-warning text-warning-foreground focus:bg-warning/90 focus:text-warning-foreground text-xs py-1 px-2 h-6"
                              onClick={() =>
                                handleRoleChange(member._id, "viewer")
                              }
                            >
                              <span className="flex-1">Viewer</span>
                              {member.role === "viewer" && (
                                <Check className="h-3 w-3 ml-1" />
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="w-[5%] text-right">
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
              Manage Project Access
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground/60 text-left pt-1">
              {selectedMember &&
                `Configure access for ${selectedMember.name || selectedMember.email}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="relative">
              <div className="flex items-center w-full bg-foreground/10 rounded-lg border border-border">
                <Search className="h-4 w-4 ml-3 text-foreground/60 flex-shrink-0" />
                <Input
                  placeholder="Search for projects"
                  className="border-0 bg-transparent px-2 py-3 placeholder:text-foreground/60 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={projectSearchQuery}
                  onChange={(e) => handleProjectSearch(e.target.value)}
                />
              </div>
              {projectSearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                  {projectSearchResults.map((project) => (
                    <div
                      key={project._id}
                      className="p-2 hover:bg-highlight cursor-pointer text-foreground"
                      onClick={() => addProjectToMember(project)}
                    >
                      {project.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 max-h-60 overflow-auto">
              {memberProjects.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No projects assigned yet. Search and add projects above.
                </p>
              ) : (
                memberProjects.map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between py-2 border-none border-border"
                  >
                    <span className="text-foreground text-body-lg">
                      {project.name}
                    </span>
                    <div className="flex items-center space-x-1 text-foreground/80">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center text-body-md opacity-70 hover:opacity-100">
                            <span className="capitalize">{project.access}</span>
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
                              handleAccessChange(project._id, "view")
                            }
                          >
                            View
                            {project.access === "view" && (
                              <Check className="h-3 w-3 ml-2" />
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs py-1 px-2 cursor-pointer flex items-center justify-between"
                            onClick={() =>
                              handleAccessChange(project._id, "edit")
                            }
                          >
                            Edit
                            {project.access === "edit" && (
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
              Remove Team Member
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-foreground/60">
              {memberToRemove &&
                `Are you sure you want to remove ${memberToRemove.name || memberToRemove.email} from the team? They will lose access to all projects.`}
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
