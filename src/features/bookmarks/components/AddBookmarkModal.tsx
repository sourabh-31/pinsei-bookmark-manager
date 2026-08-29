import { useState } from "react";
import { toast } from "@/lib/toastEvent";
import { closeModal, openModal } from "@/lib/modalEvent";
import { ModalShell } from "@/components/shared/ModalShell";
import {
  normalizeUrl,
  cleanUrl,
  dbRowToBookmark,
  titleFromUrl,
  fetchPageTitle,
} from "@/lib/bookmarkUtils";
import {
  useAddBookmark,
  useBookmarks,
} from "@/features/bookmarks/hooks/useBookmarks";
import { useAddFolder, useFolders } from "@/features/folders/hooks/useFolders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DupePayload } from "./DupeModal";

const NEW_FOLDER = "__new";

export interface AddBookmarkPayload {
  folderId?: string;
}

interface AddBookmarkModalProps {
  payload?: unknown;
}

export function AddBookmarkModal({ payload }: AddBookmarkModalProps) {
  const data = payload as AddBookmarkPayload | undefined;
  const { data: bookmarkRows } = useBookmarks();
  const { data: binnedBookmarkRows } = useBookmarks({ deleted: true });
  const { data: folderRows } = useFolders();
  const addBookmark = useAddBookmark();
  const addFolder = useAddFolder();
  const [url, setUrl] = useState("");
  const [folder, setFolder] = useState(data?.folderId || "");
  const [newFolderName, setNewFolderName] = useState("");
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);

  const folders = folderRows ?? [];
  const showNewFolder = folder === NEW_FOLDER;
  const isSaving =
    addBookmark.isPending || addFolder.isPending || isFetchingTitle;
  const canSave =
    url.trim() && (!showNewFolder || newFolderName.trim()) && !isSaving;

  const save = async () => {
    if (!canSave) return;
    const clean = cleanUrl(url);
    const key = normalizeUrl(clean);
    const dupe = [...(bookmarkRows ?? []), ...(binnedBookmarkRows ?? [])]
      .map(dbRowToBookmark)
      .find((b) => normalizeUrl(b.url) === key);
    if (dupe) {
      const dupePayload: DupePayload = {
        bookmark: dupe,
        target: folder,
        newFolderName: newFolderName.trim(),
      };
      openModal("dupe-modal", dupePayload);
      return;
    }

    try {
      let folderId: string | null = showNewFolder ? null : folder || null;
      if (showNewFolder) {
        const created = await addFolder.mutateAsync({
          name: newFolderName.trim(),
          tint: folders.length,
        });
        folderId = created.id;
      }

      setIsFetchingTitle(true);
      const withProtocol = clean.startsWith("http")
        ? clean
        : `https://${clean}`;
      const fetchedTitle = await fetchPageTitle(withProtocol);
      setIsFetchingTitle(false);

      await addBookmark.mutateAsync({
        title: fetchedTitle || titleFromUrl(clean),
        url: clean,
        folder_id: folderId,
      });

      toast({
        icon: "check",
        title: "Bookmark saved",
        sub: clean.split("/")[0],
      });
      closeModal();
    } catch (error) {
      toast({
        icon: "alert-circle",
        title: "Couldn't save bookmark",
        sub: error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  return (
    <ModalShell
      blur={false}
      darkOverlay
      className="max-w-[min(448px,calc(100vw-20px))] p-6 flex flex-col gap-4"
    >
      <h2 className="text-[19px] font-semibold leading-[1.1] text-foreground">
        Add bookmark
      </h2>

      <div className="flex flex-col gap-3">
        <Input
          placeholder="www.example.com"
          className="h-9 text-sm!"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <Label>Folder</Label>
          <Select
            value={folder}
            onValueChange={(v) => setFolder(v === "unsorted" ? "" : v)}
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

              <SelectItem value={NEW_FOLDER} className="text-sm">
                + New folder
              </SelectItem>
            </SelectContent>
          </Select>
          {showNewFolder && (
            <Input
              placeholder="New folder name"
              className="h-9 text-sm!"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={save} disabled={!canSave} size="lg">
          {isSaving ? "Saving..." : "Save bookmark"}
        </Button>
      </div>
    </ModalShell>
  );
}
