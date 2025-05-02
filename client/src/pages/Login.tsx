import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { login } from "@/api/auth"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/useToast"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
})

export function Login() {
  const { setIsAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    try {
      const response = await login(values.email, values.password)
      localStorage.setItem("accessToken", response.accessToken)
      localStorage.setItem("refreshToken", response.refreshToken)
      setIsAuthenticated(true)
      navigate("/")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid email or password",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
      {/* Background image with blur */}
      <div 
        className="fixed inset-0 w-[95%] h-[95%] m-auto -z-10 bg-cover bg-center rounded-xl"
        style={{ 
          backgroundImage: "url('/images/abstract-bg.jpg')",
          filter: "blur(8px)",
          opacity: 0.15
        }}
      ></div>

      <div className="w-full max-w-md space-y-8 mx-auto">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2.00001 17.5228 6.47716 22 12 22Z" fill="currentColor" fillOpacity="0.2" />
              <path d="M15.5 9C15.5 11.2091 13.7091 13 11.5 13H9V9C9 6.79086 10.7909 5 13 5C15.2091 5 15.5 6.79086 15.5 9Z" fill="currentColor" />
              <path d="M9 13H11.5C13.7091 13 15.5 14.7909 15.5 17C15.5 19.2091 13.2091 20 11 20C8.79086 20 9 18.2091 9 16V13Z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Welcome to Pythagora</h1>
          <p className="text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        <div className="bg-card border rounded-xl shadow-sm p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
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
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <p>
              Don't have an account?{" "}
              <Link
                to="/register"
                className="underline underline-offset-4 hover:text-primary"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}