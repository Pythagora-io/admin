import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { register as registerUser } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { AuthLayout } from "@/components/AuthLayout";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function Register() {
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    try {
      const response = await registerUser(
        values.name,
        values.email,
        values.password,
      );
      localStorage.setItem("accessToken", response.accessToken);
      setIsAuthenticated(true);
      navigate("/");

      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during registration",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <AuthLayout>
      <div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-heading-3 font-medium">Create an Account</h1>
          <p className="text-body-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* <div className="space-y-2">
              <Label htmlFor="name" className="text-body-sm">Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="Enter your name"
                  className={cn(
                    "bg-input placeholder:text-placeholder",
                    form.formState.errors.name ? "border-destructive" : ""
                  )}
                  {...form.register("name", { required: "Name is required" })}
                />
                {form.formState.errors.name && (
                  <div className="flex items-center gap-2 mt-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-caption-strong">{form.formState.errors.name.message}</span>
                  </div>
                )}
              </div>
            </div> */}

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
                    form.formState.errors.email ? "border-destructive" : "",
                  )}
                  {...form.register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Email is not valid. Try again.",
                    },
                  })}
                />
                {form.formState.errors.email && (
                  <div className="flex items-center gap-2 mt-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-caption-strong">
                      {form.formState.errors.email.message}
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
                  placeholder="Create a password"
                  className={cn(
                    "bg-input placeholder:text-placeholder pr-10",
                    form.formState.errors.password ? "border-destructive" : "",
                  )}
                  {...form.register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility("password")}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {form.formState.errors.password && (
                  <div className="flex items-center gap-2 mt-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-caption-strong">
                      {form.formState.errors.password.message}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-body-sm">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className={cn(
                    "bg-input placeholder:text-placeholder pr-10",
                    form.formState.errors.confirmPassword
                      ? "border-destructive"
                      : "",
                  )}
                  {...form.register("confirmPassword", {
                    required: "Please confirm your password",
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {form.formState.errors.confirmPassword && (
                  <div className="flex items-center gap-2 mt-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-caption-strong">
                      {form.formState.errors.confirmPassword.message}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full font-medium text-body-md bg-primary-foreground text-[hsl(252,82%,6%)] hover:bg-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
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
    </AuthLayout>
  );
}
