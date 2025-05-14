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
  Zap,
  X,
  AlertTriangle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  getUserSubscription,
  getSubscriptionPlans,
  updateSubscription,
  getTopUpPackages,
  purchaseTopUp,
  cancelSubscription,
} from "@/api/subscription";
import {
  getStripeConfig,
  createPaymentIntent,
  createTopUpPaymentIntent,
  getPaymentMethods,
} from "@/api/stripe";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Elements, PaymentElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentMethodForm } from "@/components/stripe/PaymentMethodForm";
import { PlanCard } from "@/components/ui/plan-card";
import CircleAlertIcon from "@/assets/svg/warnings/circle-alert.svg";

// Stripe promise
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

export function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [topUpPackages, setTopUpPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [confirmTopUpOpen, setConfirmTopUpOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedTopUp, setSelectedTopUp] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState<string | null>(null);

  // Add state for cancellation
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Add state for confirmation dialog
  const [confirmPlanChangeOpen, setConfirmPlanChangeOpen] = useState(false);
  const [planToChange, setPlanToChange] = useState<any>(null);

  const { toast } = useToast();

  // Load Stripe configuration
  useEffect(() => {
    const loadStripeConfig = async () => {
      try {
        const config = await getStripeConfig();
        setStripePublicKey(config.publicKey);
      } catch (error) {
        console.error("Failed to load Stripe configuration:", error);
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description:
            "Failed to load payment configuration. Please try again later.",
        });
      }
    };

    loadStripeConfig();
  }, [toast]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        console.log("Fetching subscription data...");
        const [subscriptionData, plansData, packagesData, paymentMethodsData] =
          await Promise.all([
            getUserSubscription(),
            getSubscriptionPlans(),
            getTopUpPackages(),
            getPaymentMethods(),
          ]);
        console.log("Subscription data received:", subscriptionData);
        console.log("Plans data received:", plansData);

        setSubscription(subscriptionData.subscription);
        setPlans(plansData.plans);
        setTopUpPackages(packagesData.packages);
        setPaymentMethods(paymentMethodsData.paymentMethods || []);
        setHasPaymentMethod(paymentMethodsData.paymentMethods?.length > 0);

        // Set the current plan as selected by default
        if (subscriptionData.subscription?.plan) {
          const currentPlanId = plansData.plans.find(
            (p: any) =>
              p.name.toLowerCase() ===
              subscriptionData.subscription.plan.toLowerCase(),
          )?.id;
          if (currentPlanId) {
            setSelectedPlan(currentPlanId);
          }
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Failed to load subscription data. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleInitiatePlanChange = async (plan: any) => {
    setPlanToChange(plan);

    // If the plan is free, we don't need payment processing
    if (plan.price === 0) {
      setConfirmPlanChangeOpen(true);
      return;
    }

    // Check if user has a payment method
    if (!hasPaymentMethod) {
      setShowPaymentForm(true);
      setConfirmPlanChangeOpen(true);
      return;
    }

    // If user has a payment method, just show confirmation
    setConfirmPlanChangeOpen(true);
  };

  const handlePlanChange = async () => {
    if (!planToChange) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No plan selected to change to",
      });
      return;
    }

    // For free plans, no payment processing needed
    if (planToChange.price === 0) {
      try {
        setProcessingPayment(true);
        const response = await updateSubscription({ planId: planToChange.id });
        setSubscription(response.subscription);
        toast({
          title: "Success",
          description: response.message || "Subscription updated successfully",
        });
        setConfirmPlanChangeOpen(false);
        setChangePlanOpen(false);
      } catch (error: unknown) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update subscription",
        });
      } finally {
        setProcessingPayment(false);
      }
      return;
    }

    // For paid plans, initiate payment if user doesn't have a payment method
    if (!hasPaymentMethod && showPaymentForm) {
      toast({
        variant: "destructive",
        title: "Payment Required",
        description: "Please add a payment method to continue",
      });
      return;
    }

    // Process the paid plan change
    try {
      setProcessingPayment(true);

      // For a real implementation, we would create a payment intent first
      const paymentIntentResponse = await createPaymentIntent({
        planId: planToChange.id,
      });
      setClientSecret(paymentIntentResponse.clientSecret);

      // Then proceed with subscription update
      const response = await updateSubscription({ planId: planToChange.id });
      setSubscription(response.subscription);

      toast({
        title: "Success",
        description: response.message || "Subscription updated successfully",
      });

      setConfirmPlanChangeOpen(false);
      setChangePlanOpen(false);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subscription",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentMethodSuccess = async (paymentMethod: any) => {
    setHasPaymentMethod(true);
    setShowPaymentForm(false);

    toast({
      title: "Payment Method Added",
      description: "Your payment method has been saved",
    });

    // Refresh payment methods
    try {
      const paymentMethodsData = await getPaymentMethods();
      setPaymentMethods(paymentMethodsData.paymentMethods || []);
    } catch (error) {
      console.error("Error refreshing payment methods:", error);
    }
  };

  const handleInitiateTopUp = (packageId: any) => {
    setSelectedTopUp(packageId);

    // Check if user has a payment method
    if (!hasPaymentMethod) {
      setShowPaymentForm(true);
    }

    setConfirmTopUpOpen(true);
  };

  const handleTopUpPurchase = async () => {
    if (!selectedTopUp) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a token package to continue",
      });
      return;
    }

    // If payment form is shown but no payment method added yet
    if (!hasPaymentMethod && showPaymentForm) {
      toast({
        variant: "destructive",
        title: "Payment Required",
        description: "Please add a payment method to continue",
      });
      return;
    }

    try {
      setProcessingPayment(true);

      // For a real implementation, we would create a payment intent first
      const paymentIntentResponse = await createTopUpPaymentIntent({
        packageId: selectedTopUp,
      });
      setClientSecret(paymentIntentResponse.clientSecret);

      // Then proceed with top-up purchase
      const response = await purchaseTopUp({ packageId: selectedTopUp });

      // Update the token count in the current subscription
      setSubscription({
        ...subscription,
        tokens: (subscription.tokens || 0) + response.tokens,
      });

      toast({
        title: "Success",
        description: response.message || "Token top-up purchased successfully",
      });

      setConfirmTopUpOpen(false);
      setTopUpOpen(false);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to purchase token top-up",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  // Add function to handle subscription cancellation
  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);

      const response = await cancelSubscription({ reason: cancelReason });

      setSubscription(response.subscription);

      toast({
        title: "Subscription Canceled",
        description:
          "Your subscription has been canceled and will end at the end of the current billing period.",
      });

      setCancelDialogOpen(false);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel subscription",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleContactForEnterprise = () => {
    window.open("https://pythagora.io/contact", "_blank");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number | null, currency: string = "USD") => {
    if (amount === null) return "Custom";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTokens = (tokens: number | null) => {
    if (tokens === null) return "Custom";
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toLocaleString()}M`;
    }
    return tokens.toLocaleString();
  };

  // Check if user is out of tokens
  const isOutOfTokens = subscription?.tokens === 0;

  // Check if user has a paid subscription
  const hasPaidSubscription =
    subscription?.amount > 0 && subscription?.status === "active";
  const isSubscriptionCanceled = subscription?.status === "canceled";

  // Calculate token usage percentage and determine progress bar color
  let tokenPercent = 0;
  let tokenBarColor = '';
  let tokenBgColor = '';
  let totalTokens = 0;
  if (subscription && plans.length > 0) {
    const plan = plans.find(
      (p: any) => p.name.toLowerCase() === subscription.plan?.toLowerCase()
    );
    totalTokens = plan?.tokens || 0;
    tokenPercent = totalTokens > 0 ? (subscription.tokens / totalTokens) * 100 : 0;
    if (subscription.tokens === 0 || tokenPercent < 10) {
      tokenBarColor = 'bg-[rgba(243,66,34,1)]';
      tokenBgColor = 'bg-[rgba(243,66,34,0.2)]';
    } else if (tokenPercent < 50) {
      tokenBarColor = 'bg-[rgba(48,87,225,1)]';
      tokenBgColor = 'bg-[rgba(48,87,225,0.2)]';
    } else {
      tokenBarColor = 'bg-[rgba(7,153,138,1)]';
      tokenBgColor = 'bg-[rgba(7,153,138,0.2)]';
    }
    // Debug logs
    console.log('DEBUG token usage:', {
      subscriptionTokens: subscription.tokens,
      totalTokens,
      tokenPercent,
      plan,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and token usage
        </p>
      </div>

      {isOutOfTokens && (
        <div className="flex items-center gap-3" style={{ background: 'rgba(243, 66, 34, 0.1)', borderRadius: 8, padding: '12px 16px' }}>
          <img src={CircleAlertIcon} alt="Warning" className="w-6 h-6" style={{ color: '#F34222' }} />
          <span className="font-medium text-sm" style={{ color: '#F34222' }}>
            You've run out of tokens! To continue building your apps, please top up your tokens or upgrade your plan.
          </span>
        </div>
      )}

      {/* Plan Summary Section */}
      <div className="pb-6 border-b border-[rgba(247,248,248,0.10)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Plan Summary <Badge className="ml-2 bg-yellow-500 hover:bg-yellow-600">{subscription?.plan || "Free"} Plan</Badge></h3>
            <p className="text-muted-foreground">
              {subscription?.amount > 0
                ? `${formatCurrency(subscription.amount, subscription.currency)} / month`
                : "Free"}
            </p>
          </div>
          <div className="flex gap-2">
            {hasPaidSubscription && !isSubscriptionCanceled && (
              <Button variant="outline" onClick={() => setCancelDialogOpen(true)}>
                Cancel Subscription
              </Button>
            )}
            {isSubscriptionCanceled && (
              <Badge variant="outline" className="py-1 px-2">
                Cancels on {new Date(subscription.nextBillingDate).toLocaleDateString()}
              </Badge>
            )}
            <Button onClick={() => setChangePlanOpen(true)}>
              Change Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Token Usage Section */}
      <div className="py-6 border-b border-[rgba(247,248,248,0.10)]">
        <div className="flex justify-between items-center mb-2">
          <div className="space-y-1">
            <h4 className="font-medium">Token Usage</h4>
            <p className="text-sm text-muted-foreground">
              {formatTokens(subscription?.tokens || 0)} tokens available
            </p>
          </div>
          <Button variant="outline" onClick={() => setTopUpOpen(true)}>
            <Zap className="mr-2 h-4 w-4" />
            Top Up
          </Button>
        </div>
        <Progress value={tokenPercent} className={`h-2 ${tokenBgColor}`} barClassName={tokenBarColor} />
        <p className="text-xs text-muted-foreground text-right">
          {subscription?.tokens || 0} / {totalTokens} tokens
        </p>
      </div>

      {/* Team Members Section */}
      <div className="py-6 border-b border-[rgba(247,248,248,0.10)]">
        <div className="flex justify-between items-center mb-2">
          <div className="space-y-1">
            <h4 className="font-medium">Team Members</h4>
            <p className="text-sm text-muted-foreground">
              {/* NOTE: Placeholder for available seats just for UI work, replace with real data */}
              7 / 15 seats available
            </p>
          </div>
          <Button variant="outline">
            Contact sales
          </Button>
        </div>
        <Progress value={47} className="h-2 bg-blue-700" />
      </div>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanOpen} onOpenChange={setChangePlanOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto px-8 py-8 bg-[#222029]">
          <div className="flex items-center justify-between mb-8 w-full">
            <h2 className="text-2xl font-bold text-left">Change Plan</h2>
            <button
              className="p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setChangePlanOpen(false)}
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex flex-row flex-wrap gap-6 w-full justify-between">
            {plans.map((plan) => {
              const isCurrentPlan =
                plan.name.toLowerCase() === subscription?.plan?.toLowerCase();
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={isCurrentPlan}
                  isSelected={selectedPlan === plan.id}
                  onCardClick={(p) => !p.isEnterprise && setSelectedPlan(p.id)}
                  onActionClick={(p) => handleInitiatePlanChange(p)}
                  onContactForEnterprise={handleContactForEnterprise}
                />
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Plan Change Confirmation Dialog */}
      <AlertDialog
        open={confirmPlanChangeOpen}
        onOpenChange={setConfirmPlanChangeOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {planToChange?.price === 0 && subscription?.amount > 0
                ? "Downgrade to Free Plan"
                : `Upgrade to ${planToChange?.name} Plan`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {planToChange?.price === 0 && subscription?.amount > 0
                ? "Are you sure you want to downgrade to the Free plan? You'll lose access to premium features and your current token allocation."
                : `Are you sure you want to upgrade to the ${planToChange?.name} plan? Your billing cycle will update immediately.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {showPaymentForm && !hasPaymentMethod && stripePublicKey && (
            <div className="py-4">
              <h3 className="font-medium mb-2">Payment Information</h3>
              <Elements stripe={loadStripe(stripePublicKey)}>
                <PaymentMethodForm
                  onSuccess={handlePaymentMethodSuccess}
                  buttonText="Save Payment Method"
                  isProcessing={processingPayment}
                />
              </Elements>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setConfirmPlanChangeOpen(false);
                setShowPaymentForm(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            {(!showPaymentForm || hasPaymentMethod) && (
              <AlertDialogAction
                onClick={handlePlanChange}
                disabled={processingPayment}
              >
                {processingPayment ? "Processing..." : "Confirm"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Top Up Dialog */}
      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="sm:max-w-md bg-[#222029]">
          <DialogHeader>
            <DialogTitle>Top up Pythagora</DialogTitle>
            <DialogDescription>
            Choose a one-time token top up or upgrade your plan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topUpPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-lg p-4 cursor-pointer transition-colors 
                    ${selectedTopUp === pkg.id
                      ? ""
                      : "border bg-transparent border-border"}
                  `}
                  style={selectedTopUp === pkg.id ? { backgroundColor: '#393744', border: 'none' } : {}}
                  onClick={() => setSelectedTopUp(pkg.id)}
                >
                  <div className="text-center">
                    <div className="text-xl font-bold">
                      {formatCurrency(pkg.price, pkg.currency)}
                    </div>
                    <div className="mt-2 text-sm font-medium">
                      {formatTokens(pkg.tokens)} tokens
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="border-none bg-transparent shadow-none hover:bg-transparent focus:bg-transparent"
              onClick={() => setTopUpOpen(false)}
            >
              Cancel
            </Button>
            <AlertDialog
              open={confirmTopUpOpen}
              onOpenChange={setConfirmTopUpOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  disabled={!selectedTopUp}
                  onClick={() =>
                    selectedTopUp && handleInitiateTopUp(selectedTopUp)
                  }
                >
                  Continue
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Token Purchase</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to purchase this token package? Your
                    payment method on file will be charged immediately.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {showPaymentForm && !hasPaymentMethod && stripePublicKey && (
                  <div className="py-4">
                    <h3 className="font-medium mb-2">Payment Information</h3>
                    <Elements stripe={loadStripe(stripePublicKey)}>
                      <PaymentMethodForm
                        onSuccess={handlePaymentMethodSuccess}
                        buttonText="Save Payment Method"
                        isProcessing={processingPayment}
                      />
                    </Elements>
                  </div>
                )}

                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setConfirmTopUpOpen(false);
                      setShowPaymentForm(false);
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  {(!showPaymentForm || hasPaymentMethod) && (
                    <AlertDialogAction
                      onClick={handleTopUpPurchase}
                      disabled={processingPayment}
                    >
                      {processingPayment ? "Processing..." : "Confirm Purchase"}
                    </AlertDialogAction>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#222029]">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Your subscription will remain active until the end of the current
              billing period.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">
                Reason for cancellation (optional)
              </Label>
              <Textarea
                id="cancelReason"
                placeholder="Please let us know why you're canceling..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
