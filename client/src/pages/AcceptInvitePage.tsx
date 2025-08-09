import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { acceptInvite } from "@/api/organizations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [membership, setMembership] = useState<any>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    console.log('AcceptInvitePage: Component mounted, checking auth and token');
    
    if (!token) {
      console.log('AcceptInvitePage: No token found in URL');
      setError('Invalid invitation link. Token is missing.');
      return;
    }

    // Check if user is authenticated
    const initializeAuth = async () => {
      setIsLoading(true);
      console.log('AcceptInvitePage: Checking authentication status');
      
      try {
        const isAuth = await checkAuthStatus();
        if (!isAuth) {
          console.log('AcceptInvitePage: User not authenticated, redirecting to login');
          toast({
            title: "Authentication Required",
            description: "Please log in to accept the invitation.",
            variant: "default"
          });
          return;
        }
        
        console.log('AcceptInvitePage: User authenticated, ready to process invitation');
      } catch (error) {
        console.error('AcceptInvitePage: Auth check failed:', error);
        setError('Failed to verify authentication status');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [token, checkAuthStatus, toast]);

  const handleAcceptInvitation = async () => {
    if (!token) {
      setError('Invalid invitation token');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('AcceptInvitePage: Accepting invitation');
      const result = await acceptInvite(token);
      
      if (result.success) {
        console.log('AcceptInvitePage: Invitation accepted successfully');
        setSuccess(true);
        setMembership(result.membership);
        
        toast({
          title: "Invitation Accepted",
          description: result.message || "You have successfully joined the organization!",
          variant: "default"
        });

        // Redirect to team page after 3 seconds
        setTimeout(() => {
          navigate('/team');
        }, 3000);
      } else {
        console.log('AcceptInvitePage: Failed to accept invitation:', result.error);
        setError(result.error || 'Failed to accept invitation');
      }
    } catch (error) {
      console.error('AcceptInvitePage: Error accepting invitation:', error);
      setError(error.message || 'An unexpected error occurred');
      toast({
        title: "Error",
        description: error.message || 'Failed to accept invitation',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToTeam = () => {
    navigate('/team');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Verifying authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              You need to be logged in to accept this invitation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Invalid Invitation
            </CardTitle>
            <CardDescription>
              This invitation link is invalid or expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Invitation Accepted!
            </CardTitle>
            <CardDescription>
              You have successfully joined the organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {membership && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">Organization Details</h4>
                <p className="text-sm text-muted-foreground">
                  Organization: {membership.organizationName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Role: {membership.role}
                </p>
              </div>
            )}
            <Alert>
              <AlertDescription>
                You will be redirected to the team page in a few seconds...
              </AlertDescription>
            </Alert>
            <Button onClick={handleGoToTeam} className="w-full">
              Go to Team Page Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Organization Invitation</CardTitle>
          <CardDescription>
            You have been invited to join an organization. Click the button below to accept the invitation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={handleAcceptInvitation}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}