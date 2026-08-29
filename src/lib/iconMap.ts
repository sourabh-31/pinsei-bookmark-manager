import {
  AlertCircle,
  Bookmark,
  Check,
  Download,
  Folder,
  FolderInput,
  FolderPlus,
  Heart,
  House,
  Inbox,
  Link2,
  LogOut,
  Pencil,
  Pin,
  RotateCcw,
  SearchX,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react";

/** Maps the string icon keys used by toasts / search results / the duplicate dialog to their Lucide component. */
export const ICONS: Record<string, LucideIcon> = {
  plus: FolderPlus,
  link: Link2,
  check: Check,
  "trash-2": Trash2,
  "rotate-ccw": RotateCcw,
  pencil: Pencil,
  "folder-plus": FolderPlus,
  pin: Pin,
  "folder-input": FolderInput,
  download: Download,
  upload: Upload,
  "log-out": LogOut,
  "search-x": SearchX,
  house: House,
  folder: Folder,
  bookmark: Bookmark,
  heart: Heart,
  inbox: Inbox,
  "alert-circle": AlertCircle,
};

export function iconFor(name?: string): LucideIcon {
  return (name && ICONS[name]) || Bookmark;
}
