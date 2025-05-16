import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MoreVertical,
  Edit,
  Link2,
  Copy,
  FilePlus,
  Trash,
  ExternalLink,
  Check,
  Users,
  Search,
  Upload,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getUserProjects,
  deleteProjects,
  renameProject,
  getProjectAccess,
  updateProjectAccess,
  createProjectDraft,
  duplicateProject,
  deployProject,
} from "@/api/projects";
import { searchUsers } from "@/api/team";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import EmptyStateCard from "@/components/ui/EmptyStateCard";
// Import SVG icons
import OpenIcon from "@/assets/svg/dropdown-icons/open.svg";
import CopyLinkIcon from "@/assets/svg/dropdown-icons/copy-link.svg";
import DuplicateIcon from "@/assets/svg/dropdown-icons/duplicate-project.svg";
import RenameIcon from "@/assets/svg/dropdown-icons/rename.svg";
import ManageAccessIcon from "@/assets/svg/dropdown-icons/manage-access.svg";
import DeleteIcon from "@/assets/svg/dropdown-icons/delete-project.svg";

interface ProjectsPageProps {
  type?: "drafts" | "deployed";
}

export function ProjectsPage({ type = "drafts" }: ProjectsPageProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployConfirmOpen, setDeployConfirmOpen] = useState(false);
  const [projectToDeploy, setProjectToDeploy] = useState<string | null>(null);

  // Manage access state
  const [accessManagementOpen, setAccessManagementOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectUsers, setProjectUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [savingAccess, setSavingAccess] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Set page title based on type
  const pageTitle = type === "drafts" ? "Drafts" : "Deployed";

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getUserProjects(type);
        setProjects(response.projects);
      } catch (error: unknown) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch projects",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [toast, type]);

  const toggleProjectSelection = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter((id) => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const handleSelectMode = () => {
    setIsSelecting(!isSelecting);
    setSelectedProjects([]);
  };

  const handleDeleteSelected = async () => {
    if (selectedProjects.length === 0) return;

    try {
      await deleteProjects({ projectIds: selectedProjects });

      // Update local state
      setProjects(
        projects.filter((project) => !selectedProjects.includes(project._id)),
      );

      toast({
        title: "Success",
        description: `Successfully deleted ${selectedProjects.length} project(s)`,
      });

      setSelectedProjects([]);
      setIsSelecting(false);
      setDeleteConfirmOpen(false);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete projects",
      });
    }
  };

  const handleNewProject = () => {
    navigate("/projects/create");
  };

  const handleRename = async () => {
    if (!projectToRename || !newProjectTitle.trim()) return;

    setIsRenaming(true);
    try {
      const response = await renameProject(projectToRename.id, {
        title: newProjectTitle,
      });

      // Update local state
      setProjects(
        projects.map((project) =>
          project._id === projectToRename.id
            ? { ...project, title: newProjectTitle }
            : project,
        ),
      );

      toast({
        title: "Success",
        description: response.message || "Project renamed successfully",
      });

      setRenameDialogOpen(false);
      setProjectToRename(null);
      setNewProjectTitle("");
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to rename project",
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeploy = async () => {
    if (!projectToDeploy) return;

    setIsDeploying(true);
    try {
      const response = await deployProject(projectToDeploy);

      toast({
        title: "Success",
        description: response.message || "Project deployed successfully",
      });

      // If we're on the drafts page, remove the project from the list
      if (type === "drafts") {
        setProjects(
          projects.filter((project) => project._id !== projectToDeploy),
        );
      }

      setDeployConfirmOpen(false);
      setProjectToDeploy(null);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deploy project",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const openAccessManagement = async (project: any) => {
    setSelectedProject(project);
    setAccessManagementOpen(true);
    setUserSearchQuery("");
    setUserSearchResults([]);

    try {
      const response = await getProjectAccess(project._id);
      setProjectUsers(response.users);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch project access",
      });
    }
  };

  const handleUserSearch = async (query: string) => {
    setUserSearchQuery(query);

    if (!query.trim()) {
      setUserSearchResults([]);
      return;
    }

    try {
      const response = await searchUsers(query);
      // Filter out users that are already in projectUsers
      const existingUserIds = projectUsers.map((p) => p._id);
      setUserSearchResults(
        (response as { users: any[] }).users.filter((user) => !existingUserIds.includes(user._id)),
      );
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to search users",
      });
    }
  };

  const addUserToProject = (user: any) => {
    // Add user to projectUsers with 'view' access as default
    setProjectUsers([...projectUsers, { ...user, access: "view" }]);
    // Clear search results
    setUserSearchResults([]);
    setUserSearchQuery("");
  };

  const handleAccessChange = (userId: string, access: "view" | "edit") => {
    setProjectUsers(
      projectUsers.map((user) =>
        user._id === userId ? { ...user, access } : user,
      ),
    );
  };

  const saveAccessChanges = async () => {
    if (!selectedProject) return;

    setSavingAccess(true);
    try {
      const usersToUpdate = projectUsers.map((u) => ({
        id: u._id,
        access: u.access,
      }));

      await updateProjectAccess(selectedProject._id, { users: usersToUpdate });

      toast({
        title: "Success",
        description: "Project access updated successfully",
      });
      setAccessManagementOpen(false);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update project access",
      });
    } finally {
      setSavingAccess(false);
    }
  };

  const handleProjectAction = (action: string, projectId: string) => {
    const project = projects.find((p) => p._id === projectId);

    if (!project) return;

    switch (action) {
      case "open":
        window.open(`/editor/${projectId}`, "_blank");
        break;
      case "copy-link":
        navigator.clipboard.writeText(
          `${window.location.origin}/p/${projectId}`,
        );
        toast({
          title: "Link Copied",
          description: "Project link copied to clipboard",
        });
        break;
      case "duplicate":
        // Show toast immediately
        toast({
          title: "Duplicating Project",
          description: "Creating a copy of your project...",
        });

        // Use Promise chaining instead of await
        duplicateProject(projectId)
          .then((response) => {
            // Refresh the projects list
            return getUserProjects(type).then((updatedResponse) => {
              setProjects(updatedResponse.projects);

              toast({
                title: "Success",
                description:
                  response.message || "Project duplicated successfully",
              });
            });
          })
          .catch((error) => {
            toast({
              variant: "destructive",
              title: "Error",
              description: error instanceof Error ? error.message : "Failed to duplicate project",
            });
          });
        break;
      case "rename":
        setProjectToRename({ id: projectId, title: project.title });
        setNewProjectTitle(project.title);
        setRenameDialogOpen(true);
        break;
      case "deploy":
        setProjectToDeploy(projectId);
        setDeployConfirmOpen(true);
        break;
      case "unpublish":
        toast({
          title: "Feature Coming Soon",
          description: "Project unpublishing will be available shortly",
        });
        break;
      case "manage-access":
        openAccessManagement(project);
        break;
      case "delete":
        setSelectedProjects([projectId]);
        setDeleteConfirmOpen(true);
        break;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
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
          <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
          <p className="text-muted-foreground">Manage your {type} projects</p>
        </div>
        <div className="flex gap-2">
          {isSelecting ? (
            <>
              <Button variant="outline" onClick={handleSelectMode}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={selectedProjects.length === 0}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Delete ({selectedProjects.length})
              </Button>
            </>
          ) : (
            <>
              {projects.length > 0 && (
                <Button variant="outline" onClick={handleSelectMode}>
                  Select
                </Button>
              )}
              <Button onClick={handleNewProject}>
                New project
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-start mt-8">
            {type === "drafts" ? (
              <EmptyStateCard
                title=""
                description="No projects yet. Start your first project to get going."
                buttonText="New project"
                onButtonClick={handleNewProject}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2.50019H4.16667C3.72464 2.50019 3.30072 2.67578 2.98816 2.98834C2.67559 3.3009 2.5 3.72483 2.5 4.16686V15.8335C2.5 16.2755 2.67559 16.6995 2.98816 17.012C3.30072 17.3246 3.72464 17.5002 4.16667 17.5002H15.8333C16.2754 17.5002 16.6993 17.3246 17.0118 17.012C17.3244 16.6995 17.5 16.2755 17.5 15.8335V10.0002M15.3125 2.18769C15.644 1.85617 16.0937 1.66992 16.5625 1.66992C17.0313 1.66992 17.481 1.85617 17.8125 2.18769C18.144 2.51921 18.3303 2.96885 18.3303 3.43769C18.3303 3.90653 18.144 4.35617 17.8125 4.68769L10.3017 12.1994C10.1038 12.3971 9.85934 12.5418 9.59083 12.6202L7.19667 13.3202C7.12496 13.3411 7.04895 13.3424 6.97659 13.3238C6.90423 13.3053 6.83819 13.2676 6.78537 13.2148C6.73255 13.162 6.69491 13.096 6.67637 13.0236C6.65783 12.9512 6.65909 12.8752 6.68 12.8035L7.38 10.4094C7.45877 10.1411 7.60378 9.8969 7.80167 9.69936L15.3125 2.18769Z" stroke="#F2F2F2" stroke-opacity="0.8" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                }
              />
            ) : (
              <EmptyStateCard
                title=""
                description="Your deployed apps will appear here"
                buttonText=""
                onButtonClick={() => {}}
                className="items-center justify-center"
              />
            )}
          </div>
        ) : (
          <>
            {projects.map((project) => (
              <Card
                key={project._id}
                className={`overflow-hidden transition-all bg-transparent border-0 ${
                  isSelecting
                    ? "ring-2 ring-offset-2 " +
                      (selectedProjects.includes(project._id)
                        ? "ring-primary"
                        : "ring-transparent")
                    : ""
                }`}
                onClick={() =>
                  isSelecting && toggleProjectSelection(project._id)
                }
              >
                <div className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    {!isSelecting && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 rounded-[6px]" style={{ background: '#0B091299' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-6 w-6" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#222029] rounded-[16px] p-4">
                          <DropdownMenuItem
                            onClick={() =>
                              handleProjectAction("open", project._id)
                            }
                          >
                            <img src={OpenIcon} className="mr-2 h-4 w-4" style={{ color: '#7D8294' }} />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleProjectAction("copy-link", project._id)
                            }
                          >
                            <img src={CopyLinkIcon} className="mr-2 h-4 w-4" style={{ color: '#7D8294' }} />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleProjectAction("duplicate", project._id)
                            }
                          >
                            <img src={DuplicateIcon} className="mr-2 h-4 w-4" style={{ color: '#7D8294' }} />
                            Duplicate project
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleProjectAction("rename", project._id)
                            }
                          >
                            <img src={RenameIcon} className="mr-2 h-4 w-4" style={{ color: '#7D8294' }} />
                            Rename
                          </DropdownMenuItem>
                          {type === "drafts" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleProjectAction("deploy", project._id)
                              }
                            >
                              <Upload className="mr-2 h-4 w-4" style={{ color: '#7D8294' }} />
                              Deploy
                            </DropdownMenuItem>
                          )}
                          {type === "deployed" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleProjectAction("unpublish", project._id)
                              }
                            >
                              <ExternalLink className="mr-2 h-4 w-4" style={{ color: '#7D8294' }} />
                              Unpublish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              handleProjectAction("manage-access", project._id)
                            }
                          >
                            <img src={ManageAccessIcon} className="mr-2 h-4 w-4" style={{ color: '#7D8294' }} />
                            Manage Access
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleProjectAction("delete", project._id)}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4">
                              <path d="M2 4H3.33333H14" stroke="#7D8294" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31304 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33334 13.687 3.33334 13.3333V4M5.33334 4V2.66667C5.33334 2.31304 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31304 1.33334 6.66667 1.33334H9.33334C9.68697 1.33334 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31304 10.6667 2.66667V4" stroke="#7D8294" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.66666 7.33334V11.3333" stroke="#7D8294" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M9.33334 7.33334V11.3333" stroke="#7D8294" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Delete project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <div
                    className="h-[220px] bg-cover bg-center border border-[#222029] rounded-[16px]"
                    style={{ backgroundImage: `url(${project.thumbnail})` }}
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Edited {formatTimeAgo(project.lastEdited)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-[#222029]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete your project. Including any deployments made with Pythagora and all generated code. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              variant="deleteCancel"
              className="font-geist"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={isDeploying}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#222029]">
          <div className="flex items-center justify-between mb-8 w-full">
            <DialogTitle className="flex items-center">Rename project</DialogTitle>
            <button
              className="p-2 text-muted-foreground hover:text-foreground flex items-center"
              onClick={() => setRenameDialogOpen(false)}
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <DialogDescription>
            Enter a new name for your project.
          </DialogDescription>
          <div className="py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="cancel"
              onClick={() => setRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={isRenaming || !newProjectTitle.trim()}
            >
              {isRenaming ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deploy Confirmation Dialog */}
      <AlertDialog open={deployConfirmOpen} onOpenChange={setDeployConfirmOpen}>
        <AlertDialogContent className="bg-[#222029]">
          <div className="flex items-center justify-between mb-8 w-full">
            <AlertDialogTitle>Deploy project</AlertDialogTitle>
            <button
              className="p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setDeployConfirmOpen(false)}
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <AlertDialogDescription>
            Are you sure you want to deploy this project? The project will be
            accessible to others based on your visibility settings.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-none bg-transparent shadow-none hover:bg-transparent focus:bg-transparent"
              onClick={() => setDeployConfirmOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeploy} disabled={isDeploying}>
              {isDeploying ? "Deploying..." : "Deploy"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            Configure who can access this project and their permission level.
          </DialogDescription>
          <div className="py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={userSearchQuery}
                onChange={(e) => handleUserSearch(e.target.value)}
              />
              {userSearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                  {userSearchResults.map((user) => (
                    <div
                      key={user._id}
                      className="p-2 hover:bg-accent cursor-pointer"
                      onClick={() => addUserToProject(user)}
                    >
                      {user.name} ({user.email})
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 max-h-60 overflow-auto">
              {projectUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No users have access to this project yet. Search and add users
                  above.
                </p>
              ) : (
                projectUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <Select
                      defaultValue={user.access}
                      onValueChange={(value) =>
                        handleAccessChange(user._id, value as "view" | "edit")
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Access" />
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
              variant="cancel"
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
    </div>
  );
}
