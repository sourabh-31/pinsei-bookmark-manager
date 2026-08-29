import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addBookmark,
  addBookmarks,
  deleteBookmarksForever,
  fetchBookmarks,
  updateBookmarks,
  type FetchBookmarksOptions,
} from "@/lib/api";
import { useSession } from "@/features/auth/hooks/useAuth";
import type { TablesInsert, TablesUpdate } from "@/types/database.types";

export function bookmarksQueryKey(userId: string | undefined) {
  return ["bookmarks", userId] as const;
}

export function useBookmarks(options: FetchBookmarksOptions = {}) {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: [...bookmarksQueryKey(userId), options] as const,
    queryFn: () => fetchBookmarks(userId!, options),
    enabled: !!userId,
    placeholderData: keepPreviousData,
  });
}

type NewBookmark = Omit<TablesInsert<"bookmarks">, "user_id">;

export function useAddBookmark() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookmark: NewBookmark) => {
      if (!userId) throw new Error("You must be signed in to add a bookmark");
      return addBookmark({ ...bookmark, user_id: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarksQueryKey(userId) });
    },
  });
}

export function useAddBookmarks() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookmarks: NewBookmark[]) => {
      if (!userId) throw new Error("You must be signed in to add bookmarks");
      return addBookmarks(bookmarks.map((b) => ({ ...b, user_id: userId })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarksQueryKey(userId) });
    },
  });
}

export function useDeleteBookmark() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      updateBookmarks([id], { deleted_at: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarksQueryKey(userId) });
    },
  });
}

export function useRestoreBookmark() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      updateBookmarks([id], { deleted_at: null, deleted_from_folder_id: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarksQueryKey(userId) });
    },
  });
}

export function useDeleteBookmarks() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      updateBookmarks(ids, { deleted_at: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarksQueryKey(userId) });
    },
  });
}

export function useRestoreBookmarks() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      updateBookmarks(ids, { deleted_at: null, deleted_from_folder_id: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarksQueryKey(userId) });
    },
  });
}

export function useDeleteBookmarkForever() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBookmarksForever([id]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarksQueryKey(userId) });
    },
  });
}

export function useDeleteBookmarksForever() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => deleteBookmarksForever(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarksQueryKey(userId) });
    },
  });
}

export function useUpdateBookmark() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: TablesUpdate<"bookmarks">;
    }) => updateBookmarks([id], updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarksQueryKey(userId) });
    },
  });
}

export function useMoveBookmarks() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ids,
      folderId,
    }: {
      ids: string[];
      folderId: string | null;
    }) => updateBookmarks(ids, { folder_id: folderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarksQueryKey(userId) });
    },
  });
}
