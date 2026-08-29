import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { faviconFor } from "@/lib/bookmarkUtils";
import type { Bookmark } from "@/types/common.type";

interface FolderCardProps {
  to: string;
  icon: ReactNode;
  iconClassName: string;
  name: string;
  countLabel: string;
  items: Bookmark[];
  actions?: ReactNode;
}

export function FolderCard({
  to,
  icon,
  iconClassName,
  name,
  countLabel,
  items,
  actions,
}: FolderCardProps) {
  const stack = items.slice(0, 4);
  const extra = items.length - 4;

  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl bg-card p-3.5 shadow-card"
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] ${iconClassName}`}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-ellipsis whitespace-nowrap text-[15px] font-medium text-foreground-secondary group-hover:text-primary leading-none">
            {name}
          </p>
          <p className="text-[10.5px] font-semibold text-muted-foreground">
            {countLabel}
          </p>
        </div>
        {actions && (
          <div
            className="flex shrink-0 items-center gap-0.5"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {actions}
          </div>
        )}
      </div>

      <div className="mt-4 flex h-5.25 items-center">
        {stack.map((b, i) => (
          <img
            key={b.id}
            src={faviconFor(b.url)}
            alt=""
            className="h-5.25 w-5.25 shrink-0 rounded-md bg-card object-contain shadow-[0_0_0_2px_var(--card)]"
            style={{ zIndex: 10 - i, marginLeft: i ? -7 : 0 }}
          />
        ))}
        {extra > 0 && (
          <span className="ml-2 text-[10px] font-semibold text-muted-foreground/80">
            +{extra}
          </span>
        )}
        <span className="ml-auto flex text-muted-foreground/60 group-hover:text-primary">
          <ArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  );
}
