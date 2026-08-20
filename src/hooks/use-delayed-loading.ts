import { useEffect, useRef, useState } from "react";

export const SKELETON_REVEAL_DELAY_MS = 250;
export const SKELETON_MIN_VISIBLE_MS = 300;

export function scheduleSkeletonReveal(
  onReveal: () => void,
  delayMs = SKELETON_REVEAL_DELAY_MS,
) {
  const timer = setTimeout(onReveal, delayMs);
  return () => clearTimeout(timer);
}

export function getSkeletonHideDelay(
  visibleSince: number,
  now = Date.now(),
  minimumVisibleMs = SKELETON_MIN_VISIBLE_MS,
) {
  return Math.max(0, minimumVisibleMs - (now - visibleSince));
}

export function useDelayedLoading(loading: boolean) {
  const [visible, setVisible] = useState(false);
  const visibleSince = useRef<number | null>(null);

  useEffect(() => {
    if (loading) {
      if (visible) return;

      return scheduleSkeletonReveal(() => {
        visibleSince.current = Date.now();
        setVisible(true);
      });
    }

    if (!visible) {
      visibleSince.current = null;
      return;
    }

    const timer = setTimeout(() => {
      visibleSince.current = null;
      setVisible(false);
    }, getSkeletonHideDelay(visibleSince.current ?? Date.now()));

    return () => clearTimeout(timer);
  }, [loading, visible]);

  return visible;
}
