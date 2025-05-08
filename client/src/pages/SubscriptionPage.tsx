import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Check, Zap, X, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getUserSubscription, getSubscriptionPlans, updateSubscription, getTopUpPackages, purchaseTopUp } from "@/api/subscription";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Import the downloaded icons
import StarterIcon from "@/assets/icons/starter-icon.svg";
import ProIcon from "@/assets/icons/pro-icon.svg";
import PremiumIcon from "@/assets/icons/premium-icon.svg";

// Define interfaces for better type safety
interface Plan {
  id: string;
  name: string;
  price: number | null; // Allow null for custom/enterprise plans
  currency: string;
  tokens: number | null; // Allow null for custom/enterprise plans
  features: string[];
  isEnterprise?: boolean; // Optional property
}

interface Subscription {
  plan: string;
  amount: number;
  currency: string;
  tokens: number;
  // Add other potential subscription fields if known, e.g., startDate, nextBillingDate
  startDate?: string;
  nextBillingDate?: string | null; // Can be null for free plans
}

interface TopUpPackage {
  id: string;
  name?: string; // Assuming name exists, though not used in current UI (made optional)
  price: number;
  currency: string;
  tokens: number;
}

export function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [topUpPackages, setTopUpPackages] = useState<TopUpPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [confirmTopUpOpen, setConfirmTopUpOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedTopUp, setSelectedTopUp] = useState<string | null>(null);
  const [confirmPlanChangeOpen, setConfirmPlanChangeOpen] = useState(false);
  const [planToChange, setPlanToChange] = useState<Plan | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use 'any' for responses until exact API types are known
        const [subscriptionData, plansData, packagesData] = await Promise.all([
          getUserSubscription(), // Returns Promise<any>
          getSubscriptionPlans(), // Returns Promise<any>
          getTopUpPackages(), // Returns Promise<any>
        ]);

        // Type checking before setting state, casting results to any
        setSubscription((subscriptionData as any)?.subscription ?? null);
        setPlans(
          Array.isArray((plansData as any)?.plans)
            ? (plansData as any).plans
            : []
        );
        setTopUpPackages(
          Array.isArray((packagesData as any)?.packages)
            ? (packagesData as any).packages
            : []
        );

        // Set the current plan as selected by default
        if ((subscriptionData as any)?.subscription?.plan) {
          const currentPlanId = (plansData as any)?.plans?.find(
            (
              p: Plan // Explicitly type p
            ) =>
              p.name.toLowerCase() ===
              (subscriptionData as any).subscription.plan.toLowerCase()
          )?.id;
          if (currentPlanId) {
            setSelectedPlan(currentPlanId);
          }
        }
      } catch (error: unknown) {
        // Type error as unknown
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch subscription data", // Handle error type
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handlePlanChange = async () => {
    if (!planToChange) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No plan selected to change to",
      });
      return;
    }

    try {
      // Use 'any' for response until exact API type is known
      const response = await updateSubscription({ planId: planToChange.id });
      // Cast response to any before accessing properties
      if ((response as any)?.subscription) {
        setSubscription((response as any).subscription);
      }
      toast({
        title: "Success",
        description:
          (response as any)?.message || "Subscription updated successfully",
      });
      setConfirmPlanChangeOpen(false);
      setChangePlanOpen(false);
    } catch (error: unknown) {
      // Type error as unknown
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update subscription", // Handle error type
      });
    }
  };

  // Explicitly type the plan parameter
  const handleInitiatePlanChange = (plan: Plan) => {
    setPlanToChange(plan);
    setConfirmPlanChangeOpen(true);
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

    if (!subscription) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot perform top-up without an active subscription.",
      });
      return;
    }

    try {
      // Use 'any' for response until exact API type is known
      const response = await purchaseTopUp({ packageId: selectedTopUp });
      // Update the token count in the current subscription
      // Cast response to any before accessing properties
      setSubscription({
        ...subscription,
        tokens: (subscription.tokens || 0) + ((response as any)?.tokens ?? 0), // Use nullish coalescing
      });

      toast({
        title: "Success",
        description:
          (response as any)?.message || "Token top-up purchased successfully",
      });
      setConfirmTopUpOpen(false);
      setTopUpOpen(false);
    } catch (error: unknown) {
      // Type error as unknown
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to purchase token top-up", // Handle error type
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Add a check for subscription being null before accessing its properties
  if (!subscription) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <p>Could not load subscription details.</p>
        {/* Optionally add a retry button */}
      </div>
    );
  }

  const formatCurrency = (amount: number | null, currency: string = 'USD') => {
    if (amount === null) return 'Custom';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatTokens = (tokens: number | null) => {
    if (tokens === null) return 'Custom';
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toLocaleString()}M`;
    }
    return tokens.toLocaleString();
  };

  // Check if user is out of tokens
  const isOutOfTokens = subscription.tokens === 0;

  // Find the total tokens for the current plan for progress bar calculation
  const currentPlanDetails = plans.find(
    (p) => p.name.toLowerCase() === subscription.plan.toLowerCase()
  );
  const totalPlanTokens = currentPlanDetails?.tokens ?? 0; // Default to 0 if plan/tokens not found
  const tokenProgress =
    totalPlanTokens > 0 ? (subscription.tokens / totalPlanTokens) * 100 : 0;

  // Mock data for missing fields (replace with actual data if available)
  const startDate = subscription.startDate ?? "-"; // Use actual data if available
  const nextBillingDate = subscription.nextBillingDate ?? "-"; // Use actual data if available

  // --- Helper to get plan-specific data ---
  const getPlanUIData = (planName: string, isCurrent: boolean) => {
    const lowerCaseName = planName.toLowerCase();

    // 1. Determine Icon based *only* on plan name
    let icon = StarterIcon; // Default
    if (lowerCaseName.includes("pro")) {
      icon = ProIcon;
    } else if (lowerCaseName.includes("premium")) {
      icon = PremiumIcon;
    }

    // 2. Determine Background Color
    let bgColor = "bg-plan-starter"; // Default to Starter background
    if (isCurrent) {
      // Force Starter background for the current plan
      bgColor = "bg-plan-starter";
    } else {
      // For non-current plans:
      if (lowerCaseName.includes("pro")) {
        bgColor = "bg-plan-pro";
      } else if (lowerCaseName.includes("premium")) {
        bgColor = "bg-plan-premium";
      } else {
        // Non-current Starter/Free plan gets Premium background
        bgColor = "bg-plan-premium";
      }
    }

    return { bgColor, icon };
  };

  return (
    <div className="space-y-10 p-4 md:p-8 md:pt-12 md:px-12 w-full mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium text-foreground">Subscription</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and token usage</p>
      </div>

      {isOutOfTokens && (
        <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300">
          <AlertTriangle className="h-5 w-5 stroke-current" />
          <AlertTitle className="font-semibold">You've run out of tokens!</AlertTitle>
          <AlertDescription>
            To continue building your apps, please top up your tokens or upgrade your plan.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-10">
        <div className="w-full space-y-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-normal text-foreground">
              Plan Summary
            </h2>
            <Badge className="bg-[#FFD11A] text-[#060218] hover:bg-[#FFD11A]/90 px-2 py-1 text-xs font-medium rounded-lg">
              {subscription.plan} Plan
            </Badge>
          </div>
          <div className="flex justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground/60">
                  Price/month
                </p>
                <p className="text-sm font-medium text-foreground">
                  {subscription.amount > 0
                    ? formatCurrency(subscription.amount, subscription.currency)
                    : "Free"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground/60">
                  Start date
                </p>
                <p className="text-sm font-medium text-foreground">
                  {startDate}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground/60">
                  Next Billing date
                </p>
                <p className="text-sm font-medium text-foreground">
                  {nextBillingDate}
                </p>
              </div>
            </div>

            <div className="flex justify-start">
              <Button
                size="sm"
                className={cn(
                  "bg-btn-primary hover:bg-btn-primary-hover text-btn-primary-foreground",
                  "disabled:bg-btn-primary-disabled disabled:text-btn-primary-foreground-disabled"
                )}
                onClick={() => setChangePlanOpen(true)}
                aria-label="Change subscription plan"
              >
                Change plan
              </Button>
            </div>
          </div>
        </div>
        <Separator />

        {/* <Separator
          orientation="vertical"
          className="hidden lg:flex bg-border h-auto mx-auto data-[orientation=vertical]:h-full data-[orientation=vertical]:w-[1px]"
        /> */}

        <div className="space-y-5">
          <h2 className="text-base font-normal text-foreground">Token Usage</h2>

          <div className="space-y-4 ">
            <div className="flex items-start flex-col gap-2">
              <div className="flex justify-between w-full gap-4">
                <div className="flex flex-col w-full items-start gap-2">
                  <p className="text-sm font-medium text-foreground/60">
                    Available tokens
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatTokens(subscription.tokens)} /{" "}
                    {formatTokens(totalPlanTokens)}
                  </p>
                  <Progress
                    value={tokenProgress}
                    className="h-1.5 rounded-full bg-btn-destructive/20 [&>*]:bg-btn-destructive"
                  />
                </div>
                <div className="flex justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "border-btn-outline-border text-btn-outline-foreground hover:bg-btn-outline-hover hover:text-btn-outline-foreground-hover",
                      "disabled:border-btn-outline-borderDisabled disabled:text-btn-outline-foreground-disabled",
                      "gap-2"
                    )}
                    onClick={() => setTopUpOpen(true)}
                    aria-label="Top up tokens"
                  >
                    <Zap className="h-4 w-4 stroke-current" />
                    Top Up
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={changePlanOpen} onOpenChange={setChangePlanOpen}>
        <DialogContent className="max-w-5xl overflow-y-auto bg-dialog border-plan-border rounded-2xl backdrop-blur-lg text-foreground">
          <DialogHeader className="flex flex-row justify-between items-center mb-2 pb-0">
            <DialogTitle className="text-xl font-medium tracking-tight">
              Change Plan
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-row items-stretch gap-6 px-6 pb-6 pt-4 overflow-x-auto">
            {plans
              .filter((plan) => !plan.isEnterprise)
              .map((plan) => {
                const isCurrentPlan =
                  plan.name.toLowerCase() === subscription.plan.toLowerCase();
                const { bgColor, icon: PlanIcon } = getPlanUIData(
                  plan.name,
                  isCurrentPlan
                );

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "w-[285px] h-auto flex flex-col justify-between rounded-2xl p-6 flex-shrink-0",
                      bgColor,
                      "border border-transparent",
                      "hover:border-muted-foreground/50 transition-all duration-150",
                      !isCurrentPlan && "cursor-pointer"
                    )}
                    onClick={() => !isCurrentPlan && setSelectedPlan(plan.id)}
                    onKeyDown={(e) =>
                      !isCurrentPlan &&
                      (e.key === "Enter" || e.key === " ") &&
                      setSelectedPlan(plan.id)
                    }
                    tabIndex={isCurrentPlan ? -1 : 0}
                    role="radio"
                    aria-checked={selectedPlan === plan.id}
                    aria-label={`Select ${plan.name} plan`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <img
                          src={PlanIcon}
                          alt={`${plan.name} plan icon`}
                          className="h-8 w-8"
                        />
                        {isCurrentPlan && (
                          <Badge className="bg-plan-starter-tagBg hover:bg-plan-starter-tagBg text-foreground font-normal text-sm rounded-lg px-3 py-1 h-[30px]">
                            Current plan
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <p className="text-base font-normal text-foreground">
                            {plan.name}
                          </p>
                          <p className="text-2xl font-medium text-foreground">
                            {plan.price === 0
                              ? "Free"
                              : plan.price === null
                              ? "Custom"
                              : formatCurrency(plan.price, plan.currency)}
                          </p>
                        </div>
                        <Separator className="bg-white/10" />
                        <p className="text-sm font-medium text-foreground/80 min-h-[40px]">
                          {plan.name === "Starter"
                            ? "Just getting started? Try building your first app with AI."
                            : plan.name === "Pro"
                            ? "For individuals and small teams ready to ship real products."
                            : plan.name === "Premium"
                            ? "More power, more projects, more room to grow."
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 flex-grow pt-4 pb-4">
                      <p className="text-sm font-medium text-foreground py-2">
                        {plan.name === "Starter"
                          ? "Starter includes:"
                          : plan.name === "Pro"
                          ? "Everything in Starter, plus:"
                          : plan.name === "Premium"
                          ? "Everything in Pro, plus:"
                          : "Features:"}
                      </p>
                      {plan.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 py-1"
                        >
                          <Check
                            className="h-3.5 w-3.5 text-foreground flex-shrink-0"
                            strokeWidth={2.5}
                          />
                          <span className="text-sm font-medium text-foreground/80">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-4">
                      {isCurrentPlan ? (
                        <Button
                          variant="secondary"
                          size="lg"
                          className={cn("w-full", "disabled:opacity-60")}
                          disabled
                        >
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          size="lg"
                          className={cn(
                            "w-full bg-btn-primary hover:bg-btn-primary-hover text-btn-primary-foreground",
                            "disabled:bg-btn-primary-disabled disabled:text-btn-primary-foreground-disabled"
                          )}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card div onClick from firing again
                            // Directly initiate change confirmation on button click
                            handleInitiatePlanChange(plan);
                          }}
                          aria-label={`Switch to ${plan.name}`}
                        >
                          {plan.price === 0
                            ? "Downgrade to Free"
                            : `Upgrade to ${plan.name}`}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmPlanChangeOpen}
        onOpenChange={setConfirmPlanChangeOpen}
      >
        <AlertDialogContent className="bg-dialog text-foreground border-plan-border rounded-2xl backdrop-blur-lg max-h-[85vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-medium">
              {planToChange?.price === 0 && subscription.amount > 0
                ? "Downgrade to Free Plan"
                : `Confirm Plan Change`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {planToChange?.price === 0 && subscription.amount > 0
                ? "Are you sure you want to downgrade to the Free plan? You'll lose access to premium features and your current token allocation."
                : `Are you sure you want to switch to the ${planToChange?.name} plan? Your billing cycle will update immediately.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setConfirmPlanChangeOpen(false)}
              className="h-9 px-3 py-2 bg-transparent border border-btn-outline-border text-btn-outline-foreground hover:bg-btn-outline-hover hover:text-btn-outline-foreground-hover disabled:border-btn-outline-borderDisabled disabled:text-btn-outline-foreground-disabled"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePlanChange}
              className={cn(
                "bg-btn-primary hover:bg-btn-primary-hover text-btn-primary-foreground",
                "disabled:bg-btn-primary-disabled disabled:text-btn-primary-foreground-disabled",
                "h-9 px-3 py-2"
              )}
            >
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="sm:max-w-md bg-dialog text-foreground border-plan-border rounded-2xl backdrop-blur-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader className="relative pr-10">
            <DialogTitle className="text-lg font-medium">
              Top Up Tokens
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Select a token package to add to your account.
            </DialogDescription>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 rounded-full text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topUpPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-lg border p-4 text-center transition-colors duration-150 ${
                    selectedTopUp === pkg.id
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-plan-border hover:border-muted-foreground/50"
                  } cursor-pointer bg-white/5 hover:bg-white/10`}
                  onClick={() => setSelectedTopUp(pkg.id)}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    setSelectedTopUp(pkg.id)
                  }
                  tabIndex={0}
                  role="radio"
                  aria-checked={selectedTopUp === pkg.id}
                  aria-label={`Select ${formatTokens(
                    pkg.tokens
                  )} token package for ${formatCurrency(
                    pkg.price,
                    pkg.currency
                  )}`}
                >
                  <div className="text-lg font-semibold text-foreground">
                    {formatCurrency(pkg.price, pkg.currency)}
                  </div>
                  <div className="mt-1 text-sm font-medium text-muted-foreground">
                    {formatTokens(pkg.tokens)} tokens
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTopUpOpen(false)}
              className={cn(
                "border-btn-outline-border text-btn-outline-foreground hover:bg-btn-outline-hover hover:text-btn-outline-foreground-hover",
                "disabled:border-btn-outline-borderDisabled disabled:text-btn-outline-foreground-disabled"
              )}
            >
              Cancel
            </Button>
            <AlertDialog open={confirmTopUpOpen} onOpenChange={setConfirmTopUpOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  disabled={!selectedTopUp}
                  onClick={() => selectedTopUp && setConfirmTopUpOpen(true)}
                  className={cn(
                    "bg-btn-primary hover:bg-btn-primary-hover text-btn-primary-foreground",
                    "disabled:bg-btn-primary-disabled disabled:text-btn-primary-foreground-disabled disabled:opacity-50"
                  )}
                  aria-label="Continue to top up confirmation"
                >
                  Continue
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-dialog text-foreground border-plan-border rounded-2xl backdrop-blur-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-medium">Confirm Token Purchase</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-muted-foreground">
                    Are you sure you want to purchase this token package? Your
                    payment method on file will be charged immediately.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setConfirmTopUpOpen(false)}
                    className="h-9 px-3 py-2 bg-transparent border border-btn-outline-border text-btn-outline-foreground hover:bg-btn-outline-hover hover:text-btn-outline-foreground-hover disabled:border-btn-outline-borderDisabled disabled:text-btn-outline-foreground-disabled"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleTopUpPurchase}
                    className={cn(
                      "bg-btn-primary hover:bg-btn-primary-hover text-btn-primary-foreground",
                      "disabled:bg-btn-primary-disabled disabled:text-btn-primary-foreground-disabled",
                      "h-9 px-3 py-2"
                    )}
                  >
                    Confirm Purchase
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
