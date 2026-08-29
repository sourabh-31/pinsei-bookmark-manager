import { Link } from "react-router";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-app-shell px-4.5 py-8 text-center">
      <span className="grid size-13 place-items-center rounded-2xl bg-card shadow-card">
        <Compass size={22} className="text-muted-foreground" />
      </span>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-[26px] leading-[1.15] font-bold text-foreground">
          Page not found
        </h1>
        <p className="max-w-[29em] text-[13.5px] leading-[1.55] font-medium text-muted-foreground">
          The page you're looking for doesn't exist or may have moved.
        </p>
      </div>
      <Button asChild size="lg">
        <Link to="/home">Back to your bookmarks</Link>
      </Button>
    </div>
  );
}
