import { AlertCircle } from "lucide-react";

interface TokenAlertProps {
  message: string;
}

export function TokenAlert({ message }: TokenAlertProps) {
  return (
    <div className="flex items-center gap-app-2 py-3 px-4 mb-app-6 rounded-app-sm bg-app-red/10 ">
      <AlertCircle className="h-5 w-5 text-app-red flex-shrink-0" />
      <p className="text-app-red text-sm tracking-app-body">{message}</p>
    </div>
  );
}
