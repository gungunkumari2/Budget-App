import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";

const Signin = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally validate credentials
    navigate("/dashboard"); // Redirect to dashboard after sign in
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/10 to-secondary/20">
      <Card className="w-full max-w-md p-8 shadow-xl rounded-2xl border-0 bg-white/90 backdrop-blur-md">
        <div className="flex flex-col items-center mb-6">
          <span className="flex items-center gap-2 mb-2">
            <Brain className="h-8 w-8 text-primary drop-shadow" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">SmartBudget</span>
          </span>
          <CardTitle className="text-2xl font-semibold text-center w-full">Sign In</CardTitle>
          <CardDescription className="text-center w-full mt-1">Welcome back! Please sign in to your account</CardDescription>
        </div>
        <CardContent className="p-0">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input type="email" placeholder="Email address" required className="h-12 text-base" />
            <Input type="password" placeholder="Password" required className="h-12 text-base" />
            <div className="flex justify-end">
              <button type="button" className="text-sm text-primary hover:underline focus:outline-none">Forgot password?</button>
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold shadow-md" size="lg">Sign In</Button>
          </form>
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-muted" />
            <span className="mx-4 text-muted-foreground text-xs">or</span>
            <div className="flex-grow border-t border-muted" />
          </div>
          {/* Social login buttons can be added here in the future */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Signin; 