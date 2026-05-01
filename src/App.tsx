import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import RegistrationPage from "./pages/RegistrationPage.tsx";
import WaitingScreen from "./pages/WaitingScreen.tsx";
import DayListPage from "./pages/DayListPage.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import WelcomePage from "./pages/WelcomePage.tsx";

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
          <Route path="/" element={<WelcomePage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/waiting" element={<WaitingScreen />} />
          <Route path="/components" element={<Index />} />
          <Route path="/day-list" element={<DayListPage />} />
          <Route path="/search" element={<SearchPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
