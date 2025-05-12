import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Zap,
  X,
  AlertTriangle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
            (p) =>
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

  const handleInitiatePlanChange = async (plan) => {
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
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to update subscription",
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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update subscription",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentMethodSuccess = async (paymentMethod) => {
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

  const handleInitiateTopUp = (packageId) => {
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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to purchase token top-up",
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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to cancel subscription",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and token usage
        </p>
      </div>

      {isOutOfTokens && (
        <Alert
          variant="destructive"
          className="bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300"
        >
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-semibold">
            You've run out of tokens!
          </AlertTitle>
          <AlertDescription>
            To continue building your apps, please top up your tokens or upgrade
            your plan.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Current Plan{" "}
            <Badge className="ml-2 bg-yellow-500 hover:bg-yellow-600">
              {subscription?.plan || "Free"} Plan
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Price</h3>
              <p className="text-muted-foreground">
                {subscription?.amount > 0
                  ? `${formatCurrency(subscription.amount, subscription.currency)} / month`
                  : "Free"}
              </p>
            </div>
            <div className="flex gap-2">
              {hasPaidSubscription && !isSubscriptionCanceled && (
                <Button
                  variant="outline"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  Cancel Subscription
                </Button>
              )}
              {isSubscriptionCanceled && (
                <Badge variant="outline" className="py-1 px-2">
                  Cancels on{" "}
                  {new Date(subscription.nextBillingDate).toLocaleDateString()}
                </Badge>
              )}
              <Button onClick={() => setChangePlanOpen(true)}>
                Change Plan
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between items-center">
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
            <Progress
              value={subscription?.tokens > 0 ? 50 : 0}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground text-right">
              {subscription?.tokens || 0} / 600,000 tokens
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanOpen} onOpenChange={setChangePlanOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-4">
          <div className="relative mb-8">
            <h2 className="text-2xl font-bold mb-0">Change Plan</h2>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setChangePlanOpen(false)}
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex flex-row flex-wrap gap-4 pb-2 justify-center">
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Top Up Tokens</DialogTitle>
            <DialogDescription>
              Select a token package to add to your account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topUpPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-lg border p-4 cursor-pointer transition-colors hover:border-primary ${
                    selectedTopUp === pkg.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
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
            <Button variant="outline" onClick={() => setTopUpOpen(false)}>
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
        <DialogContent className="sm:max-w-md">
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
