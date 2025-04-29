import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getCurrentUser, updateUserEmail, updateUserName, updateUserPassword } from "@/api/user";

export function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nameChangeLoading, setNameChangeLoading] = useState(false);
  const [emailChangeOpen, setEmailChangeOpen] = useState(false);
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { user } = await getCurrentUser();
        setUser(user);
        setNewName(user.name || "");
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

  const handleNameUpdate = async () => {
    if (!newName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Name cannot be empty",
      });
      return;
    }

    try {
      setNameChangeLoading(true);
      const response = await updateUserName({ name: newName });
      setUser({ ...user, name: newName });
      toast({
        title: "Success",
        description: response.message || "Name updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update name",
      });
    } finally {
      setNameChangeLoading(false);
    }
  };

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
      toast({
        title: "Success",
        description: response.message || "Email update confirmation has been sent",
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
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account details and password</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2">
              <Input id="email" value={user.email} readOnly className="flex-1" />
              <Dialog open={emailChangeOpen} onOpenChange={setEmailChangeOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Change Email</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Email Address</DialogTitle>
                    <DialogDescription>
                      Enter your new email address. A confirmation email will be sent to your current email address.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-email">New Email</Label>
                      <Input
                        id="new-email"
                        placeholder="Enter new email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEmailChangeOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEmailUpdate}>Request Change</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="flex items-center gap-2">
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleNameUpdate} disabled={nameChangeLoading}>
                {nameChangeLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={passwordChangeOpen} onOpenChange={setPasswordChangeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Change Password</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and a new password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
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
                <Button variant="outline" onClick={() => setPasswordChangeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePasswordUpdate}>Update Password</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}