import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Zap } from "lucide-react";

interface CustomerProfile {
  tokensLeft?: number;
  usageThisPeriod?: number;
  usagePreviousPeriods?: number;
  usageWarningSent?: boolean;
}

interface TokenUsageProps {
  customerProfile: CustomerProfile | null;
  onShowTopUp: () => void;
}

export function TokenUsage({ customerProfile, onShowTopUp }: TokenUsageProps) {
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

  const getProgressValue = () => {
    const tokensLeft = customerProfile?.tokensLeft || 0;
    const usageThisPeriod = customerProfile?.usageThisPeriod || 0;
    const total = tokensLeft + usageThisPeriod;

    if (total === 0) return 0;
    return (tokensLeft / total) * 100;
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-body-lg font-medium">Token Usage</h3>
        </div>
        <Button
          variant="outline"
          onClick={onShowTopUp}
          className="h-9 px-3 border border-foreground rounded-lg text-body-md text-foreground hover:bg-accent hover:text-accent-foreground items-center"
        >
          <Zap className="h-4 w-4 mr-2" />
          Top Up
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
        <div>
          <p className="text-muted-foreground opacity-60">Tokens Left</p>
          <p className="text-body-sm font-medium">
            {formatTokens(customerProfile?.tokensLeft)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground opacity-60">Usage This Period</p>
          <p className="text-body-sm font-medium">
            {formatTokens(customerProfile?.usageThisPeriod)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground opacity-60">Previous Period Usage</p>
          <p className="text-body-sm font-medium">
            {formatTokens(customerProfile?.usagePreviousPeriods)}
          </p>
        </div>
      </div>

      <Progress
        value={getProgressValue()}
        className="h-2 bg-muted [&>div]:bg-primary"
      />

      {customerProfile?.usageWarningSent && (
        <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Usage warning has been sent for this account.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}