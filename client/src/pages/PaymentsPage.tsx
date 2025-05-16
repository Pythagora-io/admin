import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import { Download, X } from "lucide-react";
import {
  getPaymentHistory,
  getBillingInfo,
  getCompanyBillingInfo,
} from "@/api/payments";
import { updateBillingInfo } from "@/api/user";

export function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [billingInfo, setBillingInfo] = useState<any>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [companyInfo, setCompanyInfo] = useState<any>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    taxId: "",
  });
  const [loading, setLoading] = useState(true);
  const [editBillingOpen, setEditBillingOpen] = useState(false);
  const [formBillingInfo, setFormBillingInfo] = useState<any>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentsData, billingData, companyData] = await Promise.all([
          getPaymentHistory(),
          getBillingInfo(),
          getCompanyBillingInfo(),
        ]);

        console.log("Payments data:", paymentsData);
        console.log("Billing data:", billingData);
        console.log("Company data:", companyData);

        setPayments(paymentsData.payments || []);

        // Guard against null billing info
        if (billingData && billingData.billingInfo) {
          setBillingInfo(billingData.billingInfo);
          setFormBillingInfo(billingData.billingInfo);
        }

        // Guard against null company info
        if (companyData && companyData.companyInfo) {
          setCompanyInfo(companyData.companyInfo);
        }
      } catch (error: unknown) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleDownloadReceipt = (paymentId: string) => {
    // In a real implementation, this would call an API endpoint to generate and download the receipt
    toast({
      title: "Download Started",
      description: "Your receipt is being generated and will download shortly.",
    });
  };

  const handleUpdateBillingInfo = async () => {
    // Validate required fields
    const requiredFields = [
      "name",
      "address",
      "city",
      "state",
      "zip",
      "country",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formBillingInfo[field],
    );

    if (missingFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    try {
      const response = await updateBillingInfo({
        billingInfo: formBillingInfo,
      });
      setBillingInfo(response.billingInfo);
      toast({
        title: "Success",
        description:
          response.message || "Billing information updated successfully",
      });
      setEditBillingOpen(false);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormBillingInfo((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-medium leading-[1.25] tracking-[-0.48px] text-[#F7F8F8] font-geist mb-2">Payments & Billing</h1>
        <p className="text-[14px] font-normal leading-[1.3] tracking-[-0.28px] text-[#F7F8F8] font-geist opacity-60">
          Manage your billing information and view payment history
        </p>
      </div>

      {/* Billing Information Section */}
      <div className="border-b border-border pb-8 mb-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-[16px] font-normal leading-[1.4] text-[#F7F8F8] font-geist mb-2">Your Billing Information</h2>
          <p className="text-[14px] font-normal leading-[1.3] tracking-[-0.28px] text-[#F7F8F8] font-geist opacity-60 mb-4">User for all receipts and invoices</p>
          <div className="space-y-2 mb-4">
            <p className="text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px]">{billingInfo.name}</p>
            <p className="text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px]">{billingInfo.address}</p>
            <p className="text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px]">
              {billingInfo.city}, {billingInfo.state} {billingInfo.zip}
            </p>
            <p className="text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px]">{billingInfo.country}</p>
          </div>
          <Button variant="default" onClick={() => setEditBillingOpen(true)}>
            Edit
          </Button>
        </div>
        <div>
          <h2 className="text-[16px] font-normal leading-[1.4] text-[#F7F8F8] font-geist mb-2">Pythagora Billing Information</h2>
          <p className="text-[14px] font-normal leading-[1.3] tracking-[-0.28px] text-[#F7F8F8] font-geist opacity-60 mb-4">For your records</p>
          <div className="space-y-2">
            <p className="text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px]">{companyInfo.name}</p>
            <p className="text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px]">{companyInfo.address}</p>
            <p className="text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px]">
              {companyInfo.city}, {companyInfo.state} {companyInfo.zip}
            </p>
            <p className="text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px]">{companyInfo.country}</p>
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div className="border-b border-border pb-8 mb-4">
        <h2 className="text-[16px] font-normal leading-[1.4] text-[#F7F8F8] font-geist mb-2">Payment History</h2>
        <p className="text-[14px] font-normal leading-[1.3] tracking-[-0.28px] text-[#F7F8F8] font-geist opacity-60 mb-8">View and download receipts for your payments</p>
        {payments.length === 0 ? (
          <p className="text-muted-foreground">No invoices available.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px] opacity-60">Date</TableHead>
                  <TableHead className="text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px] opacity-60">Description</TableHead>
                  <TableHead className="text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px] opacity-60">Amount</TableHead>
                  <TableHead className="text-right text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px] opacity-60"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px]">{formatDate(payment.date)}</TableCell>
                    <TableCell className="text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px]">{payment.description}</TableCell>
                    <TableCell className="text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px]">{formatCurrency(payment.amount, payment.currency)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadReceipt(payment.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        <span className="text-[14px] font-medium text-[#F7F8F8] font-geist tracking-[-0.28px]">Download PDF</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Edit Billing Dialog */}
      <Dialog open={editBillingOpen} onOpenChange={setEditBillingOpen}>
        <DialogContent className="sm:max-w-md bg-[#222029]">
          <div className="flex items-center justify-between mb-8 w-full">
            <DialogTitle className="flex items-center">Edit Billing Information</DialogTitle>
            <button
              className="p-2 text-muted-foreground hover:text-foreground flex items-center"
              onClick={() => setEditBillingOpen(false)}
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <DialogDescription className="text-[#F7F8F8] font-geist text-[14px] font-normal leading-[1.4] opacity-60">
            Update your billing details for receipts and invoices.
          </DialogDescription>
          <div className="py-4 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name or Business Name</Label>
              <Input
                id="name"
                name="name"
                value={formBillingInfo.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formBillingInfo.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formBillingInfo.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  name="state"
                  value={formBillingInfo.state}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="zip">ZIP / Postal Code</Label>
                <Input
                  id="zip"
                  name="zip"
                  value={formBillingInfo.zip}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formBillingInfo.country}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="cancel"
              onClick={() => setEditBillingOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateBillingInfo}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
