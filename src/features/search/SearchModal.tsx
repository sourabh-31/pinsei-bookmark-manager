import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useNavigate } from "react-router";
import {
  Bookmark,
  Folder,
  FolderPlus,
  Heart,
  House,
  Inbox,
  Plus,
  Search,
  SearchX,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dbRowToBookmark, faviconFor, tintClass } from "@/lib/bookmarkUtils";
import { useBookmarks } from "@/features/bookmarks/hooks/useBookmarks";
import { useFolders } from "@/features/folders/hooks/useFolders";
import { UNSORTED, FAVOURITES } from "@/types/common.type";
import { closeModal, openModal } from "@/lib/modalEvent";
import { Button } from "@/components/ui/button";

type ResultItem =
  | {
      group: string;
      kind: "run";
      title: string;
      sub?: string;
      icon: LucideIcon;
      tint?: number;
      run: () => void;
    }
  | { group: string; kind: "link"; title: string; sub: string; href: string };

const GROUP_ORDER = ["Actions", "Pages", "Folders", "Bookmarks"];

export function SearchModal() {
  const navigate = useNavigate();
  const { data: folderRows } = useFolders();
  const { data: bookmarkRows } = useBookmarks();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const folders = folderRows ?? [];
  const bookmarks = (bookmarkRows ?? []).map(dbRowToBookmark);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hit = (text: string) => {
    const needle = q.trim().toLowerCase();
    return !needle || text.toLowerCase().includes(needle);
  };

  const goTo = (path: string) => {
    closeModal();
    navigate(path);
  };

  const flat: ResultItem[] = (() => {
    const items: ResultItem[] = [];
    if (hit("add bookmark") || hit("new bookmark") || hit("create")) {
      items.push({
        group: "Actions",
        kind: "run",
        title: "Add Bookmark",
        sub: "Open the add bookmark dialog",
        icon: Plus,
        run: () => openModal("add-modal"),
      });
    }
    if (hit("new folder") || hit("create folder")) {
      items.push({
        group: "Actions",
        kind: "run",
        title: "New Folder",
        sub: "Create a folder",
        icon: FolderPlus,
        run: () => openModal("new-folder-modal"),
      });
    }
    (
      [
        ["Home", "/", House],
        ["Folders", "/folders", Folder],
        ["All Bookmarks", "/all-bookmarks", Bookmark],
        ["Bin", "/bin", Trash2],
      ] as [string, string, LucideIcon][]
    )
      .filter(([label]) => hit(label))
      .forEach(([label, path, icon]) =>
        items.push({
          group: "Pages",
          kind: "run",
          title: label,
          icon,
          run: () => goTo(path),
        }),
      );

    folders
      .filter((f) => hit(f.name))
      .slice(0, 5)
      .forEach((f) => {
        const n = bookmarks.filter((b) => b.folderId === f.id).length;
        items.push({
          group: "Folders",
          kind: "run",
          title: f.name,
          sub: n === 1 ? "1 bookmark" : `${n} bookmarks`,
          icon: Folder,
          tint: f.tint,
          run: () => goTo(`/folders/${f.id}`),
        });
      });
    if (hit("favourites")) {
      const n = bookmarks.filter((b) => b.favourite).length;
      items.push({
        group: "Folders",
        kind: "run",
        title: "Favourites",
        sub: `${n} bookmarks`,
        icon: Heart,
        run: () => goTo(`/folders/${FAVOURITES}`),
      });
    }
    if (hit("unsorted")) {
      const n = bookmarks.filter((b) => !b.folderId).length;
      items.push({
        group: "Folders",
        kind: "run",
        title: "Unsorted",
        sub: `${n} bookmarks`,
        icon: Inbox,
        run: () => goTo(`/folders/${UNSORTED}`),
      });
    }

    bookmarks
      .filter((b) => hit(b.title) || hit(b.url))
      .slice(0, 6)
      .forEach((b) =>
        items.push({
          group: "Bookmarks",
          kind: "link",
          title: b.title,
          sub: b.url,
          href: "https://" + b.url,
        }),
      );

    return items;
  })();

  const activate = (item: ResultItem) => {
    if (item.kind === "link") {
      window.open(item.href, "_blank", "noreferrer");
      closeModal();
    } else {
      item.run();
    }
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Escape") {
      closeModal();
    } else if (e.key === "Enter") {
      const item = flat[sel];
      if (item) {
        e.preventDefault();
        activate(item);
      }
    }
  };

  const groups = GROUP_ORDER.map((label) => ({
    label,
    items: flat
      .map((it, i) => ({ it, i }))
      .filter(({ it }) => it.group === label),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <div
        onClick={() => closeModal()}
        className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]"
      />
      <div className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-[min(560px,calc(100vw-20px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-modal-lg">
        <div className="flex items-center gap-2.5 border-b border-border-subtle px-3.75 py-3.25">
          <Search size={16} className="shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search bookmarks, folders and actions…"
            className="w-full border-0 bg-transparent font-sans text-[14.5px] font-medium text-inherit outline-none"
          />
          <Button
            variant="secondary"
            size="icon-xs"
            onClick={() => closeModal()}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1"
          >
            <X size={14} strokeWidth={2.2} />
          </Button>
        </div>

        <div className="max-h-88 overflow-y-auto p-1.5">
          {groups.map((g) => (
            <div key={g.label} className="pb-0.5">
              <p className=" px-2.5 pb-1.25 pt-2.25 text-[9.5px] font-bold uppercase text-muted-foreground/80">
                {g.label}
              </p>
              {g.items.map(({ it, i }) => {
                const on = i === sel;
                const tintCls =
                  it.kind === "run" && it.tint !== undefined
                    ? tintClass(it.tint)
                    : "bg-muted text-muted-foreground";
                return (
                  <a
                    key={`${it.group}-${it.title}-${i}`}
                    href={it.kind === "link" ? it.href : "#"}
                    target={it.kind === "link" ? "_blank" : undefined}
                    rel={it.kind === "link" ? "noreferrer" : undefined}
                    onMouseEnter={() => setSel(i)}
                    onClick={(e) => {
                      if (it.kind === "run") {
                        e.preventDefault();
                        activate(it);
                      } else {
                        closeModal();
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2.75 rounded-xl px-2.5 py-2 text-inherit no-underline",
                      on ? "bg-[oklch(0.968_0.003_300)]" : "bg-transparent",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px]",
                        it.kind === "run" ? tintCls : "",
                      )}
                    >
                      {it.kind === "run" ? (
                        <it.icon size={15} />
                      ) : (
                        <img
                          src={faviconFor(it.href.replace(/^https?:\/\//, ""))}
                          alt=""
                          className="h-4 w-4 rounded object-contain"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-medium text-foreground-secondary">
                        {it.title}
                      </span>
                      {it.sub && (
                        <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[10.5px] font-semibold text-muted-foreground">
                          {it.sub}
                        </span>
                      )}
                    </span>
                    {on && (
                      <span className="flex shrink-0 text-muted-foreground">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 5v6a2 2 0 0 1-2 2H6" />
                          <path d="M10 9l-4 4 4 4" />
                        </svg>
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          ))}

          {flat.length === 0 && (
            <div className="flex flex-col items-center gap-2.25 px-3 py-8.5">
              <span className="flex h-8.5 w-8.5 items-center justify-center rounded-[11px] bg-muted text-muted-foreground">
                <SearchX size={16} />
              </span>
              <p className=" text-center text-[13px] font-semibold text-muted-foreground">
                Nothing matches "{q}"
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3.5 border-t border-border-subtle bg-[oklch(0.982_0.002_300)] px-3 py-2">
          <Hint keys={["↑", "↓"]} label="navigate" />
          <Hint keys={["↵"]} label="select" />
          <Hint keys={["esc"]} label="close" />
          <span className="ml-auto text-[10.5px] font-semibold text-muted-foreground/70">
            {flat.length === 1 ? "1 result" : `${flat.length} results`}
          </span>
        </div>
      </div>
    </div>
  );
}

function Hint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="flex items-center gap-1.25 text-[10.5px] font-semibold text-muted-foreground">
      {keys.map((k) => (
        <kbd
          key={k}
          className="flex h-4.25 min-w-4.25 items-center justify-center rounded-md border border-border bg-card px-1 font-sans text-[9.5px] font-bold text-foreground-secondary"
        >
          {k}
        </kbd>
      ))}
      {label}
    </span>
  );
}
