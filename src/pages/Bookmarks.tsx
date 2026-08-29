import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { BulkBar } from "@/components/shared/BulkBar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookmarkItem } from "@/features/bookmarks/components/BookmarkItem";
import { openModal } from "@/lib/modalEvent";
import { useBookmarks } from "@/features/bookmarks/hooks/useBookmarks";
import { useFolders } from "@/features/folders/hooks/useFolders";
import { dbRowToBookmark } from "@/lib/bookmarkUtils";
import type { FetchBookmarksOptions } from "@/lib/api";

type Filter = "All" | "Favourites" | "Most Visited" | "Unsorted";
type Sort = "Newest" | "Oldest" | "A-Z";

const FILTERS: Filter[] = ["All", "Favourites", "Unsorted"];
const SEARCH_DEBOUNCE_MS = 300;

function toFetchOptions(
  filter: Filter,
  sort: Sort,
  search: string,
): FetchBookmarksOptions {
  if (filter === "Most Visited") {
    return { search, orderBy: "visits", ascending: false };
  }

  const options: FetchBookmarksOptions = { search };
  if (filter === "Favourites") options.favourite = true;
  if (filter === "Unsorted") options.unsorted = true;

  if (sort === "Newest") {
    options.orderBy = "created_at";
    options.ascending = false;
  } else if (sort === "Oldest") {
    options.orderBy = "created_at";
    options.ascending = true;
  } else if (sort === "A-Z") {
    options.orderBy = "title";
    options.ascending = true;
  }

  return options;
}

export default function Bookmarks() {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<Sort>("Newest");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

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

  const { data, isLoading } = useBookmarks(
    toFetchOptions(filter, sort, debouncedQ),
  );
  const { data: folderRows } = useFolders();
  const items = (data ?? []).map(dbRowToBookmark);
  const folderNameById = new Map((folderRows ?? []).map((f) => [f.id, f.name]));

  const isFiltered = filter !== "All" || !!q;
  const emptyTitle = isFiltered
    ? "No bookmarks match this view"
    : "No bookmarks yet";
  const emptyBody = isFiltered
    ? "Nothing here fits the filter you have applied. Try clearing it, or save something new."
    : "Save a link once and it shows up here, ready to file into a folder whenever you want.";
  const emptyCta = isFiltered ? "Add bookmark" : "Add your first bookmark";

  if (isLoading) return null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <h1 className=" text-base font-semibold">All Bookmarks</h1>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
          {items.length}
        </span>

        {(isFiltered || items.length > 0) && (
          <div className="ml-0 flex w-full flex-wrap items-center gap-2 md:ml-auto md:w-auto">
            <div className="items-center gap-0.5 flex">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-full border-0 px-3 py-1.5 font-sans text-xs font-medium cursor-pointer",
                    filter === f
                      ? "bg-accent text-accent-foreground"
                      : "bg-transparent text-muted-foreground",
                  )}
                >
                  {f}
                </button>
              ))}
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

            <Select value={sort} onValueChange={(e) => setSort(e as Sort)}>
              <SelectTrigger>
                <SelectValue placeholder="Newest First" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="Newest">Newest first</SelectItem>
                  <SelectItem value="Oldest">Oldest first</SelectItem>
                  <SelectItem value="A-Z">A to Z</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="relative flex flex-1 items-center md:flex-none">
              <Input
                isSearchIcon
                placeholder="Search in folder…"
                className="sm:w-45"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
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
              showFolder
              folderName={b.folderId ? folderNameById.get(b.folderId) : null}
              selectMode={selectMode}
              selected={selectedIds.has(b.id)}
              onToggleSelect={() => toggleSelect(b.id)}
            />
          ))}
        </div>
      )}

      {items.length === 0 && (
        <EmptyState title={emptyTitle} body={emptyBody}>
          <div className="flex flex-col items-center justify-center gap-2.5 md:flex-row md:flex-wrap">
            <Button className="min-w-45" onClick={() => openModal("add-modal")}>
              {emptyCta}
            </Button>
            {isFiltered && (
              <Button
                variant="secondary"
                onClick={() => {
                  setFilter("All");
                  setQ("");
                }}
                className="min-w-45"
              >
                Clear filters
              </Button>
            )}
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
