import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Bookmark } from "@/types/common.type";
import { BookmarkItem } from "../bookmarks/components/BookmarkItem";

const ROWS_PER_PANEL = 8;

interface HomePanelProps {
  title: string;
  icon?: ReactNode;
  iconClassName?: string;
  items: Bookmark[];
  viewAllTo: string;
  actions?: ReactNode;
}

export function HomePanel({
  title,
  icon,
  iconClassName,
  items,
  viewAllTo,
  actions,
}: HomePanelProps) {
  const shown = items.slice(0, ROWS_PER_PANEL);

  return (
    <section className="flex flex-col rounded-2xl bg-card p-3 shadow-card">
      <div className="mb-3.5 flex items-center gap-2 px-1 pt-0.5">
        {icon && (
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${iconClassName ?? ""}`}
          >
            {icon}
          </span>
        )}
        <h2 className=" overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-medium text-foreground-secondary">
          {title}
        </h2>
        {actions && (
          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            {actions}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {shown.length === 0 ? (
          <EmptyState size="sm" title="Nothing here yet" body="" />
        ) : (
          shown.map((b) => (
            <BookmarkItem key={b.id} bookmark={b} layout="panel" />
          ))
        )}
      </div>

      {shown.length !== 0 && (
        <Link
          to={viewAllTo}
          className="mt-5.5 mb-0.5 flex items-center justify-center gap-1.25 text-[11.5px] font-medium text-muted-foreground hover:text-primary"
        >
          View All <ArrowRight size={12} />
        </Link>
      )}
    </section>
  );
}
