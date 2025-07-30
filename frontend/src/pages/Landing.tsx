import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Brain, PieChart, TrendingUp, Upload, Zap } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              SmartBudget
            </span>
          </div>
          <div className="flex items-center space-x-8">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => navigate('/about')}>About</Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => navigate('/features')}>Features</Button>
            <Button variant="outline" onClick={() => navigate('/signin')}>Sign In</Button>
            <Button onClick={() => navigate('/register')}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-32 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-6xl font-light tracking-tight text-foreground">
            Smart Budget Management
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Intelligent financial insights through AI-powered expense tracking
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/register')}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/features')}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-4xl mx-auto">
          <div
            className="text-center space-y-4 cursor-pointer transition hover:shadow-lg hover:bg-primary/5 rounded-lg p-4"
            onClick={() => navigate('/features')}
            role="button"
            tabIndex={0}
            onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/features'); }}
          >
            <Upload className="h-8 w-8 text-primary mx-auto" />
            <h3 className="text-lg font-medium">Receipt Processing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Automatic data extraction from receipts and statements
            </p>
          </div>
          
          <div 
            className="text-center space-y-4 cursor-pointer transition hover:shadow-lg hover:bg-primary/5 rounded-lg p-4"
            onClick={() => navigate('/features')}
            role="button"
            tabIndex={0}
            onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/features'); }}
          >
            <Brain className="h-8 w-8 text-primary mx-auto" />
            <h3 className="text-lg font-medium">AI Insights</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Intelligent categorization and spending pattern analysis
            </p>
          </div>
          
          <div 
            className="text-center space-y-4 cursor-pointer transition hover:shadow-lg hover:bg-primary/5 rounded-lg p-4"
            onClick={() => navigate('/features')}
            role="button"
            tabIndex={0}
            onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/features'); }}
          >
            <TrendingUp className="h-8 w-8 text-primary mx-auto" />
            <h3 className="text-lg font-medium">Smart Budgets</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Personalized recommendations and financial guidance
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="bg-gradient-to-r from-primary to-primary-glow rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Finances?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are already taking control of their financial future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => navigate('/register')}
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/signin')}
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">SmartBudget</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <button onClick={() => navigate('/about')} className="hover:text-foreground">
                About
              </button>
              <button onClick={() => navigate('/features')} className="hover:text-foreground">
                Features
              </button>
              <button onClick={() => navigate('/signin')} className="hover:text-foreground">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;