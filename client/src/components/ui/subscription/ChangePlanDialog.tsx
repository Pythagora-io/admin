import React from "react";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { CustomDialogContent } from "./CustomDialogContent";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Plan icons as components for better reusability
const StarterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15 30C23.2843 30 30 23.2843 30 15C30 6.71573 23.2843 0 15 0C6.71573 0 0 6.71573 0 15C0 23.2843 6.71573 30 15 30ZM15 9.64286C12.0413 9.64286 9.64286 12.0413 9.64286 15C9.64286 17.9587 12.0413 20.3571 15 20.3571C17.9587 20.3571 20.3571 17.9587 20.3571 15C20.3571 12.0413 17.9587 9.64286 15 9.64286Z"
      fill="#FFD11A"
    />
  </svg>
);

const ProIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="30"
    viewBox="0 0 20 30"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.99997 0C1.79085 0 0 1.79085 0 3.99997V26C0 28.2092 1.79085 30 3.99997 30H16C18.2092 30 20 28.2092 20 26V3.99997C20 1.79085 18.2091 0 16 0H3.99997ZM13 11C13 9.34315 11.6569 8 10 8C8.34315 8 7 9.34315 7 11L7 19C7 20.6569 8.34315 22 10 22C11.6569 22 13 20.6569 13 19L13 11Z"
      fill="#FC8DDD"
    />
  </svg>
);

const PremiumIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.898607 12.8306C-0.299534 14.0287 -0.299536 15.9713 0.898605 17.1694L12.8306 29.1014C14.0287 30.2995 15.9713 30.2995 17.1694 29.1014L29.1014 17.1694C30.2995 15.9713 30.2995 14.0287 29.1014 12.8306L17.1694 0.898607C15.9713 -0.299535 14.0287 -0.299536 12.8306 0.898605L0.898607 12.8306ZM12.2855 12.2882C10.7879 13.7859 10.7879 16.2141 12.2855 17.7118C13.7832 19.2095 16.2115 19.2095 17.7092 17.7118C19.2068 16.2141 19.2068 13.7859 17.7092 12.2882C16.2115 10.7905 13.7832 10.7905 12.2855 12.2882Z"
      fill="#07998A"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="flex-shrink-0"
  >
    <path
      d="M13.3385 5L6.00521 12.3333L2.67188 9"
      stroke="#F7F8F8"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M12.9766 8.00391L9.44103 4.46837"
      stroke="#F7F8F8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.9766 8.00391L9.44103 11.5394"
      stroke="#F7F8F8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 8H13"
      stroke="#F7F8F8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface PlanFeatureProps {
  text: string;
}

const PlanFeature: React.FC<PlanFeatureProps> = ({ text }) => (
  <div className="flex items-start gap-2">
    <CheckIcon />
    <span className="text-app-white text-[14px] font-medium tracking-[-0.28px]">
      {text}
    </span>
  </div>
);

interface PlanCardProps {
  icon: React.ReactNode;
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonAction: () => void;
  isCurrentPlan?: boolean;
  isInactive?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  icon,
  name,
  price,
  description,
  features,
  buttonText,
  buttonAction,
  isCurrentPlan = false,
  isInactive = false,
}) => (
  <div
    className={cn(
      "flex w-full md:w-[285px] h-auto md:h-[512px] p-[16px] md:p-[24px] flex-col justify-between items-start rounded-app-md",
      isInactive ? "bg-[rgba(11,9,18,0.60)]" : "bg-[#393744]"
    )}
  >
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between w-full">
        {icon}
        {isCurrentPlan && (
          <span className="text-app-white bg-[rgba(247,248,248,0.1)] px-2 py-1 rounded-md">
            Current plan
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-3">
          <h3 className="text-app-white font-normal leading-[140%]">{name}</h3>
          <p className="text-app-white text-2xl font-medium leading-[125%] tracking-[-0.48px]">
            {price}
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="py-4 border border-l-0 border-r-0 border-t-app-stroke-dark border-b-app-stroke-dark">
            <p className="text-app-white text-[14px] font-medium tracking-[-0.28px]">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-app-white text-[14px] font-medium tracking-[-0.28px]">
          {name === "Starter"
            ? "Starter includes:"
            : name === "Pro"
            ? "Everything in Starter, plus:"
            : "Everything in Pro, plus:"}
        </p>
        <div className="space-y-2">
          {features.map((feature, index) => (
            <PlanFeature key={index} text={feature} />
          ))}
        </div>
      </div>
    </div>

    <Button
      onClick={buttonAction}
      className="py-3 px-4 rounded-app-sm flex items-center justify-center gap-2 bg-app-blue text-app-white hover:bg-app-blue/90"
    >
      {isCurrentPlan ? "Current Plan" : buttonText}
      {!isCurrentPlan && <ArrowIcon />}
    </Button>
  </div>
);

interface ChangePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
  onUpgrade: (plan: string) => void;
}

export function ChangePlanDialog({
  open,
  onOpenChange,
  currentPlan,
  onUpgrade,
}: ChangePlanDialogProps) {
  // Define plan levels for comparison
  const planLevels = {
    starter: 1,
    pro: 2,
    premium: 3,
  };

  // Helper function to determine button text based on current plan
  const getButtonText = (planName: string) => {
    if (currentPlan === planName.toLowerCase()) {
      return "Current Plan";
    }

    const currentLevel = planLevels[currentPlan as keyof typeof planLevels];
    const targetLevel =
      planLevels[planName.toLowerCase() as keyof typeof planLevels];

    if (targetLevel > currentLevel) {
      return `Upgrade to ${planName}`;
    } else {
      return `Downgrade to ${planName}`;
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="p-[24px] md:p-[60px] flex flex-col gap-[24px] md:gap-[40px] rounded-app-md border border-app-stroke-dark bg-[#222029] backdrop-blur-[35px]">
        <DialogClose className="absolute right-[24px] md:right-[60px] top-[24px] md:top-[60px] p-0 opacity-100 hover:opacity-80 focus:ring-0">
          <X className="h-6 w-6 text-app-white" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <div className="flex items-center">
          <h2 className="text-app-white text-[20px] font-medium leading-[130%] tracking-[-0.4px]">
            Change Plan
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center md:justify-between">
          <PlanCard
            icon={<StarterIcon />}
            name="Starter"
            price="Free"
            description="Just getting started? Try building your first app with AI."
            features={[
              "Use your own API keys",
              "Build frontend-only apps",
              "1 deployed app",
              "Watermark on deployed apps",
            ]}
            buttonText={getButtonText("Starter")}
            buttonAction={() => onUpgrade("starter")}
            isCurrentPlan={currentPlan === "starter"}
            isInactive={currentPlan !== "starter"}
          />

          <PlanCard
            icon={<ProIcon />}
            name="Pro"
            price="$49/month"
            description="For individuals and small teams ready to ship real products."
            features={[
              "Build full-stack apps (frontend + backend)",
              "Set up and connect a database",
              "Deploy apps without watermarks",
              "10M tokens included",
            ]}
            buttonText={getButtonText("Pro")}
            buttonAction={() => onUpgrade("pro")}
            isCurrentPlan={currentPlan === "pro"}
            isInactive={currentPlan !== "pro" && currentPlan !== "starter"}
          />

          <PlanCard
            icon={<PremiumIcon />}
            name="Premium"
            price="$89/month"
            description="More power, more projects, more room to grow."
            features={["20M tokens included"]}
            buttonText={getButtonText("Premium")}
            buttonAction={() => onUpgrade("premium")}
            isCurrentPlan={currentPlan === "premium"}
            isInactive={currentPlan === "starter" || currentPlan === "pro"}
          />
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
