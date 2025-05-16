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
import EmptyStateCard from "@/components/ui/EmptyStateCard";

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
          description: error instanceof Error ? error.message : String(error) || "Failed to fetch domains",
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
        description: error instanceof Error ? error.message : String(error) || "Failed to add domain",
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
        description: error instanceof Error ? error.message : String(error) || "Failed to delete domain",
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
        description: error instanceof Error ? error.message : String(error) || "Failed to verify domain",
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
          <h1 className="text-[#F7F8F8] font-geist text-[24px] font-normal font-[500] leading-[125%] tracking-[-0.48px] mb-2">Domains</h1>
          <p className="text-[#F7F8F8] font-geist text-[14px] font-normal font-[400] leading-[130%] tracking-[-0.28px] opacity-60">Manage your connected domains</p>
        </div>
        <Dialog open={addDomainOpen} onOpenChange={setAddDomainOpen}>
          <DialogTrigger asChild>
            <Button className="font-geist">
              <span className="mr-2 flex items-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.33203 9.99935C3.33203 9.53911 3.70513 9.16602 4.16536 9.16602H15.832C16.2923 9.16602 16.6654 9.53911 16.6654 9.99935C16.6654 10.4596 16.2923 10.8327 15.832 10.8327H4.16536C3.70513 10.8327 3.33203 10.4596 3.33203 9.99935Z" fill="#F7F8F8"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.0013 3.33398C10.4615 3.33398 10.8346 3.70708 10.8346 4.16732V15.834C10.8346 16.2942 10.4615 16.6673 10.0013 16.6673C9.54106 16.6673 9.16797 16.2942 9.16797 15.834V4.16732C9.16797 3.70708 9.54106 3.33398 10.0013 3.33398Z" fill="#F7F8F8"/>
                </svg>
              </span>
              Add domain
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-[#222029]">
            <DialogHeader>
              <DialogTitle className="font-geist">Add a Domain</DialogTitle>
              <DialogDescription className="font-geist">
                Enter the domain you want to connect to your account.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-end gap-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="domain" className="font-geist">Domain Name</Label>
                  <Input
                    id="domain"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="Enter domain name"
                    className="placeholder:text-[#F7F8F8] placeholder:opacity-60 placeholder:font-normal placeholder:text-[14px] placeholder:leading-[1.4] font-geist text-[14px] font-normal leading-[1.4] text-[#F7F8F8]"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="cancel"
                onClick={() => setAddDomainOpen(false)}
                className="font-geist"
              >
                Cancel
              </Button>
              <Button onClick={handleAddDomain} className="font-geist">
                Add domain
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {domains.length === 0 ? (
        <EmptyStateCard
          title=""
          description="Add your first domain to connect with Pythagora services."
          buttonText="Add domain"
          onButtonClick={() => setAddDomainOpen(true)}
          icon={<Globe className="w-5 h-5 text-muted-foreground" style={{ width: 20, height: 20 }} />}
          buttonIcon={<span className="flex items-center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M3.33203 9.99935C3.33203 9.53911 3.70513 9.16602 4.16536 9.16602H15.832C16.2923 9.16602 16.6654 9.53911 16.6654 9.99935C16.6654 10.4596 16.2923 10.8327 15.832 10.8327H4.16536C3.70513 10.8327 3.33203 10.4596 3.33203 9.99935Z" fill="#F7F8F8"/><path fillRule="evenodd" clipRule="evenodd" d="M10.0013 3.33398C10.4615 3.33398 10.8346 3.70708 10.8346 4.16732V15.834C10.8346 16.2942 10.4615 16.6673 10.0013 16.6673C9.54106 16.6673 9.16797 16.2942 9.16797 15.834V4.16732C9.16797 3.70708 9.54106 3.33398 10.0013 3.33398Z" fill="#F7F8F8"/></svg></span>}
          className="flex flex-col items-center gap-4"
        />
      ) : (
        <div className="grid gap-4">
          <div className="grid grid-cols-12 items-center px-6 py-4 border-b border-border">
            <div className="col-span-5">
              <span className="text-[#F7F8F8] font-geist text-[14px] font-normal font-[500] leading-normal tracking-[-0.28px] opacity-60">Domain name</span>
            </div>
            <div className="col-span-3">
              <span className="text-[#F7F8F8] font-geist text-[14px] font-normal font-[500] leading-normal tracking-[-0.28px] opacity-60">Date</span>
            </div>
            <div className="col-span-2">
              <span className="text-[#F7F8F8] font-geist text-[14px] font-normal font-[500] leading-normal tracking-[-0.28px] opacity-60">Status</span>
            </div>
            <div className="col-span-2"></div>
          </div>
          {domains.map((domain) => (
            <div
              key={domain._id}
              className="grid grid-cols-12 items-center px-6 py-4 border-b border-border last:border-b-0"
            >
              <div className="col-span-5 flex items-center gap-3">
                <Globe className="h-5 w-5" style={{ color: '#F7F8F8' }} />
                <span className="text-[#F7F8F8] font-geist text-[14px] font-normal font-[500] leading-normal tracking-[-0.28px]">{domain.domain}</span>
              </div>
              <div className="col-span-3">
                <span className="text-[#F7F8F8] font-geist text-[14px] font-normal font-[500] leading-normal tracking-[-0.28px]">
                  {formatDate(domain.createdAt)}
                </span>
              </div>
              <div className="col-span-2">
                {domain.verified ? (
                  <span
                    className="inline-block px-3 py-1 rounded-lg font-geist"
                    style={{
                      background: '#07998A',
                      color: '#060218',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 500,
                      fontStyle: 'normal',
                      lineHeight: 'normal',
                    }}
                  >
                    Verified
                  </span>
                ) : domain.pendingVerification ? (
                  <span
                    className="inline-block px-3 py-1 rounded-lg font-geist"
                    style={{
                      background: '#FFD11A',
                      color: '#060218',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 500,
                      fontStyle: 'normal',
                      lineHeight: 'normal',
                    }}
                  >
                    Pending
                  </span>
                ) : (
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white font-geist"
                    onClick={() => handleVerifyDomain(domain._id)}
                    disabled={verifyingDomain === domain._id}
                  >
                    {verifyingDomain === domain._id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    ) : null}
                    Verify
                  </Button>
                )}
              </div>
              <div className="col-span-2 flex items-center justify-end">
                <button
                  className="ml-2 p-2 rounded hover:bg-muted/10"
                  onClick={() => openInNewTab(domain.domain)}
                  title="Open domain"
                >
                  <ExternalLink className="h-4 w-4" style={{ width: '16px', height: '16px' }} />
                </button>
                <button
                  className="ml-2 p-2 rounded hover:bg-muted/10"
                  onClick={() => openDeleteDomainDialog(domain._id)}
                  title="Delete domain"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                    <path fillRule="evenodd" clipRule="evenodd" d="M1.66602 4.99935C1.66602 4.53911 2.03911 4.16602 2.49935 4.16602H17.4993C17.9596 4.16602 18.3327 4.53911 18.3327 4.99935C18.3327 5.45959 17.9596 5.83268 17.4993 5.83268H2.49935C2.03911 5.83268 1.66602 5.45959 1.66602 4.99935Z" fill="#F7F8F8"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.16732 4.16602C4.62756 4.16602 5.00065 4.53911 5.00065 4.99935V16.666C5.00065 16.8117 5.08186 17.027 5.27741 17.2226C5.47295 17.4181 5.68834 17.4993 5.83398 17.4993H14.1673C14.313 17.4993 14.5283 17.4181 14.7239 17.2226C14.9194 17.027 15.0007 16.8117 15.0007 16.666V4.99935C15.0007 4.53911 15.3737 4.16602 15.834 4.16602C16.2942 4.16602 16.6673 4.53911 16.6673 4.99935V16.666C16.6673 17.3537 16.3319 17.9716 15.9024 18.4011C15.473 18.8306 14.855 19.166 14.1673 19.166H5.83398C5.14629 19.166 4.52835 18.8306 4.0989 18.4011C3.66944 17.9716 3.33398 17.3537 3.33398 16.666V4.99935C3.33398 4.53911 3.70708 4.16602 4.16732 4.16602Z" fill="#F7F8F8"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M7.77741 2.77741C7.58186 2.97295 7.50065 3.18834 7.50065 3.33398V5.00065C7.50065 5.46089 7.12756 5.83398 6.66732 5.83398C6.20708 5.83398 5.83398 5.46089 5.83398 5.00065V3.33398C5.83398 2.64629 6.16944 2.02835 6.5989 1.5989C7.02835 1.16944 7.64629 0.833984 8.33398 0.833984H11.6673C12.355 0.833984 12.973 1.16944 13.4024 1.5989C13.8319 2.02835 14.1673 2.64629 14.1673 3.33398V5.00065C14.1673 5.46089 13.7942 5.83398 13.334 5.83398C12.8737 5.83398 12.5007 5.46089 12.5007 5.00065V3.33398C12.5007 3.18834 12.4194 2.97295 12.2239 2.77741C12.0283 2.58186 11.813 2.50065 11.6673 2.50065H8.33398C8.18834 2.50065 7.97295 2.58186 7.77741 2.77741Z" fill="#F7F8F8"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.33333 8.33398C8.79357 8.33398 9.16667 8.70708 9.16667 9.16732V14.1673C9.16667 14.6276 8.79357 15.0007 8.33333 15.0007C7.8731 15.0007 7.5 14.6276 7.5 14.1673V9.16732C7.5 8.70708 7.8731 8.33398 8.33333 8.33398Z" fill="#F7F8F8"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M11.6673 8.33398C12.1276 8.33398 12.5007 8.70708 12.5007 9.16732V14.1673C12.5007 14.6276 12.1276 15.0007 11.6673 15.0007C11.2071 15.0007 10.834 14.6276 10.834 14.1673V9.16732C10.834 8.70708 11.2071 8.33398 11.6673 8.33398Z" fill="#F7F8F8"/>
                  </svg>
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
        <AlertDialogContent className="bg-[#222029]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-geist">Delete Domain</AlertDialogTitle>
            <AlertDialogDescription className="font-geist">
              Are you sure you want to delete this domain? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDomainDialogOpen(false)} className="font-geist">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white font-geist"
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
