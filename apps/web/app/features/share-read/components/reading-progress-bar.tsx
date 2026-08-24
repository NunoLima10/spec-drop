import { useEffect, useRef } from "react";
import { getReadingProgress } from "../reading-progress";

export function ReadingProgressBar() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId = 0;

    function updateProgress() {
      const progressBar = progressRef.current;

      if (!progressBar) {
        return;
      }

      progressBar.style.width = `${getReadingProgress({
        scrollHeight: document.documentElement.scrollHeight,
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
      })}%`;
    }

    function scheduleUpdateProgress() {
      if (animationFrameId) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = 0;
        updateProgress();
      });
    }

    updateProgress();
    window.addEventListener("scroll", scheduleUpdateProgress, {
      passive: true,
    });
    window.addEventListener("resize", scheduleUpdateProgress);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener("scroll", scheduleUpdateProgress);
      window.removeEventListener("resize", scheduleUpdateProgress);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-50 h-1 bg-[#663af3]"
      ref={progressRef}
      style={{ width: "0%" }}
    />
  );
}
