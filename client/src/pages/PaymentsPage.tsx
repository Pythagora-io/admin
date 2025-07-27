import { useState, useEffect } from "react";
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
import { Download, FileText } from "lucide-react";
import {
  getPaymentHistory,
  getBillingInfo,
  getCompanyBillingInfo,
} from "@/api/payments";
import { updateBillingInfo } from "@/api/user";
import { Separator } from "@/components/ui/separator";

// Interface Definitions
interface Payment {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
}

interface BillingInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface CompanyInfo extends BillingInfo {
  taxId?: string; // taxId is optional as per current usage
}

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
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
  const [formBillingInfo, setFormBillingInfo] = useState<BillingInfo>({
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

        setPayments((paymentsData.payments || []) as Payment[]);

        if (billingData && billingData.billingInfo) {
          setBillingInfo(billingData.billingInfo as BillingInfo);
          setFormBillingInfo(billingData.billingInfo as BillingInfo);
        }

        if (companyData && companyData.companyInfo) {
          setCompanyInfo(companyData.companyInfo as CompanyInfo);
        }
      } catch (error: unknown) {
        console.error("Error fetching data:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch payment data";
        toast({
          variant: "error",
          title: "Error",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleDownloadReceipt = (paymentId: string) => {
    console.log("Attempting to download receipt for payment ID:", paymentId);
    toast({
      variant: "success",
      title: "Download Started",
      description: "Your receipt is being generated and will download shortly.",
    });
  };

  const handleUpdateBillingInfo = async () => {
    const requiredFields: (keyof BillingInfo)[] = [
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
        variant: "error",
        title: "Error",
        description: `Please fill in all required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    try {
      const response = await updateBillingInfo({
        billingInfo: formBillingInfo,
      });
      setBillingInfo(response.billingInfo as BillingInfo);
      toast({
        variant: "success",
        title: "Success",
        description:
          response.message || "Billing information updated successfully",
      });
      setEditBillingOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update billing information";
      toast({
        variant: "error",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormBillingInfo((prev: BillingInfo) => ({
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
    <div className="mx-auto flex flex-col gap-14 text-foreground">
      <div className="flex flex-col gap-2">
        <h1 className="text-heading-3 text-foreground">Payments & Billing</h1>
        <p className="text-body-sm text-foreground/60">
          Manage your billing information and view payment history
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Your Billing Information Section */}
          <div className="flex flex-col space-y-5">
            <div className="space-y-1.5">
              <h2 className="text-body-lg font-normal text-foreground">
                Your Billing Information
              </h2>
              <p className="text-body-sm text-foreground/60">
                Used for all receipts and invoices
              </p>
            </div>
            <div className="space-y-1 text-body-md text-foreground">
              <p className="font-medium">{billingInfo.name || "N/A"}</p>
              <p>{billingInfo.address || "-"}</p>
              <p>
                {billingInfo.city || "-"}, {billingInfo.state || "-"}{" "}
                {billingInfo.zip || "-"}
              </p>
              <p>{billingInfo.country || "-"}</p>
            </div>
            <div>
              <Button
                onClick={() => setEditBillingOpen(true)}
                className="bg-primary text-primary-foreground text-body-md px-3 py-2 h-auto rounded-lg min-w-[80px]"
              >
                Edit
              </Button>
            </div>
          </div>

          {/* Pythagora Billing Information Section */}
          <div className="flex flex-col space-y-5">
            <div className="space-y-1.5">
              <h2 className="text-body-lg font-normal text-foreground">
                Pythagora Billing Information
              </h2>
              <p className="text-body-sm text-foreground/60">
                For your records
              </p>
            </div>
            <div className="space-y-1 text-body-md text-foreground">
              <p className="font-medium">
                {companyInfo.name || "Pythagora AI Inc."}
              </p>
              <p>{companyInfo.address || "548 Market St."}</p>
              <p>
                {companyInfo.city || "San Francisco"},{" "}
                {companyInfo.state || "CA"} {companyInfo.zip || "94104"}
              </p>
              <p>{companyInfo.country || "USA"}</p>
            </div>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Payment History Section */}
        <div className="flex flex-col space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-body-lg font-normal text-foreground">
              Payment History
            </h2>
            {payments.length === 0 ? (
              <p className="text-body-sm text-foreground/60">
                No invoices available.
              </p>
            ) : (
              <p className="text-body-sm text-foreground/60">
                View and download receipts for your payments
              </p>
            )}
          </div>
          <div>
            {payments.length === 0 ? (
              <div></div>
            ) : (
              <div className="rounded-lg overflow-hidden">
                {/* Header Row */}
                <div className="flex items-center py-3 border-border text-body-sm font-medium text-foreground/60">
                  <div className="min-w-[140px] w-[20%]">Date</div>
                  <div className="flex-1">Description</div>
                  <div className="min-w-[100px] w-[15%] text-right">Amount</div>
                  <div className="min-w-[130px] w-[15%] text-right"></div>
                </div>
                {/* Payment Rows */}
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center py-3 text-body-sm text-foreground border-b border-border"
                    tabIndex={0}
                    aria-label={`Payment on ${formatDate(payment.date)}: ${payment.description}, ${formatCurrency(payment.amount, payment.currency)}`}
                  >
                    <div className="min-w-[140px] w-[20%] font-medium">
                      {formatDate(payment.date)}
                    </div>
                    <div className="flex-1">{payment.description}</div>
                    <div className="min-w-[100px] w-[15%] text-right font-medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </div>
                    <div className="min-w-[130px] w-[15%] text-right flex justify-end">
                      <Button
                        variant="ghost"
                        className="rounded-lg h-9 px-3 text-xs font-medium flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        aria-label="Download PDF receipt"
                        tabIndex={0}
                        onClick={() => handleDownloadReceipt(payment.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            handleDownloadReceipt(payment.id);
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" aria-hidden="true" />
                        Download pdf
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Billing Information Dialog */}
      <Dialog open={editBillingOpen} onOpenChange={setEditBillingOpen}>
        <DialogContent className="bg-card border-none rounded-2xl p-8 w-[90%] sm:w-[500px]">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-medium text-foreground">
              Edit your billing information
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground/60 text-left pt-1">
              Update your billing details for receipts and invoices.
            </DialogDescription>
          </DialogHeader>
          <div className="py-0 grid gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Full Name or Business Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formBillingInfo.name}
                onChange={handleInputChange}
                className="bg-foreground/10 border border-border rounded-lg p-4 placeholder:text-foreground/60 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Enter full name or business name"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-sm font-medium text-foreground"
              >
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={formBillingInfo.address}
                onChange={handleInputChange}
                className="bg-foreground/10 border border-border rounded-lg p-4 placeholder:text-foreground/60 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Enter address"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label
                  htmlFor="city"
                  className="text-sm font-medium text-foreground"
                >
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formBillingInfo.city}
                  onChange={handleInputChange}
                  className="bg-foreground/10 border border-border rounded-lg p-4 placeholder:text-foreground/60 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Enter city"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label
                  htmlFor="state"
                  className="text-sm font-medium text-foreground"
                >
                  State / Province
                </Label>
                <Input
                  id="state"
                  name="state"
                  value={formBillingInfo.state}
                  onChange={handleInputChange}
                  className="bg-foreground/10 border border-border rounded-lg p-4 placeholder:text-foreground/60 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Enter state or province"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label
                  htmlFor="zip"
                  className="text-sm font-medium text-foreground"
                >
                  ZIP / Postal Code
                </Label>
                <Input
                  id="zip"
                  name="zip"
                  value={formBillingInfo.zip}
                  onChange={handleInputChange}
                  className="bg-foreground/10 border border-border rounded-lg p-4 placeholder:text-foreground/60 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Enter ZIP or postal code"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label
                  htmlFor="country"
                  className="text-sm font-medium text-foreground"
                >
                  Country
                </Label>
                <Input
                  id="country"
                  name="country"
                  value={formBillingInfo.country}
                  onChange={handleInputChange}
                  className="bg-foreground/10 border border-border rounded-lg p-4 placeholder:text-foreground/60 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6 sm:justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setEditBillingOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-foreground/10"
              aria-label="Cancel edit billing info"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateBillingInfo}
              className="bg-primary text-primary-foreground rounded-lg px-4 py-3 text-sm font-medium hover:bg-primary/90"
              aria-label="Save billing info changes"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
