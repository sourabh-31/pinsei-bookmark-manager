import { useState } from "react";
import { Upload } from "lucide-react";
import { closeModal } from "@/lib/modalEvent";
import { toast } from "@/lib/toastEvent";
import {
  cleanUrl,
  normalizeUrl,
  titleFromUrl,
  fetchPageTitle,
} from "@/lib/bookmarkUtils";
import {
  useAddBookmarks,
  useBookmarks,
} from "@/features/bookmarks/hooks/useBookmarks";
import { useFolders } from "@/features/folders/hooks/useFolders";
import { ModalShell } from "@/components/shared/ModalShell";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface ImportPayload {
  folderId?: string;
}

interface ImportModalProps {
  payload?: unknown;
}

export function ImportModal({ payload }: ImportModalProps) {
  const data = payload as ImportPayload | undefined;
  const { data: folderRows } = useFolders();
  const { data: bookmarkRows } = useBookmarks();
  const { data: binnedBookmarkRows } = useBookmarks({ deleted: true });
  const addBookmarks = useAddBookmarks();

  const [text, setText] = useState("");
  const [folder, setFolder] = useState(data?.folderId || "");
  const [fileName, setFileName] = useState("");
  const [isFetchingTitles, setIsFetchingTitles] = useState(false);

  const folders = folderRows ?? [];

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || "");
      const urls = (content.match(/https?:\/\/[^"'<>\s]+/g) || []).map((u) =>
        u.replace(/^https?:\/\//, ""),
      );
      const uniq = urls.filter((u, i) => urls.indexOf(u) === i).slice(0, 200);
      setFileName(file.name);
      if (uniq.length) setText(uniq.join("\n"));
    };
    reader.readAsText(file);
  };

  const count = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean).length;
  const countLabel =
    count === 0
      ? "Nothing to import yet"
      : `${count} link${count === 1 ? "" : "s"} ready`;

  const runImport = async () => {
    if (addBookmarks.isPending || isFetchingTitles) return;

    const raw = text
      .split("\n")
      .map((l) => cleanUrl(l.trim()))
      .filter(Boolean);

    const existing = new Set(
      [...(bookmarkRows ?? []), ...(binnedBookmarkRows ?? [])].map((b) =>
        normalizeUrl(b.url),
      ),
    );
    const seen = new Set<string>();
    const lines = raw.filter((u) => {
      const key = normalizeUrl(u);
      if (seen.has(key) || existing.has(key)) return false;
      seen.add(key);
      return true;
    });
    const skipped = raw.length - lines.length;

    if (!lines.length) {
      closeModal();
      toast({
        icon: "search-x",
        title: "Nothing new to import",
        sub: `${skipped} duplicate${skipped === 1 ? "" : "s"} skipped`,
      });
      return;
    }

    setIsFetchingTitles(true);
    const titles = await Promise.all(
      lines.map((url) => fetchPageTitle(`https://${url}`)),
    );
    setIsFetchingTitles(false);

    addBookmarks.mutate(
      lines.map((url, i) => ({
        title: titles[i] || titleFromUrl(url),
        url,
        folder_id: folder || null,
      })),
      {
        onSuccess: (rows) => {
          closeModal();
          toast({
            icon: "upload",
            title: `Imported ${rows.length} bookmark${rows.length === 1 ? "" : "s"}`,
            sub: skipped
              ? `${skipped} duplicate${skipped === 1 ? "" : "s"} skipped`
              : undefined,
          });
        },
        onError: (error) => {
          toast({
            icon: "alert-circle",
            title: "Couldn't import bookmarks",
            sub: error.message,
          });
        },
      },
    );
  };

  return (
    <ModalShell className="max-w-[min(460px,calc(100vw-20px))] p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className=" text-[19px] font-semibold leading-[1.1] text-foreground">
          Import bookmarks
        </h2>
        <p className=" text-[12.5px] font-medium leading-[1.55] text-muted-foreground">
          Drop a bookmarks export from your browser, or paste links one per
          line.
        </p>
      </div>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed border-border px-4 py-5.5 hover:border-[oklch(0.82_0.08_6)]">
        <span className="flex h-8.5 w-8.5 items-center justify-center rounded-[11px] bg-accent text-accent-foreground">
          <Upload size={16} />
        </span>
        <span className="text-[12.5px] font-semibold text-foreground-secondary">
          {fileName || "Choose a bookmarks file"}
        </span>
        <input
          type="file"
          accept=".html,.htm,.json,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />
      </label>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"www.figma.com\nwww.linear.app"}
        className="box-border min-h-22 w-full resize-y rounded-[10px] border border-border bg-card px-3 py-2.5 font-sans text-[13px] font-medium leading-[1.6] text-inherit outline-none"
      />

      <div className="flex flex-col gap-1.5">
        <Label>Import into</Label>
        <Select
          value={folder}
          onValueChange={(v) => setFolder(v === "unsorted" ? "" : v)}
        >
          <SelectTrigger className="w-full text-sm font-medium h-9!">
            <SelectValue placeholder="Unsorted" />
          </SelectTrigger>

          <SelectContent position="popper">
            <SelectItem value="unsorted" className="text-sm">
              Unsorted
            </SelectItem>

            {folders.map((f) => (
              <SelectItem key={f.id} value={f.id} className="text-sm">
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11.5px] font-semibold text-muted-foreground">
          {countLabel}
        </span>
        <div className="flex gap-2">
          <Button variant="secondary" size="lg" onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button
            size="lg"
            disabled={!text.trim() || addBookmarks.isPending || isFetchingTitles}
            onClick={runImport}
          >
            {isFetchingTitles
              ? "Fetching titles..."
              : addBookmarks.isPending
                ? "Importing..."
                : "Import"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
