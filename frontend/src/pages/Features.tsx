import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, PieChart, TrendingUp, Upload, Zap, Shield, BarChart3, Calculator, MessageSquare, FileText, Target, AlertCircle, CheckCircle, DollarSign, Calendar, CreditCard, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Upload,
      title: "Smart Receipt Processing",
      description: "Upload receipts and financial documents. Our AI automatically extracts and categorizes transaction data, saving you hours of manual entry.",
      benefits: ["OCR technology", "Automatic categorization", "Multi-format support", "Batch processing"]
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get intelligent recommendations based on your spending patterns. Our AI analyzes your financial behavior to provide personalized advice.",
      benefits: ["Spending pattern analysis", "Personalized recommendations", "Anomaly detection", "Smart alerts"]
    },
    {
      icon: BarChart3,
      title: "Comprehensive Analytics",
      description: "Visualize your financial health with beautiful charts and detailed breakdowns. Track trends, compare periods, and understand your spending habits.",
      benefits: ["Interactive charts", "Trend analysis", "Category breakdowns", "Export capabilities"]
    },
    {
      icon: Calculator,
      title: "Smart Budget Planning",
      description: "Create personalized budgets with AI recommendations. Set goals, track progress, and get notified when you're approaching limits.",
      benefits: ["AI budget suggestions", "Goal tracking", "Real-time monitoring", "Flexible categories"]
    },
    {
      icon: MessageSquare,
      title: "AI Chat Assistant",
      description: "Get instant answers to your financial questions. Our AI assistant can help with budgeting advice, spending analysis, and financial planning.",
      benefits: ["24/7 availability", "Contextual responses", "Financial guidance", "Natural language"]
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Your financial data is protected with enterprise-grade security. We use encryption and follow strict privacy protocols to keep your information safe.",
      benefits: ["End-to-end encryption", "GDPR compliance", "Regular security audits", "Data privacy controls"]
    }
  ];

  const additionalFeatures = [
    {
      icon: Target,
      title: "Goal Setting & Tracking",
      description: "Set financial goals and track your progress with visual indicators and milestone celebrations."
    },
    {
      icon: AlertCircle,
      title: "Smart Notifications",
      description: "Get alerts for unusual spending, budget limits, and important financial milestones."
    },
    {
      icon: Calendar,
      title: "Recurring Transactions",
      description: "Automatically categorize and track recurring payments like subscriptions and bills."
    },
    {
      icon: CreditCard,
      title: "Payment Method Tracking",
      description: "Track spending across different payment methods and cards for better financial oversight."
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Access your financial data anywhere with our fully responsive mobile-friendly interface."
    },
    {
      icon: FileText,
      title: "Export & Reporting",
      description: "Generate detailed reports and export your financial data in multiple formats for tax or analysis purposes."
    }
  ];

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
            Features
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Discover the powerful features that make SmartBudget your ultimate financial companion.
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 h-full">
                <CardHeader className="text-center">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">Additional Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="p-6">
                <CardHeader className="text-center">
                  <feature.icon className="h-10 w-10 text-primary mx-auto mb-3" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold text-center">Technology Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Frontend Technologies
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• React 18 with TypeScript</li>
                    <li>• Tailwind CSS for styling</li>
                    <li>• Radix UI for components</li>
                    <li>• React Router for navigation</li>
                    <li>• React Query for data fetching</li>
                    <li>• Lucide React for icons</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Backend Technologies
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Django REST Framework</li>
                    <li>• PostgreSQL/SQLite database</li>
                    <li>• AI/ML integration</li>
                    <li>• OCR with Tesseract</li>
                    <li>• JWT authentication</li>
                    <li>• CORS configuration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">Why Choose SmartBudget?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-green-500" />
                  Save Time & Money
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Automate tedious financial tasks and get insights that help you make better spending decisions, 
                  potentially saving hundreds or thousands of dollars annually.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                  Improve Financial Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Track your progress towards financial goals, identify spending patterns, and get 
                  personalized recommendations to improve your overall financial well-being.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-purple-500" />
                  Secure & Private
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Your financial data is protected with enterprise-grade security. We never share your 
                  information and you have complete control over your data.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-orange-500" />
                  AI-Powered Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Leverage advanced AI to get insights that would be impossible to discover manually. 
                  Our AI learns your patterns and provides increasingly accurate recommendations.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">Ready to Experience These Features?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users who are already taking advantage of SmartBudget's powerful features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/register')}>
              Start Free Trial
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

export default Features; 