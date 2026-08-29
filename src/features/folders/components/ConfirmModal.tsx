import { AlertTriangle } from "lucide-react";
import { ModalShell } from "@/components/shared/ModalShell";
import { Button } from "@/components/ui/button";
import { closeModal } from "@/lib/modalEvent";
import { toast } from "@/lib/toastEvent";
import { useDeleteFolder } from "@/features/folders/hooks/useFolders";
import type { Bookmark } from "@/types/common.type";
import type { Tables } from "@/types/database.types";

export interface DeleteFolderConfirmPayload {
  folder: Tables<"folders">;
  keep: Bookmark[];
  trash: Bookmark[];
}

interface ConfirmModalProps {
  payload?: unknown;
}

export function ConfirmModal({ payload }: ConfirmModalProps) {
  const deleteFolder = useDeleteFolder();
  const data = payload as DeleteFolderConfirmPayload | undefined;

  if (!data) return null;

  const { folder, keep, trash } = data;

  const lines: { n: number; text: string }[] = [];
  if (trash.length)
    lines.push({
      n: trash.length,
      text: `bookmark${trash.length === 1 ? "" : "s"} will move to the Bin`,
    });
  if (keep.length)
    lines.push({
      n: keep.length,
      text: `bookmark${keep.length === 1 ? " will be" : "s will be"} added to Unsorted, as ${
        keep.length === 1 ? "it was" : "they were"
      } in Favourites`,
    });

  const body = lines.length
    ? "Restore the folder from the Bin any time to put everything back."
    : "The folder is empty, so nothing else changes. You can restore it from the Bin.";

  const run = () => {
    deleteFolder.mutate(
      {
        folderId: folder.id,
        keepIds: keep.map((b) => b.id),
        trashIds: trash.map((b) => b.id),
      },
      {
        onSuccess: () => {
          toast({
            icon: "trash-2",
            title: "Folder moved to bin",
            sub: keep.length
              ? `${folder.name} · ${keep.length} favourite${keep.length === 1 ? "" : "s"} kept in Unsorted`
              : folder.name,
          });
          closeModal();
        },
        onError: (error) => {
          toast({
            icon: "alert-circle",
            title: "Couldn't delete folder",
            sub: error.message,
          });
        },
      },
    );
  };

  return (
    <ModalShell
      z={60}
      className="max-w-[min(400px,calc(100vw-20px))] p-6 flex flex-col gap-3.5"
    >
      <span className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <AlertTriangle size={18} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className=" text-[19px] font-semibold leading-[1.1] text-foreground">
          Delete "{folder.name}"?
        </h2>
        {lines.length > 0 && (
          <div className="my-1.5 flex flex-col gap-2.5">
            {lines.map((line, i) => (
              <p
                key={i}
                className=" flex items-center gap-2 text-pretty text-[13.5px] font-medium leading-[1.45] text-foreground-secondary"
              >
                <span className="shrink-0 text-[21px] font-bold leading-none text-foreground">
                  {line.n}
                </span>
                {line.text}
              </p>
            ))}
          </div>
        )}
        <p className=" text-pretty text-[13px] font-medium leading-[1.6] text-muted-foreground">
          {body}
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() => closeModal()}
          disabled={deleteFolder.isPending}
          size="lg"
        >
          Cancel
        </Button>
        <Button onClick={run} disabled={deleteFolder.isPending} size="lg">
          {deleteFolder.isPending ? "Deleting..." : "Delete folder"}
        </Button>
      </div>
    </ModalShell>
  );
}
