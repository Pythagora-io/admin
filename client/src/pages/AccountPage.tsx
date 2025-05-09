import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getCurrentUser,
  updateUserEmail,
  updateUserPassword,
  updateEmailPreferences,
} from "@/api/user";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface User {
  id: string;
  name?: string;
  email?: string;
  receiveUpdates?: boolean;
  // Add other user properties as needed
}

export function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailChangeOpen, setEmailChangeOpen] = useState(false);
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { user } = await getCurrentUser();
        setUser(user);
        setReceiveUpdates(user.receiveUpdates || false);
      } catch (error) {
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

  const handleEmailUpdate = async () => {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address",
      });
      return;
    }

    try {
      const response = await updateUserEmail({ email: newEmail });
      // Update the user state with the new email
      setUser((prevUser: User | null) => ({
        ...(prevUser as User),
        email: newEmail,
      }));
      toast({
        title: "Success",
        description:
          response.message || "Email update confirmation has been sent",
        className:
          "bg-success border-border text-toast-success-text p-5 rounded-lg",
      });
      setEmailChangeOpen(false);
      setNewEmail("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update email",
      });
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All password fields are required",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords do not match",
      });
      return;
    }

    try {
      const response = await updateUserPassword({
        currentPassword,
        newPassword,
      });
      toast({
        title: "Success",
        description: response.message || "Password updated successfully",
        className:
          "bg-success border-border text-toast-success-text p-5 rounded-lg",
      });
      setPasswordChangeOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update password",
      });
    }
  };

  const handleReceiveUpdatesChange = async (checked: boolean) => {
    setReceiveUpdates(checked);
    try {
      await updateEmailPreferences({
        receiveUpdates: checked,
      });
      toast({
        title: "Preference Updated",
        description: checked
          ? "You will now receive email updates"
          : "You will no longer receive email updates",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update email preferences",
      });
      // Revert the UI state if the API call fails
      setReceiveUpdates(!checked);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
          Manage your connected domains
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <h2 className="text-body-lg-medium">Personal information</h2>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
          <div className="flex-grow flex flex-col gap-3">
            <p className="text-body-md opacity-60">Full name</p>
            <p className="text-body-sm tracking-wide">{user?.name || "N/A"}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-4">
          <div className="flex-grow flex flex-col gap-3">
            <p className="text-body-md opacity-60">Email</p>
            <p className="text-body-sm tracking-wide">
              {user?.email || "Loading..."}
            </p>
          </div>
          <Dialog open={emailChangeOpen} onOpenChange={setEmailChangeOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-border rounded-lg px-3 py-2 text-body-md w-full sm:w-auto"
                aria-label="Change email address"
              >
                Change email
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-none rounded-2xl p-8 w-[90%] sm:w-[500px]">
              <DialogHeader className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <DialogTitle className="text-xl font-medium text-foreground">
                    Change Email Address
                  </DialogTitle>
                </div>
                <DialogDescription className="text-sm text-foreground/60 text-left">
                  Enter your new email address. A confirmation email will be
                  sent to your current email address.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-0">
                <div className="space-y-2">
                  <Label
                    htmlFor="new-email"
                    className="text-sm font-medium text-foreground"
                  >
                    New Email
                  </Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="Enter new email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="bg-foreground/10 border border-border rounded-lg p-4 placeholder:text-foreground/60 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
              <DialogFooter className="mt-6 sm:justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setEmailChangeOpen(false)}
                  aria-label="Cancel email change"
                  className="rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-foreground/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEmailUpdate}
                  aria-label="Request email change"
                  className="bg-primary text-primary-foreground rounded-lg px-4 py-3 text-sm font-medium hover:bg-primary/90"
                >
                  Request Change
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator />

      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
          <h2 className="text-body-lg-medium flex-grow">Password</h2>
          <Dialog
            open={passwordChangeOpen}
            onOpenChange={setPasswordChangeOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-border rounded-lg px-3 py-2 text-body-md w-full sm:w-auto"
                aria-label="Change password"
              >
                Change password
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-none rounded-2xl p-8 w-[90%] sm:w-[500px]">
              <DialogHeader className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <DialogTitle className="text-xl font-medium text-foreground">
                    Change Password
                  </DialogTitle>
                </div>
                <DialogDescription className="text-sm text-foreground/60 text-left">
                  Enter your current password and a new password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-8 py-0">
                <div className="space-y-2">
                  <Label
                    htmlFor="current-password"
                    className="text-sm font-medium text-foreground"
                  >
                    Current Password
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-foreground/10 border border-border rounded-lg p-4 placeholder:text-foreground/60 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="new-password"
                    className="text-sm font-medium text-foreground"
                  >
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-foreground/10 border border-border rounded-lg p-4 placeholder:text-foreground/60 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirm-password"
                    className="text-sm font-medium text-foreground"
                  >
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-foreground/10 border border-border rounded-lg p-4 placeholder:text-foreground/60 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
              <DialogFooter className="mt-6 sm:justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setPasswordChangeOpen(false)}
                  aria-label="Cancel password change"
                  className="rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-foreground/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePasswordUpdate}
                  aria-label="Update password"
                  className="bg-primary text-primary-foreground rounded-lg px-4 py-3 text-sm font-medium hover:bg-primary/90"
                >
                  Update Password
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between items-center">
        <Label
          htmlFor="receive-updates"
          className="text-body-lg-medium cursor-pointer"
        >
          Receive updates via email
        </Label>
        <Checkbox
          id="receive-updates"
          className="data-[state=checked]:bg-primary border-white"
          checked={receiveUpdates}
          onCheckedChange={handleReceiveUpdatesChange}
          aria-label="Toggle email updates"
        />
      </div>
      <Separator />
    </div>
  );
}
