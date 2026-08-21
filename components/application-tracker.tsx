"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  APP_STATUSES,
  type AppStatus,
  type Application,
  usePath,
} from "@/lib/path-context";
import { CopyButton } from "@/components/copy-button";
import { ExportButton } from "@/components/practice";
import { rowsToCsv } from "@/lib/markdown-export";
import {
  Badge,
  Button,
  Callout,
  Card,
  EmptyState,
  Field,
  Heading,
  Icon,
  Input,
  Select,
  Text,
  Textarea,
} from "@/components/ui";
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
  "neutral" | "info" | "caution" | "verified" | "signal"
> = {
  applied: "neutral",
  replied: "info",
  interview: "caution",
  offer: "verified",
  rejected: "signal",
};

const FOLLOW_UP_DEFAULT_DAYS = 4;
const LOW_REPLY_RATE_SAMPLE = 20;
const LOW_REPLY_RATE_THRESHOLD = 0.1;

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

  const csv = useMemo(
    () =>
      rowsToCsv(
        ["Company", "Role", "Source", "Link", "Status", "Applied", "Follow-up", "Notes"],
        applications.map((a) => [
          a.company,
          a.role,
          a.source,
          a.link,
          STATUS_LABEL[a.status],
          a.appliedAt,
          a.followUpAt,
          a.notes,
        ]),
      ),
    [applications],
  );

  if (!hydrated) {
    return (
      <div aria-hidden className="animate-pulse space-y-6">
        <div className="h-28 rounded-lg bg-line/60" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-line/60" />
          ))}
        </div>
        <div className="h-64 rounded-lg bg-line/60" />
        <div className="h-48 rounded-lg bg-line/60" />
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
          "rounded-lg border p-6",
          overdue.length > 0
            ? "border-primary/30 bg-primary-tint"
            : "border-line bg-paper",
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-pill",
              overdue.length > 0
                ? "bg-primary text-white"
                : "bg-verified-tint text-verified",
            )}
          >
            <Icon name="alert-triangle" size={18} />
          </span>
          <div>
            <p className="kicker">Follow-up radar</p>
            <p
              aria-live="polite"
              className={cn(
                "mt-0.5 font-display text-lg leading-tight",
                overdue.length > 0 ? "text-primary-deep" : "text-ink",
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
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/25 bg-paper px-4 py-3"
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
                  <Select
                    aria-label={`Update status for ${a.company}, ${a.role}`}
                    value={a.status}
                    onChange={(e) =>
                      updateApplication(a.id, {
                        status: e.target.value as AppStatus,
                      })
                    }
                    className="max-w-[10rem]"
                  >
                    {APP_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </Select>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* LIVE STATS */}
      <div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
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
            <div key={s.label} className="bg-paper p-4">
              <dt className="text-xs font-medium text-ink-faint">{s.label}</dt>
              <dd className="mt-1 font-display text-2xl text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>

        {showDiagnostic && (
          <Callout tone="caution" icon="trending-down" className="mt-4">
            <p>
              Reply rate is under 10% over {stats.total} applications, at this
              sample size that&rsquo;s not bad luck, it&rsquo;s a signal. The
              problem is probably the application, not the volume.{" "}
              <Button href="/build" variant="link">
                Sharpen your resume
              </Button>{" "}
              or{" "}
              <Button href="/prompts" variant="link">
                write a sharper outreach message
              </Button>
              .
            </p>
          </Callout>
        )}
      </div>

      {/* ADD APPLICATION */}
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-line bg-paper p-6"
      >
        <p className="kicker">Log an application</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Company">
            <Input name="company" type="text" required placeholder="Acme Co" />
          </Field>
          <Field label="Role">
            <Input
              name="role"
              type="text"
              required
              placeholder="Executive Operations Professional"
            />
          </Field>
          <Field label="Source">
            <Input name="source" type="text" placeholder="LinkedIn, referral, direct…" />
          </Field>
          <Field label="Link">
            <Input name="link" type="url" placeholder="https://…" />
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue="applied">
              {APP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Applied on">
            <Input name="appliedAt" type="date" defaultValue={today} />
          </Field>
          <Field label="Follow up on">
            <Input
              name="followUpAt"
              type="date"
              defaultValue={defaultFollowUp}
            />
          </Field>
          <Field label="Notes" className="sm:col-span-2 lg:col-span-3">
            <Textarea
              name="notes"
              rows={2}
              placeholder="Contact name, referral, anything worth remembering…"
            />
          </Field>
        </div>

        {formError && (
          <Callout tone="coral" className="mt-3">
            <span role="alert">{formError}</span>
          </Callout>
        )}

        <div className="mt-5">
          <Button type="submit" icon={<Icon name="plus" size={16} />}>
            Add application
          </Button>
        </div>
      </form>

      {/* PIPELINE */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="kicker">The pipeline, {applications.length} total</p>
          {applications.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <CopyButton value={tsv} label="Copy pipeline as TSV" />
              <ExportButton
                title="my application pipeline"
                kind="csv"
                filename="my-applications.csv"
                build={() => csv}
              />
            </div>
          )}
        </div>

        {applications.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="Nothing logged yet"
            body="Add your first application above. The follow-up date is the column that turns this log into a tool."
            className="mt-4"
          />
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

function ApplicationRow({
  app,
  onDelete,
}: {
  app: Application;
  onDelete: () => void;
}) {
  const { updateApplication } = usePath();

  return (
    <Card as="li">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Heading level={3} size="h5">
            {app.company}
          </Heading>
          <Text size="small">{app.role}</Text>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={STATUS_TONE[app.status]}>{STATUS_LABEL[app.status]}</Badge>
          <Select
            aria-label={`Change status for ${app.company}, ${app.role}`}
            value={app.status}
            onChange={(e) =>
              updateApplication(app.id, { status: e.target.value as AppStatus })
            }
            className="max-w-[10rem]"
          >
            {APP_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-xs text-ink-faint sm:grid-cols-4">
        <div>
          <span className="block font-semibold text-ink-soft">Source</span>
          {app.source || "—"}
        </div>
        <div>
          <span className="block font-semibold text-ink-soft">Applied</span>
          {app.appliedAt || "—"}
        </div>
        <div>
          <span className="block font-semibold text-ink-soft">Follow-up</span>
          {app.followUpAt || "—"}
        </div>
        <div>
          <span className="block font-semibold text-ink-soft">Link</span>
          {app.link ? (
            <Button
              href={app.link}
              external
              variant="link"
              iconEnd={<Icon name="arrow-up-right" size={11} />}
            >
              Open
            </Button>
          ) : (
            "—"
          )}
        </div>
      </div>

      <div className="mt-4">
        <Field label="Notes" hideLabel>
          <Textarea
            defaultValue={app.notes}
            onBlur={(e) => updateApplication(app.id, { notes: e.target.value })}
            rows={2}
          />
        </Field>
      </div>

      <div className="mt-4 flex justify-end border-t border-line pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          icon={<Icon name="trash" size={13} />}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}
