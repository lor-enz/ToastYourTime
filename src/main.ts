import "@fontsource-variable/geist";
import "./style.css";

import {
  format,
  formatDistanceStrict,
  formatDuration,
  intervalToDuration,
  isValid,
  parse,
  type Duration,
} from "date-fns";
import {
  Cake,
  CalendarClock,
  CircleAlert,
  CircleCheck,
  createElement,
  PartyPopper,
  Share2,
  TrendingUp,
  type IconNode,
} from "lucide";
import { calculateMilestones, type Milestone, type Unit } from "./milestones";

/** Share links look like /19900101_1200 (local time). */
const SHARE_FORMAT = "yyyyMMdd_HHmm";
const MIN_DATE = new Date(1900, 0, 1);
const RECENTLY_PASSED_LIMIT = 5;

const UNIT_LABELS: Record<Unit, string> = {
  seconds: "s",
  minutes: "m",
  hours: "h",
  days: "d",
  weeks: "w",
  months: "mo",
};

const ICONS: Record<string, IconNode> = {
  "party-popper": PartyPopper,
  "circle-alert": CircleAlert,
  "share-2": Share2,
  cake: Cake,
};

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const form = $<HTMLFormElement>("birthday-form");
const dateInput = $<HTMLInputElement>("dob-date");
const timeInput = $<HTMLInputElement>("dob-time");
const formError = $("form-error");
const urlError = $("url-error");
const results = $("results");
const shareLabel = $("share-label");

/** Small helper for building DOM nodes without innerHTML. */
function h(
  tag: string,
  props: Record<string, string> = {},
  ...children: (Node | string | null | false)[]
): HTMLElement {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) el.setAttribute(key, value);
  for (const child of children) if (child) el.append(child);
  return el;
}

function icon(node: IconNode, className = "icon"): SVGElement {
  return createElement(node, { class: className, "aria-hidden": "true" });
}

function parseShareSegment(segment: string): Date | null {
  if (!/^\d{8}_\d{4}$/.test(segment)) return null;
  const date = parse(segment, SHARE_FORMAT, new Date());
  if (!isValid(date) || date < MIN_DATE || date > new Date()) return null;
  return date;
}

function milestoneCard(milestone: Milestone, birthDate: Date, now: Date, isNext: boolean) {
  const hasPassed = milestone.date <= now;
  const elapsed = now.getTime() - birthDate.getTime();
  const total = milestone.date.getTime() - birthDate.getTime();
  const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
  const distance = formatDistanceStrict(milestone.date, now);

  const classes = ["card", "milestone"];
  if (isNext) classes.push("is-next");
  if (hasPassed) classes.push("is-passed");

  return h(
    "article",
    { class: classes.join(" ") },
    h(
      "div",
      { class: "milestone-title" },
      h("span", { class: "milestone-value" }, milestone.value.toLocaleString()),
      h("span", { class: "milestone-unit" }, UNIT_LABELS[milestone.unit]),
      hasPassed && icon(CircleCheck, "icon passed-check"),
      isNext && h("span", { class: "badge" }, "Next!"),
    ),
    h(
      "p",
      { class: "milestone-date" },
      icon(CalendarClock, "icon icon-sm"),
      format(milestone.date, "PPP p"),
    ),
    hasPassed
      ? h("p", { class: "milestone-distance" }, `Passed ${distance} ago`)
      : h("p", { class: "milestone-distance" }, icon(TrendingUp), `In ${distance}`),
    !hasPassed &&
      h(
        "div",
        {
          class: "progress",
          role: "progressbar",
          "aria-label": `Progress towards ${milestone.value} ${milestone.unit}`,
          "aria-valuenow": progress.toFixed(1),
          "aria-valuemin": "0",
          "aria-valuemax": "100",
          title: `${progress.toFixed(1)}% complete`,
        },
        h("div", { class: "progress-bar", style: `width: ${progress}%` }),
      ),
  );
}

/** The largest units that apply: "1 year 9 months", "12 days", "20 minutes". */
const GAP_FORMATS: (keyof Duration)[][] = [
  ["years", "months"],
  ["days"],
  ["hours"],
  ["minutes"],
  ["seconds"],
];

function formatGap(from: Date, to: Date): string {
  const duration = intervalToDuration({ start: from, end: to });
  for (const units of GAP_FORMATS) {
    const text = formatDuration(duration, { format: units });
    if (text) return text;
  }
  return "";
}

/**
 * Space between two timeline cards, growing with the time between them.
 * The square root keeps multi-year gaps from turning into huge empty stretches.
 */
function gapHeightRem(from: Date, to: Date): number {
  const days = (to.getTime() - from.getTime()) / 86_400_000;
  return Math.min(9, 1.75 + Math.sqrt(days) * 0.2);
}

function timeline(milestones: Milestone[], birthDate: Date, now: Date): Node[] {
  return milestones.flatMap((m, i) => {
    const card = milestoneCard(m, birthDate, now, i === 0);
    if (i === 0) return [card];
    const prev = milestones[i - 1].date;
    const gap = h(
      "div",
      { class: "timeline-gap", style: `height: ${gapHeightRem(prev, m.date).toFixed(2)}rem` },
      formatGap(prev, m.date),
    );
    return [gap, card];
  });
}

function showMilestones(birthDate: Date) {
  const now = new Date();
  const milestones = calculateMilestones(birthDate, now);
  const upcoming = milestones.filter((m) => m.date > now);
  const passed = milestones
    .filter((m) => m.date <= now)
    .reverse()
    .slice(0, RECENTLY_PASSED_LIMIT);

  $("upcoming").replaceChildren(...timeline(upcoming, birthDate, now));
  $("no-upcoming").hidden = upcoming.length > 0;
  $("passed").replaceChildren(...passed.map((m) => milestoneCard(m, birthDate, now, false)));
  $("passed-section").hidden = passed.length === 0;
  results.hidden = false;
}

function setFormValues(date: Date) {
  dateInput.value = format(date, "yyyy-MM-dd");
  timeInput.value = format(date, "HH:mm");
}

function showFormError(message: string) {
  formError.textContent = message;
  formError.hidden = false;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formError.hidden = true;

  if (!dateInput.value || !timeInput.value) {
    showFormError("Please enter both your birth date and time.");
    return;
  }
  const [year, month, day] = dateInput.value.split("-").map(Number);
  const [hours, minutes] = timeInput.value.split(":").map(Number);
  // Round to the nearest 5 minutes; 60 rolls over into the next hour.
  const birthDate = new Date(year, month - 1, day, hours, Math.round(minutes / 5) * 5);

  if (!isValid(birthDate) || birthDate < MIN_DATE) {
    showFormError("Please enter a date after January 1st, 1900.");
    return;
  }
  if (birthDate > new Date()) {
    showFormError("Your birth date can't be in the future.");
    return;
  }

  urlError.hidden = true;
  setFormValues(birthDate);
  history.replaceState(null, "", `/${format(birthDate, SHARE_FORMAT)}`);
  showMilestones(birthDate);
});

let shareLabelTimeout: number | undefined;
$("share").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    shareLabel.textContent = "Link copied!";
  } catch {
    shareLabel.textContent = "Couldn't copy – use the address bar instead";
  }
  clearTimeout(shareLabelTimeout);
  shareLabelTimeout = window.setTimeout(() => {
    shareLabel.textContent = "Copy share link";
  }, 2500);
});

// Swap icon placeholders in the static markup for SVGs.
for (const el of document.querySelectorAll<HTMLElement>("[data-icon]")) {
  el.replaceWith(icon(ICONS[el.dataset.icon!]));
}

dateInput.max = format(new Date(), "yyyy-MM-dd");

const segment = location.pathname.replace(/^\/|\/$/g, "");
const sharedDate = segment ? parseShareSegment(segment) : null;
if (sharedDate) {
  setFormValues(sharedDate);
  showMilestones(sharedDate);
} else {
  setFormValues(new Date(new Date().getFullYear() - 25, 0, 1, 12, 0));
  urlError.hidden = !segment;
}
