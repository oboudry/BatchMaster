import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import MainLayout from "@/layouts/MainLayout";
import Dashboard from "@/pages/Dashboard";
import WorkOrders from "@/pages/WorkOrders";
import BatchRecords from "@/pages/BatchRecords";
import QualityControl from "@/pages/QualityControl";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/work-orders" component={WorkOrders} />
      <Route path="/batch-records" component={BatchRecords} />
      <Route path="/quality-control" component={QualityControl} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <Router />
      </MainLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
