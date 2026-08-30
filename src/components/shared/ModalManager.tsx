import React, { useEffect, useState } from "react";
import { AddBookmarkModal } from "@/features/bookmarks/components/AddBookmarkModal";
import { ConfirmModal } from "@/features/folders/components/ConfirmModal";
import { ConfirmActionModal } from "@/features/bookmarks/components/ConfirmActionModal";
import { RenameFolderModal } from "@/features/folders/components/RenameFolderModal";
import type { Modal } from "@/types/common.type";
import type { OpenModalDetail } from "@/lib/modalEvent";
import { ImportModal } from "@/features/bookmarks/components/ImportModal";
import { DupeModal } from "@/features/bookmarks/components/DupeModal";
import { EditBookmarkModal } from "@/features/bookmarks/components/EditBookmarkModal";
import { MoveModal } from "@/features/bookmarks/components/MoveModal";
import { NewFolderModal } from "@/features/folders/components/NewFolderModal";
import { SearchModal } from "@/features/search/SearchModal";
import { ChangePasswordModal } from "@/features/auth/components/ChangePasswordModal";

const modals: Record<Modal, React.ComponentType<{ payload?: unknown }>> = {
  "add-modal": AddBookmarkModal,
  "import-modal": ImportModal,
  "confirm-modal": ConfirmModal,
  "confirm-action-modal": ConfirmActionModal,
  "dupe-modal": DupeModal,
  "edit-modal": EditBookmarkModal,
  "move-modal": MoveModal,
  "new-folder-modal": NewFolderModal,
  "rename-folder-modal": RenameFolderModal,
  "search-modal": SearchModal,
  "change-password-modal": ChangePasswordModal,
};

export default function ModalManager() {
  const [state, setState] = useState<OpenModalDetail | null>(null);
  const ModalComponent = state ? modals[state.modal] : null;

  useEffect(() => {
    const handleOpen = (event: Event) => {
      setState((event as CustomEvent<OpenModalDetail>).detail);
    };

    const handleClose = () => {
      setState(null);
    };

    window.addEventListener("open-modal", handleOpen);
    window.addEventListener("close-modal", handleClose);

    return () => {
      window.removeEventListener("open-modal", handleOpen);
      window.removeEventListener("close-modal", handleClose);
    };
  }, []);

  return ModalComponent && <ModalComponent payload={state?.payload} />;
}
