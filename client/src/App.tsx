import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import PageBuilder from "@/pages/PageBuilder";
import ServiceBuilder from "@/pages/ServiceBuilder";
import Assets from "@/pages/Assets";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/projects" component={Projects} />
          <Route path="/portlets" component={() => <div>Portlets Page - Coming Soon</div>} />
          <Route path="/themes" component={() => <div>Themes Page - Coming Soon</div>} />
          <Route path="/assets" component={Assets} />
          <Route path="/page-builder" component={PageBuilder} />
          <Route path="/service-builder" component={ServiceBuilder} />
          <Route path="/analytics" component={() => <div>Analytics Page - Coming Soon</div>} />
          <Route path="/team" component={() => <div>Team Page - Coming Soon</div>} />
          <Route path="/settings" component={() => <div>Settings Page - Coming Soon</div>} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
