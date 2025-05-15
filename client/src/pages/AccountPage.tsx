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

export function AccountPage() {
  const [user, setUser] = useState<any>(null);
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
          description: error.message || "Failed to fetch user data",
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
      setUser((prevUser) => ({
        ...prevUser,
        email: newEmail,
      }));
      toast({
        title: "Success",
        description:
          response.message || "Email update confirmation has been sent",
      });
      setEmailChangeOpen(false);
      setNewEmail("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update email",
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
      });
      setPasswordChangeOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update password",
      });
    }
  };

  const handleReceiveUpdatesChange = async (checked: boolean) => {
    setReceiveUpdates(checked);
    try {
      const response = await updateEmailPreferences({
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
        description: error.message || "Failed to update email preferences",
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-geist">Account settings</h1>
        <p className="text-muted-foreground font-geist">Manage your connected domains</p>
      </div>

      {/* Personal Information Section */}
      <div className="border-b border-border pb-8 mb-4">
        <h2 className="text-lg font-semibold mb-4 font-geist">Personal information</h2>
        <div className="flex flex-col gap-2">
          <div>
            <span className="block text-sm text-muted-foreground font-geist">Full name</span>
            <span className="block text-base font-geist">{user?.name || "-"}</span>
          </div>
          <div>
            <span className="block text-sm text-muted-foreground font-geist">Email</span>
            <span className="block text-base font-geist">{user?.email || "-"}</span>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Dialog open={emailChangeOpen} onOpenChange={setEmailChangeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Change email</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#222029]">
              <DialogHeader>
                <DialogTitle className="font-geist">Change Email Address</DialogTitle>
                <DialogDescription className="font-geist">
                  Enter your new email address. A confirmation email will be sent to your current email address.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-email" className="font-geist">New Email</Label>
                  <Input
                    id="new-email"
                    placeholder="Enter new email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="cancel" onClick={() => setEmailChangeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEmailUpdate}>Request Change</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Password Section */}
      <div className="border-b border-border pb-8 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-geist">Password</span>
          <Dialog open={passwordChangeOpen} onOpenChange={setPasswordChangeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Change password</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#222029]">
              <DialogHeader>
                <DialogTitle className="font-geist">Change Password</DialogTitle>
                <DialogDescription className="font-geist">
                  Enter your current password and a new password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="font-geist">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="font-geist">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="font-geist">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="cancel" onClick={() => setPasswordChangeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePasswordUpdate}>Change Password</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Email Updates Section */}
      <div className="border-b border-border pb-8 mb-4 flex items-center justify-between">
        <span className="text-base font-geist">Receive updates via email</span>
        <Checkbox
          id="receive-updates"
          checked={receiveUpdates}
          onCheckedChange={handleReceiveUpdatesChange}
        />
      </div>

      {/* Change Plan Button (if needed) */}
      <div className="flex justify-end pt-4">
        <Button variant="default">Change plan</Button>
      </div>
    </div>
  );
}
