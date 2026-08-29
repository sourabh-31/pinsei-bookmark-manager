export type ListBucket = "recent" | "favourites" | "visited";

export type Modal =
  | "add-modal"
  | "import-modal"
  | "confirm-modal"
  | "confirm-action-modal"
  | "dupe-modal"
  | "edit-modal"
  | "move-modal"
  | "new-folder-modal"
  | "rename-folder-modal"
  | "search-modal";

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  list: ListBucket;
  folderId: string | null;
  favourite: boolean;
  deleted: boolean;
  visits: number;
  createdAt: number;
  /** Set when a bookmark was trashed as part of a folder deletion, so it can be restored with the folder. */
  viaFolder?: string | null;
}

export interface Folder {
  id: string;
  name: string;
  tint: number;
  pinned: boolean;
}

export interface BinFolder extends Folder {
  deletedAt: number;
}

export interface Toast {
  id: string;
  icon: string;
  title: string;
  sub?: string;
  actionLabel?: string;
  action?: () => void;
}

export interface ConfirmState {
  title: string;
  body?: string;
  lines?: { n: number; text: string }[];
  label: string;
  run: () => void;
}

export interface DupeState {
  id: string;
  target: string;
  newName: string;
}

export interface EditState {
  id: string;
  title: string;
  url: string;
  folderId: string;
}

export interface MoveState {
  id?: string;
  ids?: string[];
}

export interface RenameState {
  id: string;
  value: string;
}

/** Sentinel folder ids used for the two built-in smart folders. */
export const UNSORTED = "unsorted";
export const FAVOURITES = "favourites";
