import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import { Download, Receipt, FileText } from "lucide-react";
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
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch payment data",
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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update billing information",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormBillingInfo((prev) => ({
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
        <h1 className="text-3xl font-bold">Payments & Billing</h1>
        <p className="text-muted-foreground">
          Manage your billing information and view payment history
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Your Billing Information</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditBillingOpen(true)}
              >
                Edit
              </Button>
            </CardTitle>
            <CardDescription>
              Used for all receipts and invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">{billingInfo.name}</p>
              <p>{billingInfo.address}</p>
              <p>
                {billingInfo.city}, {billingInfo.state} {billingInfo.zip}
              </p>
              <p>{billingInfo.country}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pythagora Billing Information</CardTitle>
            <CardDescription>For your records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">{companyInfo.name}</p>
              <p>{companyInfo.address}</p>
              <p>
                {companyInfo.city}, {companyInfo.state} {companyInfo.zip}
              </p>
              <p>{companyInfo.country}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View and download receipts for your payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No payment history yet</h3>
              <p className="text-muted-foreground">
                Your payment history will appear here once you make your first
                payment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell>
                        {formatCurrency(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReceipt(payment.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Billing Information Dialog */}
      <Dialog open={editBillingOpen} onOpenChange={setEditBillingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Billing Information</DialogTitle>
            <DialogDescription>
              Update your billing details for receipts and invoices.
            </DialogDescription>
          </DialogHeader>
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
            <Button variant="outline" onClick={() => setEditBillingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBillingInfo}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
