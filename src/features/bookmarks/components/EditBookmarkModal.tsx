import { useEffect, useRef, useState } from "react";
import { closeModal } from "@/lib/modalEvent";
import { toast } from "@/lib/toastEvent";
import { useFolders } from "@/features/folders/hooks/useFolders";
import { useUpdateBookmark } from "@/features/bookmarks/hooks/useBookmarks";
import { ModalShell } from "@/components/shared/ModalShell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface EditBookmarkPayload {
  id: string;
  title: string;
  url: string;
  folderId: string | null;
}

interface EditBookmarkModalProps {
  payload?: unknown;
}

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

export function EditBookmarkModal({ payload }: EditBookmarkModalProps) {
  const data = payload as EditBookmarkPayload | undefined;
  const { data: folderRows } = useFolders();
  const updateBookmark = useUpdateBookmark();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(data?.title ?? "");
  const [url, setUrl] = useState(data?.url ?? "");
  const [folderId, setFolderId] = useState(data?.folderId ?? "");

  const folders = folderRows ?? [];

  useEffect(() => {
    if (textareaRef.current) autoResize(textareaRef.current);
  }, []);

  if (!data) return null;

  const canSave = title.trim() && url.trim() && !updateBookmark.isPending;

  const save = () => {
    if (!canSave) return;
    const cleanTitle = title.trim();
    updateBookmark.mutate(
      {
        id: data.id,
        updates: {
          title: cleanTitle,
          url: url.trim().replace(/^https?:\/\//, ""),
          folder_id: folderId || null,
        },
      },
      {
        onSuccess: () => {
          closeModal();
          toast({
            icon: "check",
            title: "Bookmark updated",
            sub: cleanTitle,
          });
        },
        onError: (error) => {
          toast({
            icon: "alert-circle",
            title: "Couldn't update bookmark",
            sub: error.message,
          });
        },
      },
    );
  };

  return (
    <ModalShell className="max-w-[min(420px,calc(100vw-20px))] p-6 flex flex-col gap-4">
      <h2 className=" text-[19px] font-semibold leading-[1.1] text-foreground">
        Edit bookmark
      </h2>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Title</Label>
          <textarea
            ref={textareaRef}
            value={title}
            onChange={(e) => {
              autoResize(e.target);
              setTitle(e.target.value);
            }}
            rows={1}
            className="min-h-9.5 w-full resize-none overflow-hidden rounded-[10px] border border-border bg-card px-2.5 py-2.25 text-sm font-medium leading-[1.45] text-inherit shadow-[0_1px_2px_oklch(0_0_0/0.03)] outline-none wrap-anywhere hover:border-[oklch(0.9_0.004_300)] hover:text-foreground-secondary"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Link</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-9 text-sm!"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Folder</Label>
          <Select
            value={folderId}
            onValueChange={(v) => setFolderId(v === "unsorted" ? "" : v)}
          >
            <SelectTrigger className="w-full text-sm font-medium h-9!">
              <SelectValue placeholder="Unsorted" />
            </SelectTrigger>

            <SelectContent position="popper">
              <SelectItem value="unsorted" className="text-sm">
                Unsorted
              </SelectItem>

              {folders.map((f) => (
                <SelectItem key={f.id} value={f.id} className="text-sm">
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => closeModal()}>
          Cancel
        </Button>
        <Button onClick={save} disabled={!canSave}>
          {updateBookmark.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </ModalShell>
  );
}
