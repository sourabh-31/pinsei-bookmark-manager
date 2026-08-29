import { useState } from "react";
import { toast } from "@/lib/toastEvent";
import { closeModal } from "@/lib/modalEvent";
import { useAddFolder, useFolders } from "@/features/folders/hooks/useFolders";
import { uniqueName } from "@/lib/bookmarkUtils";
import { ModalShell } from "@/components/shared/ModalShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewFolderModal() {
  const { data } = useFolders();
  const addFolder = useAddFolder();
  const [name, setName] = useState("");

  const create = () => {
    const clean = name.trim();
    if (!clean || addFolder.isPending) return;
    const finalName = uniqueName(clean, (data ?? []).map((f) => f.name));
    addFolder.mutate(
      { name: finalName, tint: data?.length ?? 0 },
      {
        onSuccess: () => {
          toast({
            icon: "folder-plus",
            title: "Folder created",
            sub: finalName,
          });
          closeModal();
        },
        onError: (error) => {
          toast({
            icon: "alert-circle",
            title: "Couldn't create folder",
            sub: error.message,
          });
        },
      },
    );
  };

  return (
    <ModalShell
      blur={false}
      darkOverlay
      className="max-w-[min(400px,calc(100vw-20px))] p-6 flex flex-col gap-4"
    >
      <h2 className=" text-[19px] font-semibold leading-[1.1] text-foreground">
        New folder
      </h2>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && create()}
        placeholder="Folder name"
        autoFocus
        className="h-9 text-sm!"
      />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => closeModal()} size="lg">
          Cancel
        </Button>
        <Button
          onClick={create}
          size="lg"
          disabled={!name.trim() || addFolder.isPending}
        >
          {addFolder.isPending ? "Creating..." : "Create folder"}
        </Button>
      </div>
    </ModalShell>
  );
}
