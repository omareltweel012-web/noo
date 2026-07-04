import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useGetMe } from "@workspace/api-client-react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transfer from "./pages/Transfer";
import Tax from "./pages/Tax";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, ...rest }: any) {
  const [location, setLocation] = useLocation();
  const { data: user, isError, isLoading } = useGetMe({
    query: {
      refetchInterval: 5000,
      retry: false,
    }
  });

  useEffect(() => {
    if (isError) {
      localStorage.removeItem("sessionToken");
      setLocation("/");
    }
  }, [isError, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0a0a0f]" />;
  }

  if (!user) {
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/transfer"><ProtectedRoute component={Transfer} /></Route>
      <Route path="/tax"><ProtectedRoute component={Tax} /></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="min-h-[100dvh] bg-[#0a0a0f] text-white font-sans antialiased overflow-x-hidden relative">
            <Router />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;