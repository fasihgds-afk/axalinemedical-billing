"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setVisible(true);
    setProgress(20);

    const step = window.setTimeout(() => setProgress(65), 80);
    const done = window.setTimeout(() => {
      setProgress(100);
      window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 220);
    }, 320);

    return () => {
      window.clearTimeout(step);
      window.clearTimeout(done);
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="pointer-events-none fixed top-14 right-0 left-0 z-[100] h-0.5 overflow-hidden bg-primary/10 lg:left-64"
      role="progressbar"
      aria-hidden
    >
      <div
        className="h-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
