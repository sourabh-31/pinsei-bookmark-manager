import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";

import { ToastStack } from "@/components/shared/ToastStack";
import { routeModules } from "@/lib/routeModules";

import AppLayout from "./layout";
import { SessionProvider } from "./features/auth/store/SessionProvider";

const Home = lazy(routeModules.home);
const Bookmarks = lazy(routeModules.bookmarks);
const Folders = lazy(routeModules.folders);
const FolderDetail = lazy(routeModules.folderDetail);
const Bin = lazy(routeModules.bin);
const Auth = lazy(routeModules.auth);
const NotFound = lazy(routeModules.notFound);

function App() {
  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/auth" element={<Auth />} />

          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/all-bookmarks" element={<Bookmarks />} />
            <Route path="/folders" element={<Folders />} />
            <Route path="/folders/:folderId" element={<FolderDetail />} />
            <Route path="/bin" element={<Bin />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <ToastStack />
    </SessionProvider>
  );
}

export default App;
