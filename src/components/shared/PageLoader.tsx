/** Full-panel loading state shown while a page's primary query is in flight. */
export function PageLoader() {
  return (
    <div className="flex min-h-[min(62vh,520px)] flex-1 flex-col items-center justify-center gap-5">
      <span className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-[dc-ring_1.6s_cubic-bezier(0.3,0,0.5,1)_infinite] rounded-full bg-[oklch(0.66_0.2_8/0.14)]" />
        <svg
          width="26"
          height="31.4"
          viewBox="1 1 17 20.5"
          fill="none"
          className="block animate-[dc-breath_1.6s_cubic-bezier(0.45,0,0.55,1)_infinite]"
        >
          <path
            d="M13.4 1.5H18v17.2l-4.6-3.4V1.5Z"
            fill="oklch(0.55 0.216 4)"
            opacity="0.28"
          />
          <path
            d="M1 2.4A1.4 1.4 0 0 1 2.4 1h8.9a1.4 1.4 0 0 1 1.4 1.4v19.1l-5.85-4.3L1 21.5V2.4Z"
            fill="oklch(0.6 0.222 6)"
          />
        </svg>
      </span>
      <span className="text-[12.5px] font-medium text-muted-foreground">
        Loading your bookmarks
      </span>
    </div>
  );
}
