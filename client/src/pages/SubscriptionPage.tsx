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
  StarterPlanIcon,
  ProPlanIcon,
  PremiumPlanIcon,
  EnterprisePlanIcon,
} from "@/components/icons/PlanIcons";
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
import { Check, ExternalLink, Zap, AlertCircle } from "lucide-react";
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
import { Alert } from "@/components/ui/alert";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentMethodForm } from "@/components/stripe/PaymentMethodForm";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number | null;
  currency: string;
  tokens: number | null;
  features: string[];
  isEnterprise?: boolean;
  description?: string;
}

interface UserSubscription {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: "active" | "canceled" | "past_due" | string;
  tokens: number;
  tokensLimit?: number;
  nextBillingDate: string;
  startDate?: string;
}

interface TopUpPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  currency: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

const DISPLAY_TOTAL_TOKENS = 60000000;

export function SubscriptionPage() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [topUpPackages, setTopUpPackages] = useState<TopUpPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [confirmTopUpOpen, setConfirmTopUpOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedTopUp, setSelectedTopUp] = useState<string | null>(null);
  // Used in handlePaymentMethodSuccess
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState<string | null>(null);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const [confirmPlanChangeOpen, setConfirmPlanChangeOpen] = useState(false);
  const [planToChange, setPlanToChange] = useState<SubscriptionPlan | null>(
    null,
  );

  const { toast } = useToast();

  useEffect(() => {
    const loadStripeConfig = async () => {
      try {
        const config = await getStripeConfig();
        setStripePublicKey(config.publicKey);
      } catch (error: unknown) {
        let errorMessage =
          "Failed to load payment configuration. Please try again later.";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        toast({
          variant: "error",
          title: "Configuration Error",
          description: errorMessage,
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

        const currentSub = subscriptionData.subscription as UserSubscription;
        const allPlans = plansData.plans as SubscriptionPlan[];

        let determinedTokensLimit = 600000;
        if (currentSub && currentSub.plan) {
          const currentPlanDetails = allPlans.find(
            (p) => p.name.toLowerCase() === currentSub.plan.toLowerCase(),
          );
          if (
            currentPlanDetails &&
            currentPlanDetails.tokens &&
            currentPlanDetails.tokens > 0
          ) {
            determinedTokensLimit = currentPlanDetails.tokens;
          }
        }
        if (currentSub) {
          currentSub.tokensLimit = determinedTokensLimit;
        }

        setSubscription(currentSub);
        setPlans(allPlans);
        setTopUpPackages(packagesData.packages as TopUpPackage[]);
        setPaymentMethods(paymentMethodsData.paymentMethods || []);
        setHasPaymentMethod(paymentMethodsData.paymentMethods?.length > 0);

        if (currentSub?.plan) {
          const currentPlanId = allPlans.find(
            (p: SubscriptionPlan) =>
              p.name.toLowerCase() === currentSub.plan.toLowerCase(),
          )?.id;
          if (currentPlanId) {
            setSelectedPlan(currentPlanId);
          }
        }
      } catch (error: unknown) {
        let errorMessage =
          "Failed to load subscription data. Please try again later.";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
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

  const handleInitiatePlanChange = async (plan: SubscriptionPlan) => {
    setPlanToChange(plan);

    if (plan.price === 0) {
      setConfirmPlanChangeOpen(true);
      return;
    }

    if (!hasPaymentMethod) {
      setShowPaymentForm(true);
      setConfirmPlanChangeOpen(true);
      return;
    }

    setConfirmPlanChangeOpen(true);
  };

  const handlePlanChange = async () => {
    if (!planToChange) {
      toast({
        variant: "error",
        title: "Error",
        description: "No plan selected to change to",
      });
      return;
    }

    if (planToChange.price === 0) {
      try {
        setProcessingPayment(true);
        const response = await updateSubscription({ planId: planToChange.id });
        setSubscription(response.subscription);
        toast({
          variant: "success",
          title: "Success",
          description: response.message || "Subscription updated successfully",
        });
        setConfirmPlanChangeOpen(false);
        setChangePlanOpen(false);
      } catch (error: unknown) {
        let errorMessage = "Failed to update subscription";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        toast({
          variant: "error",
          title: "Error",
          description: errorMessage,
        });
      } finally {
        setProcessingPayment(false);
      }
      return;
    }

    if (!hasPaymentMethod && showPaymentForm) {
      toast({
        variant: "error",
        title: "Payment Required",
        description: "Please add a payment method to continue",
      });
      return;
    }

    try {
      setProcessingPayment(true);

      await createPaymentIntent({
        planId: planToChange.id,
      });

      const response = await updateSubscription({ planId: planToChange.id });
      setSubscription(response.subscription);

      toast({
        variant: "success",
        title: "Success",
        description: response.message || "Subscription updated successfully",
      });

      setConfirmPlanChangeOpen(false);
      setChangePlanOpen(false);
    } catch (error: unknown) {
      let errorMessage = "Failed to update subscription";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast({
        variant: "error",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentMethodSuccess = async () => {
    setHasPaymentMethod(true);
    setShowPaymentForm(false);

    toast({
      variant: "success",
      title: "Payment Method Added",
      description: "Your payment method has been saved",
    });

    try {
      const paymentMethodsData = await getPaymentMethods();
      setPaymentMethods(paymentMethodsData.paymentMethods || []);
    } catch (error: unknown) {
      console.error(
        "Error refreshing payment methods:",
        error instanceof Error ? error.message : error,
      );
    }
  };

  const handleInitiateTopUp = (packageId: string) => {
    setSelectedTopUp(packageId);

    if (!hasPaymentMethod) {
      setShowPaymentForm(true);
    }

    setConfirmTopUpOpen(true);
  };

  const handleTopUpPurchase = async () => {
    if (!selectedTopUp) {
      toast({
        variant: "error",
        title: "Error",
        description: "Please select a token package to continue",
      });
      return;
    }

    if (!hasPaymentMethod && showPaymentForm) {
      toast({
        variant: "error",
        title: "Payment Required",
        description: "Please add a payment method to continue",
      });
      return;
    }

    try {
      setProcessingPayment(true);

      await createTopUpPaymentIntent({
        packageId: selectedTopUp,
      });

      const response = await purchaseTopUp({ packageId: selectedTopUp });

      if (subscription) {
        setSubscription({
          ...subscription,
          tokens: (subscription.tokens || 0) + response.tokens,
        });
      }

      toast({
        variant: "success",
        title: "Success",
        description: response.message || "Token top-up purchased successfully",
      });

      setConfirmTopUpOpen(false);
      setTopUpOpen(false);
    } catch (error: unknown) {
      let errorMessage = "Failed to purchase token top-up";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast({
        variant: "error",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);

      const response = await cancelSubscription({ reason: cancelReason });

      setSubscription(response.subscription);

      toast({
        variant: "success",
        title: "Subscription Canceled",
        description:
          "Your subscription has been canceled and will end at the end of the current billing period.",
      });

      setCancelDialogOpen(false);
    } catch (error: unknown) {
      let errorMessage = "Failed to cancel subscription";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast({
        variant: "error",
        title: "Error",
        description: errorMessage,
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
      return `${(tokens / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return tokens.toLocaleString();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const isOutOfTokens = subscription?.tokens === 0;

  const hasPaidSubscription = subscription
    ? subscription.amount > 0 && subscription.status === "active"
    : false;
  const isSubscriptionCanceled = subscription?.status === "canceled";

  const getPlanBadgeClass = (planName?: string) => {
    if (!planName) return "bg-warning text-warning-foreground";

    switch (planName.toLowerCase()) {
      case "free":
        return "bg-plan-starter text-warning-foreground";
      case "pro":
        return "bg-plan-pro text-warning-foreground";
      case "premium":
        return "bg-plan-premium text-warning-foreground";
      case "enterprise":
        return "bg-plan-enterprise text-warning-foreground";
      default:
        return "bg-warning text-warning-foreground";
    }
  };

  return (
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

      <div className="flex flex-col gap-10">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-body-lg font-medium">Plan Summary</h2>
            <Badge
              className={`${getPlanBadgeClass(subscription?.plan)} hover:opacity-90`}
            >
              {subscription?.plan
                ? `${subscription.plan} plan`
                : "Starter plan"}
            </Badge>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
              <div>
                <p className="text-muted-foreground opacity-60">Price/month</p>
                <p className="font-medium">
                  {subscription && subscription.amount > 0
                    ? `${formatCurrency(subscription.amount, subscription.currency)}`
                    : "Free"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground opacity-60">Start date</p>
                <p className="font-medium">
                  {formatDate(subscription?.startDate)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground opacity-60">
                  Next Billing date
                </p>
                <p className="font-medium">
                  {isSubscriptionCanceled ||
                  (subscription &&
                    subscription.amount === 0 &&
                    subscription.plan.toLowerCase() === "free")
                    ? "-"
                    : formatDate(subscription?.nextBillingDate)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-4 md:mt-0 self-start md:self-center">
              {isSubscriptionCanceled && subscription && (
                <Badge
                  variant="outline"
                  className="py-1 px-2 order-first sm:order-none mb-2 sm:mb-0 sm:mr-2"
                >
                  Cancels on {formatDate(subscription.nextBillingDate)}
                </Badge>
              )}
              <Button
                onClick={() => setChangePlanOpen(true)}
                className="w-full sm:w-auto"
              >
                Change Plan
              </Button>
              {hasPaidSubscription && !isSubscriptionCanceled && (
                <Button
                  variant="outline"
                  onClick={() => setCancelDialogOpen(true)}
                  className="w-full sm:w-auto"
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-body-lg font-medium">Token Usage</h3>
            </div>
            <Button
              variant="outline"
              onClick={() => setTopUpOpen(true)}
              className="h-9 px-3 border border-foreground rounded-lg text-body-md text-foreground hover:bg-accent hover:text-accent-foreground items-center"
            >
              <Zap className="h-4 w-4 mr-2" />
              Top Up
            </Button>
          </div>
          <div className="mb-1">
            <p className="text-body-sm text-muted-foreground opacity-60">
              Available tokens
            </p>
            <p className="text-body-sm font-medium">
              {formatTokens(subscription?.tokens || 0)} /{" "}
              {formatTokens(DISPLAY_TOTAL_TOKENS)}
            </p>
          </div>
          <Progress
            value={subscription && subscription.tokens > 0 ? 50 : 0}
            className="h-2 bg-success/20 [&>div]:bg-success"
          />
        </div>
      </div>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanOpen} onOpenChange={setChangePlanOpen}>
        <DialogContent className="sm:max-w-7xl w-[95vw] max-h-[90vh] overflow-auto">
          <DialogHeader className="relative">
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Select a new plan. Your billing cycle will update immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const isCurrentPlan =
                  plan.name.toLowerCase() === subscription?.plan?.toLowerCase();
                const isEnterprisePlan = plan.isEnterprise;

                // Get the correct icon based on plan name
                let planIcon = null;
                let planBgColor = "bg-background";

                if (
                  plan.name.toLowerCase() === "starter" ||
                  plan.name.toLowerCase() === "free"
                ) {
                  planIcon = <StarterPlanIcon className="h-7 w-7" />;
                } else if (plan.name.toLowerCase() === "pro") {
                  planIcon = <ProPlanIcon className="h-7 w-5" />;
                } else if (plan.name.toLowerCase() === "premium") {
                  planIcon = <PremiumPlanIcon className="h-7 w-7" />;
                } else if (
                  isEnterprisePlan ||
                  plan.name.toLowerCase() === "enterprise"
                ) {
                  planIcon = <EnterprisePlanIcon className="h-7 w-7" />;
                }

                // Set different background colors based on selection state
                if (isCurrentPlan) {
                  planBgColor = "bg-[#393744]";
                } else if (selectedPlan === plan.id) {
                  planBgColor = "bg-primary/5 border-primary";
                } else {
                  planBgColor = "bg-black/60 dark:bg-[#0b0912]/60";
                }

                // We use the features that come from the backend API
                const planFeatures = plan.features || [];

                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl border border-border ${planBgColor} p-6 flex flex-col h-full ${
                      isEnterprisePlan ? "border-dashed" : ""
                    } transition-colors duration-200 cursor-pointer`}
                    onClick={() =>
                      !isEnterprisePlan && setSelectedPlan(plan.id)
                    }
                  >
                    <div className="flex justify-between items-start mb-4">
                      {planIcon && <div className="mb-2">{planIcon}</div>}

                      {isCurrentPlan && (
                        <span className="text-xs font-medium bg-foreground/15 text-foreground rounded-md px-3 py-1">
                          Current plan
                        </span>
                      )}
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <h3 className="text-body-lg font-normal">
                          {plan.name}
                        </h3>
                        <p className="text-heading-3 font-medium -tracking-[0.02em] mt-3">
                          {plan.price === 0
                            ? "Free"
                            : plan.price === null
                              ? "Custom"
                              : `${formatCurrency(plan.price, plan.currency)}/month`}
                        </p>
                      </div>

                      {plan.description && (
                        <div className="border-t border-foreground/10 pt-4">
                          <p className="text-sm text-foreground/80 mb-2">
                            {plan.description}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        {planFeatures.map((feature, index) => {
                          // Check if this is a heading (e.g., "Everything in X, plus:")
                          const isHeading =
                            feature.includes("Everything in") &&
                            feature.includes("plus:");

                          return (
                            <div
                              key={index}
                              className={`flex items-start gap-2 ${isHeading ? "pt-2" : ""}`}
                            >
                              {!isHeading && (
                                <Check className="h-4 w-4 text-foreground mt-1 flex-shrink-0" />
                              )}
                              <span
                                className={`text-sm ${isHeading ? "font-medium" : "text-foreground/80"}`}
                              >
                                {feature}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-auto">
                      {isEnterprisePlan ? (
                        <Button
                          className="w-full rounded-lg"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContactForEnterprise();
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Get in Touch
                        </Button>
                      ) : isCurrentPlan ? (
                        <Button
                          className="w-full rounded-lg bg-foreground/10 hover:bg-foreground/20 text-foreground"
                          disabled
                        >
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          className="w-full rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInitiatePlanChange(plan);
                          }}
                        >
                          {plan.price === 0 &&
                          (subscription ? subscription.amount > 0 : false)
                            ? "Downgrade to Free"
                            : `Upgrade to ${plan.name}`}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
              {planToChange?.price === 0 &&
              (subscription ? subscription.amount > 0 : false)
                ? "Downgrade to Free Plan"
                : `Upgrade to ${planToChange?.name} Plan`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {planToChange?.price === 0 &&
              (subscription ? subscription.amount > 0 : false)
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
            <DialogTitle>Top Up Pythagora</DialogTitle>
            <DialogDescription>
              Select a token package to add to your account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topUpPackages.map((pkg: TopUpPackage) => (
                <div
                  key={pkg.id}
                  className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                    selectedTopUp === pkg.id ? "bg-highlight" : "border-border"
                  }`}
                  onClick={() => setSelectedTopUp(pkg.id)}
                >
                  <div className="text-center">
                    <div className="text-subheading">
                      {formatCurrency(pkg.price, pkg.currency)}
                    </div>
                    <div className="mt-2 text-body-md">
                      {formatTokens(pkg.tokens)} tokens
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTopUpOpen(false)}>
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
                  Save Changes
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
                    className="bg-transparent text-foreground border-none"
                    onClick={() => {
                      setConfirmTopUpOpen(false);
                      setShowPaymentForm(false);
                    }}
                  >
                    Back
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
