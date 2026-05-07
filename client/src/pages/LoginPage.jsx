import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import AuthForm from "@/components/forms/AuthForm";
import Logo from "@/components/common/Logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await login(values);
      navigate(location.state?.from?.pathname || "/app/dashboard", {
        replace: true,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container grid min-h-screen items-center gap-10 py-8 md:py-10">
      {/* <div className="hidden lg:block">
        <div className="space-y-6 rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-ambient backdrop-blur-2xl light:border-slate-200 light:bg-white/80">
          <Logo />
          <div className="space-y-4">
            <h1 className="headline text-5xl font-semibold">Sign in to your workspace.</h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Use the email you verified during signup to access projects, tasks, and your profile.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Projects", "Track every workspace"],
              ["Tasks", "Assign and move work"],
              ["Profile", "Update avatar and details"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-white/10 bg-black/10 p-4 light:border-slate-200 light:bg-slate-900/5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      <Card className="mx-auto w-full max-w-xl">
        {/* Back Button */}
        

        <div className="flex justify-start items-center p-4">
          <Logo />
          <button
          onClick={() => navigate("/")}
          className="absolute right-4 top-4 flex  gap-2 text-slate-100 hover:text-white transition-all duration-300"
        >
          <ArrowLeft size={20} />
        </button>
        </div>
        <CardHeader>
          <CardTitle className="text-3xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your email and password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            mode="login"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
