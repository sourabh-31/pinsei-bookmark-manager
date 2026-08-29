import type { Modal } from "../types/common.type";

export interface OpenModalDetail {
  modal: Modal;
  payload?: unknown;
}

export function openModal(modal: Modal, payload?: unknown) {
  window.dispatchEvent(
    new CustomEvent<OpenModalDetail>("open-modal", {
      detail: { modal, payload },
    }),
  );
}

export function closeModal() {
  window.dispatchEvent(new Event("close-modal"));
}
