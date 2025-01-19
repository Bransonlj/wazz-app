import { BrowserRouter } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/socket-context";
import Router from "./routes/router";
import { Toaster } from "./components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function App() {

  const queryClient = new QueryClient()

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <AuthProvider>
            <BrowserRouter>
              <Router />
            </BrowserRouter>
          </AuthProvider>
        </SocketProvider>
        <Toaster />
      </QueryClientProvider>
    </>
  )
}