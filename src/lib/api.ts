import { supabase } from "@/lib/supabase";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/database.types";

export async function signUp(
  fullName: string,
  email: string,
  password: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/home`,
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export interface FetchBookmarksOptions {
  favourite?: boolean;
  unsorted?: boolean;
  folderId?: string;
  search?: string;
  orderBy?: "created_at" | "visits" | "title";
  ascending?: boolean;
  /** Fetch deleted (bin) bookmarks instead of live ones. */
  deleted?: boolean;
}

export async function fetchBookmarks(
  userId: string,
  options: FetchBookmarksOptions = {},
): Promise<Tables<"bookmarks">[]> {
  const {
    favourite,
    unsorted,
    folderId,
    search,
    orderBy = "created_at",
    ascending = false,
    deleted,
  } = options;

  let query = supabase.from("bookmarks").select("*").eq("user_id", userId);
  query = deleted
    ? query.not("deleted_at", "is", null)
    : query.is("deleted_at", null);

  if (favourite) query = query.eq("favourite", true);
  if (unsorted) query = query.is("folder_id", null);
  if (folderId) query = query.eq("folder_id", folderId);

  const term = search?.trim().replace(/[%,()]/g, "");
  if (term) query = query.or(`title.ilike.%${term}%,url.ilike.%${term}%`);

  const { data, error } = await query.order(orderBy, { ascending });

  if (error) throw error;
  return data;
}

export async function addBookmark(
  bookmark: TablesInsert<"bookmarks">,
): Promise<Tables<"bookmarks">> {
  const { data, error } = await supabase
    .from("bookmarks")
    .insert(bookmark)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addBookmarks(
  bookmarks: TablesInsert<"bookmarks">[],
): Promise<Tables<"bookmarks">[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .insert(bookmarks)
    .select();

  if (error) throw error;
  return data;
}

export async function updateBookmarks(
  ids: string[],
  updates: TablesUpdate<"bookmarks">,
): Promise<Tables<"bookmarks">[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .update(updates)
    .in("id", ids)
    .select();

  if (error) throw error;
  return data;
}

export async function deleteBookmarksForever(ids: string[]): Promise<void> {
  const { error } = await supabase.from("bookmarks").delete().in("id", ids);
  if (error) throw error;
}

/** Restores bookmarks that were trashed alongside a deleted folder, refiling them back into it. */
export async function restoreBookmarksFromFolder(
  folderId: string,
): Promise<Tables<"bookmarks">[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .update({
      deleted_at: null,
      folder_id: folderId,
      deleted_from_folder_id: null,
    })
    .eq("deleted_from_folder_id", folderId)
    .not("deleted_at", "is", null)
    .select();

  if (error) throw error;
  return data;
}

export async function fetchFolders(
  userId: string,
): Promise<Tables<"folders">[]> {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function addFolder(
  folder: TablesInsert<"folders">,
): Promise<Tables<"folders">> {
  const { data, error } = await supabase
    .from("folders")
    .insert(folder)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFolder(
  id: string,
  updates: TablesUpdate<"folders">,
): Promise<Tables<"folders">> {
  const { data, error } = await supabase
    .from("folders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchDeletedFolders(
  userId: string,
): Promise<Tables<"folders">[]> {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) throw error;
  return data;
}

/** Permanently deletes a bin folder and any bookmarks that were trashed alongside it. */
export async function deleteFolderForever(folderId: string): Promise<void> {
  const { error: bookmarksError } = await supabase
    .from("bookmarks")
    .delete()
    .eq("deleted_from_folder_id", folderId)
    .not("deleted_at", "is", null);
  if (bookmarksError) throw bookmarksError;

  const { error: folderError } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId);
  if (folderError) throw folderError;
}

/** Permanently deletes every bin bookmark and bin folder for the user. */
export async function emptyBin(userId: string): Promise<void> {
  const { error: bookmarksError } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .not("deleted_at", "is", null);
  if (bookmarksError) throw bookmarksError;

  const { error: foldersError } = await supabase
    .from("folders")
    .delete()
    .eq("user_id", userId)
    .not("deleted_at", "is", null);
  if (foldersError) throw foldersError;
}
