import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash, ExternalLink, Plus, Globe, CheckCircle } from "lucide-react";
import {
  getUserDomains,
  addDomain,
  deleteDomain,
  verifyDomain,
} from "@/api/domains";

type Domain = {
  _id: string;
  domain: string;
  createdAt: string;
  verified: boolean;
};

export function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [addDomainOpen, setAddDomainOpen] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState<string | null>(null);
  const [deleteDomainDialogOpen, setDeleteDomainDialogOpen] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await getUserDomains();
        setDomains(response.domains);
      } catch (error) {
        let message = "Failed to fetch domains";
        if (error instanceof Error) message = error.message;
        toast({
          variant: "error",
          title: "Error",
          description: message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, [toast]);

  const handleAddDomain = async () => {
    // Basic domain format validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
    if (!domainRegex.test(newDomain)) {
      toast({
        variant: "error",
        title: "Error",
        description: "Please enter a valid domain name (e.g., example.com)",
      });
      return;
    }

    try {
      const response = await addDomain({ domain: newDomain });
      setDomains([...domains, response.domain]);
      setNewDomain("");
      setAddDomainOpen(false);
      toast({
        variant: "success",
        title: "Success",
        description: response.message || "Domain added successfully",
      });
    } catch (error) {
      let message = "Failed to add domain";
      if (error instanceof Error) message = error.message;
      toast({
        variant: "error",
        title: "Error",
        description: message,
      });
    }
  };

  const openDeleteDomainDialog = (domainId: string) => {
    setDomainToDelete(domainId);
    setDeleteDomainDialogOpen(true);
  };

  const handleDeleteDomain = async () => {
    if (!domainToDelete) return;

    try {
      await deleteDomain(domainToDelete);
      setDomains(domains.filter((domain) => domain._id !== domainToDelete));
      toast({
        variant: "success",
        title: "Success",
        description: "Domain deleted successfully",
      });
    } catch (error) {
      let message = "Failed to delete domain";
      if (error instanceof Error) message = error.message;
      toast({
        variant: "error",
        title: "Error",
        description: message,
      });
    } finally {
      setDeleteDomainDialogOpen(false);
      setDomainToDelete(null);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingDomain(domainId);
    try {
      const response = await verifyDomain(domainId);
      setDomains(
        domains.map((domain) =>
          domain._id === domainId ? { ...domain, verified: true } : domain,
        ),
      );
      toast({
        variant: "success",
        title: "Success",
        description: response.message || "Domain verified successfully",
      });
    } catch (error) {
      let message = "Failed to verify domain";
      if (error instanceof Error) message = error.message;
      toast({
        variant: "error",
        title: "Error",
        description: message,
      });
    } finally {
      setVerifyingDomain(null);
    }
  };

  const openInNewTab = (domain: string) => {
    window.open(`https://${domain}`, "_blank", "noopener,noreferrer");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          <h1 className="text-heading-3 font-normal">Domains</h1>
          <p className="text-body-sm text-foreground/60">
            Manage your connected domains
          </p>
        </div>
        <Dialog open={addDomainOpen} onOpenChange={setAddDomainOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-5 mr-2" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent className="flex flex-col gap-10">
            <DialogHeader>
              <DialogTitle>Add a Domain</DialogTitle>
              <DialogDescription>
                Enter the domain you want to connect to your account.
              </DialogDescription>
            </DialogHeader>
            <div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDomainOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDomain}>Add Domain</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {domains.length === 0 ? (
        <Card className="border-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No domains added yet</h3>
            <p className="text-muted-foreground text-center mt-2 mb-4">
              Add your first domain to connect with Pythagora services.
            </p>
            <Button onClick={() => setAddDomainOpen(true)}>
              <Plus className="size-5 mr-2" />
              Add Your First Domain
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg overflow-hidden">
          {/* Desktop Table Layout - Hidden on mobile */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              {/* Header Row */}
              <div className="flex items-center py-3 border-border text-body-sm font-medium text-foreground/60 min-w-[600px]">
                <div className="min-w-[200px] w-[40%]">Domain name</div>
                <div className="min-w-[120px] w-[20%]">Date</div>
                <div className="min-w-[120px] w-[20%]">Status</div>
                <div className="min-w-[160px] w-[20%] text-right">Actions</div>
              </div>

              {/* Domain Rows */}
              <div className="flex flex-col">
                {domains.map((domain) => (
                  <div
                    key={domain._id}
                    className="flex items-center py-3 text-body-sm text-foreground border-b min-w-[600px]"
                    tabIndex={0}
                    aria-label={`Domain ${domain.domain}, added on ${formatDate(domain.createdAt)}, status: ${domain.verified ? "Verified" : "Pending Verification"}`}
                  >
                    <div className="min-w-[200px] w-[40%] flex items-center gap-2">
                      <Globe className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium tracking-wider truncate">
                        {domain.domain}
                      </span>
                    </div>
                    <div className="min-w-[120px] w-[20%] font-medium">
                      {formatDate(domain.createdAt)}
                    </div>
                    <div className="min-w-[120px] w-[20%]">
                      {domain.verified ? (
                        <div className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-success text-warning-foreground text-xs font-medium tracking-wide">
                          Verified
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-warning text-warning-foreground text-xs font-medium tracking-wide">
                          Pending Verification
                        </div>
                      )}
                    </div>
                    <div className="min-w-[160px] w-[20%] flex justify-end gap-2">
                      {!domain.verified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyDomain(domain._id)}
                          disabled={verifyingDomain === domain._id}
                          className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900/20"
                        >
                          {verifyingDomain === domain._id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Verify
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openInNewTab(domain.domain)}
                        title="Open domain"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDomainDialog(domain._id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                        title="Delete domain"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Card Layout - Visible on mobile only */}
          <div className="block md:hidden space-y-3">
            {domains.map((domain) => (
              <Card key={domain._id} className="p-4">
                <div className="space-y-3">
                  {/* Domain Info */}
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium tracking-wider text-sm break-all">
                      {domain.domain}
                    </span>
                  </div>

                  {/* Status and Date */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs text-foreground/60">Added on</div>
                      <div className="text-sm font-medium">
                        {formatDate(domain.createdAt)}
                      </div>
                    </div>
                    <div>
                      {domain.verified ? (
                        <div className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-success text-warning-foreground text-xs font-medium tracking-wide">
                          Verified
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-warning text-warning-foreground text-xs font-medium tracking-wide">
                          Pending Verification
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    {!domain.verified && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyDomain(domain._id)}
                        disabled={verifyingDomain === domain._id}
                        className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900/20 flex-1"
                      >
                        {verifyingDomain === domain._id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Verify
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openInNewTab(domain.domain)}
                      title="Open domain"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDomainDialog(domain._id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                      title="Delete domain"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Delete Domain Alert Dialog */}
      <AlertDialog
        open={deleteDomainDialogOpen}
        onOpenChange={setDeleteDomainDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Domain</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this domain? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDomainDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDeleteDomain}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
