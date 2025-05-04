import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Check,
  ExternalLink,
  Zap,
  X,
  AlertTriangle,
  MoveRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  getUserSubscription,
  getSubscriptionPlans,
  updateSubscription,
  getTopUpPackages,
  purchaseTopUp,
} from "@/api/subscription";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [creditCardInfo, setCreditCardInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  // Add state for confirmation dialog
  const [confirmPlanChangeOpen, setConfirmPlanChangeOpen] = useState(false);
  const [planToChange, setPlanToChange] = useState<any>(null);

  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subscriptionData, plansData, packagesData] = await Promise.all([
          getUserSubscription(),
          getSubscriptionPlans(),
          getTopUpPackages(),
        ]);

        setSubscription(subscriptionData.subscription);
        setPlans(plansData.plans);
        setTopUpPackages(packagesData.packages);

        // Set the current plan as selected by default
        if (subscriptionData.subscription?.plan) {
          const currentPlanId = plansData.plans.find(
            (p) =>
              p.name.toLowerCase() ===
              subscriptionData.subscription.plan.toLowerCase()
          )?.id;
          if (currentPlanId) {
            setSelectedPlan(currentPlanId);
          }
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch subscription data",
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
    }
  };

  const handleInitiatePlanChange = (plan) => {
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

    try {
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
  const isOutOfTokens = subscription.tokens === 0;

  const isFreePlan = planToChange?.price === 0 && subscription.amount > 0;

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
              {subscription.plan} Plan
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Price</h3>
              <p className="text-muted-foreground">
                {subscription.amount > 0
                  ? `${formatCurrency(
                      subscription.amount,
                      subscription.currency
                    )} / month`
                  : "Free"}
              </p>
            </div>
            <Button
              onClick={() => setChangePlanOpen(true)}
              className="btn-primary"
            >
              Change Plan
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h4 className="font-medium">Token Usage</h4>
                <p className="text-sm text-muted-foreground">
                  {formatTokens(subscription.tokens)} tokens available
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setTopUpOpen(true)}
                className="btn-brija"
              >
                <Zap className="mr-2 h-4 w-4" />
                Top Up
              </Button>
            </div>
            <Progress
              value={subscription.tokens > 0 ? 50 : 0}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground text-right">
              {subscription.tokens} / 600,000 tokens
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanOpen} onOpenChange={setChangePlanOpen}>
        <DialogContent className="sm:max-w-6xl p-14" noClose>
          <DialogHeader className="relative">
            <DialogTitle>Change Plan</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-6 w-6 no-margin"
              onClick={() => setChangePlanOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const isCurrentPlan =
                  plan.name.toLowerCase() === subscription.plan.toLowerCase();
                const isEnterprisePlan = plan.isEnterprise;
                const isFreePlan = plan.price === 0;
                const buttonLabel = isCurrentPlan
                  ? "Current Plan"
                  : isFreePlan && subscription.amount > 0
                  ? "Switch to Free"
                  : `Upgrade to ${plan.name}`;

                return (
                  <div
                    key={plan.id}
                    className={`
                      "w-[285px] h-auto flex flex-col justify-between rounded-2xl p-6 flex-shrink-0
                      border border-transparent
                      hover:border-muted-foreground/50 transition-all duration-150
                      ${isCurrentPlan ? "current-plan" : "plan-to-choose"}`}
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
                        <div>Icon</div>
                        {isCurrentPlan && (
                          <Badge className="bg-plan-starter-tagBg hover:bg-plan-starter-tagBg text-foreground font-normal text-sm rounded-lg px-3 py-1 h-[30px]">
                            Current plan
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <p className="text-base font-normal text-foreground">
                            {plan.name === "Free" ? "Starter" : plan.name}
                          </p>
                          <p className="text-2xl font-medium text-foreground">
                            {plan.price === 0
                              ? "Free"
                              : plan.price === null
                              ? "Custom"
                              : `${formatCurrency(
                                  plan.price,
                                  plan.currency
                                )}/month`}
                          </p>
                        </div>
                        <Separator className="bg-white/10" />
                        <p className="text-sm font-medium text-foreground/80 min-h-[40px]">
                          {plan.name === "Free"
                            ? "Just getting started? Try building your first app with AI."
                            : plan.name === "Pro"
                            ? "For individuals and small teams ready to ship real products."
                            : "More power, more projects, more room to grow."}
                        </p>
                        <Separator className="bg-white/10" />
                      </div>
                    </div>

                    <div className="space-y-2 flex-grow pt-4 pb-4">
                      <p className="text-sm font-medium text-foreground py-2">
                        {plan.name === "Free"
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

                    <div className="mt-auto">
                      {isEnterprisePlan ? (
                        <Button
                          className="btn-primary"
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
                          className="btn-primary"
                          variant="secondary"
                          disabled
                        >
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          className="btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInitiatePlanChange(plan);
                          }}
                        >
                          {buttonLabel} <MoveRight />
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
              {isFreePlan
                ? "Switch to Free Plan?"
                : `Upgrade to ${planToChange?.name} Plan`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isFreePlan
                ? "You will be switched to our Free plan on {DATE}. You’ll still be able to access your projects after that. If you change your mind, you can always renew your subscription."
                : `Are you sure you want to upgrade to the ${planToChange?.name} plan? Your billing cycle will update immediately.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmPlanChangeOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePlanChange}
              className={isFreePlan ? "btn-red" : "btn-primary"}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Top Up Dialog */}
      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="sm:max-w-md p-8 pt-20">
          <DialogHeader>
            <DialogTitle>Top up Pythagora</DialogTitle>
            <DialogDescription>
              Choose a one-time token top up or upgrade your plan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topUpPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-lg border p-4 cursor-pointer transition-colors hover:border-primary top-up-token ${
                    selectedTopUp === pkg.id
                      ? "border-border bg-primary/5 token-active"
                      : "border-border"
                  } `}
                  onClick={() => setSelectedTopUp(pkg.id)}
                >
                  <div className="text-center">
                    <div className="text-xl font-bold">
                      {formatCurrency(pkg.price, pkg.currency)}
                    </div>
                    <div className="mt-1 text-xs font-medium">
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
                  className="btn-primary"
                  disabled={!selectedTopUp}
                  onClick={() => selectedTopUp && setConfirmTopUpOpen(true)}
                >
                  Save changes
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="p-8 ">
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Token Purchase</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to purchase this token package? Your
                    payment method on file will be charged immediately.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmTopUpOpen(false)}>
                    Back
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleTopUpPurchase}
                    className="btn-primary"
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
