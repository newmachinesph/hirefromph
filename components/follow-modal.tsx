"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Users, Sparkles, Gift } from "lucide-react";
import site from "@/data/site.json";
import { LogoMark, FacebookGlyph } from "@/components/logo";

const STORAGE_KEY = "devup:fb-prompt";

export function FollowModal() {
  const [open, setOpen] = useState(false);

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
    const timer = window.setTimeout(() => setOpen(true), delay);
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") remember();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
            onClick={remember}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fb-modal-title"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper-2 p-7 shadow-[var(--shadow-lg)]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-coral/10 blur-2xl"
            />
            <button
              type="button"
              onClick={remember}
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
                Walang bayad — everything here is free and always will be. Join
                our Facebook group for real talk, new resources, and member
                giveaways.
              </p>

              <ul className="mt-5 flex flex-col gap-2.5 text-sm text-ink">
                <li className="flex items-center gap-2.5">
                  <Gift size={16} className="shrink-0 text-coral" />
                  Free drops and giveaways, first to the group
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
                  onClick={remember}
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
                    onClick={remember}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-coral"
                  >
                    <FacebookGlyph size={15} />
                    Follow our page
                  </a>
                  <button
                    type="button"
                    onClick={remember}
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
