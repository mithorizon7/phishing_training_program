import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { TrainingSessionProvider } from "@/lib/training-session";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Training from "@/pages/training";
import RecoverDrill from "@/pages/recover";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Home} />
      <Route path="/training" component={Training} />
      <Route path="/training/:id" component={Training} />
      <Route path="/recover" component={RecoverDrill} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TrainingSessionProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </TrainingSessionProvider>
    </QueryClientProvider>
  );
}

export default App;
