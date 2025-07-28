import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import BudgetPage from "./pages/BudgetPage";
import Upload from "./pages/Upload";
import NotFound from "./pages/NotFound";
import Signin from "./pages/Signin";
import Register from "./pages/Register";
import About from "./pages/About";
import Features from "./pages/Features";
import AIChatWidget from './components/AIChatWidget';
import { createContext, useContext, useEffect, useState } from "react";

const queryClient = new QueryClient();

// --- Auth Context ---
const AuthContext = createContext({
  user: null as null | { username: string; email?: string },
  token: null as null | string,
  login: (token: string, user: any) => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<null | { username: string; email?: string }>(null);
  const [token, setToken] = useState<null | string>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
  }, []);

  const login = (token: string, user: any) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Protected Route ---
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute><AppLayout><BudgetPage /></AppLayout></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><AppLayout><Upload /></AppLayout></ProtectedRoute>} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Profile Page</h1>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Settings Page</h1>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* Only show chatbot if authenticated */}
          {useAuth().token && <AIChatWidget />}
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
