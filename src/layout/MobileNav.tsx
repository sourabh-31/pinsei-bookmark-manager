import { Link, useLocation } from "react-router";
import { Bookmark, Folder, House, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { routeModules } from "@/lib/routeModules";

const TABS = [
  {
    to: "/home",
    label: "Home",
    icon: House,
    match: (p: string) => p === "/home",
    prefetch: routeModules.home,
  },
  {
    to: "/folders",
    label: "Folders",
    icon: Folder,
    match: (p: string) => p.startsWith("/folders"),
    prefetch: routeModules.folders,
  },
  {
    to: "/all-bookmarks",
    label: "Saved",
    icon: Bookmark,
    match: (p: string) => p === "/all-bookmarks",
    prefetch: routeModules.bookmarks,
  },
  {
    to: "/bin",
    label: "Bin",
    icon: Trash2,
    match: (p: string) => p === "/bin",
    prefetch: routeModules.bin,
  },
];

export default function MobileNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-70 grid grid-cols-4 gap-0.5 border-t border-border bg-card/90 px-2 pt-1.75 pb-[calc(7px+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.to}
            to={tab.to}
            onMouseEnter={tab.prefetch}
            onFocus={tab.prefetch}
            className={cn(
              "flex flex-col items-center gap-0.75 rounded-xl px-1 py-1.5 text-[10px] font-semibold",
              active ? "bg-accent text-primary" : "text-muted-foreground",
            )}
          >
            <tab.icon size={20} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
