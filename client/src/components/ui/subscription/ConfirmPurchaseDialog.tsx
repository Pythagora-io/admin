import React from "react";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { CustomDialogContent } from "./CustomDialogContent";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ConfirmPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  tokens: number;
  onConfirm: () => void;
}

export function ConfirmPurchaseDialog({
  open,
  onOpenChange,
  amount,
  tokens,
  onConfirm,
}: ConfirmPurchaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="p-app-8 flex flex-col gap-app-10 rounded-app-md border border-app-stroke-dark bg-app-window-blur backdrop-blur-app w-full md:w-[500px]">
        <div className="flex justify-between items-start">
          <h2 className="text-app-white text-xl font-medium leading-[130%] tracking-app-title">
            Confirm Token Purchase
          </h2>
          <DialogClose className="ml-6 p-0 opacity-100 hover:opacity-80 focus:ring-0">
            <X className="h-6 w-6 text-app-white" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <p className="text-app-white text-base tracking-app-body">
          Are you sure you want to purchase {tokens.toLocaleString()} tokens for ${amount}? Your payment method on file will be charged immediately.
        </p>

        <div className="flex justify-end gap-app-4">
          <Button
            variant="outline"
            className="py-app-3 px-app-4 rounded-app-sm border-none text-app-white bg-transparent hover:bg-transparent hover:text-app-white hover:opacity-80"
            onClick={() => onOpenChange(false)}
          >
            Back
          </Button>
          <Button
            className="py-app-3 px-app-4 rounded-app-sm bg-app-blue text-app-white hover:bg-app-blue/90"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Confirm Purchase
          </Button>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
