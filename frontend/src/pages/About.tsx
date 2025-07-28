import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, PieChart, TrendingUp, Upload, Zap, Shield, BarChart3, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

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
          <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl font-light tracking-tight text-foreground">
            About SmartBudget
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Your intelligent financial companion designed to make managing your money effortless, insightful, and secure.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold text-center">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-muted-foreground leading-relaxed">
              <p className="mb-6">
                SmartBudget was created with a simple yet powerful vision: to democratize financial intelligence. 
                We believe that everyone deserves access to sophisticated financial tools that can help them make 
                better decisions about their money.
              </p>
              <p>
                By combining cutting-edge AI technology with intuitive design, we've built a platform that 
                transforms complex financial data into actionable insights, making budgeting and expense tracking 
                not just easier, but genuinely enjoyable.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardHeader className="text-center">
                <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Smart Document Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Automatically extract and categorize financial data from receipts, bank statements, 
                  and other documents using advanced OCR and AI technology.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="text-center">
                <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get intelligent recommendations and spending pattern analysis to help you make 
                  better financial decisions and achieve your goals.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="text-center">
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Comprehensive Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Visualize your financial health with beautiful charts, trends, and detailed 
                  breakdowns of your spending habits.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="text-center">
                <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Smart Budget Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Create personalized budgets with AI recommendations and track your progress 
                  towards financial goals in real-time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Security & Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Your financial data is protected with enterprise-grade security and privacy 
                  controls. Your information stays yours.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="text-center">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Real-Time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get instant updates and notifications about your spending, budget status, 
                  and financial insights as they happen.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold text-center">Technology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Frontend</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• React with TypeScript for type safety</li>
                    <li>• Tailwind CSS for modern, responsive design</li>
                    <li>• Radix UI components for accessibility</li>
                    <li>• React Router for seamless navigation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Backend</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Django REST Framework for robust APIs</li>
                    <li>• PostgreSQL/SQLite for data persistence</li>
                    <li>• AI/ML integration for smart insights</li>
                    <li>• OCR technology for document processing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users who are already taking control of their finances with SmartBudget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/register')}>
              Create Free Account
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/signin')}>
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
            <p className="text-sm text-muted-foreground">
              © 2024 SmartBudget. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About; 