import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Check, CreditCard, ExternalLink, Zap } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { getUserSubscription, getSubscriptionPlans, updateSubscription, getTopUpPackages, purchaseTopUp } from "@/api/subscription";

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
    cvc: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subscriptionData, plansData, packagesData] = await Promise.all([
          getUserSubscription(),
          getSubscriptionPlans(),
          getTopUpPackages()
        ]);

        setSubscription(subscriptionData.subscription);
        setPlans(plansData.plans);
        setTopUpPackages(packagesData.packages);

        // Set the current plan as selected by default
        if (subscriptionData.subscription?.plan) {
          const currentPlanId = plansData.plans.find(
            p => p.name.toLowerCase() === subscriptionData.subscription.plan.toLowerCase()
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
    if (!selectedPlan) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a plan to continue",
      });
      return;
    }

    try {
      const response = await updateSubscription({ planId: selectedPlan });
      setSubscription(response.subscription);
      toast({
        title: "Success",
        description: response.message || "Subscription updated successfully",
      });
      setChangePlanOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update subscription",
      });
    }
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
        tokens: (subscription.tokens || 0) + response.tokens
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
    window.open('https://pythagora.io/contact', '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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

  // Calculate the next billing date
  const nextBillingDate = subscription?.nextBillingDate
    ? new Date(subscription.nextBillingDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : "N/A";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and token usage</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your subscription details and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">{subscription.plan} Plan</h3>
              <p className="text-muted-foreground">
                {subscription.amount > 0 ? (
                  `${formatCurrency(subscription.amount, subscription.currency)} / month`
                ) : (
                  "Free"
                )}
              </p>
            </div>
            <Button onClick={() => setChangePlanOpen(true)}>Change Plan</Button>
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
              <Button variant="outline" onClick={() => setTopUpOpen(true)}>
                <Zap className="mr-2 h-4 w-4" />
                Top Up
              </Button>
            </div>
            <Progress value={50} className="h-2" />
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-medium">
                {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : "N/A"}
              </span>
            </div>
            {subscription.amount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Billing Date:</span>
                <span className="font-medium">{nextBillingDate}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanOpen} onOpenChange={setChangePlanOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Select a new plan. Your billing cycle will update immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={selectedPlan || ""}
              onValueChange={setSelectedPlan}
              className="grid gap-4"
            >
              {plans.map((plan) => {
                const isCurrentPlan = plan.name.toLowerCase() === subscription.plan.toLowerCase();
                const isEnterprisePlan = plan.isEnterprise;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-lg border p-4 ${
                      selectedPlan === plan.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    } ${isEnterprisePlan ? "border-dashed" : ""}`}
                  >
                    {!isEnterprisePlan ? (
                      <RadioGroupItem
                        value={plan.id}
                        id={`plan-${plan.id}`}
                        className="sr-only"
                      />
                    ) : null}
                    <Label
                      htmlFor={isEnterprisePlan ? undefined : `plan-${plan.id}`}
                      className={`flex flex-col ${isEnterprisePlan ? "" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold">{plan.name}</span>
                          {isCurrentPlan && (
                            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <span className="font-bold">
                          {plan.price === 0 ? (
                            "Free"
                          ) : plan.price === null ? (
                            "Custom"
                          ) : (
                            <>
                              {formatCurrency(plan.price, plan.currency)}
                              <span className="text-sm font-normal text-muted-foreground">
                                /month
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                      {plan.tokens !== null && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {plan.tokens === 0 ? "No tokens included" : `${formatTokens(plan.tokens)} tokens included`}
                        </div>
                      )}
                      <div className="mt-2 space-y-1">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      {isEnterprisePlan && (
                        <Button
                          className="mt-4 w-full"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            handleContactForEnterprise();
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Get in Touch
                        </Button>
                      )}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePlanOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlanChange} disabled={!selectedPlan || selectedPlan === plans.find(p => p.isEnterprise)?.id}>
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <AlertDialog open={confirmTopUpOpen} onOpenChange={setConfirmTopUpOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={!selectedTopUp}
                  onClick={() => selectedTopUp && setConfirmTopUpOpen(true)}
                >
                  Continue
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Token Purchase</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to purchase this token package? Your payment method on file will be charged immediately.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmTopUpOpen(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleTopUpPurchase}>
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