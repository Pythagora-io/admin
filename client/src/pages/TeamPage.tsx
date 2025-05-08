import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import {
  MoreHorizontal,
  UserPlus,
  Settings,
  UserMinus,
  Search,
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

export function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [accessManagementOpen, setAccessManagementOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [memberProjects, setMemberProjects] = useState<any[]>([]);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [projectSearchResults, setProjectSearchResults] = useState<any[]>([]);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [savingAccess, setSavingAccess] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        console.log("Fetching team members...");
        const response = await getTeamMembers();
        console.log("Team members response:", response);
        console.log("Members array:", response.members);
        setMembers(response.members);
      } catch (error) {
        console.error("Error in fetchMembers:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch team members",
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
        variant: "destructive",
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
        title: "Success",
        description: response.message || "Invitation sent successfully",
      });
      setInviteEmail("");
      setInviteOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send invitation",
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
        title: "Success",
        description: "Team member removed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove team member",
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
    setUpdatingRole(memberId);
    try {
      await updateTeamMemberRole(memberId, { role });
      setMembers(
        members.map((member) =>
          member._id === memberId ? { ...member, role } : member,
        ),
      );
      toast({
        title: "Success",
        description: `Role updated to ${role}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update role",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const openAccessManagement = async (member: any) => {
    setSelectedMember(member);
    setAccessManagementOpen(true);

    try {
      const response = await getMemberAccess(member._id);
      setMemberProjects(response.projects);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch member access",
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
      const existingProjectIds = memberProjects.map((p) => p._id);
      setProjectSearchResults(
        response.projects.filter((p) => !existingProjectIds.includes(p._id)),
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to search projects",
      });
    }
  };

  const addProjectToMember = (project: any) => {
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
      const projectsToUpdate = memberProjects.map((p) => ({
        id: p._id,
        access: p.access,
      }));

      await updateMemberAccess(selectedMember._id, {
        projects: projectsToUpdate,
      });

      toast({
        title: "Success",
        description: "Project access updated successfully",
      });
      setAccessManagementOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update project access",
      });
    } finally {
      setSavingAccess(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-700/20 dark:text-red-400 border-red-200";
      case "developer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-700/20 dark:text-blue-400 border-blue-200";
      case "viewer":
        return "bg-green-100 text-green-800 dark:bg-green-700/20 dark:text-green-400 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700/20 dark:text-gray-400 border-gray-200";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your team members and their access
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your team.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-end gap-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleInviteMember}
                disabled={sendingInvite || !inviteEmail.trim()}
              >
                {sendingInvite ? "Sending..." : "Invite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>View and manage your team members</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No team members yet</h3>
              <p className="text-muted-foreground text-center mt-2 mb-4">
                Invite colleagues to collaborate on your projects.
              </p>
              <Button onClick={() => setInviteOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Your First Team Member
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        handleRoleChange(
                          member._id,
                          value as "admin" | "developer" | "viewer",
                        )
                      }
                      disabled={updatingRole === member._id}
                    >
                      <SelectTrigger
                        className={`w-32 ${getRoleColor(member.role)} border`}
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openAccessManagement(member)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Manage Access
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => {
                            setMemberToRemove(member);
                            setRemoveConfirmOpen(true);
                          }}
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Access Management Dialog */}
      <Dialog
        open={accessManagementOpen}
        onOpenChange={setAccessManagementOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Project Access</DialogTitle>
            <DialogDescription>
              {selectedMember && `Configure access for ${selectedMember.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-8"
                value={projectSearchQuery}
                onChange={(e) => handleProjectSearch(e.target.value)}
              />
              {projectSearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                  {projectSearchResults.map((project) => (
                    <div
                      key={project._id}
                      className="p-2 hover:bg-accent cursor-pointer"
                      onClick={() => addProjectToMember(project)}
                    >
                      {project.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 max-h-60 overflow-auto">
              {memberProjects.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No projects assigned yet. Search and add projects above.
                </p>
              ) : (
                memberProjects.map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <span>{project.name}</span>
                    <Select
                      defaultValue={project.access}
                      onValueChange={(value) =>
                        handleAccessChange(
                          project._id,
                          value as "view" | "edit",
                        )
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select access" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">View</SelectItem>
                        <SelectItem value="edit">Edit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAccessManagementOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveAccessChanges} disabled={savingAccess}>
              {savingAccess ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove &&
                `Are you sure you want to remove ${memberToRemove.name} from the team? They will lose access to all projects.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemoveConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
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
