/**
 * Central registry of dynamic page imports. Shared by App.tsx's lazy() calls and
 * nav hover-prefetch so both reference the same import() call and its module cache.
 */
export const routeModules = {
  home: () => import("@/pages/Home"),
  bookmarks: () => import("@/pages/Bookmarks"),
  folders: () => import("@/pages/Folders"),
  folderDetail: () => import("@/pages/FolderDetail"),
  bin: () => import("@/pages/Bin"),
  auth: () => import("@/pages/Auth"),
  notFound: () => import("@/pages/NotFound"),
} as const;
