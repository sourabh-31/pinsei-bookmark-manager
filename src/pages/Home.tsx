import { Folder, Pin } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/PageLoader";
import { HomePanel } from "@/features/home/HomePanel";
import { dbRowToBookmark, tintClass } from "@/lib/bookmarkUtils";
import { UNSORTED, FAVOURITES } from "@/types/common.type";
import { Button } from "@/components/ui/button";
import { openModal } from "@/lib/modalEvent";
import { useBookmarks } from "@/features/bookmarks/hooks/useBookmarks";
import { useFolders, useUpdateFolder } from "@/features/folders/hooks/useFolders";

export default function Home() {
  const { data, isLoading } = useBookmarks();
  const { data: folderRows, isLoading: foldersLoading } = useFolders();
  const updateFolder = useUpdateFolder();
  const bookmarks = (data ?? []).map(dbRowToBookmark);
  const folders = folderRows ?? [];

  const recent = bookmarks;
  const favourites = bookmarks.filter((b) => b.favourite);
  const unsorted = bookmarks.filter((b) => !b.folderId);
  const pinnedFolders = folders.filter((f) => f.pinned);

  const stats = [
    { value: bookmarks.length, label: "Bookmarks" },
    { value: folders.length, label: "Folders" },
    { value: favourites.length, label: "Favourites" },
    { value: unsorted.length, label: "Unsorted" },
  ];

  if (isLoading || foldersLoading) return <PageLoader />;

  const isBlank = bookmarks.length === 0;

  if (isBlank) {
    return (
      <EmptyState
        title="Your board is empty"
        body="Save your first link and Home fills up on its own with recently added, favourites and the folders you pin."
      >
        <div className="flex flex-col items-center justify-center gap-2.5 md:flex-row md:flex-wrap">
          <Button className="min-w-45" onClick={() => openModal("add-modal")}>
            Add your first bookmark
          </Button>
          <Button
            variant="secondary"
            className="min-w-45"
            onClick={() => openModal("import-modal")}
          >
            Import from browser
          </Button>
        </div>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="min-w-0 rounded-2xl bg-card px-4 py-3 shadow-card sm:min-w-35"
          >
            <p className=" text-xl font-semibold leading-tight text-primary">
              {s.value}
            </p>
            <p className=" mt-0.5 text-xs font-medium text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(310px,1fr))]">
        <HomePanel
          title="Recently Added"
          items={recent}
          viewAllTo="/all-bookmarks"
        />
        <HomePanel
          title="Your Favourites"
          items={favourites}
          viewAllTo={`/folders/${FAVOURITES}`}
        />
        <HomePanel
          title="Unsorted"
          items={unsorted}
          viewAllTo={`/folders/${UNSORTED}`}
        />
        {pinnedFolders.map((f) => (
          <HomePanel
            key={f.id}
            title={f.name}
            icon={<Folder size={13} />}
            iconClassName={tintClass(f.tint)}
            items={bookmarks.filter((b) => b.folderId === f.id)}
            viewAllTo={`/folders/${f.id}`}
            actions={
              <button
                type="button"
                aria-label="Unpin folder"
                onClick={() =>
                  updateFolder.mutate({ id: f.id, updates: { pinned: false } })
                }
                className="flex rounded-lg border-0 bg-accent p-1.25 text-accent-foreground cursor-pointer"
              >
                <Pin size={13} />
              </button>
            }
          />
        ))}
      </div>
    </div>
  );
}
