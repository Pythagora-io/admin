import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import {
  Trash,
  ExternalLink,
  PlusCircle,
  Globe,
} from "lucide-react";
import {
  getUserDomains,
  addDomain,
  deleteDomain,
  verifyDomain,
} from "@/api/domains";

export function DomainsPage() {
  const [domains, setDomains] = useState<any[]>([]);
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
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch domains",
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
        variant: "destructive",
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
        title: "Success",
        description: response.message || "Domain added successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add domain",
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
        title: "Success",
        description: "Domain deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete domain",
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
      // Update the domain in the local state
      setDomains(
        domains.map((domain) =>
          domain._id === domainId ? { ...domain, verified: true } : domain,
        ),
      );
      toast({
        title: "Success",
        description: response.message || "Domain verified successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to verify domain",
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
          <h1 className="text-3xl font-bold">Domains</h1>
          <p className="text-muted-foreground">Manage your connected domains</p>
        </div>
        <Dialog open={addDomainOpen} onOpenChange={setAddDomainOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add a Domain</DialogTitle>
              <DialogDescription>
                Enter the domain you want to connect to your account.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-end gap-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="domain">Domain Name</Label>
                  <Input
                    id="domain"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="example.com"
                  />
                </div>
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No domains added yet</h3>
            <p className="text-muted-foreground text-center mt-2 mb-4">
              Add your first domain to connect with Pythagora services.
            </p>
            <Button onClick={() => setAddDomainOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Domain
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {domains.map((domain) => (
            <div
              key={domain._id}
              className="grid grid-cols-12 items-center px-6 py-4 border-b border-border last:border-b-0"
            >
              <div className="col-span-5 flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-base">{domain.domain}</span>
              </div>
              <div className="col-span-3 text-sm text-muted-foreground">
                {formatDate(domain.createdAt)}
              </div>
              <div className="col-span-4 flex items-center justify-end">
                {domain.verified ? (
                  <Button
                    className="bg-[#07998A] hover:bg-[#07998A] text-white cursor-default"
                    disabled
                  >
                    Verified
                  </Button>
                ) : domain.pendingVerification ? (
                  <Button
                    className="bg-[#FFD11A] hover:bg-[#FFD11A] text-black cursor-default"
                    disabled
                  >
                    Pending Verification
                  </Button>
                ) : (
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => handleVerifyDomain(domain._id)}
                    disabled={verifyingDomain === domain._id}
                  >
                    {verifyingDomain === domain._id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    ) : null}
                    Verify
                  </Button>
                )}
                <button
                  className="ml-2 p-2 rounded hover:bg-muted/10"
                  onClick={() => openInNewTab(domain.domain)}
                  title="Open domain"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button
                  className="ml-2 p-2 rounded hover:bg-red-900/10 text-red-500"
                  onClick={() => openDeleteDomainDialog(domain._id)}
                  title="Delete domain"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
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
