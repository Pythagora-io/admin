import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, ExternalLink, AlertCircle, Key, ShieldAlert, CreditCard, ArrowRight, Coins } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  getCustomerProfile,
} from "@/api/subscription";
import { getCurrentUser } from "@/api/user";
import { cancelSubscription } from "@/api/stripe";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PAYMENT_LINKS, TOPUP_TOKENS, PLAN_LINKS } from "@/constants/plans";
import SpinnerShape from "@/components/SpinnerShape";
import { PlanSummary } from "@/components/subscription/PlanSummary";
import { PlanUpgrade } from "@/components/subscription/PlanUpgrade";
import { TokenUsage } from "@/components/subscription/TokenUsage";
import { PremiumPlanIcon } from "@/components/icons/PlanIcons";

interface CustomerProfile {
  id?: string;
  _id?: string;
  bksApiKey?: string;
  bksKeyId?: string;
  billingAddress?: any;
  subscription?: {
    stripeId?: string;
    planType?: string;
  };
  currentSubscription?: {
    id: string;
    customerId: string;
    createdAt: string;
    planType: string;
  };
  prepaidPaymentsHistory?: Array<{
    id: string;
    customerId: string;
    createdAt: string | { $date: string };
    stripeData?: {
      amount: number;
      currency: string;
      status: string;
      created: number;
      description?: string;
      receipt_email?: string;
      payment_method_types: string[];
    };
  }>;
  subscriptionsHistory?: Array<{
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
  }>;
  isFreeTrial?: boolean;
  usageThisPeriod?: number;
  usagePreviousPeriods?: number;
  usageWarningSent?: boolean;
  isKeyRevoked?: boolean;
  tokensLeft?: number;
  customerId?: string;
  createdAt?: string | { $date: string };
  updatedAt?: string | { $date: string };
}

export function SubscriptionPage() {
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("SubscriptionPage: Fetching customer profile data...");
        const customerProfileResponse = await getCustomerProfile();
        console.log("SubscriptionPage: Customer profile response received:", customerProfileResponse);

        // Extract the customer data from the response
        const customerProfileData = customerProfileResponse.customer;
        console.log("SubscriptionPage: Extracted customer profile data:", customerProfileData);

        setCustomerProfile(customerProfileData);

        // Get current user data for email and customer ID
        console.log("SubscriptionPage: Getting current user data...");
        const userData = getCurrentUser();
        console.log("SubscriptionPage: Current user data:", userData);
        setCurrentUser(userData);
      } catch (error: unknown) {
        console.error("SubscriptionPage: Error fetching subscription data:", error);
        let errorMessage = "Failed to load subscription data. Please try again later.";
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

    fetchData();
  }, [toast]);

  const handleContactForEnterprise = () => {
    // Point to 
    window.open("https://www.pythagora.ai/contact", "_blank");
  };

  const handleShowTopUp = () => {
    setShowTopUpModal(true);
  };

  const handleTopUpPurchase = (amount: string) => {
    try {
      console.log(`SubscriptionPage: Purchasing ${amount} top-up`);
      console.log("SubscriptionPage: Current user for top-up:", currentUser);

      if (!currentUser?.email) {
        console.error("SubscriptionPage: User email not found. Current user data:", currentUser);
        toast({
          variant: "destructive",
          title: "Error",
          description: "User email not found. Please try refreshing the page.",
        });
        return;
      }

      // Use the id field from customer profile as client_reference_id
      const customerReferenceId = customerProfile?.id;
      if (!customerReferenceId) {
        console.error("SubscriptionPage: Customer ID not found. Customer profile:", customerProfile);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Customer ID not found. Please try refreshing the page.",
        });
        return;
      }

      // Generate the Stripe checkout URL with user data
      const checkoutUrl = PAYMENT_LINKS[amount as keyof typeof PAYMENT_LINKS]
        .replace('RECIPIENT_EMAIL', encodeURIComponent(currentUser.email))
        .replace('CUSTOMER_ID', encodeURIComponent(customerReferenceId));

      console.log(`SubscriptionPage: Opening Stripe checkout for ${amount} top-up:`, checkoutUrl);
      console.log(`SubscriptionPage: Using customer reference ID: ${customerReferenceId}`);
      console.log(`SubscriptionPage: Using user email: ${currentUser.email}`);

      // Close the modal
      setShowTopUpModal(false);

      // Open Stripe checkout in a new tab
      window.open(checkoutUrl, '_blank');

      toast({
        variant: "default",
        title: "Redirecting to Checkout",
        description: `Opening ${amount} top-up checkout in a new tab.`,
      });
    } catch (error: unknown) {
      console.error("SubscriptionPage: Error purchasing top-up:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to purchase top-up";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleUpgradePlan = (planType: 'Pro' | 'Premium') => {
    try {
      console.log(`SubscriptionPage: Upgrading to ${planType} plan`);
      console.log("SubscriptionPage: Current user data for upgrade:", currentUser);

      if (!currentUser?.email) {
        console.error("SubscriptionPage: User email not found for upgrade. Current user data:", currentUser);
        toast({
          variant: "destructive",
          title: "Error",
          description: "User email not found. Please try refreshing the page.",
        });
        return;
      }

      // Use the id field from customer profile as client_reference_id
      const customerReferenceId = customerProfile?.id;
      if (!customerReferenceId) {
        console.error("SubscriptionPage: Customer ID not found for upgrade. Customer profile:", customerProfile);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Customer ID not found. Please try refreshing the page.",
        });
        return;
      }

      // Generate the Stripe checkout URL with user data
      const checkoutUrl = PLAN_LINKS[planType]
        .replace('RECIPIENT_EMAIL', encodeURIComponent(currentUser.email))
        .replace('CUSTOMER_ID', encodeURIComponent(customerReferenceId));

      console.log(`SubscriptionPage: Opening Stripe checkout for ${planType}:`, checkoutUrl);
      console.log(`SubscriptionPage: Using customer reference ID: ${customerReferenceId}`);
      console.log(`SubscriptionPage: Using user email: ${currentUser.email}`);

      // Open Stripe checkout in a new tab
      window.open(checkoutUrl, '_blank');

      toast({
        variant: "default",
        title: "Redirecting to Checkout",
        description: `Opening ${planType} plan checkout in a new tab.`,
      });
    } catch (error: unknown) {
      console.error("SubscriptionPage: Error upgrading plan:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upgrade plan";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancellingSubscription(true);
      console.log("SubscriptionPage: Cancelling subscription...");

      await cancelSubscription();

      toast({
        variant: "default",
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });

      // Refresh the customer profile data
      const customerProfileResponse = await getCustomerProfile();
      const customerProfileData = customerProfileResponse.customer;
      setCustomerProfile(customerProfileData);

    } catch (error: unknown) {
      console.error("SubscriptionPage: Error cancelling subscription:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to cancel subscription";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setCancellingSubscription(false);
    }
  };

  const maskApiKey = (apiKey?: string) => {
    if (!apiKey) return "No API key";
    const prefix = apiKey.substring(0, 12);
    const suffix = apiKey.substring(apiKey.length - 8);
    return `${prefix}...${suffix}`;
  };

  const formatTokens = (tokens?: number) => {
    if (typeof tokens !== 'number') return "0";
    if (tokens >= 1000000) {
      const formatted = (tokens / 1000000).toFixed(1);
      return `${formatted.replace(/\.0$/, "")}M`;
    }
    if (tokens >= 1000) {
      const formatted = (tokens / 1000).toFixed(1);
      return `${formatted.replace(/\.0$/, "")}K`;
    }
    return tokens.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <SpinnerShape className="w-16 h-16" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">Failed to load subscription data</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const isOutOfTokens = (customerProfile?.tokensLeft || 0) === 0;
  const isKeyRevoked = customerProfile?.isKeyRevoked || false;

  return (
    <div className="w-full max-w-none overflow-hidden">
      <div className="flex flex-col gap-14">
        <div>
          <h1 className="text-heading-3 text-foreground tracking-wide">
            Subscription
          </h1>
          <p className="text-body-sm text-foreground/60">
            Manage your subscription and token usage
          </p>
        </div>

        {isOutOfTokens && (
          <Alert className="bg-token-alert-background border-none flex items-center py-3 px-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-token-alert" />
              <p className="text-[14px] font-medium leading-[1.3em] tracking-[-0.02em] text-token-alert">
                You've run out of tokens. To continue building your apps, please
                top up your tokens or upgrade your plan.
              </p>
            </div>
          </Alert>
        )}

        {isKeyRevoked && (
          <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>API Key Revoked:</strong> Your API key has been revoked. Please contact support to resolve this issue.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-10">
          {/* API Key Section */}
          {customerProfile?.bksApiKey && (
            <>
              <div className="flex flex-col space-y-3">
                <h2 className="text-body-lg font-medium">API Key</h2>
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {maskApiKey(customerProfile.bksApiKey)}
                  </code>
                  {customerProfile.bksKeyId && (
                    <Badge variant="outline" className="text-xs">
                      ID: {customerProfile.bksKeyId}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Free Trial Status */}
          <div className="flex flex-col space-y-3">
            <h2 className="text-body-lg font-medium">Free Trial Status</h2>
            <div className="flex items-center gap-2">
              <Badge variant={customerProfile?.isFreeTrial ? "default" : "outline"}>
                {customerProfile?.isFreeTrial ? "On Free Trial" : "Not on Free Trial"}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Plan Summary */}
          <PlanSummary
            customerProfile={customerProfile}
            cancellingSubscription={cancellingSubscription}
            onContactSales={handleContactForEnterprise}
            onCancelSubscription={handleCancelSubscription}
          />

          {/* Plan Upgrade Section */}
          <PlanUpgrade
            customerProfile={customerProfile}
            onUpgradePlan={handleUpgradePlan}
          />

          {/* Token Usage */}
          <TokenUsage
            customerProfile={customerProfile}
            onShowTopUp={handleShowTopUp}
          />
        </div>

        {/* Top Up Modal */}
        <Dialog open={showTopUpModal} onOpenChange={setShowTopUpModal}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Top Up Tokens
              </DialogTitle>
              <DialogDescription>
                Choose a top-up package to add tokens to your account. Each package includes a different amount of tokens for various usage needs.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
              {Object.entries(PAYMENT_LINKS).map(([amount, link]) => {
                const tokens = TOPUP_TOKENS[amount as keyof typeof TOPUP_TOKENS];
                const price = parseInt(amount.replace('$', ''));
                return (
                  <Card
                    key={amount}
                    className="relative overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer hover:shadow-md"
                    onClick={() => handleTopUpPurchase(amount)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <PremiumPlanIcon className="w-7 h-7" />
                        <div>
                          <CardTitle className="text-lg">{amount} Top-up</CardTitle>
                          <CardDescription className="text-2xl font-bold text-foreground">
                            {formatTokens(tokens)} tokens
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{formatTokens(tokens)} tokens instantly</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>$3.00 per million tokens</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTopUpPurchase(amount);
                        }}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Purchase {amount}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTopUpModal(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}