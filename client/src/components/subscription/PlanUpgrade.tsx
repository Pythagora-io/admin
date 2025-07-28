import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, ArrowRight } from "lucide-react";
import { ProPlanIcon, PremiumPlanIcon } from "@/components/icons/PlanIcons";
import { PLAN_FEATURES, PLAN_PRICES } from "@/constants/plans";
import { Separator } from "@/components/ui/separator";

interface CustomerProfile {
  currentSubscription?: {
    planType: string;
  };
  subscription?: {
    planType?: string;
  };
}

interface PlanUpgradeProps {
  customerProfile: CustomerProfile | null;
  onUpgradePlan: (planType: 'Pro' | 'Premium') => void;
}

export function PlanUpgrade({ customerProfile, onUpgradePlan }: PlanUpgradeProps) {
  // Get available upgrade options based on current plan
  const getAvailableUpgrades = () => {
    // Prioritize currentSubscription over subscription
    const currentPlan = customerProfile?.currentSubscription?.planType?.toLowerCase() || 
                       customerProfile?.subscription?.planType?.toLowerCase();
    console.log("PlanUpgrade: Current plan type for upgrades:", currentPlan);

    if (!currentPlan || currentPlan === 'free' || currentPlan === 'prepaid') {
      return ['Pro', 'Premium'];
    } else if (currentPlan === 'premium') {
      return ['Pro'];
    }
    return [];
  };

  const availableUpgrades = getAvailableUpgrades();

  if (availableUpgrades.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col space-y-6">
        <div>
          <h2 className="text-body-lg font-medium mb-2">Upgrade Your Plan</h2>
          <p className="text-muted-foreground text-sm">
            Get more features and tokens by upgrading to a higher plan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableUpgrades.includes('Pro') && (
            <Card className="relative overflow-hidden border-2 border-transparent hover:border-pink-200 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <ProPlanIcon className="w-5 h-7" />
                  <div>
                    <CardTitle className="text-lg">Pro Plan</CardTitle>
                    <CardDescription className="text-2xl font-bold text-foreground">
                      ${PLAN_PRICES.Pro}<span className="text-sm font-normal text-muted-foreground">/month</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="space-y-2">
                  {PLAN_FEATURES.Pro.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  onClick={() => onUpgradePlan('Pro')}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {availableUpgrades.includes('Premium') && (
            <Card className="relative overflow-hidden border-2 border-transparent hover:border-teal-200 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <PremiumPlanIcon className="w-7 h-7" />
                  <div>
                    <CardTitle className="text-lg">Premium Plan</CardTitle>
                    <CardDescription className="text-2xl font-bold text-foreground">
                      ${PLAN_PRICES.Premium}<span className="text-sm font-normal text-muted-foreground">/month</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="space-y-2">
                  {PLAN_FEATURES.Premium.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  onClick={() => onUpgradePlan('Premium')}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      <Separator />
    </>
  );
}