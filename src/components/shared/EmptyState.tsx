import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function SkeletonRow({
  opacity,
  shadow,
}: {
  opacity?: number;
  shadow?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl border border-border-subtle bg-card box-border px-2.5 py-2",
        shadow && "shadow-skeleton-row",
      )}
      style={opacity !== undefined ? { opacity } : undefined}
    >
      <span className="block h-5 w-5 shrink-0 rounded-md bg-accent" />
      <span className="flex flex-1 flex-col gap-1">
        <span className="block h-1.5 w-[56%] rounded bg-border" />
        <span className="block h-1.25 w-[34%] rounded bg-border-subtle" />
      </span>
    </div>
  );
}

/** The "no bookmarks yet" browser-row illustration, in a large (page) and small (panel) size. */
export function EmptyIllustration({ size = "lg" }: { size?: "lg" | "sm" }) {
  if (size === "sm") {
    return (
      <div className="flex w-[78%] flex-col items-center gap-1.25 mask-[linear-gradient(to_bottom,black_38%,transparent_100%)]">
        <SkeletonRow />
        <div className="w-[88%] opacity-50">
          <SkeletonRow />
        </div>
      </div>
    );
  }
  return (
    <div className="relative box-border flex w-66 flex-col items-center gap-1.75 px-2 py-0.5 mask-[linear-gradient(to_bottom,black_45%,transparent_100%)]">
      <SkeletonRow shadow />
      <div className="w-[92%] opacity-55">
        <SkeletonRow shadow />
      </div>
      <div className="w-[84%] opacity-[0.26]">
        <SkeletonRow shadow />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  body?: string;
  size?: "lg" | "sm";
  children?: ReactNode;
}

export function EmptyState({
  title,
  body,
  size = "lg",
  children,
}: EmptyStateProps) {
  if (size === "sm") {
    return (
      <div className="flex flex-col items-center gap-3 px-2 py-6 pb-7">
        <EmptyIllustration size="sm" />
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
      </div>
    );
  }
  return (
    <div className="box-border flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-6.5 px-8 py-6">
      <EmptyIllustration size="lg" />
      <div className="-mt-1.5 flex flex-col items-center gap-1.75">
        <p className="font-semibold text-foreground text-lg">{title}</p>
        <p className=" max-w-[min(340px,calc(100vw-20px))] text-center text-pretty text-[12.5px] font-medium leading-[1.6] text-muted-foreground">
          {body}
        </p>
      </div>
      {children}
    </div>
  );
}
