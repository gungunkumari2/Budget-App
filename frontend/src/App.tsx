import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import BudgetPage from "./pages/BudgetPage";
import Upload from "./pages/Upload";
import NotFound from "./pages/NotFound";
import Signin from "./pages/Signin";
import AIChatWidget from './components/AIChatWidget';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Landing />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/budget" element={<AppLayout><BudgetPage /></AppLayout>} />
          <Route path="/upload" element={<AppLayout><Upload /></AppLayout>} />
          <Route
            path="/profile"
            element={
              <AppLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Profile Page</h1>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              </AppLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <AppLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Settings Page</h1>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              </AppLayout>
            }
          />
          <Route path="/signin" element={<Signin />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIChatWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
