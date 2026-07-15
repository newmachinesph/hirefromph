"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Users, Sparkles, Megaphone } from "lucide-react";
import site from "@/data/site.json";
import { LogoMark, FacebookGlyph } from "@/components/logo";
import { track } from "@/lib/analytics";

const STORAGE_KEY = "devup:fb-prompt";

export function FollowModal() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let seen: string | null = null;
    try {
      seen = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      seen = "done"; // storage blocked: don't nag
    }
    if (seen) return;

    // Appear at a random moment so it never feels scripted.
    const delay = 9000 + Math.floor(Math.random() * 12000); // 9–21s
    const timer = window.setTimeout(() => {
      setOpen(true);
      track("follow_modal_shown");
    }, delay);
    return () => window.clearTimeout(timer);
  }, []);

  function remember() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "done");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  function dismiss(reason: string) {
    track("follow_modal_dismiss", { reason });
    remember();
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss("esc");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // Only re-bind when open toggles; dismiss is recreated each render but stable in behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Move focus into the dialog, trap Tab inside it, restore focus on close.
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const getFocusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
    (getFocusable()[0] ?? dialog).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener("keydown", onKey);
    return () => {
      dialog.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => dismiss("backdrop")}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />

          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fb-modal-title"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper-2 p-7 shadow-[var(--shadow-lg)]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-coral/10 blur-2xl"
            />
            <button
              type="button"
              onClick={() => dismiss("close")}
              aria-label="No thanks"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-line text-ink-faint transition-colors hover:border-ink hover:text-ink"
            >
              <X size={16} />
            </button>

            <div className="relative">
              <LogoMark size={40} />
              <h2
                id="fb-modal-title"
                className="mt-5 font-display text-[length:var(--text-h3)] leading-snug text-balance"
              >
                Join the DevUp community.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Everything here is open, and always will be. Join
                our Facebook group for the news that matters: real shifts in
                this market, and what&apos;s new on the portal.
              </p>

              <ul className="mt-5 flex flex-col gap-2.5 text-sm text-ink">
                <li className="flex items-center gap-2.5">
                  <Megaphone size={16} className="shrink-0 text-coral" />
                  Important news that affects this career, explained early
                </li>
                <li className="flex items-center gap-2.5">
                  <Sparkles size={16} className="shrink-0 text-emerald" />
                  New guides and tools the moment they land
                </li>
              </ul>

              <div className="mt-7 flex flex-col gap-3">
                <a
                  href={site.social.facebookGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    track("follow_modal_join", { target: "group" });
                    remember();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-coral-deep hover:-translate-y-0.5"
                >
                  <Users size={16} />
                  Join our Facebook group
                </a>
                <div className="flex items-center justify-center gap-4">
                  <a
                    href={site.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      track("follow_modal_follow", { target: "page" });
                      remember();
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-coral"
                  >
                    <FacebookGlyph size={15} />
                    Follow our page
                  </a>
                  <button
                    type="button"
                    onClick={() => dismiss("later")}
                    className="text-sm font-medium text-ink-faint transition-colors hover:text-ink"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
