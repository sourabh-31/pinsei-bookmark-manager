import type { Toast } from "@/types/common.type";

export function toast(t: Omit<Toast, "id">) {
  const id = "t" + Date.now() + Math.random().toString(36).slice(2, 6);
  window.dispatchEvent(
    new CustomEvent("show-toast", {
      detail: { id, ...t },
    }),
  );
}

export function dismissToast(id: string) {
  window.dispatchEvent(new CustomEvent("dismiss-toast", { detail: id }));
}
