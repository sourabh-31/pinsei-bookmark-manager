import { Routes, Route, Navigate } from "react-router";

import { ToastStack } from "@/components/shared/ToastStack";

import AppLayout from "./layout";
import { SessionProvider } from "./features/auth/store/SessionProvider";
import Home from "@/pages/Home";
import Bookmarks from "@/pages/Bookmarks";
import Folders from "@/pages/Folders";
import FolderDetail from "@/pages/FolderDetail";
import Bin from "@/pages/Bin";
import Account from "@/pages/Account";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <SessionProvider>
      <Routes>
        <Route path="/auth" element={<Auth />} />

        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/all-bookmarks" element={<Bookmarks />} />
          <Route path="/folders" element={<Folders />} />
          <Route path="/folders/:folderId" element={<FolderDetail />} />
          <Route path="/bin" element={<Bin />} />
          <Route path="/account" element={<Account />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastStack />
    </SessionProvider>
  );
}

export default App;
