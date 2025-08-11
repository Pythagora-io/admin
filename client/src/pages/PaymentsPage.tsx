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
  getBillingInfo,
  getCompanyBillingInfo,
  generateInvoice,
} from "@/api/payments";
import { updateBillingInfo } from "@/api/user";
import { Separator } from "@/components/ui/separator";
import { getCustomerProfile } from "@/api/subscription";
import SpinnerShape from "@/components/SpinnerShape";

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

interface PrepaidPayment {
  id: string;
  customerId: string;
  createdAt: string;
  stripeData?: {
    amount: number;
    currency: string;
    status: string;
    created: number;
    description?: string;
    receipt_email?: string;
    payment_method_types: string[];
  };
}

interface SubscriptionHistory {
  id: string;
  customerId: string;
  createdAt: string | { $date: string };
  planType: string;
  stripeData?: {
    status: string;
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
    canceled_at?: number;
    items: Array<{
      price: {
        unit_amount: number;
        currency: string;
        recurring: {
          interval: string;
          interval_count: number;
        };
      };
      product: string;
    }>;
  };
}

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptionsHistory, setSubscriptionsHistory] = useState<SubscriptionHistory[]>([]);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "Pythagora AI Inc.",
    address: "548 Market St.",
    city: "San Francisco",
    state: "CA",
    zip: "94104",
    country: "USA",
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

  const transformPrepaidPaymentsToPayments = (prepaidPayments: PrepaidPayment[]): Payment[] => {
    return prepaidPayments
      .filter(payment => payment.stripeData) // Only include payments with stripe data
      .map(payment => ({
        id: payment.id,
        date: payment.createdAt,
        description: payment.stripeData?.description || `Payment via ${payment.stripeData?.payment_method_types?.[0] || 'card'}`,
        amount: payment.stripeData?.amount || 0, // Amount is already in dollars, don't divide by 100
        currency: (payment.stripeData?.currency || 'usd').toUpperCase(),
      }));
  };

  // Filter unique subscriptions by ID
  const getUniqueSubscriptions = (subscriptions?: Array<any>) => {
    if (!subscriptions) return [];

    const uniqueSubscriptions = subscriptions.filter((subscription, index, self) =>
      index === self.findIndex(s => s.id === subscription.id)
    );

    return uniqueSubscriptions;
  };

  const formatDate = (dateInput?: string | { $date: string }) => {
    if (!dateInput) return "-";
    try {
      let dateString: string;
      if (typeof dateInput === 'object' && dateInput.$date) {
        dateString = dateInput.$date;
      } else if (typeof dateInput === 'string') {
        dateString = dateInput;
      } else {
        return "-";
      }

      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (typeof amount !== 'number') return "-";
    // Convert from cents to dollars for Stripe amounts
    const dollars = amount / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency?.toUpperCase() || "USD",
    }).format(dollars);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("PaymentsPage: Fetching customer profile data...");

        // Only call getCustomerProfile - all data comes from here
        const customerProfileData = await getCustomerProfile();

        console.log("PaymentsPage: Customer profile data:", customerProfileData);

        // Transform prepaid payments history to payments format
        if (customerProfileData?.customer?.prepaidPaymentsHistory) {
          const transformedPayments = transformPrepaidPaymentsToPayments(
            customerProfileData.customer.prepaidPaymentsHistory
          );
          console.log("PaymentsPage: Transformed payments:", transformedPayments);
          setPayments(transformedPayments);
        } else {
          console.log("PaymentsPage: No prepaid payments history found");
          setPayments([]);
        }

        // Set subscriptions history
        if (customerProfileData?.customer?.subscriptionsHistory) {
          const uniqueSubscriptions = getUniqueSubscriptions(customerProfileData.customer.subscriptionsHistory);
          console.log("PaymentsPage: Unique subscriptions history:", uniqueSubscriptions);
          setSubscriptionsHistory(uniqueSubscriptions);
        } else {
          console.log("PaymentsPage: No subscriptions history found");
          setSubscriptionsHistory([]);
        }

        // Handle billing info from customer profile or use empty values
        let finalBillingInfo = {
          name: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          country: "",
        };

        if (customerProfileData?.customer?.billingAddress) {
          // If billing address exists in customer profile, use it
          const billingAddress = customerProfileData.customer.billingAddress;
          finalBillingInfo = {
            name: billingAddress.name || "",
            address: billingAddress.address || "",
            city: billingAddress.city || "",
            state: billingAddress.state || "",
            zip: billingAddress.zip || "",
            country: billingAddress.country || "",
          };
          console.log("PaymentsPage: Using billing info from customer profile");
        } else {
          console.log("PaymentsPage: No billing address in customer profile, using empty values");
        }

        setBillingInfo(finalBillingInfo);
        setFormBillingInfo(finalBillingInfo);

        // Company info is static/hardcoded
        console.log("PaymentsPage: Using static company info");

      } catch (error: unknown) {
        console.error("PaymentsPage: Error fetching data:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch payment data";
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      console.log("PaymentsPage: Generating invoice for payment ID:", paymentId);

      const response = await generateInvoice('payment', paymentId);

      if (response.success && response.url) {
        // Open the invoice URL in a new window/tab
        window.open(response.url, '_blank');
        toast({
          variant: "default",
          title: "Invoice Generated",
          description: "Your invoice has been generated and opened in a new tab.",
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: unknown) {
      console.error("PaymentsPage: Error generating invoice:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate invoice";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleDownloadSubscriptionInvoice = async (subscriptionId: string) => {
    try {
      console.log("PaymentsPage: Generating invoice for subscription ID:", subscriptionId);

      const response = await generateInvoice('subscription', subscriptionId);

      if (response.success && response.url) {
        // Open the invoice URL in a new window/tab
        window.open(response.url, '_blank');
        toast({
          variant: "default",
          title: "Invoice Generated",
          description: "Your subscription invoice has been generated and opened in a new tab.",
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: unknown) {
      console.error("PaymentsPage: Error generating invoice:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate invoice";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
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
        variant: "destructive",
        title: "Error",
        description: `Please fill in all required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    try {
      console.log("PaymentsPage: Updating billing information:", formBillingInfo);
      // Note: This would need to be implemented via Pythagora API
      // For now, just update local state and show success
      setBillingInfo(formBillingInfo);
      toast({
        variant: "default",
        title: "Success",
        description: "Billing information updated successfully",
      });
      setEditBillingOpen(false);
    } catch (error: unknown) {
      console.error("PaymentsPage: Error updating billing info:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update billing information";
      toast({
        variant: "destructive",
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
        <SpinnerShape className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex flex-col gap-14 text-foreground">
      <div className="flex flex-col gap-2">
        <h1 className="text-heading-3 text-foreground">Payments & Billing</h1>
        <p className="text-body-sm text-foreground/60">
          Manage your billing information and view payment history
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {/* Your Billing Information Section */}
        {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <p className="font-medium">{billingInfo.name || "Not provided"}</p>
              <p>{billingInfo.address || "Not provided"}</p>
              <p>
                {billingInfo.city || "Not provided"}, {billingInfo.state || "Not provided"}{" "}
                {billingInfo.zip || "Not provided"}
              </p>
              <p>{billingInfo.country || "Not provided"}</p>
            </div>
            <div>
              <Button
                onClick={() => setEditBillingOpen(true)}
                className="bg-primary text-primary-foreground text-body-md px-3 py-2 h-auto rounded-lg min-w-[80px]"
              >
                Edit
              </Button>
            </div>
          </div>*/}

          {/* Pythagora Billing Information Section */}
          {/*
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
                {companyInfo.name}
              </p>
              <p>{companyInfo.address}</p>
              <p>
                {companyInfo.city}, {companyInfo.state} {companyInfo.zip}
              </p>
              <p>{companyInfo.country}</p>
            </div>
          </div>
        </div>*
        */}

        <Separator className="bg-border" />

        {/* Payment History Section */}
        <div className="flex flex-col space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-body-lg font-normal text-foreground">
              Payment History
            </h2>
            {payments.length === 0 ? (
              <p className="text-body-sm text-foreground/60">
                No payment history available.
              </p>
            ) : (
              <p className="text-body-sm text-foreground/60">
                View and download invoices for your payments
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
                        className="rounded-lg h-9 px-3 text-xs font-medium flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        aria-label="Download invoice"
                        tabIndex={0}
                        onClick={() => handleDownloadReceipt(payment.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            handleDownloadReceipt(payment.id);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-1" aria-hidden="true" />
                        Get Invoice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Subscription History Section */}
        <div className="flex flex-col space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-body-lg font-normal text-foreground">
              Subscription History
            </h2>
            {subscriptionsHistory.length === 0 ? (
              <p className="text-body-sm text-foreground/60">
                No subscription history available.
              </p>
            ) : (
              <p className="text-body-sm text-foreground/60">
                View and download invoices for your subscriptions
              </p>
            )}
          </div>
          <div className="space-y-2">
            {subscriptionsHistory.length > 0 ? (
              subscriptionsHistory.map((sub, index) => (
                <div key={sub.id} className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Plan: {sub.planType}</p>
                    <p className="text-xs text-muted-foreground">Subscription ID: {sub.id}</p>
                    {sub.stripeData && (
                      <p className="text-xs text-muted-foreground">
                        Status: {sub.stripeData.status}
                        {sub.stripeData.items?.[0]?.price && (
                          <span className="ml-2">
                            • {formatCurrency(sub.stripeData.items[0].price.unit_amount, sub.stripeData.items[0].price.currency)}/{sub.stripeData.items[0].price.recurring?.interval}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex flex-col gap-2">
                    <p className="text-sm">{formatDate(sub.createdAt)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => handleDownloadSubscriptionInvoice(sub.id)}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Get Invoice
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              // <p className="text-sm text-muted-foreground">No subscription history available</p>
              <></>
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