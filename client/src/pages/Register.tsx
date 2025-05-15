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
import { X } from "lucide-react";
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" className="w-full rounded-lg bg-[#23222A] border border-[#23222A] text-white placeholder:text-[#7D7A8C] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" className="w-full rounded-lg bg-[#23222A] border border-[#23222A] text-white placeholder:text-[#7D7A8C] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a password"
                          className="w-full rounded-lg bg-[#23222A] border border-[#23222A] text-white placeholder:text-[#7D7A8C] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          className="w-full rounded-lg bg-[#23222A] border border-[#23222A] text-white placeholder:text-[#7D7A8C] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}