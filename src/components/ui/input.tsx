import * as React from "react";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface InputProps extends React.ComponentProps<"input"> {
  isSearchIcon?: boolean;
}

function Input({
  className,
  type,
  isSearchIcon = false,
  ...props
}: InputProps) {
  return (
    <div className="relative w-full">
      {isSearchIcon && (
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
      )}

      <input
        type={type}
        data-slot="input"
        className={cn(
          "h-8 w-full min-w-0 rounded-[10px] border border-border bg-card py-1 text-xs sm:text-sm shadow-[0_1px_2px_oklch(0_0_0/0.03)] transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-xs dark:bg-card dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 hover:border-[oklch(0.9_0.004_300)] hover:text-foreground-secondary font-medium",
          isSearchIcon ? "pl-8 pr-2.5" : "px-2.5",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { Input };
