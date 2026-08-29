import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addFolder,
  deleteFolderForever,
  emptyBin,
  fetchDeletedFolders,
  fetchFolders,
  restoreBookmarksFromFolder,
  updateBookmarks,
  updateFolder,
} from "@/lib/api";
import { useSession } from "@/features/auth/hooks/useAuth";
import { bookmarksQueryKey } from "@/features/bookmarks/hooks/useBookmarks";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database.types";

function foldersQueryKey(userId: string | undefined) {
  return ["folders", userId] as const;
}

function deletedFoldersQueryKey(userId: string | undefined) {
  return ["folders", "deleted", userId] as const;
}

export function useFolders() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: foldersQueryKey(userId),
    queryFn: () => fetchFolders(userId!),
    enabled: !!userId,
  });
}

type NewFolder = Omit<TablesInsert<"folders">, "user_id">;

export function useAddFolder() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folder: NewFolder) => {
      if (!userId) throw new Error("You must be signed in to add a folder");
      return addFolder({ ...folder, user_id: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foldersQueryKey(userId) });
    },
  });
}

export function useUpdateFolder() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: TablesUpdate<"folders">;
    }) => updateFolder(id, updates),
    onMutate: async ({ id, updates }) => {
      const key = foldersQueryKey(userId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Tables<"folders">[]>(key);
      queryClient.setQueryData<Tables<"folders">[]>(key, (old) =>
        old?.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(foldersQueryKey(userId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: foldersQueryKey(userId) });
    },
  });
}

export function useDeleteFolder() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      folderId,
      keepIds,
      trashIds,
    }: {
      folderId: string;
      keepIds: string[];
      trashIds: string[];
    }) => {
      if (keepIds.length) {
        await updateBookmarks(keepIds, { folder_id: null });
      }
      if (trashIds.length) {
        await updateBookmarks(trashIds, {
          deleted_at: new Date().toISOString(),
          deleted_from_folder_id: folderId,
          folder_id: null,
        });
      }
      return updateFolder(folderId, { deleted_at: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foldersQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: deletedFoldersQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: bookmarksQueryKey(userId) });
    },
  });
}

export function useDeletedFolders() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: deletedFoldersQueryKey(userId),
    queryFn: () => fetchDeletedFolders(userId!),
    enabled: !!userId,
  });
}

export function useRestoreFolder() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      folderId,
      name,
    }: {
      folderId: string;
      /** Pass when the original name now clashes with a live folder. */
      name?: string;
    }) => {
      await updateFolder(folderId, {
        deleted_at: null,
        ...(name ? { name } : {}),
      });
      return restoreBookmarksFromFolder(folderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foldersQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: deletedFoldersQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: bookmarksQueryKey(userId) });
    },
  });
}

export function useDeleteFolderForever() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => deleteFolderForever(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deletedFoldersQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: bookmarksQueryKey(userId) });
    },
  });
}

export function useEmptyBin() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!userId) throw new Error("You must be signed in to empty the bin");
      return emptyBin(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deletedFoldersQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: bookmarksQueryKey(userId) });
    },
  });
}
