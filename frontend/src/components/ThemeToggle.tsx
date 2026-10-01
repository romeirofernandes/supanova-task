import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun02Icon } from "@hugeicons/core-free-icons";
import { AnimatePresence, m } from "motion/react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

type RectangleStart = "bottom-up" | "top-down" | "left-right" | "right-left";

function rectangleClipPaths(start: RectangleStart) {
  switch (start) {
    case "top-down":
      return {
        from: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      };
    case "left-right":
      return {
        from: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
        to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      };
    case "right-left":
      return {
        from: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
        to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      };
    case "bottom-up":
    default:
      return {
        from: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      };
  }
}

const TRANSITION_STYLE_ID = "theme-transition-styles";

function injectRectangleWipe(start: RectangleStart) {
  if (typeof window === "undefined") return;
  const clip = rectangleClipPaths(start);
  const css = `
    ::view-transition-group(root) {
      animation-duration: 1s;
      animation-timing-function: var(--expo-out);
    }
    ::view-transition-new(root) {
      animation-name: reveal-light-${start};
      will-change: clip-path;
      filter: blur(2px);
    }
    ::view-transition-old(root),
    .dark::view-transition-old(root) {
      animation: none;
      z-index: -1;
    }
    .dark::view-transition-new(root) {
      animation-name: reveal-dark-${start};
      filter: blur(2px);
    }
    @keyframes reveal-dark-${start} {
      from { clip-path: ${clip.from}; filter: blur(8px); }
      50% { filter: blur(4px); }
      to { clip-path: ${clip.to}; filter: blur(0px); }
    }
    @keyframes reveal-light-${start} {
      from { clip-path: ${clip.from}; filter: blur(8px); }
      50% { filter: blur(4px); }
      to { clip-path: ${clip.to}; filter: blur(0px); }
    }
  `;
  let el = document.getElementById(TRANSITION_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = TRANSITION_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const [displayDark, setDisplayDark] = useState(
    () => typeof window !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const sync = () => setDisplayDark(document.documentElement.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const goingDark = !displayDark;
    const start: RectangleStart = goingDark ? "bottom-up" : "top-down";
    setDisplayDark(goingDark);
    setDirection(goingDark ? 1 : -1);
    injectRectangleWipe(start);
    const switchTheme = () => setTheme(goingDark ? "dark" : "light");
    if (document.startViewTransition) {
      document.startViewTransition(switchTheme);
    } else {
      switchTheme();
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={displayDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className="overflow-hidden active:scale-[0.96]"
    >
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <m.span
          key={displayDark ? "moon" : "sun"}
          custom={direction}
          variants={{
            enter: (d: number) => ({ opacity: 0, y: 12 * d, filter: "blur(4px)" }),
            center: { opacity: 1, y: 0, filter: "blur(0px)" },
            exit: (d: number) => ({ opacity: 0, y: -12 * d, filter: "blur(4px)" }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex"
        >
          <HugeiconsIcon icon={displayDark ? Moon02Icon : Sun02Icon} size={16} strokeWidth={1.5} />
        </m.span>
      </AnimatePresence>
    </Button>
  );
}
