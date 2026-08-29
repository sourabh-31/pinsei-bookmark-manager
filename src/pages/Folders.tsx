import { Folder, Heart, Inbox, Pencil, Pin, Plus, Trash2 } from "lucide-react";
import { FolderCard } from "@/features/folders/components/FolderCard";
import { dbRowToBookmark, tintClass } from "@/lib/bookmarkUtils";
import { UNSORTED, FAVOURITES } from "@/types/common.type";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { openModal } from "@/lib/modalEvent";
import {
  useFolders,
  useUpdateFolder,
} from "@/features/folders/hooks/useFolders";
import { useBookmarks } from "@/features/bookmarks/hooks/useBookmarks";
import type { DeleteFolderConfirmPayload } from "@/features/folders/components/ConfirmModal";
import type { RenameFolderPayload } from "@/features/folders/components/RenameFolderModal";

export default function Folders() {
  const { data: folderRows, isLoading: foldersLoading } = useFolders();
  const { data: bookmarkRows, isLoading: bookmarksLoading } = useBookmarks();
  const updateFolder = useUpdateFolder();

  const folders = folderRows ?? [];
  const bookmarks = (bookmarkRows ?? []).map(dbRowToBookmark);
  const unsorted = bookmarks.filter((b) => !b.folderId);
  const favourites = bookmarks.filter((b) => b.favourite);

  if (foldersLoading || bookmarksLoading) return null;

  return (
    <div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <h1 className=" text-base font-semibold">Folders</h1>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {folders.length + 2}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={() => openModal("new-folder-modal")}>
            <Plus />
            New folder
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[repeat(auto-fill,minmax(310px,1fr))]">
        <FolderCard
          to={`/folders/${UNSORTED}`}
          icon={<Inbox size={15} />}
          iconClassName="bg-muted text-muted-foreground"
          name="Unsorted"
          countLabel={
            unsorted.length === 1
              ? "1 bookmark"
              : `${unsorted.length} bookmarks`
          }
          items={unsorted}
        />
        <FolderCard
          to={`/folders/${FAVOURITES}`}
          icon={<Heart size={18} />}
          iconClassName="bg-accent text-accent-foreground"
          name="Favourites"
          countLabel={
            favourites.length === 1
              ? "1 bookmark"
              : `${favourites.length} bookmarks`
          }
          items={favourites}
        />

        {folders.map((f) => {
          const items = bookmarks.filter((b) => b.folderId === f.id);
          const keep = items.filter((b) => b.favourite);
          const trash = items.filter((b) => !b.favourite);
          const confirmDeletePayload: DeleteFolderConfirmPayload = {
            folder: f,
            keep,
            trash,
          };
          const renamePayload: RenameFolderPayload = {
            folder: f,
            bookmarkCount: items.length,
          };
          return (
            <FolderCard
              key={f.id}
              to={`/folders/${f.id}`}
              icon={<Folder size={15} />}
              iconClassName={tintClass(f.tint)}
              name={f.name}
              countLabel={
                items.length === 1 ? "1 bookmark" : `${items.length} bookmarks`
              }
              items={items}
              actions={
                <>
                  <button
                    type="button"
                    aria-label="Rename folder"
                    onClick={() =>
                      openModal("rename-folder-modal", renamePayload)
                    }
                    className="flex rounded-lg border-0 bg-transparent p-1.25 text-muted-foreground/80 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label={f.pinned ? "Unpin folder" : "Pin folder"}
                    onClick={() =>
                      updateFolder.mutate({
                        id: f.id,
                        updates: { pinned: !f.pinned },
                      })
                    }
                    className={cn(
                      "flex rounded-lg border-0 p-1.25 cursor-pointer",
                      f.pinned
                        ? "bg-accent text-accent-foreground"
                        : "bg-transparent text-muted-foreground/80",
                    )}
                  >
                    <Pin size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openModal("confirm-modal", confirmDeletePayload)
                    }
                    aria-label="Delete folder"
                    className="flex rounded-lg border-0 bg-transparent p-1.25 text-muted-foreground/80 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              }
            />
          );
        })}
      </div>
    </div>
  );
}
