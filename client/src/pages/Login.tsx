import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import { X, Eye, EyeOff } from "lucide-react";

// SVG imports
import PythagoraLogo from "@/assets/svg/pythagora-logo.svg";
import GoogleIcon from "@/assets/svg/social/google.svg";
import GithubIcon from "@/assets/svg/social/github.svg";

// Bleed image
import BleedImg from "@/assets/bleed.png";

type LoginForm = {
  email: string;
  password: string;
};

export function Login() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({ mode: "onChange" });
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
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
      <div className="relative z-20 w-full max-w-md flex flex-col items-center rounded-2xl bg-[rgba(24,21,35,0.80)] shadow-xl p-0 mx-auto mt-24 border border-[rgba(247,248,248,0.10)]" style={{ padding: '40px 32px' }}>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-center mb-3">Welcome to Pythagora</h1>
            <p className="text-center text-muted-foreground mb-8" style={{ color: 'rgba(255, 255, 255, 0.50)', fontFamily: 'Geist', fontSize: '14px', fontStyle: 'normal', fontWeight: '400', lineHeight: '130%', letterSpacing: '-0.28px' }}>
              Don&apos;t have an account?{' '}
              <button
                className="text-primary underline underline-offset-2 hover:text-primary/80"
                type="button"
                onClick={() => navigate("/register")}
                style={{ color: '#F7F8F8', fontFamily: 'Geist', fontSize: '14px', fontStyle: 'normal', fontWeight: '400', lineHeight: '130%', letterSpacing: '-0.28px' }}
              >
                Sign up for free
              </button>
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Your email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email..."
                  className="w-full rounded-lg bg-[#23222A] border border-[#23222A] text-white placeholder:text-[#7D7A8C] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  {...register("email", { required: true })}
                  disabled={loading}
                />
                {errors.email && <span className="text-xs text-red-500">Email is required</span>}
              </div>
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">Password</label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password..."
                  className="w-full rounded-lg bg-[#23222A] border border-[#23222A] text-white placeholder:text-[#7D7A8C] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                  {...register("password", { required: true })}
                  disabled={loading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7D7A8C] hover:text-[#F7F8F8] focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.password && <span className="text-xs text-red-500">Password is required</span>}
              </div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-[#7D7A8C]">Forgot your password?</span>
                <button
                  type="button"
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                  onClick={() => navigate("/reset-password")}
                >
                  Reset your password
                </button>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg py-3 font-medium transition-colors duration-150 text-black"
                style={{
                  background: isValid ? "#3057E1" : "#F7F8F8",
                  color: isValid ? "#fff" : "#222029",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                disabled={loading || !isValid}
              >
                Sign in
              </button>
              {/* Commented out OR divider and social logins
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-[#23222A]" />
                <span className="mx-4 text-[#7D7A8C] text-xs">OR</span>
                <div className="flex-grow border-t border-[#23222A]" />
              </div>
              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-lg py-3 px-4 bg-[#F7F8F8] text-[#222029] font-medium mb-3 border border-[#E6E6E6] hover:bg-[#ececec] transition-colors"
                onClick={() => toast({ title: "Google login not implemented" })}
                disabled={loading}
              >
                <img src={GoogleIcon} alt="Google" className="h-5 w-5" />
                Continue with Google
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-lg py-3 px-4 bg-[#F7F8F8] text-[#222029] font-medium border border-[#E6E6E6] hover:bg-[#ececec] transition-colors"
                onClick={() => toast({ title: "GitHub login not implemented" })}
                disabled={loading}
              >
                <img src={GithubIcon} alt="GitHub" className="h-5 w-5" />
                Continue with GitHub
              </button>
              */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
