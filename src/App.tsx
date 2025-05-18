
import { Toaster } from "@/components/ui/toaster";
// Remove the Sonner import since it might be causing conflicts
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WorksheetProvider } from "./contexts/WorksheetContext";
import { ApiIntegrationProvider } from "./contexts/ApiIntegrationContext";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import WorksheetPage from "./pages/WorksheetPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import "./index.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <WorksheetProvider>
          <ApiIntegrationProvider>
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/worksheet/:id" 
                    element={
                      <ProtectedRoute>
                        <WorksheetPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </ApiIntegrationProvider>
        </WorksheetProvider>
      </AuthProvider>
      <Toaster />
      {/* Removed the Sonner toaster to eliminate potential conflict */}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
