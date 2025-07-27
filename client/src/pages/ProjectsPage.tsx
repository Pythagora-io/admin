import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  MoreVertical,
  Users,
  Search,
  Upload,
  SquarePen,
  Settings2,
  ArrowUpRightSquare,
  Trash2,
  Link,
  Copy,
  FileEdit,
  CloudOff,
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

interface ProjectsPageProps {
  type?: "drafts" | "deployed";
}

interface Project {
  _id: string;
  title: string;
  lastEdited: string;
  visibility: "public" | "private";
  thumbnail?: string;
  // Add other relevant project fields here
}

interface UserAccessInfo {
  _id: string;
  name: string;
  email: string;
  access: "view" | "edit";
}

interface SearchedUser {
  _id: string;
  name: string;
  email: string;
}

export function ProjectsPage({ type = "drafts" }: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectUsers, setProjectUsers] = useState<UserAccessInfo[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<SearchedUser[]>(
    [],
  );
  const [savingAccess, setSavingAccess] = useState(false);

  const { toast } = useToast();

  // Set page title based on type
  const pageTitle = type === "drafts" ? "Drafts" : "Deployed Projects";

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true); // Reset loading state when type changes
      setProjects([]); // Clear projects immediately to prevent flash
      try {
        const response = await getUserProjects(type);
        setProjects(response.projects);
      } catch (error) {
        toast({
          variant: "error",
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch projects",
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
        variant: "success",
        title: "Success",
        description: `Successfully deleted ${selectedProjects.length} project(s)`,
      });

      setSelectedProjects([]);
      setIsSelecting(false);
      setDeleteConfirmOpen(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete projects",
      });
    }
  };

  const handleNewProject = async () => {
    try {
      const response = await createProjectDraft({
        title: "New Project",
        description: "Enter project description here",
        visibility: "private",
      });

      // Ensure response is used or handled if needed, e.g., for navigation or specific feedback
      console.log("New project created:", response.project._id);

      // Refresh the projects list
      const updatedResponse = await getUserProjects(type);
      setProjects(updatedResponse.projects);

      toast({
        variant: "success",
        title: "Success",
        description: "New project created successfully",
      });

      // You could also navigate to an editor with the new project ID
      // navigate(`/editor/${response.project._id}`);
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create new project",
      });
    }
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
        variant: "success",
        title: "Success",
        description: response.message || "Project renamed successfully",
      });

      setRenameDialogOpen(false);
      setProjectToRename(null);
      setNewProjectTitle("");
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to rename project",
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
        variant: "success",
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
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to deploy project",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const openAccessManagement = async (project: Project) => {
    setSelectedProject(project);
    setAccessManagementOpen(true);
    setUserSearchQuery("");
    setUserSearchResults([]);

    try {
      const response = await getProjectAccess(project._id);
      setProjectUsers(response.users);
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch project access",
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
        (response as { users: SearchedUser[] }).users.filter(
          (user) => !existingUserIds.includes(user._id),
        ),
      );
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to search users",
      });
    }
  };

  const addUserToProject = (user: SearchedUser) => {
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
        variant: "success",
        title: "Success",
        description: "Project access updated successfully",
      });
      setAccessManagementOpen(false);
    } catch (error) {
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
          variant: "success",
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
                variant: "success",
                title: "Success",
                description:
                  response.message || "Project duplicated successfully",
              });
            });
          })
          .catch((error) => {
            toast({
              variant: "error",
              title: "Error",
              description:
                error instanceof Error
                  ? error.message
                  : "Failed to duplicate project",
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
          variant: "success",
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-medium">{pageTitle}</h1>
          <p className="text-body-sm text-muted-foreground">
            Manage your {type} projects
          </p>
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
                Delete
                {selectedProjects.length > 0
                  ? ` (${selectedProjects.length})`
                  : " checked"}
              </Button>
            </>
          ) : (
            <>
              {!loading && projects.length > 0 && (
                <Button variant="ghost" onClick={handleSelectMode}>
                  Select
                </Button>
              )}
              <Button onClick={handleNewProject}>New Project</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : projects.length === 0 ? (
          type === "drafts" ? (
            <div className="relative overflow-hidden transition-all h-60 w-[356px]">
              <div
                className="relative rounded-2xl"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='rgba(247,248,252,0.15)' stroke-width='1' stroke-dasharray='11,11'/%3e%3c/svg%3e\")",
                }}
              >
                <div className="h-60 w-full flex flex-col gap-4 items-center justify-center rounded-2xl">
                  <SquarePen className="h-5 w-5 text-foreground" />
                  <p className="text-body-sm font-medium text-foreground/80 text-center max-w-[176px]">
                    No projects yet. Start your first project to get going.
                  </p>
                  <Button
                    onClick={handleNewProject}
                    className="bg-primary text-primary-foreground text-caption-strong px-3 py-2 h-9 rounded-md"
                  >
                    New project
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative transition-all">
              <div
                className="relative rounded-2xl overflow-hidden h-60 w-[356px] flex flex-col items-center justify-center"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='rgba(247,248,252,0.15)' stroke-width='1' stroke-dasharray='11,11'/%3e%3c/svg%3e\")",
                }}
              >
                <p className="text-body-md text-foreground/80 text-center max-w-[176px]">
                  Your deployed apps will appear here.
                </p>
              </div>
            </div>
          )
        ) : (
          <>
            {projects.map((project) => (
              <div
                key={project._id}
                className={`relative overflow-hidden transition-all ${
                  isSelecting ? "cursor-pointer" : "cursor-pointer"
                }`}
                onClick={() => {
                  if (isSelecting) {
                    toggleProjectSelection(project._id);
                  } else {
                    // Default action for non-select mode, e.g., open project
                    // window.open(`/editor/${project._id}`, "_blank");
                  }
                }}
              >
                {/* Image Container */}
                <div className="relative rounded-2xl overflow-hidden border border-border">
                  {/* Thumbnail Image */}
                  <div
                    className="h-60 w-full bg-cover bg-center flex items-center justify-center"
                    style={{
                      backgroundImage: project.thumbnail
                        ? `url(${project.thumbnail})`
                        : "none",
                    }}
                  >
                    {!project.thumbnail && (
                      <Settings2 className="h-16 w-16 text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Checkbox for selection (only visible when isSelecting is true) */}
                  {isSelecting && (
                    <div
                      className="absolute top-3 left-3 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedProjects.includes(project._id)}
                        onCheckedChange={() =>
                          toggleProjectSelection(project._id)
                        }
                        className="border-2 border-checkbox-check bg-white data-[state=checked]:text-checkbox-check data-[state=checked]:bg-white size-5"
                      />
                    </div>
                  )}

                  {/* More Options Button (three vertical dots) */}
                  {!isSelecting && (
                    <div className="absolute top-3 right-3 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md bg-background/80 hover:bg-background/80 backdrop-blur-sm data-[state=open]:bg-background/90"
                            onClick={(e) => e.stopPropagation()} // Prevent card click
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-[180px] px-2 py-2.5 rounded-2xl"
                        >
                          <DropdownMenuItem
                            className="group"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProjectAction("open", project._id);
                            }}
                          >
                            <ArrowUpRightSquare className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground" />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="group"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProjectAction("copy-link", project._id);
                            }}
                          >
                            <Link className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="group"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProjectAction("duplicate", project._id);
                            }}
                          >
                            <Copy className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground" />
                            Duplicate Project
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="group"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProjectAction("rename", project._id);
                            }}
                          >
                            <FileEdit className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="group"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProjectAction("manage-access", project._id);
                            }}
                          >
                            <Users className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground" />
                            Manage Access
                          </DropdownMenuItem>
                          {type === "drafts" && (
                            <DropdownMenuItem
                              className="group"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProjectAction("deploy", project._id);
                              }}
                            >
                              <Upload className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground" />
                              Deploy
                            </DropdownMenuItem>
                          )}
                          {type === "deployed" && (
                            <DropdownMenuItem
                              className="group"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProjectAction("unpublish", project._id);
                              }}
                            >
                              <CloudOff className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground" />
                              Unpublish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="group"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProjectAction("delete", project._id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground group-focus:text-accent-foreground" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                {/* Text Content Area */}
                <div className="flex flex-col gap-0 px-4 pt-4">
                  <h3 className="text-body-md truncate" title={project.title}>
                    {project.title}
                  </h3>
                  <p className="text-xs text-foreground/80">
                    Edited {formatTimeAgo(project.lastEdited)}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Project{selectedProjects.length > 1 ? "s" : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              {selectedProjects.length === 0
                ? "the selected projects"
                : selectedProjects.length === 1
                  ? "this project"
                  : `these ${selectedProjects.length} projects`}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDeleteSelected}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for your project.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name</Label>
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
              variant="outline"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deploy Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deploy this project? The project will be
              accessible to others based on your visibility settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeployConfirmOpen(false)}>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Project Access</DialogTitle>
            <DialogDescription>
              Configure who can access this project and their permission level.
            </DialogDescription>
          </DialogHeader>
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
    </div>
  );
}
