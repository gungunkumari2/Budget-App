import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Brain, PieChart, TrendingUp, Upload, Zap } from "lucide-react";

const Landing = () => {
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
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              About
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Features
            </Button>
            <Button variant="outline">Sign In</Button>
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
          <Button size="lg" variant="outline" className="mt-12">
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <Upload className="h-8 w-8 text-primary mx-auto" />
            <h3 className="text-lg font-medium">Receipt Processing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Automatic data extraction from receipts and statements
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <Brain className="h-8 w-8 text-primary mx-auto" />
            <h3 className="text-lg font-medium">AI Insights</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Intelligent categorization and spending pattern analysis
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <TrendingUp className="h-8 w-8 text-primary mx-auto" />
            <h3 className="text-lg font-medium">Smart Budgets</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Personalized recommendations and financial guidance
            </p>
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
            <p className="text-sm text-muted-foreground">
              © 2024 SmartBudget. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;