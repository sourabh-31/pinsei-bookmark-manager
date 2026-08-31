import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Check, Folder, Heart, Inbox, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/PageLoader";
import { BulkBar } from "@/components/shared/BulkBar";
import { dbRowToBookmark, tintClass } from "@/lib/bookmarkUtils";
import { UNSORTED, FAVOURITES } from "@/types/common.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookmarkItem } from "@/features/bookmarks/components/BookmarkItem";
import { openModal } from "@/lib/modalEvent";
import { useBookmarks } from "@/features/bookmarks/hooks/useBookmarks";
import { useFolders } from "@/features/folders/hooks/useFolders";
import type { FetchBookmarksOptions } from "@/lib/api";
import type { AddBookmarkPayload } from "@/features/bookmarks/components/AddBookmarkModal";

const SEARCH_DEBOUNCE_MS = 300;

export default function FolderDetail() {
  const { folderId = "" } = useParams();

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelectMode = () => {
    setSelectMode((val) => !val);
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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [q]);

  const { data: folderRows, isLoading: foldersLoading } = useFolders();
  const folder = folderRows?.find((f) => f.id === folderId);

  const name =
    folderId === FAVOURITES
      ? "Favourites"
      : folderId === UNSORTED
        ? "Unsorted"
        : (folder?.name ?? "Folder");

  const fetchOptions: FetchBookmarksOptions =
    folderId === FAVOURITES
      ? { favourite: true, search: debouncedQ }
      : folderId === UNSORTED
        ? { unsorted: true, search: debouncedQ }
        : { folderId, search: debouncedQ };

  const { data: bookmarkRows, isLoading: bookmarksLoading } =
    useBookmarks(fetchOptions);
  const items = (bookmarkRows ?? []).map(dbRowToBookmark);

  const icon =
    folderId === FAVOURITES ? (
      <Heart size={18} />
    ) : folderId === UNSORTED ? (
      <Inbox size={15} />
    ) : (
      <Folder size={15} />
    );
  const iconClass =
    folderId === FAVOURITES || folderId === UNSORTED
      ? "bg-accent text-accent-foreground"
      : tintClass(folder?.tint ?? 0);

  const isRealFolder = folderId !== FAVOURITES && folderId !== UNSORTED;
  const addPayload: AddBookmarkPayload | undefined = isRealFolder
    ? { folderId }
    : undefined;

  let emptyTitle: string;
  let emptyBody: string;
  let emptyCta: string;
  if (q) {
    emptyTitle = `No matches in ${name}`;
    emptyBody = `Nothing in this folder matches "${q}". Try a shorter search, or save something new here.`;
    emptyCta = "Add a bookmark";
  } else if (folderId === FAVOURITES) {
    emptyTitle = "No favourites yet";
    emptyBody =
      "Mark any bookmark as a favourite and it collects here, safe from folder cleanups.";
    emptyCta = "Add a bookmark";
  } else if (folderId === UNSORTED) {
    emptyTitle = "Nothing unsorted";
    emptyBody =
      "Every bookmark is filed. Anything you save without picking a folder will wait here.";
    emptyCta = "Add a bookmark";
  } else {
    emptyTitle = `${name} is empty`;
    emptyBody =
      "Save a link straight into this folder, or move bookmarks here from anywhere else in Pinsei.";
    emptyCta = `Add to ${name}`;
  }

  if (foldersLoading || bookmarksLoading) return <PageLoader />;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <Link
          to="/folders"
          aria-label="Back to folders"
          className="flex rounded-[10px] border border-border bg-card p-1.5 text-muted-foreground hover:border-[oklch(0.87_0.06_6)] hover:text-primary"
        >
          <ArrowLeft size={15} />
        </Link>
        <span
          className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-[10px] ${iconClass}`}
        >
          {icon}
        </span>
        <h1 className=" text-base font-semibold">{name}</h1>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {items.length}
        </span>

        {(q || items.length > 0) && (
          <div className="ml-0 flex w-full flex-wrap items-center gap-2 md:ml-auto md:w-auto">
            <div className="relative flex flex-1 items-center md:flex-none">
              <Input
                isSearchIcon
                placeholder="Search in folder…"
                className="sm:w-45"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleSelectMode}
              className={`${selectMode && "border-primary bg-accent text-accent-foreground"}`}
            >
              <Check className="size-3.5" />
              {selectMode ? "Done" : "Select"}
            </Button>
            <Button
              size="sm"
              onClick={() => openModal("add-modal", addPayload)}
            >
              <Plus />
              Add here
            </Button>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4 grid grid-cols-1 items-start gap-3 md:grid-cols-[repeat(auto-fill,minmax(330px,1fr))]">
          {items.map((b) => (
            <BookmarkItem
              key={b.id}
              bookmark={b}
              layout="card"
              selectMode={selectMode}
              selected={selectedIds.has(b.id)}
              onToggleSelect={() => toggleSelect(b.id)}
            />
          ))}
        </div>
      )}

      {items.length === 0 && (
        <EmptyState title={emptyTitle} body={emptyBody}>
          <Button
            className="min-w-45"
            onClick={() => openModal("add-modal", addPayload)}
          >
            {emptyCta}
          </Button>
        </EmptyState>
      )}

      <BulkBar
        selectedIds={Array.from(selectedIds)}
        onClear={() => setSelectedIds(new Set())}
        currentFolderId={isRealFolder ? folderId : null}
      />
    </div>
  );
}
