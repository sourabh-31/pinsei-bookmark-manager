import { useState } from "react";
import { Link } from "react-router";
import {
  Check,
  ChevronDown,
  Folder as FolderIcon,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { BulkBar } from "@/components/shared/BulkBar";
import { dbRowToBookmark, faviconFor, tintClass } from "@/lib/bookmarkUtils";
import { cn } from "@/lib/utils";
import { closeModal, openModal } from "@/lib/modalEvent";
import { toast } from "@/lib/toastEvent";
import { useBookmarks } from "@/features/bookmarks/hooks/useBookmarks";
import {
  useDeleteFolderForever,
  useDeletedFolders,
  useEmptyBin,
  useFolders,
  useRestoreFolder,
} from "@/features/folders/hooks/useFolders";
import { BookmarkItem } from "@/features/bookmarks/components/BookmarkItem";
import type { ConfirmActionPayload } from "@/features/bookmarks/components/ConfirmActionModal";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";

export default function Bin() {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: activeFolderRows } = useFolders();
  const { data: deletedFolderRows, isLoading: foldersLoading } =
    useDeletedFolders();
  const { data: deletedBookmarkRows, isLoading: bookmarksLoading } =
    useBookmarks({ deleted: true });

  const restoreFolder = useRestoreFolder();
  const deleteFolderForever = useDeleteFolderForever();
  const emptyBin = useEmptyBin();

  const items = (deletedBookmarkRows ?? []).map(dbRowToBookmark);
  const looseItems = items.filter((b) => !b.viaFolder);
  const binFolders = deletedFolderRows ?? [];
  const hasItems = looseItems.length + binFolders.length > 0;

  const toggleSelectMode = () => {
    setSelectMode((v) => !v);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const restoreBinFolder = (folder: Tables<"folders">) => {
    const clash = (activeFolderRows ?? []).some(
      (f) => f.name.toLowerCase() === folder.name.toLowerCase(),
    );
    const name = clash ? `${folder.name} (restored)` : folder.name;
    restoreFolder.mutate(
      { folderId: folder.id, name: clash ? name : undefined },
      {
        onSuccess: () => {
          toast({
            icon: "rotate-ccw",
            title: "Folder restored",
            sub: clash
              ? `Renamed to "${name}" because a folder called "${folder.name}" already exists`
              : name,
          });
        },
        onError: (error) => {
          toast({
            icon: "alert-circle",
            title: "Couldn't restore folder",
            sub: error.message,
          });
        },
      },
    );
  };

  const purgeBinFolder = (folder: Tables<"folders">) => {
    const nested = items.filter((b) => b.viaFolder === folder.id);
    openModal("confirm-action-modal", {
      title: `Delete "${folder.name}" forever?`,
      body: nested.length
        ? `The folder and its ${nested.length} bookmark${nested.length === 1 ? "" : "s"} will be gone for good. This cannot be undone.`
        : "The folder will be gone for good. This cannot be undone.",
      label: "Delete forever",
      pendingLabel: "Deleting...",
      run: () =>
        new Promise<void>((resolve, reject) => {
          deleteFolderForever.mutate(folder.id, {
            onSuccess: () => {
              closeModal();
              toast({
                icon: "trash-2",
                title: "Deleted forever",
                sub: folder.name,
              });
              resolve();
            },
            onError: (error) => {
              toast({
                icon: "alert-circle",
                title: "Couldn't delete folder",
                sub: error.message,
              });
              reject(error);
            },
          });
        }),
    } satisfies ConfirmActionPayload);
  };

  const handleEmptyBin = () => {
    const bits: string[] = [];
    if (items.length)
      bits.push(`${items.length} bookmark${items.length === 1 ? "" : "s"}`);
    if (binFolders.length)
      bits.push(
        `${binFolders.length} folder${binFolders.length === 1 ? "" : "s"}`,
      );
    openModal("confirm-action-modal", {
      title: "Empty the bin?",
      body: `${bits.join(" and ")} will be deleted for good. This cannot be undone.`,
      label: "Empty bin",
      pendingLabel: "Emptying...",
      run: () =>
        new Promise<void>((resolve, reject) => {
          emptyBin.mutate(undefined, {
            onSuccess: () => {
              closeModal();
              setSelectedIds(new Set());
              toast({
                icon: "trash-2",
                title: "Bin emptied",
                sub: `${bits.join(" and ")} removed`,
              });
              resolve();
            },
            onError: (error) => {
              toast({
                icon: "alert-circle",
                title: "Couldn't empty bin",
                sub: error.message,
              });
              reject(error);
            },
          });
        }),
    } satisfies ConfirmActionPayload);
  };

  if (foldersLoading || bookmarksLoading) return null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-5 flex items-center gap-3">
        <h1 className=" text-base font-semibold">Bin</h1>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
          {looseItems.length + binFolders.length}
        </span>
        {hasItems && (
          <span className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={toggleSelectMode}
              className={`${selectMode && "border-primary bg-accent text-accent-foreground"}`}
            >
              <Check className="size-3.5" />
              {selectMode ? "Done" : "Select"}
            </Button>
            <Button size="sm" onClick={handleEmptyBin}>
              <Trash2 className="size-3.25" />
              Empty bin
            </Button>
          </span>
        )}
      </div>

      {binFolders.length > 0 && (
        <div>
          <p className=" mt-5 text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wide">
            {binFolders.length === 1
              ? "1 deleted folder"
              : `${binFolders.length} deleted folders`}
          </p>
          <div className="mt-2.25 grid grid-cols-1 items-start gap-3 md:grid-cols-[repeat(auto-fill,minmax(330px,1fr))]">
            {binFolders.map((f) => {
              const nested = items.filter((b) => b.viaFolder === f.id);
              const isOpen = !!open[f.id];
              return (
                <div
                  key={f.id}
                  className="box-border rounded-2xl bg-card p-2 shadow-card"
                >
                  <div
                    onClick={() => setOpen((s) => ({ ...s, [f.id]: !s[f.id] }))}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.75 hover:bg-surface-hover"
                  >
                    <span
                      className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-[10px] ${tintClass(f.tint)}`}
                    >
                      <FolderIcon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className=" overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-semibold text-foreground">
                        {f.name}
                      </p>
                      <p className=" overflow-hidden text-ellipsis whitespace-nowrap text-[10.5px] font-semibold text-muted-foreground">
                        Folder ·{" "}
                        {nested.length
                          ? `${nested.length} bookmark${nested.length === 1 ? "" : "s"} inside`
                          : "empty"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex p-1 text-muted-foreground transition-transform",
                        isOpen && "rotate-180",
                      )}
                    >
                      <ChevronDown size={16} strokeWidth={2.2} />
                    </span>
                  </div>

                  {isOpen && nested.length > 0 && (
                    <div className="mt-0.5 flex flex-col gap-px py-0.5">
                      {nested.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center gap-3 rounded-xl px-2 py-1.75"
                        >
                          <img
                            src={faviconFor(b.url)}
                            alt=""
                            className="h-7 w-7 shrink-0 rounded-lg object-contain"
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              title={b.title}
                              className=" overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-medium text-foreground-secondary"
                            >
                              {b.title}
                            </p>
                            <p className=" overflow-hidden text-ellipsis whitespace-nowrap text-[10.5px] font-semibold text-muted-foreground">
                              {b.url}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-0.5 flex items-center gap-1.5 px-0.5 pb-0.5 pt-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => restoreBinFolder(f)}
                      className="flex-1"
                    >
                      <RotateCcw className="size-3.5" />
                      Restore folder
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      className="rounded-[10px]!"
                      onClick={() => purgeBinFolder(f)}
                      aria-label="Delete folder forever"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {binFolders.length > 0 && looseItems.length > 0 && (
        <p className=" mt-5 text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wide">
          {looseItems.length === 1
            ? "1 deleted bookmark"
            : `${looseItems.length} deleted bookmarks`}
        </p>
      )}

      {looseItems.length > 0 && (
        <div
          className={cn(
            "grid grid-cols-1 items-start gap-3 md:grid-cols-[repeat(auto-fill,minmax(330px,1fr))]",
            binFolders.length ? "mt-2.25" : "mt-4",
          )}
        >
          {looseItems.map((b) => (
            <BookmarkItem
              key={b.id}
              bookmark={b}
              layout="card"
              binMode
              selectMode={selectMode}
              selected={selectedIds.has(b.id)}
              onToggleSelect={() => toggleSelect(b.id)}
            />
          ))}
        </div>
      )}

      {!hasItems && (
        <EmptyState
          title="Your bin is clear"
          body="Deleted bookmarks rest here before they're gone for good, so you can restore anything you didn't mean to lose."
        >
          <div className="flex flex-col items-center justify-center gap-2.25 md:flex-row md:flex-wrap">
            <Link
              to="/all-bookmarks"
              className="box-border inline-flex h-10.5 min-w-47 items-center justify-center gap-1.5 rounded-[10px] border border-primary bg-primary px-4 font-sans text-[13px] font-semibold text-primary-foreground shadow-cta cursor-pointer no-underline"
            >
              Browse all bookmarks
            </Link>
            <Link
              to="/folders"
              className="box-border inline-flex h-10.5 min-w-47 items-center justify-center rounded-[10px] border border-border bg-card px-4 font-sans text-[13px] font-semibold text-foreground-secondary shadow-field cursor-pointer no-underline hover:border-[oklch(0.87_0.06_6)] hover:text-accent-foreground"
            >
              Organise folders
            </Link>
          </div>
        </EmptyState>
      )}

      <BulkBar
        selectedIds={Array.from(selectedIds)}
        onClear={() => setSelectedIds(new Set())}
      />
    </div>
  );
}
