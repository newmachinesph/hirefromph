"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

type Target = { id: string; label: string; icon: string; href: (u: string, t: string, d: string) => string };

/** Plain share intents: no SDKs, no third-party scripts, CSP-safe. */
const TARGETS: Target[] = [
  { id: "x", label: "Share on X", icon: "x-logo", href: (u, t) => `https://x.com/intent/post?text=${enc(t)}&url=${enc(u)}` },
  { id: "facebook", label: "Share on Facebook", icon: "facebook-logo", href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}` },
  { id: "linkedin", label: "Share on LinkedIn", icon: "linkedin-logo", href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${enc(u)}` },
  { id: "whatsapp", label: "Share on WhatsApp", icon: "whatsapp-logo", href: (u, t) => `https://wa.me/?text=${enc(`${t} ${u}`)}` },
  { id: "telegram", label: "Share on Telegram", icon: "telegram-logo", href: (u, t) => `https://t.me/share/url?url=${enc(u)}&text=${enc(t)}` },
  { id: "email", label: "Share by email", icon: "envelope-simple", href: (u, t, d) => `mailto:?subject=${enc(t)}&body=${enc(`${d}\n\n${u}`)}` },
];

function enc(value: string): string {
  return encodeURIComponent(value);
}

const BUTTON =
  "inline-flex min-h-11 items-center gap-2 rounded-pill border border-line-strong bg-paper px-3.5 text-small text-ink transition-colors duration-150 ease-out hover:border-ink hover:bg-band focus-visible:outline-2 focus-visible:outline-primary";

/**
 * Share buttons for an article. Uses the Web Share API when the browser has
 * it (phones), otherwise the classic intent links; Copy link always works.
 */
export function ShareBar({
  url,
  title,
  description,
  label = "Share",
  className,
}: {
  url: string;
  title: string;
  description: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- feature detection is only possible on the client */
  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: description, url });
    } catch {
      // The user dismissed the sheet; nothing to do.
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} role="group" aria-label={label}>
      <span className="mr-1 text-small font-semibold text-ink">{label}</span>
      {canNativeShare && (
        <button type="button" onClick={nativeShare} className={BUTTON}>
          <Icon name="share-network" size={16} />
          Share…
        </button>
      )}
      {TARGETS.map((target) => (
        <a
          key={target.id}
          href={target.href(url, title, description)}
          target={target.id === "email" ? undefined : "_blank"}
          rel="noopener noreferrer"
          className={BUTTON}
          aria-label={target.label}
          title={target.label}
        >
          <Icon name={target.icon} size={16} />
          <span className="sr-only sm:not-sr-only">{target.label.replace(/^Share (on |by )?/, "")}</span>
        </a>
      ))}
      <button type="button" onClick={copy} className={BUTTON} aria-live="polite">
        <Icon name={copied ? "check" : "link"} size={16} />
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
