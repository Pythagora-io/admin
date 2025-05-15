import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/AuthLayout";
import { cn } from "@/lib/utils";

type LoginForm = {
  email: string;
  password: string;
};

export function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      toast({
        title: "Success",
        variant: "success",
        description: "Logged in successfully",
      });
      navigate("/");
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthLayout>
      <div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-heading-3 font-medium">Welcome to Pythagora</h1>
          <p className="text-body-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-foreground hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>

        <div className="">
          <div className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-body-sm">
                  Your email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={cn(
                      "bg-input placeholder:text-placeholder",
                      errors.email ? "border-destructive" : "",
                    )}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Email is not valid. Try again.",
                      },
                    })}
                  />
                  {errors.email && (
                    <div className="flex items-center gap-2 mt-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-caption-strong">
                        {errors.email.message}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-body-sm">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={cn(
                      "bg-input placeholder:text-placeholder pr-10",
                      errors.password ? "border-destructive" : "",
                    )}
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  {errors.password && (
                    <div className="flex items-center gap-2 mt-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-caption-strong">
                        {errors.password.message}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full font-medium text-body-md bg-primary-foreground text-[hsl(252,82%,6%)] hover:bg-primary-foreground"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
          </div>
          <div className="pt-6 flex justify-center">
            <p className="text-caption-strong text-muted-foreground text-center">
              By continuing, you agree to Pythagora's{" "}
              <a href="#" className="hover:underline">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
