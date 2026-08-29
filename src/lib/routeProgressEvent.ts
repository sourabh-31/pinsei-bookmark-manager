export function startRouteProgress() {
  window.dispatchEvent(new Event("route-progress-start"));
}

export function finishRouteProgress() {
  window.dispatchEvent(new Event("route-progress-finish"));
}
