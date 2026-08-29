import { Navigate, Outlet, useLocation } from "react-router";
import Header from "./Header";
import MobileNav from "./MobileNav";
import ModalManager from "@/components/shared/ModalManager";
import { useSession } from "@/features/auth/hooks/useAuth";
import {
  ErrorBoundary,
  SectionErrorFallback,
} from "@/components/shared/ErrorBoundary";

function AppLayout() {
  const { session, isLoading } = useSession();
  const { pathname } = useLocation();

  if (isLoading) return null;

  if (!session) return <Navigate to="/auth" replace />;

  return (
    <div className="flex min-h-screen w-full flex-col bg-app-shell">
      <Header />
      <MobileNav />
      <main className="flex flex-1 flex-col px-4.5 pt-4 pb-24 md:px-7.5 md:pb-8">
        {/* Keyed by route so navigating away from a crashed page resets the boundary instead of leaving it stuck. */}
        <ErrorBoundary
          key={pathname}
          fallback={(error, reset) => (
            <SectionErrorFallback error={error} reset={reset} />
          )}
        >
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Modal component */}
      <ModalManager />
    </div>
  );
}

export default AppLayout;
