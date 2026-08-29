import { useState } from "react";
import { Download, Folder, Upload } from "lucide-react";
import { exportBookmarksAsJson, tintClass } from "@/lib/bookmarkUtils";
import { closeModal, openModal } from "@/lib/modalEvent";
import { toast } from "@/lib/toastEvent";
import { useUpdateFolder } from "@/features/folders/hooks/useFolders";
import { useBookmarks } from "@/features/bookmarks/hooks/useBookmarks";
import { ModalShell } from "@/components/shared/ModalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tables } from "@/types/database.types";
import type { ImportPayload } from "@/features/bookmarks/components/ImportModal";

export interface RenameFolderPayload {
  folder: Tables<"folders">;
  bookmarkCount: number;
}

interface RenameFolderModalProps {
  payload?: unknown;
}

export function RenameFolderModal({ payload }: RenameFolderModalProps) {
  const data = payload as RenameFolderPayload | undefined;
  const updateFolder = useUpdateFolder();
  const { data: folderBookmarks } = useBookmarks({ folderId: data?.folder.id });
  const [value, setValue] = useState(data?.folder.name ?? "");

  if (!data) return null;

  const { folder, bookmarkCount } = data;
  const canSave = value.trim().length > 0 && !updateFolder.isPending;

  const handleExport = () => {
    const bookmarks = folderBookmarks ?? [];
    if (!bookmarks.length) return;
    const count = exportBookmarksAsJson(
      bookmarks,
      () => folder.name,
      `pinsei-${folder.name.toLowerCase().replace(/\s+/g, "-")}.json`,
    );
    toast({
      icon: "download",
      title: "Folder exported",
      sub: `${folder.name} · ${count} bookmarks`,
    });
  };

  const commit = () => {
    const clean = value.trim();
    if (!clean || updateFolder.isPending) return;
    const was = folder.name;
    updateFolder.mutate(
      { id: folder.id, updates: { name: clean } },
      {
        onSuccess: () => {
          closeModal();
          if (clean !== was)
            toast({
              icon: "pencil",
              title: "Folder renamed",
              sub: `${was} → ${clean}`,
            });
        },
        onError: (error) => {
          toast({
            icon: "alert-circle",
            title: "Couldn't rename folder",
            sub: error.message,
          });
        },
      },
    );
  };

  return (
    <ModalShell
      blur={false}
      darkOverlay
      className="max-w-[min(400px,calc(100vw-20px))] p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-2.75">
        <span
          className={`flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl ${tintClass(folder.tint)}`}
        >
          <Folder size={16} />
        </span>
        <div className="flex min-w-0 flex-col gap-px">
          <h2 className=" text-[19px] font-semibold leading-[1.1] text-foreground">
            Edit folder
          </h2>
          <p className=" text-[11.5px] font-medium text-muted-foreground">
            {bookmarkCount === 1 ? "1 bookmark" : `${bookmarkCount} bookmarks`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Folder name</Label>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") closeModal();
          }}
          autoFocus
          className="h-9 text-sm!"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Bookmarks</Label>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="h-9.5 flex-1"
            onClick={() => {
              closeModal();
              openModal("import-modal", {
                folderId: folder.id,
              } satisfies ImportPayload);
            }}
          >
            <Upload size={15} />
            Import into folder
          </Button>
          <Button
            variant="secondary"
            className="h-9.5 flex-1"
            disabled={bookmarkCount === 0}
            onClick={handleExport}
          >
            <Download size={15} />
            Export folder
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => closeModal()} size="lg">
          Cancel
        </Button>
        <Button onClick={commit} disabled={!canSave} size="lg">
          {updateFolder.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </ModalShell>
  );
}
