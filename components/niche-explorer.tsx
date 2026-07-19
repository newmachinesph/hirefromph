"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Award, Check, Sparkles, X } from "lucide-react";
import tracksData from "@/data/tracks.json";
import { usePath } from "@/lib/path-context";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { cn } from "@/lib/utils";

type Track = (typeof tracksData.tracks)[number];

const DIFFICULTY_FILTERS = ["Beginner-friendly", "Intermediate", "Advanced"] as const;

const difficultyTone: Record<string, "emerald" | "amber" | "coral"> = {
  "Beginner-friendly": "emerald",
  Intermediate: "amber",
  Advanced: "coral",
};

// Reused from components/path-chooser.tsx, same accent system, same look.
const accentRing: Record<string, string> = {
  coral: "hover:border-coral/60 data-[active=true]:border-coral data-[active=true]:bg-coral-tint",
  emerald: "hover:border-emerald/60 data-[active=true]:border-emerald data-[active=true]:bg-emerald-tint",
  amber: "hover:border-amber/60 data-[active=true]:border-amber data-[active=true]:bg-amber-tint",
  indigo: "hover:border-indigo/60 data-[active=true]:border-indigo data-[active=true]:bg-indigo-tint",
};
const iconTone: Record<string, string> = {
  coral: "bg-coral-tint text-coral-deep",
  emerald: "bg-emerald-tint text-emerald",
  amber: "bg-amber-tint text-amber-text",
  indigo: "bg-indigo-tint text-indigo",
};
const accentText: Record<string, string> = {
  coral: "text-coral",
  amber: "text-amber-text",
  emerald: "text-emerald",
  indigo: "text-indigo",
};

const learnIcon: Record<string, string> = {
  YouTube: "youtube",
  Course: "graduation-cap",
  Template: "file-text",
};

export function NicheExplorer() {
  const { state, hydrated, choosePath } = usePath();
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const uid = useId();
  const panelId = `${uid}-panel`;
  const detailRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const tracks = tracksData.tracks.filter((t) => !filter || t.difficulty === filter);
  const selected = tracksData.tracks.find((t) => t.id === selectedId) ?? null;

  // Move focus + scroll to the detail panel once it opens (after the reveal animation).
  useEffect(() => {
    if (!selectedId) return;
    const t = setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      headingRef.current?.focus();
    }, 320);
    return () => clearTimeout(t);
  }, [selectedId]);

  function handleSelect(id: string) {
    setSelectedId((current) => (current === id ? null : id));
  }

  return (
    <div>
      <div
        role="group"
        aria-label="Filter niches by difficulty"
        className="flex flex-wrap gap-2"
      >
        <FilterChip label="All niches" active={filter === null} onClick={() => setFilter(null)} />
        {DIFFICULTY_FILTERS.map((d) => (
          <FilterChip key={d} label={d} active={filter === d} onClick={() => setFilter(d)} />
        ))}
      </div>

      {tracks.length === 0 && (
        <p className="mt-6 rounded-2xl border border-line bg-paper-2 p-6 text-sm text-ink-soft">
          No niches match this filter yet.
        </p>
      )}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tracks.map((t) => {
          const active = selectedId === t.id;
          const isChosen = hydrated && state.track === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelect(t.id)}
              aria-pressed={active}
              aria-expanded={active}
              aria-controls={panelId}
              data-active={active}
              className={cn(
                "group relative flex h-full flex-col gap-3 rounded-2xl border border-line bg-paper-2 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
                accentRing[t.accent],
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn("grid h-11 w-11 place-items-center rounded-xl", iconTone[t.accent])}>
                  <Icon name={t.icon} size={20} />
                </span>
                {isChosen && (
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald text-white">
                    <Check size={14} />
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-display text-lg leading-tight">{t.name}</h3>
                <p className="mt-1 text-sm leading-snug text-ink-soft">{t.tagline}</p>
              </div>
              <div className="mt-auto flex items-center justify-between pt-1">
                <span className="text-sm font-semibold text-ink">{t.pay}</span>
                <Pill tone={t.accent as "coral"}>{t.demandLabel}</Pill>
              </div>
              <Pill tone={difficultyTone[t.difficulty] ?? "neutral"} className="w-fit">
                {t.difficulty}
              </Pill>
            </button>
          );
        })}
      </div>

      <div ref={detailRef} className="scroll-mt-24">
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.id}
              id={panelId}
              role="region"
              aria-label={`${selected.name} details`}
              initial={{ opacity: 0, y: 16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 overflow-hidden"
            >
              <DetailCard
                track={selected}
                isChosen={hydrated && state.track === selected.id}
                onChoose={() => choosePath(selected.id)}
                onClose={() => setSelectedId(null)}
                headingRef={headingRef}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
        active
          ? "border-ink bg-ink text-paper-2"
          : "border-line-strong bg-paper-2 text-ink-soft hover:border-ink hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

function DetailCard({
  track,
  isChosen,
  onChoose,
  onClose,
  headingRef,
}: {
  track: Track;
  isChosen: boolean;
  onChoose: () => void;
  onClose: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <div className="relative rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-8 shadow-[var(--shadow-lg)] lg:p-10">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close niche details"
        className="absolute right-6 top-6 grid h-9 w-9 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        <X size={16} />
      </button>

      <div className="flex flex-wrap items-start gap-4 pr-12">
        <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl", iconTone[track.accent])}>
          <Icon name={track.icon} size={26} />
        </span>
        <div>
          <p className={cn("kicker", accentText[track.accent])}>{track.tagline}</p>
          <h3
            ref={headingRef}
            tabIndex={-1}
            className="mt-1 font-display text-2xl leading-tight outline-none lg:text-3xl"
          >
            {track.name}
          </h3>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Pill tone={track.accent as "coral"}>{track.demandLabel} demand</Pill>
          <Pill tone={difficultyTone[track.difficulty] ?? "neutral"}>{track.difficulty}</Pill>
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
        {track.blurb}
      </p>

      {track.ai && (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-paper-3/60 p-5">
            <h4 className="kicker flex items-center gap-2">
              <Icon name="cpu" size={14} weight="bold" />
              How AI is changing this niche
            </h4>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{track.ai.change}</p>
          </div>
          <div className="rounded-2xl border border-emerald/30 bg-emerald-tint p-5">
            <h4 className="kicker text-emerald">Why you are still needed</h4>
            <p className="mt-2.5 text-sm leading-relaxed text-ink">{track.ai.human}</p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h4 className="kicker">Skills you&rsquo;ll build</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {track.skills.map((s) => (
              <span
                key={s}
                className="rounded-full border border-line bg-paper-3 px-3 py-1 text-xs font-medium text-ink-soft"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="kicker">Tools you&rsquo;ll use</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {track.tools.map((tool) => (
              <span
                key={tool}
                className="rounded-full border border-line bg-paper-3 px-3 py-1 text-xs font-medium text-ink-soft"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="kicker">Where to learn it</h4>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {track.learn.map((item) => (
            <li
              key={item.title}
              className="flex items-start gap-3 rounded-xl border border-line bg-paper-3/60 px-4 py-3"
            >
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-paper-2">
                <Icon name={learnIcon[item.type] ?? "sparkles"} size={15} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{item.title}</span>
                <span className="block text-xs text-ink-faint">
                  {item.type} · {item.provider}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {"regions" in track && track.regions ? <RegionGuide regions={track.regions} /> : null}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="kicker">Certifications that help</h4>
          <ul className="mt-3 flex flex-wrap gap-2">
            {track.certs.map((c) => (
              <li key={c}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-paper px-3 py-1 text-xs font-medium text-ink">
                  <Award size={12} className={accentText[track.accent]} />
                  {c}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="kicker">Who hires this</h4>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{track.clients}</p>
        </div>
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <p className="text-sm text-ink-soft">
          Typical pay: <span className="font-semibold text-ink">{track.pay}</span>
        </p>
        {isChosen ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-tint px-6 py-3 text-sm font-semibold text-emerald">
            <Check size={16} /> This is your path
          </span>
        ) : (
          <button
            type="button"
            onClick={onChoose}
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-coral hover:shadow-[var(--shadow-coral)]"
          >
            <Sparkles size={16} />
            Choose this as my path
          </button>
        )}
      </div>
    </div>
  );
}

type Regions = NonNullable<Extract<Track, { regions: unknown }>["regions"]>;

const accentBar: Record<string, string> = {
  coral: "bg-coral",
  emerald: "bg-emerald",
  amber: "bg-amber",
  indigo: "bg-indigo",
};

/** Per-market compliance guide. Only tracks whose rules change by country carry
 *  a `regions` block, so this renders for those and stays out of the way otherwise. */
function RegionGuide({ regions }: { regions: Regions }) {
  return (
    <section className="mt-10 border-t border-line pt-8">
      <h4 className="kicker">{regions.kicker}</h4>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">{regions.lead}</p>

      <p className="mt-4 max-w-3xl border-l-2 border-line-strong bg-paper-3/60 px-4 py-3 text-sm leading-relaxed text-ink">
        {regions.boundary}
      </p>

      <div className="mt-6 grid gap-4">
        {regions.items.map((r) => (
          <article key={r.market} className="relative border border-line bg-paper-2 p-5 pl-6">
            <span
              aria-hidden
              className={cn("absolute top-0 bottom-0 left-0 w-1", accentBar[r.accent] ?? "bg-ink")}
            />
            <h5 className="font-display text-lg text-ink">
              <span aria-hidden className="mr-2">
                {r.flag}
              </span>
              {r.market}
            </h5>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.different}</p>

            <h6 className="kicker mt-5">What to learn, in order</h6>
            <ol className="mt-2 grid gap-1.5">
              {r.learn.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                  <span className={cn("font-mono text-xs font-semibold", accentText[r.accent])}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <h6 className="kicker mt-5">Read it from the source</h6>
            <ul className="mt-2 flex flex-wrap gap-2">
              {r.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-line-strong bg-paper px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink"
                  >
                    {s.label}
                    <ArrowUpRight size={12} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">Stack: </span>
              {r.stack}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">Watch out: </span>
              {r.watchOut}
            </p>
          </article>
        ))}
      </div>

      <h4 className="kicker mt-8">How to actually start</h4>
      <ol className="mt-3 grid gap-2">
        {regions.howToStart.map((step, i) => (
          <li key={step} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
            <span className="font-mono text-xs font-semibold text-ink">
              {String(i + 1).padStart(2, "0")}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}
