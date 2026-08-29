import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { faviconFor } from "@/lib/bookmarkUtils";
import { closeModal } from "@/lib/modalEvent";
import { toast } from "@/lib/toastEvent";
import { useAddFolder, useFolders } from "@/features/folders/hooks/useFolders";
import { useUpdateBookmark } from "@/features/bookmarks/hooks/useBookmarks";
import type { Bookmark } from "@/types/common.type";
import { ModalShell } from "@/components/shared/ModalShell";
import { Button } from "@/components/ui/button";

const NEW_FOLDER = "__new";

export interface DupePayload {
  bookmark: Bookmark;
  target: string;
  newFolderName: string;
}

interface DupeModalProps {
  payload?: unknown;
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-md bg-accent px-1.25 text-[13px] font-bold text-accent-foreground">
      {children}
    </span>
  );
}

export function DupeModal({ payload }: DupeModalProps) {
  const navigate = useNavigate();
  const data = payload as DupePayload | undefined;
  const { data: folderRows } = useFolders();
  const addFolder = useAddFolder();
  const updateBookmark = useUpdateBookmark();

  if (!data) return null;

  const { bookmark: b, target, newFolderName } = data;
  const folders = folderRows ?? [];

  const isNew = target === NEW_FOLDER && !!newFolderName;
  const targetId = isNew ? null : target || null;
  const folderName = (id: string | null) =>
    id ? (folders.find((f) => f.id === id)?.name ?? "Unsorted") : "Unsorted";
  const targetName = isNew ? newFolderName : folderName(targetId);
  const currentName = folderName(b.folderId);
  const same = !isNew && (b.folderId || null) === targetId;

  const isBusy = addFolder.isPending || updateBookmark.isPending;

  const goTo = () => {
    closeModal();
    if (b.deleted) navigate("/bin");
    else if (b.folderId) navigate(`/folders/${b.folderId}`);
    else navigate("/all-bookmarks");
  };

  const commit = async (label: string) => {
    if (isBusy) return;
    try {
      let fid: string | null = targetId;
      if (isNew) {
        const hit = folders.find(
          (f) => f.name.toLowerCase() === newFolderName.toLowerCase(),
        );
        fid = hit
          ? hit.id
          : (
              await addFolder.mutateAsync({
                name: newFolderName,
                tint: folders.length,
              })
            ).id;
      }

      const wasDeleted = b.deleted;
      const previousFolderId = b.folderId;

      await updateBookmark.mutateAsync({
        id: b.id,
        updates: {
          folder_id: fid,
          ...(wasDeleted
            ? { deleted_at: null, deleted_from_folder_id: null }
            : {}),
        },
      });

      closeModal();
      navigate(fid ? `/folders/${fid}` : "/all-bookmarks");
      toast({
        icon: wasDeleted ? "rotate-ccw" : "folder",
        title: label,
        sub: b.title,
        actionLabel: "Undo",
        action: () => {
          updateBookmark.mutate({
            id: b.id,
            updates: {
              folder_id: previousFolderId,
              ...(wasDeleted ? { deleted_at: new Date().toISOString() } : {}),
            },
          });
        },
      });
    } catch (error) {
      toast({
        icon: "alert-circle",
        title: "Something went wrong",
        sub: error instanceof Error ? error.message : undefined,
      });
    }
  };

  let title: string;
  let body: ReactNode;
  let where: string;
  let secondaryLabel: string;
  let secondary: () => void;
  let primaryLabel: string;
  let primary: () => void;

  if (b.deleted) {
    title = "This one is in your Bin";
    body = (
      <>
        You deleted this link earlier, so it is not in your library right now.
        Saving it again restores the original into <Chip>{targetName}</Chip>. No
        duplicate is created.
      </>
    );
    where = "In the Bin  ·  " + b.url;
    secondaryLabel = "Go to Bin";
    secondary = goTo;
    primaryLabel = "Restore to " + targetName;
    primary = () => commit("Restored to " + targetName);
  } else if (same) {
    title = "Already in " + targetName;
    body = (
      <>
        This exact link is already saved in <Chip>{targetName}</Chip>, so there
        is nothing to add. Open it, or close this and save something else.
      </>
    );
    where = "In " + currentName + "  ·  " + b.url;
    secondaryLabel = "Close";
    secondary = () => closeModal();
    primaryLabel = "Go to it";
    primary = goTo;
  } else {
    title = "You already saved this";
    body = (
      <>
        It lives in <Chip>{currentName}</Chip> right now. Saving again will not
        create a copy. It moves the bookmark from <Chip>{currentName}</Chip> to{" "}
        <Chip>{targetName}</Chip>, keeping its title, favourite and visit
        history.
      </>
    );
    where = "In " + currentName + "  ·  " + b.url;
    secondaryLabel = "Keep it in " + currentName;
    secondary = goTo;
    primaryLabel = "Move to " + targetName;
    primary = () => commit("Moved to " + targetName);
  }

  return (
    <ModalShell className="max-w-[min(420px,calc(100vw-20px))] p-6 flex flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <h2 className=" text-[19px] font-medium leading-[1.1] text-foreground">
          {title}
        </h2>
        <p className=" mt-0.5 text-pretty text-[13.5px] leading-[1.65] text-foreground-secondary">
          {body}
        </p>
      </div>

      <div className="flex items-center gap-2.75 rounded-xl border border-border-subtle bg-[oklch(0.982_0.002_300)] px-2.75 py-2.25">
        <img
          src={faviconFor(b.url)}
          alt=""
          className="h-6.5 w-6.5 shrink-0 rounded-lg object-contain"
        />
        <div className="min-w-0 flex-1">
          <p className=" overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-foreground-secondary">
            {b.title}
          </p>
          <p className=" mt-px overflow-hidden text-ellipsis whitespace-nowrap text-[10.5px] font-semibold text-muted-foreground">
            {where}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="secondary"
          onClick={secondary}
          disabled={isBusy}
          size="lg"
        >
          {secondaryLabel}
        </Button>
        <Button onClick={primary} disabled={isBusy} size="lg">
          {isBusy ? "Working..." : primaryLabel}
        </Button>
      </div>
    </ModalShell>
  );
}
