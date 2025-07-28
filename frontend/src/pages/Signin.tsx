import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Brain } from "lucide-react";
import axios from "axios";
import { useAuth } from "../App";

const Signin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/upload-receipt/login/", {
        email: form.email,
        password: form.password
      });

      if (response.data.access) {
        login(response.data.access, { 
          username: response.data.user.username,
          email: response.data.user.email 
        }); // Store access token
        // Redirect to the page they were trying to access, or dashboard
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        setError("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Please check your connection.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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
            <Input 
              name="email"
              type="email" 
              placeholder="Email address" 
              required 
              className="h-12 text-base" 
              value={form.email}
              onChange={handleChange}
            />
            <Input 
              name="password"
              type="password" 
              placeholder="Password" 
              required 
              className="h-12 text-base" 
              value={form.password}
              onChange={handleChange}
            />
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
            <div className="flex justify-end">
              <button type="button" className="text-sm text-primary hover:underline focus:outline-none">Forgot password?</button>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold shadow-md" 
              size="lg"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-muted" />
            <span className="mx-4 text-muted-foreground text-xs">or</span>
            <div className="flex-grow border-t border-muted" />
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button 
                onClick={() => navigate('/register')}
                className="text-primary hover:underline focus:outline-none"
              >
                Sign up
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signin; 