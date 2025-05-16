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
  MoreVertical,
  UserPlus,
  Settings,
  UserMinus,
  Search,
  X,
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
import { PageTitle } from '@/components/PageTitle';
import { PageSubtitle } from '@/components/PageSubtitle';

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
          description: error instanceof Error ? error.message : String(error) || "Failed to fetch team members",
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
        description: error instanceof Error ? error.message : String(error) || "Failed to send invitation",
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
        description: error instanceof Error ? error.message : String(error) || "Failed to remove team member",
      });
    } finally {
      setRemoveConfirmOpen(false);
      setMemberToRemove(null);
    }
  };

  const handleRoleChange = async (memberId: string, role: 'admin' | 'developer' | 'viewer') => {
    setUpdatingRole(memberId);
    try {
      await updateTeamMemberRole(memberId, { role });
      setMembers((prev) => prev.map((m) => m._id === memberId ? { ...m, role } : m));
      toast({ title: "Role updated", description: `Role changed to ${role}` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : String(error) });
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
        description: error instanceof Error ? error.message : String(error) || "Failed to fetch member access",
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
      const existingProjectIds = memberProjects.map((p: any) => p._id);
      setProjectSearchResults(
        response.projects.filter((p: any) => !existingProjectIds.includes(p._id)),
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : String(error) || "Failed to search projects",
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
        description: error instanceof Error ? error.message : String(error) || "Failed to update project access",
      });
    } finally {
      setSavingAccess(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-[#07998A]";
      case "developer":
        return "bg-[#FC8DDD]";
      case "viewer":
        return "bg-[#FFD11A]";
      default:
        return "bg-gray-200";
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
          <PageTitle>Team</PageTitle>
          <PageSubtitle>Manage your team members</PageSubtitle>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              Invite member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-[#222029] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <DialogTitle className="text-white font-geist text-[18px] font-medium leading-normal">Invite a team member</DialogTitle>
              <button
                className="p-2 text-muted-foreground hover:text-foreground flex items-center"
                onClick={() => setInviteOpen(false)}
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex gap-2 mb-6">
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Invite others by email"
                className="flex-1 bg-[#18171B] border-none text-white font-geist text-[14px] font-normal placeholder:text-[#A1A1AA]"
              />
              <Button
                onClick={handleInviteMember}
                disabled={sendingInvite || !inviteEmail.trim()}
                className="bg-primary text-white font-geist text-[14px] font-medium px-6"
              >
                {sendingInvite ? "Inviting..." : "Invite"}
              </Button>
            </div>
            <div className="divide-y divide-[#35343A]">
              {members.map((member) => (
                <div key={member._id} className="flex items-center justify-between py-3">
                  <span className="text-white font-geist text-[16px] font-normal">{member.email}</span>
                  <Select
                    value={member.role}
                    onValueChange={(role) => handleRoleChange(member._id, role as 'admin' | 'developer' | 'viewer')}
                  >
                    <SelectTrigger className="w-32 bg-transparent border-none text-[#A1A1AA] font-geist text-[14px] font-normal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#222029]">
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members Section */}
      <div className="pt-8 pb-0 border-b border-[rgba(247,248,248,0.10)]">
        <h2 className="text-[24px] font-medium leading-[1.25] tracking-[-0.48px] text-[#F7F8F8] font-geist mb-2">Team members</h2>
        {/* Table header */}
        <div className="mb-5"></div>
        <div className="flex w-full border-b border-[rgba(247,248,248,0.10)] pb-2"
          style={{ color: '#F7F8F8', fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 500, fontStyle: 'normal', lineHeight: 'normal', letterSpacing: '-0.28px' }}>
          <div className="flex-1">Email</div>
          <div className="w-48">Role</div>
          <div className="w-32">Access</div>
          <div className="w-8"></div>
        </div>
        {/* Table rows */}
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <h3 className="text-lg font-medium">Invite member</h3>
            <p className="text-muted-foreground text-center mt-2 mb-4">
              Invite colleagues to collaborate on your projects.
            </p>
            <Button onClick={() => setInviteOpen(true)}>
              Invite member
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(247,248,248,0.10)]">
            {members.map((member) => (
              <div
                key={member._id}
                className="flex items-center py-2.5"
              >
                <div className="flex-1 text-base"
                  style={{ color: 'rgba(242,242,242,0.80)', fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: 500, fontStyle: 'normal', lineHeight: 'normal' }}
                >{member.email}</div>
                <div className="w-48"
                  style={{ color: 'rgba(242,242,242,0.80)', fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: 500, fontStyle: 'normal', lineHeight: 'normal' }}
                >
                  {member.role.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                </div>
                <div className="w-32">
                  {/* Access badge or button here */}
                  <span
                    className={`inline-block px-3 py-1 rounded-lg ${getRoleColor(member.role)}`}
                    style={{
                      color: '#060218',
                      borderRadius: 8,
                      fontFamily: 'Geist, sans-serif',
                      fontSize: 12,
                      fontWeight: 500,
                      fontStyle: 'normal',
                      lineHeight: 'normal',
                    }}
                  >
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                </div>
                <div className="w-8 text-right">
                  {/* Actions menu here */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#222029] rounded-[16px] p-4">
                      <DropdownMenuItem
                        onClick={() => { setRemoveConfirmOpen(true); setMemberToRemove(member); }}
                        style={{ color: '#F7F8F8', fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: 'normal' }}
                        className="flex items-center gap-3"
                      >
                        Remove member
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openAccessManagement(member)}
                        style={{ color: '#F7F8F8', fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: 'normal' }}
                        className="flex items-center gap-3"
                      >
                        Manage access
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Access Management Dialog */}
      <Dialog
        open={accessManagementOpen}
        onOpenChange={setAccessManagementOpen}
      >
        <DialogContent className="sm:max-w-md bg-[#222029]">
          <div className="flex items-center justify-between mb-8 w-full">
            <DialogTitle className="flex items-center">Manage project access</DialogTitle>
            <button
              className="p-2 text-muted-foreground hover:text-foreground flex items-center"
              onClick={() => setAccessManagementOpen(false)}
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <DialogDescription>
            {selectedMember && `Configure access for ${selectedMember.name}`}
          </DialogDescription>
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
              {savingAccess ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <AlertDialogContent className="bg-[#222029]">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team member? They will no longer have access to any projects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              variant="deleteCancel"
              className="font-geist"
              onClick={() => setRemoveConfirmOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="font-geist"
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
