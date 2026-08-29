import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/globals.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient.ts";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
