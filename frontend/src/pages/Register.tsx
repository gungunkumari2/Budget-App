import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Brain } from "lucide-react";
import axios from "axios";
import { useAuth } from "../App"; // Import useAuth context

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from AuthContext
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // Register user and get JWT token in one request
      const response = await axios.post("http://localhost:8000/api/upload-receipt/register/", {
        username: form.username,
        email: form.email,
        password: form.password
      });
      
      if (response.data.access) {
        login(response.data.access, { 
          username: form.username,
          email: form.email 
        });
        navigate("/dashboard");
      } else {
        setError("Registration successful but no token received");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.response?.data?.error || "Registration failed");
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
          <CardTitle className="text-2xl font-semibold text-center w-full">Create Account</CardTitle>
          <CardDescription className="text-center w-full mt-1">Sign up to start managing your budget</CardDescription>
        </div>
        <CardContent className="p-0">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input name="username" type="text" placeholder="Username" required className="h-12 text-base" value={form.username} onChange={handleChange} />
            <Input name="email" type="email" placeholder="Email address" required className="h-12 text-base" value={form.email} onChange={handleChange} />
            <Input name="password" type="password" placeholder="Password" required className="h-12 text-base" value={form.password} onChange={handleChange} />
            <Input name="confirm" type="password" placeholder="Confirm Password" required className="h-12 text-base" value={form.confirm} onChange={handleChange} />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full h-12 text-base font-semibold shadow-md" size="lg" disabled={loading}>{loading ? 'Registering...' : 'Create Account'}</Button>
          </form>
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-muted" />
            <span className="mx-4 text-muted-foreground text-xs">or</span>
            <div className="flex-grow border-t border-muted" />
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button 
                onClick={() => navigate('/signin')}
                className="text-primary hover:underline focus:outline-none"
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register; 