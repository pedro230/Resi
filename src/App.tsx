import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import RequestMaintenance from "./pages/RequestMaintenance";
import FindProviders from "./pages/FindProviders";
import NotFound from "./pages/NotFound";
import PartnersList from "./pages/PartnersList";
import Payment from "./pages/Payment";
import Proof from "./pages/Proof";
import PaymentSuccess from "./pages/PaymentSuccess";
import Feed from "./pages/Feed";
import RealEstate from "./pages/RealEstate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/request-maintenance" element={<RequestMaintenance />} />
          <Route path="/find-providers" element={<FindProviders />} />
          <Route path="/partners" element={<PartnersList />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/proof" element={<Proof />} />
          <Route path="/real-estate" element={<RealEstate />} />
          <Route path="/feed" element={<Feed />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
