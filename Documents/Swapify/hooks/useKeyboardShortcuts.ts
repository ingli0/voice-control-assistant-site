"use client";
import { useEffect } from "react";

interface Shortcuts {
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;    // super like
  onUndo?: () => void;
  onSpace?: () => void; // play/pause
}

export function useKeyboardShortcuts(shortcuts: Shortcuts, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function handler(e: KeyboardEvent) {
      // Don't fire when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          shortcuts.onLeft?.();
          break;
        case "ArrowRight":
          e.preventDefault();
          shortcuts.onRight?.();
          break;
        case "ArrowUp":
          e.preventDefault();
          shortcuts.onUp?.();
          break;
        case "u":
        case "U":
          e.preventDefault();
          shortcuts.onUndo?.();
          break;
        case " ":
          e.preventDefault();
          shortcuts.onSpace?.();
          break;
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts, enabled]);
}
