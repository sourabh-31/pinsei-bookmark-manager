import { Folder, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { tintClass } from "@/lib/bookmarkUtils";
import { closeModal } from "@/lib/modalEvent";
import { toast } from "@/lib/toastEvent";
import { useFolders } from "@/features/folders/hooks/useFolders";
import { useMoveBookmarks } from "@/features/bookmarks/hooks/useBookmarks";
import { ModalShell } from "@/components/shared/ModalShell";

export interface MoveBookmarksPayload {
  ids: string[];
  title: string;
  currentFolderId: string | null;
  /** Called after a successful move, e.g. to clear a bulk selection. */
  onMoved?: () => void;
}

interface MoveModalProps {
  payload?: unknown;
}

export function MoveModal({ payload }: MoveModalProps) {
  const data = payload as MoveBookmarksPayload | undefined;
  const { data: folderRows } = useFolders();
  const moveBookmarks = useMoveBookmarks();

  if (!data) return null;

  const { ids, title, currentFolderId, onMoved } = data;
  const folders = folderRows ?? [];

  const targets = [
    { id: "", name: "Unsorted", tint: -1 },
    ...folders.map((f) => ({ id: f.id, name: f.name, tint: f.tint })),
  ];

  const pick = (targetId: string, targetName: string) => {
    if (ids.length === 1 && (currentFolderId || "") === targetId) {
      closeModal();
      return;
    }

    moveBookmarks.mutate(
      { ids, folderId: targetId || null },
      {
        onSuccess: () => {
          closeModal();
          onMoved?.();
          toast({
            icon: "folder-input",
            title:
              ids.length === 1
                ? `Moved to ${targetName}`
                : `Moved ${ids.length} to ${targetName}`,
            sub: ids.length === 1 ? title : undefined,
            actionLabel: "Undo",
            action: () =>
              moveBookmarks.mutate({ ids, folderId: currentFolderId }),
          });
        },
        onError: (error) => {
          toast({
            icon: "alert-circle",
            title: "Couldn't move",
            sub: error.message,
          });
        },
      },
    );
  };

  return (
    <ModalShell className="max-w-[min(420px,calc(100vw-20px))] p-6 flex flex-col gap-3.5">
      <div className="flex flex-col gap-1">
        <h2 className=" text-[19px] font-semibold leading-[1.1] text-foreground">
          Move to folder
        </h2>
        <p className=" text-[12.5px] font-medium text-muted-foreground">
          {ids.length === 1 ? title : `${ids.length} bookmarks selected`}
        </p>
      </div>

      <div className="-mx-1.5 flex max-h-67 flex-col gap-0.5 overflow-y-auto px-1.5">
        {targets.map((t) => {
          const current = (currentFolderId || "") === t.id;
          return (
            <button
              key={t.id || "unsorted"}
              type="button"
              onClick={() => pick(t.id, t.name)}
              disabled={moveBookmarks.isPending}
              className={cn(
                "flex w-full items-center gap-2.75 rounded-xl border-0 px-2.25 py-2 font-sans text-inherit cursor-pointer",
                current ? "bg-muted" : "bg-transparent",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px]",
                  t.tint === -1
                    ? "bg-muted text-muted-foreground"
                    : tintClass(t.tint),
                )}
              >
                {t.tint === -1 ? <Inbox size={15} /> : <Folder size={15} />}
              </span>
              <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left text-[13.5px] font-medium">
                {t.name}
              </span>
              {current && (
                <span className="shrink-0 text-[10.5px] font-semibold uppercase text-accent-foreground mr-4">
                  Current
                </span>
              )}
            </button>
          );
        })}
      </div>
    </ModalShell>
  );
}
