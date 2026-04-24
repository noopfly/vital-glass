import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import PatientCodeEntry from "./pages/PatientCodeEntry.tsx";
import RegistrationPage from "./pages/RegistrationPage.tsx";
import WaitingScreen from "./pages/WaitingScreen.tsx";

const queryClient = new QueryClient();
const Router =
  typeof window !== "undefined" && window.location.hostname.endsWith("github.io")
    ? HashRouter
    : BrowserRouter;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>
          <Route path="/" element={<PatientCodeEntry />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/waiting" element={<WaitingScreen />} />
          <Route path="/components" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
