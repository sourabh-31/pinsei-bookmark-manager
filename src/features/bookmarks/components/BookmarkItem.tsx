import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  FolderInput,
  Heart,
  Link2,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { faviconFor, initials } from "@/lib/bookmarkUtils";
import { toast } from "@/lib/toastEvent";
import type { Bookmark } from "@/types/common.type";
import {
  useDeleteBookmark,
  useDeleteBookmarkForever,
  useRestoreBookmark,
  useUpdateBookmark,
} from "@/features/bookmarks/hooks/useBookmarks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { closeModal, openModal } from "@/lib/modalEvent";
import type { ConfirmActionPayload } from "@/features/bookmarks/components/ConfirmActionModal";
import type { MoveBookmarksPayload } from "./MoveModal";
import type { EditBookmarkPayload } from "./EditBookmarkModal";

interface BookmarkItemProps {
  bookmark: Bookmark;
  /** "panel" = dense row used on Home; "card" = self-contained card used on grids. */
  layout: "panel" | "card";
  /** Include the folder name in the meta line (used on All Bookmarks). */
  showFolder?: boolean;
  /** Resolved folder name to show when `showFolder` is set; omitted for unsorted bookmarks. */
  folderName?: string | null;
  /** Renders Restore / Delete forever instead of the live-bookmark actions. */
  binMode?: boolean;
  /** Shows the selection checkbox and switches the row's click behavior to toggle selection. */
  selectMode?: boolean;
  /** Whether this bookmark is currently selected (only meaningful when `selectMode` is set). */
  selected?: boolean;
  /** Called when the row/checkbox is clicked while `selectMode` is set. */
  onToggleSelect?: () => void;
}

export function BookmarkItem({
  bookmark,
  layout,
  showFolder,
  folderName,
  binMode,
  selectMode,
  selected,
  onToggleSelect,
}: BookmarkItemProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const deleteBookmark = useDeleteBookmark();
  const restoreBookmark = useRestoreBookmark();
  const updateBookmark = useUpdateBookmark();
  const deleteBookmarkForever = useDeleteBookmarkForever();

  const flashed = false;

  const meta = showFolder
    ? [bookmark.url, folderName].filter(Boolean).join("  ·  ")
    : bookmark.url;

  const open = () => {
    window.open("https://" + bookmark.url, "_blank", "noreferrer");
  };

  const toggleFavourite = () => {
    const next = !bookmark.favourite;
    updateBookmark.mutate(
      { id: bookmark.id, updates: { favourite: next } },
      {
        onSuccess: () => {
          toast({
            icon: "heart",
            title: next ? "Added to favourites" : "Removed favourite",
            sub: bookmark.title,
          });
        },
        onError: (error) => {
          toast({
            icon: "alert-circle",
            title: next
              ? "Couldn't add to favourites"
              : "Couldn't remove favourite",
            sub: error.message,
          });
        },
      },
    );
  };

  const copyLink = async () => {
    const link = "https://" + bookmark.url;
    try {
      await navigator.clipboard.writeText(link);
      toast({ icon: "link-2", title: "Link copied", sub: link });
    } catch {
      toast({
        icon: "alert-circle",
        title: "Couldn't copy link",
        sub: link,
      });
    }
  };

  const moveToFolder = () => {
    const payload: MoveBookmarksPayload = {
      ids: [bookmark.id],
      title: bookmark.title,
      currentFolderId: bookmark.folderId,
    };
    openModal("move-modal", payload);
  };

  const editBookmark = () => {
    const payload: EditBookmarkPayload = {
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      folderId: bookmark.folderId,
    };
    openModal("edit-modal", payload);
  };

  const moveToBin = () => {
    deleteBookmark.mutate(bookmark.id, {
      onSuccess: () => {
        toast({
          icon: "trash-2",
          title: "Moved to bin",
          sub: bookmark.url,
          actionLabel: "Undo",
          action: () => restoreBookmark.mutate(bookmark.id),
        });
      },
      onError: (error) => {
        toast({
          icon: "alert-circle",
          title: "Couldn't move to bin",
          sub: error.message,
        });
      },
    });
  };

  const restoreFromBin = () => {
    restoreBookmark.mutate(bookmark.id, {
      onSuccess: () => {
        toast({
          icon: "rotate-ccw",
          title: "Bookmark restored",
          sub: bookmark.title,
          actionLabel: "Undo",
          action: () => deleteBookmark.mutate(bookmark.id),
        });
      },
      onError: (error) => {
        toast({
          icon: "alert-circle",
          title: "Couldn't restore bookmark",
          sub: error.message,
        });
      },
    });
  };

  const deleteForever = () => {
    openModal("confirm-action-modal", {
      title: "Delete forever?",
      body: `"${bookmark.title}" will be gone for good. This cannot be undone.`,
      label: "Delete forever",
      pendingLabel: "Deleting...",
      run: () =>
        new Promise<void>((resolve, reject) => {
          deleteBookmarkForever.mutate(bookmark.id, {
            onSuccess: () => {
              closeModal();
              toast({
                icon: "trash-2",
                title: "Deleted forever",
                sub: bookmark.title,
              });
              resolve();
            },
            onError: (error) => {
              toast({
                icon: "alert-circle",
                title: "Couldn't delete bookmark",
                sub: error.message,
              });
              reject(error);
            },
          });
        }),
    } satisfies ConfirmActionPayload);
  };

  const row = (
    <div
      role="link"
      tabIndex={0}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-2 py-1.5 cursor-pointer hover:bg-surface-hover",
        layout === "panel" ? "py-1.75" : "flex-1",
      )}
      onClick={selectMode ? onToggleSelect : open}
    >
      {selectMode && (
        <span
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSelect?.();
          }}
          className={cn(
            "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border-[1.5px] text-white",
            selected ? "border-primary bg-primary" : "border-border bg-card",
          )}
        >
          {selected && <Check size={12} strokeWidth={3} />}
        </span>
      )}

      <div className="relative h-7 w-7 shrink-0">
        {!imgFailed ? (
          <img
            src={faviconFor(bookmark.url)}
            alt=""
            onError={() => setImgFailed(true)}
            className="h-7 w-7 rounded-lg object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-accent text-[10px] font-bold text-accent-foreground">
            {initials(bookmark.title)}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          title={bookmark.title}
          className={cn(
            " text-[13.5px] font-medium leading-[1.35]",
            layout === "panel"
              ? "overflow-hidden text-ellipsis whitespace-nowrap"
              : "text-clamp-2 max-h-[2.75em] overflow-hidden text-pretty wrap-anywhere",
          )}
        >
          {bookmark.title}
        </p>
        <p className=" overflow-hidden text-ellipsis whitespace-nowrap text-[10.5px] font-semibold leading-[1.35] text-muted-foreground">
          {meta}
        </p>
      </div>

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <span
          className={cn(
            "flex transition-opacity",
            menuOpen
              ? "opacity-100"
              : "opacity-100 md:opacity-0 md:group-hover:opacity-100",
          )}
        >
          <DropdownMenuTrigger
            aria-label="More actions"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex rounded-full border-0 bg-transparent p-1 text-muted-foreground cursor-pointer outline-hidden"
          >
            <MoreHorizontal size={16} strokeWidth={2.6} />
          </DropdownMenuTrigger>
        </span>

        <span
          className={cn(
            "flex shrink-0 p-1 text-muted-foreground transition-opacity",
            menuOpen
              ? "opacity-100"
              : "opacity-45 md:opacity-45 md:group-hover:opacity-100",
          )}
        >
          <ArrowUpRight size={16} />
        </span>

        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
          className="min-w-38"
        >
          {binMode ? (
            <>
              <DropdownMenuItem onClick={restoreFromBin}>
                <RotateCcw />
                Restore
              </DropdownMenuItem>
              <DropdownMenuItem onClick={deleteForever}>
                <Trash2 />
                Delete forever
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={toggleFavourite}>
                <Heart />
                {bookmark.favourite ? "Remove favourite" : "Add to favourites"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={moveToFolder}>
                <FolderInput />
                Move to folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={editBookmark}>
                <Pencil />
                Edit bookmark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyLink}>
                <Link2 />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={moveToBin}>
                <Trash2 />
                Move to bin
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  if (layout === "panel") return row;

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl bg-card p-2 shadow-card h-full",
        flashed && "shadow-card-flash",
      )}
    >
      {row}
    </div>
  );
}
