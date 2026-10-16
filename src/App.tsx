import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import Deposito from "./pages/Deposito";
import Saque from "./pages/Saque";
import Planos from "./pages/Planos";
import Suporte from "./pages/Suporte";
import CheckIn from "./pages/CheckIn";
import Indicacao from "./pages/Indicacao";
import SobreNos from "./pages/SobreNos";
import Privacidade from "./pages/Privacidade";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen w-full bg-background flex justify-center">
            <div className="relative w-full max-w-[480px] bg-background md:border-x md:border-border md:shadow-sm">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
                <Route path="/deposito" element={<ProtectedRoute><Deposito /></ProtectedRoute>} />
                <Route path="/saque" element={<ProtectedRoute><Saque /></ProtectedRoute>} />
                <Route path="/planos" element={<ProtectedRoute><Planos /></ProtectedRoute>} />
                <Route path="/indicacao" element={<ProtectedRoute><Indicacao /></ProtectedRoute>} />
                <Route path="/suporte" element={<ProtectedRoute><Suporte /></ProtectedRoute>} />
                <Route path="/checkin" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
                <Route path="/sobre-nos" element={<ProtectedRoute><SobreNos /></ProtectedRoute>} />
                <Route path="/privacidade" element={<ProtectedRoute><Privacidade /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
