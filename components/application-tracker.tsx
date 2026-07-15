"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Inbox,
  Plus,
  Trash2,
  TrendingDown,
} from "lucide-react";
import {
  APP_STATUSES,
  type AppStatus,
  type Application,
  usePath,
} from "@/lib/path-context";
import { CopyButton } from "@/components/copy-button";
import { Pill } from "@/components/ui";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<AppStatus, string> = {
  applied: "Applied",
  replied: "Replied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const STATUS_TONE: Record<
  AppStatus,
  "neutral" | "indigo" | "amber" | "emerald" | "coral"
> = {
  applied: "neutral",
  replied: "indigo",
  interview: "amber",
  offer: "emerald",
  rejected: "coral",
};

const FOLLOW_UP_DEFAULT_DAYS = 4;
const LOW_REPLY_RATE_SAMPLE = 20;
const LOW_REPLY_RATE_THRESHOLD = 0.1;

const inputCls =
  "w-full rounded-xl border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-ink";

/** Local calendar date, matches what <input type="date"> shows and returns. */
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** UTC-midnight timestamp for a YYYY-MM-DD string, pure calendar-date arithmetic, no TZ drift. */
function toUTCms(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y || 1970, (m || 1) - 1, d || 1);
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(toUTCms(iso) + days * 86_400_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((toUTCms(toISO) - toUTCms(fromISO)) / 86_400_000);
}

/** Keep a TSV cell to one line so the export stays valid TSV. */
function tsvCell(value: string): string {
  return value.replace(/[\t\n\r]+/g, " ").trim();
}

export function ApplicationTracker() {
  const {
    state,
    hydrated,
    addApplication,
    updateApplication,
    deleteApplication,
  } = usePath();
  const [formError, setFormError] = useState<string | null>(null);

  const today = todayISO();
  const defaultFollowUp = addDaysISO(today, FOLLOW_UP_DEFAULT_DAYS);
  const applications = state.applications;

  const overdue = useMemo(
    () =>
      applications
        .filter(
          (a) => a.status === "applied" && a.followUpAt && a.followUpAt <= today,
        )
        .sort((a, b) => a.followUpAt.localeCompare(b.followUpAt)),
    [applications, today],
  );

  const stats = useMemo(() => {
    const total = applications.length;
    const replied = applications.filter((a) =>
      ["replied", "interview", "offer"].includes(a.status),
    ).length;
    const interviews = applications.filter((a) =>
      ["interview", "offer"].includes(a.status),
    ).length;
    const offers = applications.filter((a) => a.status === "offer").length;
    return {
      total,
      replied,
      interviews,
      offers,
      replyRate: total > 0 ? replied / total : 0,
      interviewRate: total > 0 ? interviews / total : 0,
    };
  }, [applications]);

  const showDiagnostic =
    stats.total >= LOW_REPLY_RATE_SAMPLE &&
    stats.replyRate < LOW_REPLY_RATE_THRESHOLD;

  const tsv = useMemo(() => {
    const header = [
      "Company",
      "Role",
      "Source",
      "Link",
      "Status",
      "Applied",
      "Follow-up",
      "Notes",
    ].join("\t");
    const rows = applications.map((a) =>
      [
        a.company,
        a.role,
        a.source,
        a.link,
        STATUS_LABEL[a.status],
        a.appliedAt,
        a.followUpAt,
        a.notes,
      ]
        .map(tsvCell)
        .join("\t"),
    );
    return [header, ...rows].join("\n");
  }, [applications]);

  if (!hydrated) {
    return (
      <div aria-hidden className="animate-pulse space-y-6">
        <div className="h-28 rounded-2xl bg-line/60" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-line/60" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-line/60" />
        <div className="h-48 rounded-2xl bg-line/60" />
      </div>
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const company = String(data.get("company") ?? "").trim();
    const role = String(data.get("role") ?? "").trim();
    if (!company || !role) {
      setFormError("Company and role are required.");
      return;
    }
    const rawStatus = String(data.get("status") ?? "applied") as AppStatus;
    addApplication({
      company,
      role,
      source: String(data.get("source") ?? "").trim(),
      link: String(data.get("link") ?? "").trim(),
      status: APP_STATUSES.includes(rawStatus) ? rawStatus : "applied",
      appliedAt: String(data.get("appliedAt") ?? "").trim() || today,
      followUpAt: String(data.get("followUpAt") ?? "").trim() || defaultFollowUp,
      notes: String(data.get("notes") ?? "").trim(),
    });
    form.reset();
    setFormError(null);
  }

  function handleDelete(app: Application) {
    if (
      confirm(
        `Delete the application to ${app.company}, ${app.role}? This can't be undone.`,
      )
    ) {
      deleteApplication(app.id);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* FOLLOW-UP RADAR */}
      <div
        className={cn(
          "rounded-2xl border p-6",
          overdue.length > 0
            ? "border-coral/30 bg-coral-tint"
            : "border-line bg-paper-2",
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-full",
              overdue.length > 0
                ? "bg-coral text-white"
                : "bg-emerald-tint text-emerald",
            )}
          >
            <AlertTriangle size={18} aria-hidden />
          </span>
          <div>
            <p className="kicker">Follow-up radar</p>
            <p
              aria-live="polite"
              className={cn(
                "mt-0.5 font-display text-lg leading-tight",
                overdue.length > 0 ? "text-coral-deep" : "text-ink",
              )}
            >
              {overdue.length === 0
                ? "Nothing overdue, you're on top of it."
                : `${overdue.length} application${overdue.length === 1 ? "" : "s"} need${overdue.length === 1 ? "s" : ""} a follow-up now.`}
            </p>
          </div>
        </div>

        {overdue.length > 0 && (
          <ul className="mt-5 flex flex-col gap-2.5">
            {overdue.map((a) => {
              const diff = daysBetween(a.followUpAt, today);
              return (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-coral/25 bg-paper-2 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {a.company}, {a.role}
                    </p>
                    <p className="text-xs text-ink-faint">
                      {diff === 0
                        ? "Follow up today"
                        : `${diff} day${diff === 1 ? "" : "s"} overdue`}
                    </p>
                  </div>
                  <select
                    aria-label={`Update status for ${a.company}, ${a.role}`}
                    value={a.status}
                    onChange={(e) =>
                      updateApplication(a.id, {
                        status: e.target.value as AppStatus,
                      })
                    }
                    className="rounded-full border border-line-strong bg-paper px-3 py-1.5 text-xs font-semibold text-ink"
                  >
                    {APP_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* LIVE STATS */}
      <div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Applied", value: String(stats.total) },
            { label: "Replies", value: String(stats.replied) },
            { label: "Interviews", value: String(stats.interviews) },
            { label: "Offers", value: String(stats.offers) },
            { label: "Reply rate", value: `${Math.round(stats.replyRate * 100)}%` },
            {
              label: "Interview rate",
              value: `${Math.round(stats.interviewRate * 100)}%`,
            },
          ].map((s) => (
            <div key={s.label} className="bg-paper-2 p-4">
              <dt className="text-xs font-medium text-ink-faint">{s.label}</dt>
              <dd className="mt-1 font-display text-2xl text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>

        {showDiagnostic && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber/30 bg-amber-tint px-5 py-4">
            <TrendingDown
              size={18}
              className="mt-0.5 shrink-0 text-amber-text"
              aria-hidden
            />
            <p className="text-sm leading-relaxed text-[#6b4d00]">
              Reply rate is under 10% over {stats.total} applications, at this
              sample size that&rsquo;s not bad luck, it&rsquo;s a signal. The
              problem is probably the application, not the volume.{" "}
              <Link
                href="/build"
                className="font-semibold underline underline-offset-2"
              >
                Sharpen your resume
              </Link>{" "}
              or{" "}
              <Link
                href="/prompts"
                className="font-semibold underline underline-offset-2"
              >
                write a sharper outreach message
              </Link>
              .
            </p>
          </div>
        )}
      </div>

      {/* ADD APPLICATION */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-line bg-paper-2 p-6"
      >
        <p className="kicker">Log an application</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Company" htmlFor="company">
            <input
              id="company"
              name="company"
              type="text"
              required
              className={inputCls}
              placeholder="Acme Co"
            />
          </Field>
          <Field label="Role" htmlFor="role">
            <input
              id="role"
              name="role"
              type="text"
              required
              className={inputCls}
              placeholder="Executive Operations Professional"
            />
          </Field>
          <Field label="Source" htmlFor="source">
            <input
              id="source"
              name="source"
              type="text"
              className={inputCls}
              placeholder="LinkedIn, referral, direct…"
            />
          </Field>
          <Field label="Link" htmlFor="link">
            <input
              id="link"
              name="link"
              type="url"
              className={inputCls}
              placeholder="https://…"
            />
          </Field>
          <Field label="Status" htmlFor="status">
            <select
              id="status"
              name="status"
              defaultValue="applied"
              className={inputCls}
            >
              {APP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Applied on" htmlFor="appliedAt">
            <input
              id="appliedAt"
              name="appliedAt"
              type="date"
              defaultValue={today}
              className={inputCls}
            />
          </Field>
          <Field label="Follow up on" htmlFor="followUpAt">
            <input
              id="followUpAt"
              name="followUpAt"
              type="date"
              defaultValue={defaultFollowUp}
              className={inputCls}
            />
          </Field>
          <Field
            label="Notes"
            htmlFor="notes"
            className="sm:col-span-2 lg:col-span-3"
          >
            <textarea
              id="notes"
              name="notes"
              rows={2}
              className={inputCls}
              placeholder="Contact name, referral, anything worth remembering…"
            />
          </Field>
        </div>

        {formError && (
          <p role="alert" className="mt-3 text-sm font-medium text-coral-deep">
            {formError}
          </p>
        )}

        <button
          type="submit"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-coral"
        >
          <Plus size={16} /> Add application
        </button>
      </form>

      {/* PIPELINE */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="kicker">The pipeline, {applications.length} total</p>
          {applications.length > 0 && (
            <CopyButton value={tsv} label="Copy pipeline as TSV" />
          )}
        </div>

        {applications.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-paper-2 px-6 py-14 text-center">
            <Inbox size={28} className="text-ink-faint" aria-hidden />
            <p className="max-w-md text-sm leading-relaxed text-ink-soft">
              Nothing logged yet. The discipline is simple: every application
              gets a row, and every &ldquo;applied&rdquo; gets a follow-up
              date. Log your first one above, future you will thank you in
              four days.
            </p>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {applications.map((a) => (
              <ApplicationRow
                key={a.id}
                app={a}
                onDelete={() => handleDelete(a)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-xs font-semibold text-ink-soft">
        {label}
      </label>
      {children}
    </div>
  );
}

function ApplicationRow({
  app,
  onDelete,
}: {
  app: Application;
  onDelete: () => void;
}) {
  const { updateApplication } = usePath();

  return (
    <li className="rounded-2xl border border-line bg-paper-2 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-lg leading-tight">{app.company}</p>
          <p className="text-sm text-ink-soft">{app.role}</p>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone={STATUS_TONE[app.status]}>{STATUS_LABEL[app.status]}</Pill>
          <select
            aria-label={`Change status for ${app.company}, ${app.role}`}
            value={app.status}
            onChange={(e) =>
              updateApplication(app.id, { status: e.target.value as AppStatus })
            }
            className="rounded-full border border-line-strong bg-paper px-3 py-1.5 text-xs font-semibold text-ink"
          >
            {APP_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-xs text-ink-faint sm:grid-cols-4">
        <div>
          <span className="block font-semibold text-ink-soft">Source</span>
          {app.source || ", "}
        </div>
        <div>
          <span className="block font-semibold text-ink-soft">Applied</span>
          {app.appliedAt || ", "}
        </div>
        <div>
          <span className="block font-semibold text-ink-soft">Follow-up</span>
          {app.followUpAt || ", "}
        </div>
        <div>
          <span className="block font-semibold text-ink-soft">Link</span>
          {app.link ? (
            <a
              href={app.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-ink hover:text-coral"
            >
              Open <ArrowUpRight size={11} />
            </a>
          ) : (
            ", "
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <label
          htmlFor={`notes-${app.id}`}
          className="text-xs font-semibold text-ink-soft"
        >
          Notes
        </label>
        <textarea
          id={`notes-${app.id}`}
          defaultValue={app.notes}
          onBlur={(e) => updateApplication(app.id, { notes: e.target.value })}
          rows={2}
          className={inputCls}
        />
      </div>

      <div className="mt-4 flex justify-end border-t border-line pt-3">
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-faint transition-colors hover:text-coral"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </li>
  );
}
