import { useLocation } from "react-router";
import { FolderInput, RotateCcw, Trash2, X } from "lucide-react";
import { closeModal, openModal } from "@/lib/modalEvent";
import { toast } from "@/lib/toastEvent";
import {
  useDeleteBookmarks,
  useDeleteBookmarksForever,
  useRestoreBookmarks,
} from "@/features/bookmarks/hooks/useBookmarks";
import type { ConfirmActionPayload } from "@/features/bookmarks/components/ConfirmActionModal";
import { Button } from "../ui/button";
import type { MoveBookmarksPayload } from "@/features/bookmarks/components/MoveModal";

interface BulkBarProps {
  selectedIds: string[];
  onClear: () => void;
  /** The folder these bookmarks currently live in, so "Move to folder" can preselect it and "Undo" can move them back. */
  currentFolderId?: string | null;
}

export function BulkBar({
  selectedIds,
  onClear,
  currentFolderId = null,
}: BulkBarProps) {
  const { pathname } = useLocation();
  const isBin = pathname === "/bin";
  const ids = selectedIds;
  const deleteBookmarks = useDeleteBookmarks();
  const restoreBookmarks = useRestoreBookmarks();
  const deleteBookmarksForever = useDeleteBookmarksForever();

  if (ids.length === 0) return null;

  const restore = () => {
    restoreBookmarks.mutate(ids, {
      onSuccess: () => {
        onClear();
        toast({
          icon: "rotate-ccw",
          title: `Restored ${ids.length} bookmark${ids.length === 1 ? "" : "s"}`,
        });
      },
      onError: (error) => {
        toast({
          icon: "alert-circle",
          title: "Couldn't restore",
          sub: error.message,
        });
      },
    });
  };

  const purge = () => {
    openModal("confirm-action-modal", {
      title: `Delete ${ids.length} forever?`,
      body: "These bookmarks will be gone for good. This cannot be undone.",
      label: "Delete forever",
      pendingLabel: "Deleting...",
      run: () =>
        new Promise<void>((resolve, reject) => {
          deleteBookmarksForever.mutate(ids, {
            onSuccess: () => {
              closeModal();
              onClear();
              toast({
                icon: "trash-2",
                title: `Deleted ${ids.length} forever`,
              });
              resolve();
            },
            onError: (error) => {
              toast({
                icon: "alert-circle",
                title: "Couldn't delete forever",
                sub: error.message,
              });
              reject(error);
            },
          });
        }),
    } satisfies ConfirmActionPayload);
  };

  const move = () => {
    openModal("move-modal", {
      ids,
      title: "",
      currentFolderId,
      onMoved: onClear,
    } satisfies MoveBookmarksPayload);
  };

  const del = () => {
    deleteBookmarks.mutate(ids, {
      onSuccess: () => {
        onClear();
        toast({
          icon: "trash-2",
          title: `Moved ${ids.length} to bin`,
          actionLabel: "Undo",
          action: () => restoreBookmarks.mutate(ids),
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

  return (
    <div className="fixed z-75 box-border flex items-center gap-2 rounded-2xl border border-border bg-card shadow-bulkbar left-3 right-3 bottom-[calc(74px+env(safe-area-inset-bottom,0px))] flex-wrap justify-center p-2.5 md:left-1/2 md:right-auto md:bottom-5.5 md:max-w-[calc(100vw-24px)] md:-translate-x-1/2 md:flex-nowrap md:justify-start md:gap-2 md:py-2.25 md:pr-2.5 md:pl-3.5">
      <span className="text-[12.5px] font-semibold text-foreground order-1 flex-1 md:order-0 md:flex-none">
        {ids.length} selected
      </span>
      <span className="hidden md:block h-5 w-px shrink-0 bg-border" />
      <div className="order-3 flex w-full items-center gap-2 md:order-0 md:w-auto md:flex-wrap md:gap-1.25">
        {isBin ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={restore}
              disabled={restoreBookmarks.isPending}
            >
              <RotateCcw className="size-3.5" /> Restore
            </Button>
            <Button variant="secondary" size="sm" onClick={purge}>
              <Trash2 className="size-3.5" /> Delete forever
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" size="sm" onClick={move}>
              <FolderInput className="size-3.5" /> Move to folder
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={del}
              disabled={deleteBookmarks.isPending}
            >
              <Trash2 className="size-3.5" /> Move to bin
            </Button>
          </>
        )}
      </div>
      <button
        type="button"
        aria-label="Clear selection"
        onClick={onClear}
        className="order-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-0 bg-transparent text-muted-foreground cursor-pointer -my-1.5 md:order-0 md:h-auto md:w-auto md: md:p-1.5 hover:bg-muted hover:text-foreground-secondary"
      >
        <X size={15} strokeWidth={2.2} />
      </button>
    </div>
  );
}
