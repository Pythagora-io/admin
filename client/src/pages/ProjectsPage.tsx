import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  Lock,
  Calendar,
  Folder,
  ExternalLink,
  Trash2,
  Link,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { getProjects, deleteDeployedProject, setupCustomDomain, deleteCustomDomain } from "@/api/projects";
import { getUserProfile } from "@/api/user";
import SpinnerShape from "@/components/SpinnerShape";
import { ProjectsPythagoraIcon, PremiumPlanIcon } from "@/components/icons/PlanIcons";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Project {
  id: string;
  name: string;
  folder_name: string;
  updated_at?: string;
  created_at?: string;
  isPublic?: boolean;
  status?: 'draft' | 'deployed';
  deploymentUrl?: string;
}

interface Deployment {
  instanceName: string;
  folderPath: string;
  url: string;
  projectId: string;
  instanceId: string;
  publicDnsName: string;
  createdAt: { $date: string } | string;
  updatedAt: { $date: string } | string;
  customDomain?: string;
  customDomainStatus?: string;
  publicIp?: string;
  customDomainRetryCount?: number;
  customDomainLastChecked?: string;
}

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingDeployment, setDeletingDeployment] = useState<string | null>(null);
  const [settingUpDomain, setSettingUpDomain] = useState<string | null>(null);
  const [customDomainDialog, setCustomDomainDialog] = useState<{ open: boolean; deployment: Deployment | null }>({ open: false, deployment: null });
  const [dnsInstructionsDialog, setDnsInstructionsDialog] = useState<{ open: boolean; deployment: Deployment | null }>({ open: false, deployment: null });
  const [customDomain, setCustomDomain] = useState("");
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    return (tab === 'deployed' || tab === 'projects') ? tab : 'projects';
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deletingCustomDomain, setDeletingCustomDomain] = useState<string | null>(null);

  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('ProjectsPage: Fetching projects and deployments...');

      // Fetch both projects and user profile (which contains deployments)
      const [projectsResponse, profileResponse] = await Promise.all([
        getProjects(),
        getUserProfile()
      ]);

      console.log("ProjectsPage: Projects response received:", projectsResponse);
      console.log("ProjectsPage: Profile response received:", profileResponse);

      // Handle projects
      if (projectsResponse && projectsResponse.projects) {
        const mappedProjects = projectsResponse.projects.map((project: any) => ({
          id: project.id,
          name: project.name,
          folder_name: project.folder_name,
          updated_at: project.updated_at,
          created_at: project.created_at,
          isPublic: project.isPublic || false,
          status: 'draft' as const,
          deploymentUrl: project.deploymentUrl || `https://${project.id}.deployments.pythagora.ai`
        }));

        // Sort projects by time (most recent first)
        const sortedProjects = mappedProjects.sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || 0);
          const dateB = new Date(b.updated_at || b.created_at || 0);
          return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
        });

        console.log("ProjectsPage: Mapped and sorted projects:", sortedProjects);
        setProjects(sortedProjects);
      } else {
        console.warn("ProjectsPage: No projects found in response");
        setProjects([]);
      }

      // Handle deployments
      if (profileResponse && profileResponse.deployments) {
        console.log("ProjectsPage: Deployments found:", profileResponse.deployments);

        // Sort deployments by time (most recent first)
        const sortedDeployments = [...profileResponse.deployments].sort((a, b) => {
          const getDateString = (dateObj: { $date: string } | string) => {
            return typeof dateObj === 'object' && dateObj.$date ? dateObj.$date : dateObj;
          };

          const dateA = new Date(getDateString(a.updatedAt) || getDateString(a.createdAt) || 0);
          const dateB = new Date(getDateString(b.updatedAt) || getDateString(b.createdAt) || 0);
          return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
        });

        setDeployments(sortedDeployments);
      } else {
        console.warn("ProjectsPage: No deployments found in profile response");
        setDeployments([]);
      }

    } catch (error: unknown) {
      console.error("ProjectsPage: Error fetching data:", error);
      let errorMessage = "Failed to load data. Please try again later.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeployment = async (deployment: Deployment) => {
    try {
      setDeletingDeployment(deployment.projectId);
      console.log('ProjectsPage: Deleting deployment:', deployment);

      await deleteDeployedProject(deployment.projectId, deployment.folderPath);

      toast({
        title: "Success",
        description: "Deployment deleted successfully",
      });

      // Refresh the data to reflect the changes
      await fetchData();
    } catch (error: unknown) {
      console.error("ProjectsPage: Error deleting deployment:", error);
      let errorMessage = "Failed to delete deployment. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setDeletingDeployment(null);
    }
  };

  const handleDeleteCustomDomain = async (deployment: Deployment) => {
    if (!deployment.customDomain) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No custom domain found for this deployment",
      });
      return;
    }

    try {
      setDeletingCustomDomain(deployment.projectId);
      console.log('ProjectsPage: Deleting custom domain:', {
        deployment: deployment,
        domain: deployment.customDomain
      });

      await deleteCustomDomain(deployment.customDomain);

      toast({
        title: "Success",
        description: `Custom domain ${deployment.customDomain} deleted successfully`,
      });

      // Refresh the data to reflect the changes
      await fetchData();
    } catch (error: unknown) {
      console.error("ProjectsPage: Error deleting custom domain:", error);
      let errorMessage = "Failed to delete custom domain. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setDeletingCustomDomain(null);
    }
  };

  const handleSetupCustomDomain = async () => {
    if (!customDomainDialog.deployment || !customDomain.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid domain name",
      });
      return;
    }

    try {
      setSettingUpDomain(customDomainDialog.deployment.projectId);
      console.log('ProjectsPage: Setting up custom domain:', {
        deployment: customDomainDialog.deployment,
        domain: customDomain
      });

      const response = await setupCustomDomain(
        customDomainDialog.deployment.projectId,
        customDomainDialog.deployment.folderPath,
        customDomain.trim()
      );

      console.log('ProjectsPage: Custom domain setup response:', response);

      toast({
        title: "Custom Domain Setup Initiated",
        description: response.dnsInstructions?.instructions || `Custom domain setup for ${customDomain} has been initiated`,
      });

      // Close dialog and reset form
      setCustomDomainDialog({ open: false, deployment: null });
      setCustomDomain("");

      // Refresh data to get updated deployment info
      await fetchData();

    } catch (error: unknown) {
      console.error("ProjectsPage: Error setting up custom domain:", error);
      let errorMessage = "Failed to setup custom domain. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setSettingUpDomain(null);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: "Copied",
        description: `${field} copied to clipboard`,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard",
      });
    }
  };

  const getCustomDomainStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
      active: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      failed: { color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle },
      default: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.default;
    const IconComponent = config.icon;

    return (
      <Badge variant="outline" className={`text-xs ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString?: string | { $date: string }) => {
    if (!dateString) return "Unknown";

    try {
      let dateToFormat: string;
      if (typeof dateString === 'object' && dateString.$date) {
        dateToFormat = dateString.$date;
      } else if (typeof dateString === 'string') {
        dateToFormat = dateString;
      } else {
        return "Unknown";
      }

      const date = new Date(dateToFormat);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
      return `${Math.ceil(diffDays / 365)} years ago`;
    } catch {
      return "Unknown";
    }
  };

  const openDeployment = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <SpinnerShape className="w-16 h-16" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-heading-3 text-foreground tracking-wide">
            My Projects
          </h1>
          <p className="text-body-sm text-muted-foreground">
            View and manage your projects and deployments
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Failed to load data</h2>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={() => fetchData()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-heading-3 text-foreground tracking-wide">
          My Projects
        </h1>
        <p className="text-body-sm text-muted-foreground">
          View and manage your projects and deployments
        </p>
      </div>

      {/* Tabs for Projects and Deployments */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <ProjectsPythagoraIcon className="h-4 w-4" />
            Projects ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="deployed" className="flex items-center gap-2">
            <PremiumPlanIcon className="h-4 w-4" />
            Deployed ({deployments.length})
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab Content */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                  <p className="text-muted-foreground text-center">
                    You don't have any projects yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project, index) => (
                    <div key={project.id}>
                      <div className="flex items-center justify-between py-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-foreground">
                              {project.name}
                            </h3>
                            <Badge
                              variant={project.isPublic ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {project.isPublic ? (
                                <>
                                  <Globe className="h-3 w-3 mr-1" />
                                  Public
                                </>
                              ) : (
                                <>
                                  <Lock className="h-3 w-3 mr-1" />
                                  Private
                                </>
                              )}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(project.updated_at || project.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Folder className="h-3 w-3" />
                              {project.folder_name}
                            </span>
                          </div>
                        </div>
                      </div>
                      {index < projects.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deployed Tab Content */}
        <TabsContent value="deployed" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {deployments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <PremiumPlanIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No deployments found</h3>
                  <p className="text-muted-foreground text-center">
                    You don't have any deployed projects yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deployments.map((deployment, index) => (
                    <div key={deployment.instanceId}>
                      <div className="flex items-center justify-between py-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-foreground">
                              {deployment.folderPath}
                            </h3>
                            <Badge variant="default" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              Live
                            </Badge>
                            {deployment.customDomain && getCustomDomainStatusBadge(deployment.customDomainStatus)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(deployment.updatedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Folder className="h-3 w-3" />
                              {deployment.instanceName}
                            </span>
                            <span className="truncate max-w-[200px]" title={deployment.url}>
                              {deployment.url}
                            </span>
                          </div>
                          {deployment.customDomain && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Custom Domain:</span>
                              <span className="font-medium text-foreground">{deployment.customDomain}</span>
                              {deployment.customDomainStatus === 'pending' && (
                                <span className="text-yellow-600 text-xs">
                                  (Propagation pending)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeployment(deployment.url)}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open
                          </Button>

                          {deployment.customDomain && deployment.publicIp && (
                            <Dialog
                              open={dnsInstructionsDialog.open && dnsInstructionsDialog.deployment?.projectId === deployment.projectId}
                              onOpenChange={(open) => {
                                if (!open) {
                                  setDnsInstructionsDialog({ open: false, deployment: null });
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDnsInstructionsDialog({ open: true, deployment })}
                                  className="flex items-center gap-2"
                                >
                                  <Link className="h-4 w-4" />
                                  DNS Info
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>DNS Configuration</DialogTitle>
                                  <DialogDescription>
                                    Configure your DNS settings to point your custom domain to your deployment.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Record Type</Label>
                                    <div className="flex items-center gap-2">
                                      <Input value="A" readOnly className="flex-1" />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard("A", "Record Type")}
                                      >
                                        {copiedField === "Record Type" ? (
                                          <CheckCircle className="h-4 w-4" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Name/Host</Label>
                                    <div className="flex items-center gap-2">
                                      <Input value={deployment.customDomain} readOnly className="flex-1" />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(deployment.customDomain!, "Domain")}
                                      >
                                        {copiedField === "Domain" ? (
                                          <CheckCircle className="h-4 w-4" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Value/Points to</Label>
                                    <div className="flex items-center gap-2">
                                      <Input value={deployment.publicIp} readOnly className="flex-1" />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(deployment.publicIp!, "IP Address")}
                                      >
                                        {copiedField === "IP Address" ? (
                                          <CheckCircle className="h-4 w-4" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>TTL</Label>
                                    <div className="flex items-center gap-2">
                                      <Input value="300" readOnly className="flex-1" />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard("300", "TTL")}
                                      >
                                        {copiedField === "TTL" ? (
                                          <CheckCircle className="h-4 w-4" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                      <strong>Instructions:</strong> Create an A record for {deployment.customDomain} pointing to {deployment.publicIp}.
                                      DNS propagation may take up to 48 hours.
                                    </p>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={() => setDnsInstructionsDialog({ open: false, deployment: null })}
                                  >
                                    Close
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}

                          {deployment.customDomain && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "flex items-center gap-2 border-orange-200 text-orange-600 hover:text-orange-700",
                                    "hover:bg-orange-50 hover:border-orange-300 transition-all duration-200",
                                    "focus:ring-2 focus:ring-orange-200 focus:ring-offset-1",
                                    "dark:border-orange-800 dark:text-orange-400 dark:hover:text-orange-300",
                                    "dark:hover:bg-orange-950 dark:hover:border-orange-700",
                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                  )}
                                  disabled={deletingCustomDomain === deployment.projectId}
                                >
                                  {deletingCustomDomain === deployment.projectId ? (
                                    <SpinnerShape className="h-4 w-4" />
                                  ) : (
                                    <Link className="h-4 w-4" />
                                  )}
                                  Delete Domain
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Custom Domain</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the custom domain "{deployment.customDomain}"?
                                    This will remove the custom domain configuration but won't delete the deployment itself.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCustomDomain(deployment)}
                                    className={cn(
                                      "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
                                      "dark:bg-orange-600 dark:hover:bg-orange-700"
                                    )}
                                  >
                                    Delete Domain
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          <Dialog
                            open={customDomainDialog.open && customDomainDialog.deployment?.projectId === deployment.projectId}
                            onOpenChange={(open) => {
                              if (!open) {
                                setCustomDomainDialog({ open: false, deployment: null });
                                setCustomDomain("");
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCustomDomainDialog({ open: true, deployment })}
                                className="flex items-center gap-2"
                                disabled={settingUpDomain === deployment.projectId || !!deployment.customDomain}
                              >
                                {settingUpDomain === deployment.projectId ? (
                                  <SpinnerShape className="h-4 w-4" />
                                ) : (
                                  <Link className="h-4 w-4" />
                                )}
                                {deployment.customDomain ? "Domain Set" : "Custom Domain"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Setup Custom Domain</DialogTitle>
                                <DialogDescription>
                                  Connect a custom domain to your deployment "{deployment.folderPath}".
                                  You'll receive DNS instructions after setup.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="domain">Domain Name</Label>
                                  <Input
                                    id="domain"
                                    placeholder="example.com"
                                    value={customDomain}
                                    onChange={(e) => setCustomDomain(e.target.value)}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setCustomDomainDialog({ open: false, deployment: null });
                                    setCustomDomain("");
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleSetupCustomDomain}
                                  disabled={!customDomain.trim() || settingUpDomain === deployment.projectId}
                                >
                                  {settingUpDomain === deployment.projectId ? (
                                    <>
                                      <SpinnerShape className="h-4 w-4 mr-2" />
                                      Setting up...
                                    </>
                                  ) : (
                                    "Setup Domain"
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "flex items-center gap-2 border-red-200 text-red-600 hover:text-red-700",
                                  "hover:bg-red-50 hover:border-red-300 transition-all duration-200",
                                  "focus:ring-2 focus:ring-red-200 focus:ring-offset-1",
                                  "dark:border-red-800 dark:text-red-400 dark:hover:text-red-300",
                                  "dark:hover:bg-red-950 dark:hover:border-red-700",
                                  "disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                                disabled={deletingDeployment === deployment.projectId}
                              >
                                {deletingDeployment === deployment.projectId ? (
                                  <SpinnerShape className="h-4 w-4" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Deployment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the deployment "{deployment.folderPath}"?
                                  This action cannot be undone and will permanently remove the deployed application.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteDeployment(deployment)}
                                  className={cn(
                                    "bg-red-600 hover:bg-red-700 focus:ring-red-500",
                                    "dark:bg-red-600 dark:hover:bg-red-700"
                                  )}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {index < deployments.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}