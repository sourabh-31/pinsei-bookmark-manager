import { useEffect, useRef, useState } from "react";
import {
  finishRouteProgress,
  startRouteProgress,
} from "@/lib/routeProgressEvent";

const SHOW_DELAY = 150;
const HIDE_DELAY = 220;
const TRICKLE_STEPS: Array<[width: number, delay: number]> = [
  [20, 0],
  [45, 250],
  [65, 650],
  [80, 1400],
];

/** Global top bar driven by route-progress-start/finish events. Mount once near the app root. */
export function RouteProgressBar() {
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const activeCount = useRef(0);
  const isVisible = useRef(false);
  const showTimer = useRef<number | undefined>(undefined);
  const hideTimer = useRef<number | undefined>(undefined);
  const trickleTimers = useRef<number[]>([]);

  useEffect(() => {
    function clearTrickle() {
      trickleTimers.current.forEach(window.clearTimeout);
      trickleTimers.current = [];
    }

    function show() {
      isVisible.current = true;
      setVisible(true);
      setWidth(TRICKLE_STEPS[0][0]);
      for (const [w, delay] of TRICKLE_STEPS.slice(1)) {
        trickleTimers.current.push(window.setTimeout(() => setWidth(w), delay));
      }
    }

    function onStart() {
      activeCount.current += 1;
      if (activeCount.current > 1) return;

      window.clearTimeout(hideTimer.current);
      showTimer.current = window.setTimeout(show, SHOW_DELAY);
    }

    function onFinish() {
      activeCount.current = Math.max(0, activeCount.current - 1);
      if (activeCount.current > 0) return;

      window.clearTimeout(showTimer.current);
      clearTrickle();

      if (!isVisible.current) return;

      setWidth(100);
      hideTimer.current = window.setTimeout(() => {
        isVisible.current = false;
        setVisible(false);
        setWidth(0);
      }, HIDE_DELAY);
    }

    window.addEventListener("route-progress-start", onStart);
    window.addEventListener("route-progress-finish", onFinish);
    return () => {
      window.removeEventListener("route-progress-start", onStart);
      window.removeEventListener("route-progress-finish", onFinish);
      window.clearTimeout(showTimer.current);
      window.clearTimeout(hideTimer.current);
      clearTrickle();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-90 h-0.75"
    >
      <div
        id="route-progress"
        className="h-full bg-linear-to-r from-primary to-primary-glow shadow-[0_0_8px_var(--primary-glow)] transition-[width,opacity] duration-300 ease-out"
        style={{ width: `${width}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}

/** Suspense fallback that reports the chunk-loading window to RouteProgressBar. */
export function RouteSuspenseFallback() {
  useEffect(() => {
    startRouteProgress();
    return () => finishRouteProgress();
  }, []);
  return null;
}
