import React, { useState } from "react";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { CustomDialogContent } from "./CustomDialogContent";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopUpOptionProps {
  price: string;
  tokens: string;
  selected: boolean;
  onClick: () => void;
}

const TopUpOption: React.FC<TopUpOptionProps> = ({
  price,
  tokens,
  selected,
  onClick,
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center p-[24px] rounded-app-md cursor-pointer transition-colors border border-app-stroke-dark",
      selected ? "bg-app-highlight-dark" : ""
    )}
    onClick={onClick}
  >
    <p className="text-app-white text-2xl font-medium leading-[125%] tracking-[-0.48px]">
      ${price}
    </p>
    <p className="text-app-white text-[14px] font-medium tracking-[-0.28px]">
      {tokens} tokens
    </p>
  </div>
);

interface TopUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTopUp: (amount: number) => void;
}

export function TopUpDialog({ open, onOpenChange, onTopUp }: TopUpDialogProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);

  const topUpOptions = [
    { price: "50", tokens: "10M" },
    { price: "100", tokens: "20M" },
    { price: "200", tokens: "40M" },
    { price: "500", tokens: "200M" },
    { price: "1,000", tokens: "300M" },
  ];

  const handleTopUp = () => {
    if (selectedAmount !== null) {
      onTopUp(selectedAmount);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="p-[32px] flex flex-col gap-[40px] rounded-app-md border border-app-stroke-dark bg-[#222029] backdrop-blur-[35px] w-full md:w-[500px]">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h2 className="text-app-white text-[20px] font-medium leading-[130%] tracking-[-0.4px]">
              Top up Pythagora
            </h2>
            <DialogClose className="ml-6 p-0 opacity-100 hover:opacity-80 focus:ring-0">
              <X className="h-6 w-6 text-app-white" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
          <p className="text-app-white text-[14px] font-medium tracking-[-0.28px]">
            Choose a one-time token top up or upgrade your plan.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-[16px]">
          {topUpOptions.slice(0, 4).map((option, index) => (
            <TopUpOption
              key={index}
              price={option.price}
              tokens={option.tokens}
              selected={
                selectedAmount === Number(option.price.replace(",", ""))
              }
              onClick={() =>
                setSelectedAmount(Number(option.price.replace(",", "")))
              }
            />
          ))}
          <div className="col-span-2 md:col-span-1">
            <TopUpOption
              price={topUpOptions[4].price}
              tokens={topUpOptions[4].tokens}
              selected={
                selectedAmount ===
                Number(topUpOptions[4].price.replace(",", ""))
              }
              onClick={() =>
                setSelectedAmount(
                  Number(topUpOptions[4].price.replace(",", ""))
                )
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            className="py-3 px-4 rounded-app-sm border-none text-app-white bg-transparent hover:bg-transparent hover:text-app-white hover:opacity-80"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="py-3 px-4 rounded-app-sm bg-app-blue text-app-white hover:bg-app-blue/90"
            onClick={handleTopUp}
            disabled={selectedAmount === null}
          >
            Save changes
          </Button>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
