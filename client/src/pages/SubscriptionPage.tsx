import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { Separator } from "@/components/ui/separator";
import { Zap } from "lucide-react";
import { getUserSubscription } from "@/api/subscription";
import { PageContainer, PageHeader, Section } from "@/components/layout";
import { PlanTag } from "@/components/ui/subscription/PlanTag";
import { TokenProgressBar } from "@/components/ui/subscription/TokenProgressBar";
import { LabelValue } from "@/components/ui/subscription/LabelValue";

export function SubscriptionPage() {
  const [subscription, setSubscription] = useState<{
    plan: string;
    status: string;
    startDate: string;
    nextBillingDate: string;
    amount: number;
    currency: string;
    tokens: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subscriptionData = (await getUserSubscription()) as {
          subscription: {
            plan: string;
            status: string;
            startDate: string;
            nextBillingDate: string;
            amount: number;
            currency: string;
            tokens: number;
          };
        };
        setSubscription(subscriptionData.subscription);
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch subscription data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <PageContainer>
        <p className="text-app-white">No subscription data available.</p>
      </PageContainer>
    );
  }

  // Constants
  const totalTokens = 600000; // 600k tokens
  const usedTokens = subscription?.tokens || 0;

  return (
    <PageContainer>
      <PageHeader
        title="Subscription"
        subtitle="Manage your subscription and token usage"
      />

      <Section>
        {/* Plan Summary Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <h2 className="text-base font-normal leading-base text-app-white">
              Plan Summary
            </h2>
            <PlanTag plan={subscription.plan} />
          </div>
        </div>

        {/* Plan Summary Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Change Plan Button - Positioned absolutely on desktop */}
          <div className="md:absolute md:right-0 md:top-0 mb-4 md:mb-0 flex md:justify-end col-span-1 md:col-span-3">
            <Button
              className="h-auto py-[9px] px-[12px] rounded-app-sm bg-app-blue hover:bg-app-blue/90 text-[14px] font-medium tracking-[-0.28px] text-app-white"
              onClick={() => {
                toast({
                  title: "Feature coming soon",
                  description:
                    "Plan change functionality will be available soon.",
                });
              }}
            >
              Change plan
            </Button>
          </div>
          <LabelValue
            label="Price/month"
            value={subscription.amount > 0 ? `$${subscription.amount}` : "Free"}
          />
          <LabelValue label="Start date" value="April 12, 2025" />
          <LabelValue label="Next billing date" value="-" />
        </div>
      </Section>

      <Separator className="h-[1px] bg-app-stroke-dark mb-app-10" />

      <Section>
        {/* Token Usage Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <h2 className="text-base font-normal leading-base text-app-white">
              Token Usage
            </h2>
          </div>
        </div>

        {/* Token Usage Content */}
        <div className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <LabelValue label="Available tokens" value="1289 / 600K" />
            <Button
              variant="outline"
              className="h-[36px] py-[9px] px-[12px] rounded-app-sm border-app-stroke-dark bg-transparent hover:bg-app-white-opacity-05 hover:border-app-white text-[14px] font-medium tracking-[-0.28px] text-app-white hover:text-app-white mt-2 md:mt-0 transition-colors"
              onClick={() => {
                toast({
                  title: "Feature coming soon",
                  description:
                    "Token top-up functionality will be available soon.",
                });
              }}
            >
              <Zap className="h-4 w-4 text-app-white" />
              Top Up
            </Button>
          </div>

          <TokenProgressBar value={usedTokens} max={totalTokens} />
        </div>
      </Section>
    </PageContainer>
  );
}
