import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import BudgetPage from "./pages/BudgetPage";
import ExpensesPage from "./pages/Expenses";
import Upload from "./pages/Upload";
import NotFound from "./pages/NotFound";
import Signin from "./pages/Signin";
import Register from "./pages/Register";
import About from "./pages/About";
import Features from "./pages/Features";
import DataTest from "./components/DataTest";
import ApiTest from "./components/ApiTest";
import AIChatWidget from './components/AIChatWidget';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            {/* Public Pages - Always accessible */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Dashboard Routes - Require authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AppLayout>
                  <Analytics />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/budget" element={
              <ProtectedRoute>
                <AppLayout>
                  <BudgetPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute>
                <AppLayout>
                  <ExpensesPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <AppLayout>
                  <Upload />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/test" element={
              <ProtectedRoute>
                <AppLayout>
                  <DataTest />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/api-test" element={
              <ProtectedRoute>
                <AppLayout>
                  <ApiTest />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Profile Page</h1>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Settings Page</h1>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Only show chatbot if authenticated */}
          <AuthenticatedChatWidget />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

// Component to conditionally render chat widget
const AuthenticatedChatWidget = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AIChatWidget /> : null;
};

export default App;
