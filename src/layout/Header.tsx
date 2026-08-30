import { Link, useLocation, useNavigate } from "react-router";
import {
  Bookmark,
  Download,
  Folder,
  House,
  LogOut,
  Plus,
  Search,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { openModal } from "@/lib/modalEvent";
import { toast } from "@/lib/toastEvent";
import { useSession, useSignOut } from "@/features/auth/hooks/useAuth";
import { exportBookmarksAsJson, initials } from "@/lib/bookmarkUtils";
import { useBookmarks } from "@/features/bookmarks/hooks/useBookmarks";
import { useFolders } from "@/features/folders/hooks/useFolders";
import { UNSORTED, FAVOURITES } from "@/types/common.type";
import type { ImportPayload } from "@/features/bookmarks/components/ImportModal";

const NAV_ITEMS = [
  {
    to: "/home",
    label: "Home",
    icon: House,
    match: (p: string) => p === "/home",
  },
  {
    to: "/folders",
    label: "Folders",
    icon: Folder,
    match: (p: string) => p.startsWith("/folders"),
  },
  {
    to: "/all-bookmarks",
    label: "All Bookmarks",
    icon: Bookmark,
    match: (p: string) => p === "/all-bookmarks",
  },
  {
    to: "/bin",
    label: "Bin",
    icon: Trash2,
    match: (p: string) => p === "/bin",
  },
];

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const signOut = useSignOut();
  const { session } = useSession();
  const { data: bookmarkRows } = useBookmarks();
  const { data: folderRows } = useFolders();

  const user = session?.user;
  const fullName = user?.user_metadata?.full_name as string | undefined;
  const displayName =
    fullName || (user?.is_anonymous ? "Guest" : user?.email) || "Account";
  const displaySub = user?.is_anonymous ? "Anonymous session" : user?.email;
  const avatarLabel = initials(fullName || displayName);

  // Header renders alongside <Outlet/>, not inside it, so :folderId isn't reachable via useParams() here.
  const folderDetailId = pathname.match(/^\/folders\/([^/]+)$/)?.[1];
  const importFolderId =
    folderDetailId &&
    folderDetailId !== FAVOURITES &&
    folderDetailId !== UNSORTED
      ? folderDetailId
      : undefined;

  function handleExport() {
    const bookmarks = bookmarkRows ?? [];
    if (!bookmarks.length) {
      toast({
        icon: "alert-circle",
        title: "Nothing to export",
        sub: "You don't have any bookmarks yet",
      });
      return;
    }
    const folderNameById = new Map(
      (folderRows ?? []).map((f) => [f.id, f.name]),
    );
    const count = exportBookmarksAsJson(
      bookmarks,
      (folderId) => (folderId ? (folderNameById.get(folderId) ?? null) : null),
      "pinsei-bookmarks.json",
    );
    toast({
      icon: "download",
      title: "Export ready",
      sub: `${count} bookmarks as JSON`,
    });
  }

  function handleSignOut() {
    signOut.mutate(undefined, {
      onError: (error) =>
        toast({
          icon: "alert-circle",
          title: "Couldn't sign out",
          sub: error.message,
        }),
    });
  }

  return (
    <header className="flex flex-wrap items-center gap-3 px-4.5 py-3.5 sm:px-7.5">
      <Link to="/" className="mr-5 flex items-center gap-2 text-inherit">
        <svg
          width="17"
          height="20.5"
          viewBox="1 1 17 20.5"
          fill="none"
          aria-label="Pinsei"
          className="block shrink-0"
        >
          <defs>
            <linearGradient id="pinsei-logo" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="oklch(0.72 0.19 22)" />
              <stop offset="1" stopColor="oklch(0.55 0.216 4)" />
            </linearGradient>
          </defs>
          <path
            d="M13.4 1.5H18v17.2l-4.6-3.4V1.5Z"
            fill="oklch(0.55 0.216 4)"
            opacity="0.28"
          />
          <path
            d="M1 2.4A1.4 1.4 0 0 1 2.4 1h8.9a1.4 1.4 0 0 1 1.4 1.4v19.1l-5.85-4.3L1 21.5V2.4Z"
            fill="url(#pinsei-logo)"
          />
        </svg>
        <span className="block font-bold leading-none text-foreground-secondary">
          Pinsei
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-5">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex items-center gap-1.5 rounded-xl text-xs font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-card p-0 text-muted-foreground shadow-[0_1px_2px_oklch(0_0_0/0.03)] cursor-pointer md:w-36 md:px-4 md:py-2.25 hover:border-[oklch(0.9_0.004_300)] hover:text-foreground-secondary"
          onClick={() => openModal("search-modal")}
        >
          <Search size={14} />
          <span className="hidden text-xs font-medium md:inline">
            Search / Ctrl + K
          </span>
        </div>
        <Button size="icon-sm" onClick={() => openModal("add-modal")}>
          <Plus size={16} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Account"
            className="flex size-7.5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-xs font-semibold text-accent-foreground shadow-avatar-ring cursor-pointer outline-hidden"
          >
            {avatarLabel}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-46">
            <div className="flex flex-col gap-px border-b border-border-subtle px-2.25 pt-1.75 pb-2.25 mb-1">
              <span className="text-[12.5px] font-semibold text-foreground-secondary">
                {displayName}
              </span>
              {displaySub && (
                <span className="text-[10.5px] font-medium text-muted-foreground">
                  {displaySub}
                </span>
              )}
            </div>
            {!user?.is_anonymous && (
              <DropdownMenuItem onSelect={() => navigate("/account")}>
                <User />
                Account Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onSelect={() =>
                openModal(
                  "import-modal",
                  importFolderId
                    ? ({ folderId: importFolderId } satisfies ImportPayload)
                    : undefined,
                )
              }
            >
              <Upload />
              Import bookmarks
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleExport}>
              <Download />
              Export bookmarks
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
