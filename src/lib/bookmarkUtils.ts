import type { Bookmark } from "@/types/common.type";
import type { Tables } from "@/types/database.types";
import { supabase } from "@/lib/supabase";

export function dbRowToBookmark(row: Tables<"bookmarks">): Bookmark {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    list: "recent",
    folderId: row.folder_id,
    favourite: row.favourite,
    deleted: !!row.deleted_at,
    visits: row.visits,
    createdAt: new Date(row.created_at).getTime(),
    viaFolder: row.deleted_from_folder_id,
  };
}

export function faviconFor(url: string) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${url.replace(/^www\./, "")}`;
}

export function initials(title: string) {
  return title
    .replace(/[^a-zA-Z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/**
 * Normalizes a URL for duplicate detection: strips protocol, www, hash and
 * trailing slashes. The query string is kept — many sites (e.g. YouTube's
 * ?v=) encode the actual resource identity there, so stripping it would
 * make unrelated pages on the same path collide as "duplicates".
 */
export function normalizeUrl(u: string) {
  return (u || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/#.*$/, "")
    .replace(/\/+(?=\?|$)/, "");
}

export function cleanUrl(u: string) {
  return u
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}

export function titleFromUrl(url: string) {
  const clean = url.split("/")[0]!;
  const host = clean.replace(/^www\./, "").split(".")[0]!;
  return host ? host.charAt(0).toUpperCase() + host.slice(1) : clean;
}

/** Appends " (n)" to `base` until it no longer collides with `existing` (case-insensitive), e.g. "Work" -> "Work (2)". */
export function uniqueName(base: string, existing: string[]) {
  const taken = new Set(existing.map((n) => n.trim().toLowerCase()));
  if (!taken.has(base.toLowerCase())) return base;
  let n = 2;
  while (taken.has(`${base} (${n})`.toLowerCase())) n++;
  return `${base} (${n})`;
}

/** Fetches a URL's real page title via the fetch-page-title edge function. Returns null if it's unavailable. */
export async function fetchPageTitle(url: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke<{
      title: string | null;
    }>("fetch-page-title", {
      body: { url },
    });

    if (error || !data) {
      return null;
    }

    const title = data.title?.trim();

    return title || null;
  } catch {
    return null;
  }
}

/** Generates a unique id for a new record. Kept outside component render bodies so it stays a pure call site. */
export function genId(prefix: string) {
  return (
    prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

const TINT_CLASSES = [
  "tint-0",
  "tint-1",
  "tint-2",
  "tint-3",
  "tint-4",
  "tint-5",
] as const;

/** Cycles a folder's tint index into one of the 6 palette pairs defined in globals.css. */
export function tintClass(index: number) {
  const i = ((index % 6) + 6) % 6;
  return TINT_CLASSES[i];
}

/** Triggers a browser download of `data` as a formatted JSON file. */
export function downloadJson(filename: string, data: unknown) {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  } catch {
    // download blocked (e.g. sandboxed preview) - toast still confirms the export ran
  }
}

/** Maps bookmark rows to portable export JSON and downloads them. Returns the exported count. */
export function exportBookmarksAsJson(
  bookmarks: Tables<"bookmarks">[],
  getFolderName: (folderId: string | null) => string | null,
  filename: string,
) {
  const data = bookmarks.map((b) => ({
    title: b.title,
    url: b.url.startsWith("http") ? b.url : `https://${b.url}`,
    folder: getFolderName(b.folder_id),
    favourite: b.favourite,
  }));
  downloadJson(filename, data);
  return data.length;
}
