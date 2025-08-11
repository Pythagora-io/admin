import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

import SpinnerShape from "@/components/SpinnerShape";

interface CustomerProfile {
  id?: string;
  _id?: string;
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
  createdAt?: string | { $date: string };
}

interface PlanSummaryProps {
  customerProfile: CustomerProfile | null;
  cancellingSubscription: boolean;
  onChangePlan: () => void;
  onCancelSubscription: () => void;
}

export function PlanSummary({
  customerProfile,
  cancellingSubscription,
  onChangePlan,
  onCancelSubscription,
}: PlanSummaryProps) {
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

  const getPlanBadgeClass = (planType?: string) => {
    if (!planType) return "bg-muted text-muted-foreground";

    switch (planType.toLowerCase()) {
      case "free":
        return "bg-plan-starter text-warning-foreground";
      case "pro":
        return "bg-plan-pro text-warning-foreground";
      case "premium":
        return "bg-plan-premium text-warning-foreground";
      case "enterprise":
        return "bg-plan-enterprise text-warning-foreground";
      case "prepaid":
        return "bg-blue-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Get unique subscriptions by ID
  const getUniqueSubscriptions = (subscriptions?: Array<any>) => {
    if (!subscriptions) return [];

    const uniqueSubscriptions = subscriptions.filter((subscription, index, self) =>
      index === self.findIndex(s => s.id === subscription.id)
    );

    return uniqueSubscriptions;
  };

  const getCurrentSubscriptionPrice = () => {
    console.log("Getting current subscription price from subscriptions history:", customerProfile?.subscriptionsHistory);

    if (!customerProfile?.subscriptionsHistory || customerProfile.subscriptionsHistory.length === 0) {
      return null;
    }

    // Get unique subscriptions first, then get the most recent one with pricing data
    const uniqueSubscriptions = getUniqueSubscriptions(customerProfile.subscriptionsHistory);

    const latestSubscription = uniqueSubscriptions
      .filter(sub => sub.stripeData?.items?.[0]?.price)
      .sort((a, b) => {
        const dateA = typeof a.createdAt === 'string' ? a.createdAt : a.createdAt?.$date || '';
        const dateB = typeof b.createdAt === 'string' ? b.createdAt : b.createdAt?.$date || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })[0];

    if (!latestSubscription?.stripeData?.items?.[0]?.price) {
      return null;
    }

    const price = latestSubscription.stripeData.items[0].price;
    return {
      amount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval || 'month',
      status: latestSubscription.stripeData.status
    };
  };

  // Check if user has an active subscription that can be cancelled
  const hasActiveSubscription = () => {
    // Check currentSubscription first, then fall back to subscription
    const currentPlan = customerProfile?.currentSubscription?.planType?.toLowerCase() ||
                       customerProfile?.subscription?.planType?.toLowerCase();
    console.log("PlanSummary: Checking active subscription, current plan:", currentPlan);
    
    // If no plan or not a paid plan, return false
    if (!currentPlan || !['pro', 'premium'].includes(currentPlan)) {
      return false;
    }

    // Check if the latest subscription is canceled
    if (customerProfile?.subscriptionsHistory && customerProfile.subscriptionsHistory.length > 0) {
      // Get unique subscriptions first, then get the most recent one
      const uniqueSubscriptions = getUniqueSubscriptions(customerProfile.subscriptionsHistory);
      
      const latestSubscription = uniqueSubscriptions
        .filter(sub => sub.stripeData?.status)
        .sort((a, b) => {
          const dateA = typeof a.createdAt === 'string' ? a.createdAt : a.createdAt?.$date || '';
          const dateB = typeof b.createdAt === 'string' ? b.createdAt : b.createdAt?.$date || '';
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        })[0];

      if (latestSubscription?.stripeData?.status === 'canceled') {
        console.log("PlanSummary: Latest subscription is canceled, hiding cancel button");
        return false;
      }
    }

    return true;
  };

  // Get the current plan type - prioritize currentSubscription over subscription
  const getCurrentPlanType = () => {
    const planType = customerProfile?.currentSubscription?.planType || 
                    customerProfile?.subscription?.planType || 
                    "No Plan";
    console.log("PlanSummary: Current plan type:", planType);
    return planType;
  };

  const subscriptionPrice = getCurrentSubscriptionPrice();
  const currentPlanType = getCurrentPlanType();

  return (
    <>
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-body-lg font-medium">Plan Summary</h2>
          <Badge
            className={`${getPlanBadgeClass(currentPlanType)} hover:opacity-90`}
          >
            {currentPlanType}
          </Badge>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
            <div>
              <p className="text-muted-foreground opacity-60">Plan Type</p>
              <p className="font-medium">
                {currentPlanType === "No Plan" ? "No active plan" : currentPlanType}
              </p>
              {subscriptionPrice && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(subscriptionPrice.amount, subscriptionPrice.currency)}/{subscriptionPrice.interval}
                  {subscriptionPrice.status === 'canceled' && (
                    <span className="text-red-500 ml-1">(Canceled)</span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-4 md:mt-0 self-start md:self-center">
            <Button
              onClick={onChangePlan}
              className="w-full sm:w-auto"
            >
              Change Plan
            </Button>
            {hasActiveSubscription() && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto"
                    disabled={cancellingSubscription}
                  >
                    {cancellingSubscription ? (
                      <>
                        <SpinnerShape className="w-4 h-4 mr-2" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Subscription"
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your subscription? This action cannot be undone and you will lose access to premium features at the end of your current billing period.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onCancelSubscription}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Cancel Subscription
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      <Separator />
    </>
  );
}