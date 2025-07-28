import { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import { getCurrentUser } from "@/api/user";
import { Separator } from "@/components/ui/separator";

interface User {
  id: string;
  name?: string;
  email?: string;
  receiveUpdates?: boolean;
}

export function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("AccountPage: Fetching user data");
        const userData = getCurrentUser(); // getCurrentUser returns user data directly, not a promise
        console.log("AccountPage: User response", userData);

        if (userData) {
          setUser(userData);
          console.log("AccountPage: User data set successfully", userData);
        } else {
          console.log("AccountPage: No user data received");
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Unable to retrieve user information. Please log in again.",
          });
        }
      } catch (error) {
        console.error("AccountPage: Error fetching user data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch user data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to view your account information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-10 text-foreground">
      <div>
        <h1 className="text-heading-3 text-foreground tracking-wide">
          Account settings
        </h1>
        <p className="text-body-sm text-foreground/60">
          View your account information
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <h2 className="text-body-lg-medium">Personal information</h2>

        <div className="flex flex-col gap-3">
          <p className="text-body-md opacity-60">Full name</p>
          <p className="text-body-sm tracking-wide">{user?.name || "N/A"}</p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-body-md opacity-60">Email</p>
          <p className="text-body-sm tracking-wide">
            {user?.email || "N/A"}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-body-md opacity-60">Email Updates</p>
          <p className="text-body-sm tracking-wide">
            {user?.receiveUpdates ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>

      <Separator />
    </div>
  );
}