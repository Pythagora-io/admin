import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { register as registerUser } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { X, Eye, EyeOff } from "lucide-react";
import PythagoraLogo from "@/assets/svg/pythagora-logo.svg";
import BleedImg from "@/assets/bleed.png";

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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Bleed background image */}
      <img
        src={BleedImg}
        alt="bleed background"
        className="pointer-events-none select-none fixed bottom-0 left-0 w-full max-h-[40vh] object-cover z-0"
        style={{ objectFit: "cover" }}
      />
      {/* Blurred area */}
      <div className="fixed inset-0 m-4 rounded-2xl bg-[#111016CC] backdrop-blur-lg z-10 border" style={{ borderColor: '#F7F8F81A', borderWidth: 1 }}>
        {/* Logo and X icon at top inside blurred area */}
        <div className="absolute top-0 left-0 w-full flex items-center justify-between p-8">
          <img src={PythagoraLogo} alt="Pythagora Logo" className="h-8 w-auto" />
          <X className="h-7 w-7 text-white opacity-70 cursor-default" />
        </div>
      </div>
      {/* Modal/Dialog with form */}
      <div className="relative z-20 w-full max-w-md flex flex-col items-center rounded-2xl bg-[rgba(24,21,35,0.80)] shadow-xl p-0 mx-auto my-auto border border-[rgba(247,248,248,0.10)]" style={{ padding: '20px 32px' }}>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-center mb-3">Create an account</h1>
            <p className="text-center text-muted-foreground mb-8" style={{ color: 'rgba(255, 255, 255, 0.50)', fontFamily: 'Geist', fontSize: '14px', fontStyle: 'normal', fontWeight: '400', lineHeight: '130%', letterSpacing: '-0.28px' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
                style={{ color: '#F7F8F8', fontFamily: 'Geist', fontSize: '14px', fontStyle: 'normal', fontWeight: '400', lineHeight: '130%', letterSpacing: '-0.28px' }}
              >
                Sign in
              </Link>
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">Your name</label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your name..."
                    className="w-full rounded-lg bg-[#23222A] border border-[#23222A] text-white placeholder:text-[#7D7A8C] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    {...form.register("name", { required: true })}
                    disabled={isLoading}
                  />
                  {form.formState.errors.name && <span className="text-xs text-red-500">Name is required</span>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Your email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email..."
                    className="w-full rounded-lg bg-[#23222A] border border-[#23222A] text-white placeholder:text-[#7D7A8C] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    {...form.register("email", { required: true })}
                    disabled={isLoading}
                  />
                  {form.formState.errors.email && <span className="text-xs text-red-500">Email is required</span>}
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">Password</label>
                  <div className="flex items-center relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Enter your password..."
                      className="w-full rounded-lg bg-[#23222A] border border-[#23222A] text-white placeholder:text-[#7D7A8C] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                      {...form.register("password", { required: true })}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 text-[#7D7A8C] hover:text-[#F7F8F8] focus:outline-none flex items-center justify-center"
                      style={{ height: '100%' }}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {form.formState.errors.password && <span className="text-xs text-red-500">Password is required</span>}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                  <div className="flex items-center relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Confirm your password..."
                      className="w-full rounded-lg bg-[#23222A] border border-[#23222A] text-white placeholder:text-[#7D7A8C] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                      {...form.register("confirmPassword", { required: true })}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 text-[#7D7A8C] hover:text-[#F7F8F8] focus:outline-none flex items-center justify-center"
                      style={{ height: '100%' }}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && <span className="text-xs text-red-500">{form.formState.errors.confirmPassword.message || 'Please confirm your password'}</span>}
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg py-3 font-medium transition-colors duration-150 text-black"
                  style={{
                    background: form.formState.isValid ? "#3057E1" : "#F7F8F8",
                    color: form.formState.isValid ? "#fff" : "#222029",
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                  disabled={isLoading || !form.formState.isValid}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}